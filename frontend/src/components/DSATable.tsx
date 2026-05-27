"use client";

import { useState } from "react";
import { Search, Filter, ExternalLink, Check, Clock, Circle } from "lucide-react";
import { dsaProblems, dsaTopics, type DSAProblem, type Status } from "@/lib/dsaData";

const difficultyColor = {
  Easy: "text-success bg-success/10 border-success/20",
  Medium: "text-warning bg-warning/10 border-warning/20",
  Hard: "text-danger bg-danger/10 border-danger/20",
};

const statusConfig: Record<Status, { icon: typeof Check; color: string; label: string }> = {
  Solved: { icon: Check, color: "text-success", label: "Solved" },
  Attempted: { icon: Clock, color: "text-warning", label: "Attempted" },
  Unsolved: { icon: Circle, color: "text-muted", label: "Unsolved" },
};

export default function DSATable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filtered = dsaProblems.filter((p: DSAProblem) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTopic = selectedTopic === "All" || p.topic === selectedTopic;
    const matchDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchSearch && matchTopic && matchDiff;
  });

  const totalSolved = dsaProblems.filter((p) => p.status === "Solved").length;
  const totalAttempted = dsaProblems.filter((p) => p.status === "Attempted").length;
  const totalUnsolved = dsaProblems.filter((p) => p.status === "Unsolved").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{totalSolved}</p>
            <p className="text-xs text-muted">Solved</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${(totalSolved / dsaProblems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{totalAttempted}</p>
            <p className="text-xs text-muted">Attempted</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-warning transition-all duration-500"
                style={{ width: `${(totalAttempted / dsaProblems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted/10 border border-muted/20 flex items-center justify-center">
            <Circle className="w-5 h-5 text-muted" />
          </div>
          <div>
            <p className="text-2xl font-bold text-muted">{totalUnsolved}</p>
            <p className="text-xs text-muted">Unsolved</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-muted transition-all duration-500"
                style={{ width: `${(totalUnsolved / dsaProblems.length) * 100}%` }}
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
              {dsaTopics.map((t) => (
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
              </tr>
            </thead>
            <tbody className="stagger-children">
              {filtered.map((problem) => {
                const statusInfo = statusConfig[problem.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr
                    key={problem.id}
                    className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-xs font-medium ${statusInfo.color} hidden lg:inline`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted font-mono text-xs">{problem.id}</td>
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
                      <a
                        href={problem.link}
                        className="text-accent hover:text-accent-hover transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No problems found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>
            Showing {filtered.length} of {dsaProblems.length} problems
          </span>
          <span>
            {totalSolved} / {dsaProblems.length} solved (
            {Math.round((totalSolved / dsaProblems.length) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
