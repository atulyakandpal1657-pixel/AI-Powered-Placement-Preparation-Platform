"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  BrainCircuit,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "DSA Tracker", href: "/dsa-tracker", icon: Code2 },
  { label: "AI Mock Interview", href: "#", icon: BrainCircuit },
  { label: "Resume Builder", href: "#", icon: FileText },
  { label: "Discussion Forum", href: "#", icon: MessageSquare },
  { label: "Settings", href: "#", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-border ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{ background: "var(--surface)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-base font-bold gradient-text leading-tight">PlacePrep AI</h1>
            <p className="text-[10px] text-muted tracking-wider uppercase">Placement Platform</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#6c5ce7]/20 to-transparent text-white border border-[#6c5ce7]/30"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#a29bfe]" : "text-muted group-hover:text-foreground"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            AP
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-sm font-medium truncate">Atul Pandey</p>
              <p className="text-xs text-muted truncate">atul@example.com</p>
            </div>
          )}
        </div>
        {/* Logout */}
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/10 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-hover hover:border-accent/40 transition-all z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted" />
        )}
      </button>
    </aside>
  );
}
