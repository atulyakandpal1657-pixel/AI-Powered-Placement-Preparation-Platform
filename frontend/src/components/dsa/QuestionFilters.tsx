"use client";

import { Search } from "lucide-react";
import type { Difficulty, StatusFilter } from "@/types/dsa";

interface Props {
  search: string;
  topic: string;
  difficulty: "All" | Difficulty;
  company: string;
  status: StatusFilter;
  bookmarkedOnly: boolean;
  topics: string[];
  companies: string[];
  onChange: (next: {
    search?: string;
    topic?: string;
    difficulty?: "All" | Difficulty;
    company?: string;
    status?: StatusFilter;
    bookmarkedOnly?: boolean;
  }) => void;
}

export default function QuestionFilters(props: Props) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={props.search}
          onChange={(e) => props.onChange({ search: e.target.value })}
          placeholder="Search questions, topics, companies..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <select
          value={props.topic}
          onChange={(e) => props.onChange({ topic: e.target.value })}
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm"
        >
          <option value="All">All Topics</option>
          {props.topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={props.difficulty}
          onChange={(e) => props.onChange({ difficulty: e.target.value as "All" | Difficulty })}
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm"
        >
          <option value="All">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={props.company}
          onChange={(e) => props.onChange({ company: e.target.value })}
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm"
        >
          <option value="All">All Companies</option>
          {props.companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={props.status}
          onChange={(e) => props.onChange({ status: e.target.value as StatusFilter })}
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm"
        >
          <option value="All">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm">
          <input
            type="checkbox"
            checked={props.bookmarkedOnly}
            onChange={(e) => props.onChange({ bookmarkedOnly: e.target.checked })}
          />
          Bookmarked only
        </label>
      </div>
    </div>
  );
}
