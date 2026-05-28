"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, Filter, ExternalLink, Check, Circle, Pencil, Trash2, Plus } from "lucide-react";
import api from "@/lib/axios";
import { defaultTopics, type DSAProblem, type DSAStats, type Difficulty } from "@/lib/dsaData";

const difficultyColor = {
  Easy: "text-success bg-success/10 border-success/20",
  Medium: "text-warning bg-warning/10 border-warning/20",
  Hard: "text-danger bg-danger/10 border-danger/20",
};

const emptyStats: DSAStats = {
  total: 0,
  solved: 0,
  unsolved: 0,
  completionRate: 0,
  byDifficulty: {
    Easy: { total: 0, solved: 0 },
    Medium: { total: 0, solved: 0 },
    Hard: { total: 0, solved: 0 },
  },
  byTopic: {},
};

interface ProblemFormState {
  title: string;
  topic: string;
  difficulty: Difficulty;
  solved: boolean;
  link: string;
}

const initialFormState: ProblemFormState = {
  title: "",
  topic: defaultTopics[0],
  difficulty: "Easy",
  solved: false,
  link: "",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
};

export default function DSATable() {
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [stats, setStats] = useState<DSAStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProblemFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const [problemsRes, statsRes] = await Promise.all([
        api.get("/dsa"),
        api.get("/dsa/stats"),
      ]);
      setProblems(problemsRes.data.problems || []);
      setStats(statsRes.data.stats || emptyStats);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load DSA tracker"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProblems();
  }, []);

  const topics = useMemo(() => {
    const merged = [...defaultTopics, ...problems.map((p) => p.topic)];
    return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const filtered = problems.filter((p: DSAProblem) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTopic = selectedTopic === "All" || p.topic === selectedTopic;
    const matchDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchSearch && matchTopic && matchDiff;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/dsa/${editingId}`, form);
      } else {
        await api.post("/dsa", form);
      }
      setForm(initialFormState);
      setEditingId(null);
      await fetchProblems();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save problem"));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (problem: DSAProblem) => {
    setEditingId(problem._id);
    setForm({
      title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      solved: problem.solved,
      link: problem.link || "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/dsa/${id}`);
      await fetchProblems();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete problem"));
    }
  };

  const toggleSolved = async (problem: DSAProblem) => {
    try {
      await api.put(`/dsa/${problem._id}`, { solved: !problem.solved });
      await fetchProblems();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update problem"));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="glass-card p-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Problem title"
            required
            className="md:col-span-2 px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
          />
          <input
            type="text"
            value={form.topic}
            onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
            placeholder="Topic"
            required
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
          />
          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))
            }
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <input
            type="url"
            value={form.link}
            onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
            placeholder="Problem link (optional)"
            className="md:col-span-2 px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
          />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.solved}
              onChange={(e) => setForm((prev) => ({ ...prev, solved: e.target.checked }))}
            />
            Solved
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-2.5 rounded-xl bg-accent text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialFormState);
                }}
                className="px-3 py-2.5 rounded-xl border border-border text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{stats.solved}</p>
            <p className="text-xs text-muted">Solved</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Filter className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{stats.total}</p>
            <p className="text-xs text-muted">Total</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted/10 border border-muted/20 flex items-center justify-center">
            <Circle className="w-5 h-5 text-muted" />
          </div>
          <div>
            <p className="text-2xl font-bold text-muted">{stats.unsolved}</p>
            <p className="text-xs text-muted">Unsolved</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-muted transition-all duration-500"
                style={{ width: `${stats.total ? (stats.unsolved / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
          {/* Topic Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
            >
              <option value="All">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  Problem
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Topic
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Link
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Loading problems...
                  </td>
                </tr>
              )}
              {filtered.map((problem) => {
                return (
                  <tr
                    key={problem._id}
                    className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <button onClick={() => toggleSolved(problem)} title="Toggle solved">
                        {problem.solved ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-muted font-mono text-xs">
                      {problem._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-medium">{problem.title}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                        {problem.topic}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                          difficultyColor[problem.difficulty]
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      {problem.link ? (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:text-accent-hover transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-muted text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(problem)}
                          className="text-muted hover:text-accent transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="text-muted hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No problems found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>
            Showing {filtered.length} of {problems.length} problems
          </span>
          <span>
            {stats.solved} / {stats.total} solved ({stats.completionRate}%)
          </span>
        </div>
      </div>
    </div>
  );
}
