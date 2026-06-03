import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accentColor = "#6c5ce7",
}: StatCardProps) {
  return (
    <div className="glass-card p-5 transition-all duration-300 hover:scale-[1.02] group cursor-default">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted font-medium">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold ${
                  trendUp ? "text-success" : "text-danger"
                }`}
              >
                {trendUp ? "↑" : "↓"} {trend}
              </span>
              <span className="text-xs text-muted">vs last week</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
