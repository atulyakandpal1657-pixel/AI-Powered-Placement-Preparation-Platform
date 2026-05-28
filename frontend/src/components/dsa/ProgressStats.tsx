"use client";

import { Flame, Bookmark, CircleCheck, CircleDashed } from "lucide-react";
import type { QuestionStats } from "@/types/dsa";

interface Props {
  stats: QuestionStats;
}

export default function ProgressStats({ stats }: Props) {
  const cards = [
    { label: "Solved", value: stats.solved, icon: CircleCheck, color: "text-success" },
    { label: "Unsolved", value: stats.unsolved, icon: CircleDashed, color: "text-warning" },
    { label: "Bookmarked", value: stats.bookmarked, icon: Bookmark, color: "text-accent" },
    { label: "Daily Streak", value: `${stats.dailyStreak}d`, icon: Flame, color: "text-danger" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="glass-card p-4 flex items-center gap-3">
          <c.icon className={`w-5 h-5 ${c.color}`} />
          <div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
