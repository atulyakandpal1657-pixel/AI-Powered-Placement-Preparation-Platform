"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2 } from "lucide-react";
import api from "@/lib/axios";
import type { Difficulty, QuestionItem, QuestionStats, StatusFilter } from "@/types/dsa";
import QuestionFilters from "@/components/dsa/QuestionFilters";
import QuestionTable from "@/components/dsa/QuestionTable";
import ProgressStats from "@/components/dsa/ProgressStats";
import QuestionSkeleton from "@/components/dsa/QuestionSkeleton";

const emptyStats: QuestionStats = {
  total: 0,
  solved: 0,
  unsolved: 0,
  bookmarked: 0,
  progress: 0,
  dailyStreak: 0,
};

export default function DSATrackerPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [stats, setStats] = useState<QuestionStats>(emptyStats);
  const [topics, setTopics] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [company, setCompany] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const query = useMemo(
    () =>
      ({
        search: search || undefined,
        topic,
        difficulty,
        company,
        status,
        bookmarked: bookmarkedOnly ? "true" : undefined,
      }) as const,
    [search, topic, difficulty, company, status, bookmarkedOnly]
  );

  const fetchStats = useCallback(async () => {
    const { data } = await api.get("/questions/stats");
    if (data.stats) setStats(data.stats);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [qRes, sRes] = await Promise.all([
        api.get("/questions", { params: query }),
        api.get("/questions/stats"),
      ]);
      setQuestions(qRes.data.questions || []);
      setTopics(qRes.data.filters?.topics || []);
      setCompanies(qRes.data.filters?.companies || []);
      setStats(sRes.data.stats ?? emptyStats);
    } catch {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSolved = async (id: string) => {
    const target = questions.find((q) => q._id === id);
    if (!target) return;
    const previousQuestions = questions;
    const previousStats = stats;
    const nextSolved = !target.solved;

    setQuestions((prev) =>
      prev.map((q) => (q._id === id ? { ...q, solved: nextSolved } : q))
    );
    setStats((prev) => {
      const solvedDelta = nextSolved ? 1 : -1;
      const nextSolvedCount = Math.max(0, prev.solved + solvedDelta);
      return {
        ...prev,
        solved: nextSolvedCount,
        unsolved: Math.max(0, prev.total - nextSolvedCount),
        progress: prev.total ? Math.round((nextSolvedCount / prev.total) * 100) : 0,
      };
    });

    try {
      await api.patch(`/questions/${id}/solve`);
      await fetchStats();
    } catch {
      setQuestions(previousQuestions);
      setStats(previousStats);
      setError("Failed to update solve status.");
    }
  };

  const toggleBookmark = async (id: string) => {
    const target = questions.find((q) => q._id === id);
    if (!target) return;
    const previousQuestions = questions;
    const previousStats = stats;
    const nextBookmarked = !target.bookmarked;

    setQuestions((prev) =>
      prev.map((q) => (q._id === id ? { ...q, bookmarked: nextBookmarked } : q))
    );
    setStats((prev) => ({
      ...prev,
      bookmarked: Math.max(0, prev.bookmarked + (nextBookmarked ? 1 : -1)),
    }));

    try {
      await api.patch(`/questions/${id}/bookmark`);
    } catch {
      setQuestions(previousQuestions);
      setStats(previousStats);
      setError("Failed to update bookmark.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">DSA Tracker</h1>
          <p className="text-sm text-muted">
            Track your progress across all Data Structures & Algorithms topics
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <ProgressStats stats={stats} />
      <QuestionFilters
        search={search}
        topic={topic}
        difficulty={difficulty}
        company={company}
        status={status}
        bookmarkedOnly={bookmarkedOnly}
        topics={topics}
        companies={companies}
        onChange={(next) => {
          if (next.search !== undefined) setSearch(next.search);
          if (next.topic !== undefined) setTopic(next.topic);
          if (next.difficulty !== undefined) setDifficulty(next.difficulty);
          if (next.company !== undefined) setCompany(next.company);
          if (next.status !== undefined) setStatus(next.status);
          if (next.bookmarkedOnly !== undefined) setBookmarkedOnly(next.bookmarkedOnly);
        }}
      />
      {loading ? (
        <div className="grid gap-3">
          <QuestionSkeleton />
          <QuestionSkeleton />
          <QuestionSkeleton />
        </div>
      ) : (
        <QuestionTable
          questions={questions}
          onToggleSolved={toggleSolved}
          onToggleBookmark={toggleBookmark}
          emptyVariant={stats.total === 0 ? "database" : "filters"}
        />
      )}
    </div>
  );
}
