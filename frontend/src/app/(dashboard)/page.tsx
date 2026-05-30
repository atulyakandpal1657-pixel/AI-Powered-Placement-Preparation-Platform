"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import {
  Code2,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";

interface QuestionStats {
  total: number;
  solved: number;
  unsolved: number;
  bookmarked: number;
  progress: number;
  dailyStreak: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuestionStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/questions/stats");
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-muted text-sm">
          Here&apos;s an overview of your placement preparation progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        <StatCard
          label="Problems Solved"
          value={stats?.solved ?? "—"}
          icon={<Code2 className="w-6 h-6" />}
          trend={stats ? `${stats.progress}%` : "—"}
          trendUp={true}
          accentColor="#6c5ce7"
        />
        <StatCard
          label="Current Streak"
          value={stats ? `${stats.dailyStreak} days` : "—"}
          icon={<Flame className="w-6 h-6" />}
          trend={stats?.dailyStreak ? `${stats.dailyStreak} days` : "—"}
          trendUp={true}
          accentColor="#f5a623"
        />
        <StatCard
          label="Bookmarked"
          value={stats?.bookmarked ?? "—"}
          icon={<Trophy className="w-6 h-6" />}
          trend=""
          trendUp={true}
          accentColor="#00d2a0"
        />
        <StatCard
          label="Accuracy Rate"
          value={stats ? `${stats.progress}%` : "—"}
          icon={<Target className="w-6 h-6" />}
          trend=""
          trendUp={true}
          accentColor="#74b9ff"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart Placeholder */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly Activity</h2>
              <p className="text-xs text-muted">Problems solved per day</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2 h-2 rounded-full bg-accent" /> This week
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2 h-2 rounded-full bg-muted/40" /> Last week
              </span>
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-48 pt-4">
            {[
              { day: "Mon", current: 65, previous: 45 },
              { day: "Tue", current: 80, previous: 60 },
              { day: "Wed", current: 45, previous: 70 },
              { day: "Thu", current: 90, previous: 50 },
              { day: "Fri", current: 70, previous: 80 },
              { day: "Sat", current: 95, previous: 65 },
              { day: "Sun", current: 55, previous: 40 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end gap-1 h-40">
                  <div
                    className="flex-1 rounded-t-md bg-muted/20 transition-all duration-500 hover:bg-muted/30"
                    style={{ height: `${d.previous}%` }}
                  />
                  <div
                    className="flex-1 rounded-t-md bg-gradient-to-t from-[#6c5ce7] to-[#a29bfe] transition-all duration-500 hover:opacity-80"
                    style={{ height: `${d.current}%` }}
                  />
                </div>
                <span className="text-xs text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Topic Progress</h2>
          <div className="space-y-3">
            {[
              { topic: "Arrays", progress: 85, color: "#6c5ce7" },
              { topic: "Trees", progress: 60, color: "#00d2a0" },
              { topic: "DP", progress: 35, color: "#f5a623" },
              { topic: "Graphs", progress: 45, color: "#74b9ff" },
              { topic: "Strings", progress: 70, color: "#a29bfe" },
              { topic: "Linked List", progress: 55, color: "#ff4757" },
            ].map((t) => (
              <div key={t.topic} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{t.topic}</span>
                  <span className="font-medium" style={{ color: t.color }}>
                    {t.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${t.progress}%`,
                      background: `linear-gradient(90deg, ${t.color}, ${t.color}aa)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Clock className="w-4 h-4 text-muted" />
          </div>
          <div className="space-y-3">
            {[
              {
                action: "Solved",
                problem: "Two Sum",
                time: "2 hours ago",
                icon: <Zap className="w-4 h-4 text-success" />,
              },
              {
                action: "Attempted",
                problem: "Merge K Sorted Lists",
                time: "5 hours ago",
                icon: <Clock className="w-4 h-4 text-warning" />,
              },
              {
                action: "Completed",
                problem: "AI Mock Interview — System Design",
                time: "1 day ago",
                icon: <Trophy className="w-4 h-4 text-accent" />,
              },
              {
                action: "Solved",
                problem: "Binary Tree Level Order Traversal",
                time: "1 day ago",
                icon: <Zap className="w-4 h-4 text-success" />,
              },
              {
                action: "Read",
                problem: "Guide: Dynamic Programming Patterns",
                time: "2 days ago",
                icon: <BookOpen className="w-4 h-4 text-[#74b9ff]" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="text-muted">{item.action}:</span> {item.problem}
                  </p>
                  <p className="text-xs text-muted">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Goals */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Goals</h2>
            <TrendingUp className="w-4 h-4 text-muted" />
          </div>
          <div className="space-y-3">
            {[
              {
                goal: "Solve 5 DP problems this week",
                progress: 60,
                deadline: "3 days left",
                color: "#f5a623",
              },
              {
                goal: "Complete Graph topic (15 problems)",
                progress: 30,
                deadline: "5 days left",
                color: "#74b9ff",
              },
              {
                goal: "Take 2 mock interviews",
                progress: 50,
                deadline: "This week",
                color: "#6c5ce7",
              },
              {
                goal: "Update resume with new projects",
                progress: 0,
                deadline: "Next week",
                color: "#00d2a0",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/50 hover:border-accent/20 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{item.goal}</p>
                  <span className="text-[10px] text-muted whitespace-nowrap bg-surface px-2 py-0.5 rounded-full">
                    {item.deadline}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.progress}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
