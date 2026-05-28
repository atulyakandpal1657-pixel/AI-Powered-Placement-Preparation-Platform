"use client";

import { Bookmark, BookmarkCheck, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import type { QuestionItem } from "@/types/dsa";

interface Props {
  questions: QuestionItem[];
  onToggleSolved: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

const difficultyStyles = {
  Easy: "text-success bg-success/10 border-success/20",
  Medium: "text-warning bg-warning/10 border-warning/20",
  Hard: "text-danger bg-danger/10 border-danger/20",
};

export default function QuestionTable({ questions, onToggleSolved, onToggleBookmark }: Props) {
  if (!questions.length) {
    return (
      <div className="glass-card p-10 text-center text-muted">
        No questions found for current filters.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Question</th>
              <th className="text-left px-4 py-3">Topic</th>
              <th className="text-left px-4 py-3">Difficulty</th>
              <th className="text-left px-4 py-3">Companies</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q._id} className="border-b border-border/40 hover:bg-surface-hover/40">
                <td className="px-4 py-3">
                  <button onClick={() => onToggleSolved(q._id)}>
                    {q.solved ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium">{q.title}</td>
                <td className="px-4 py-3">{q.topic}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg border ${difficultyStyles[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {q.companies.map((company) => (
                      <span key={company} className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                        {company}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <a href={q.solveUrl} target="_blank" rel="noreferrer" className="text-accent">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => onToggleBookmark(q._id)}>
                      {q.bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-warning" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-muted" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
