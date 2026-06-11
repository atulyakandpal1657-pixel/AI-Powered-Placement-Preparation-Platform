"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  BrainCircuit,
  FileText,
  NotebookPen,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useToast } from "@/context/ToastContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "DSA Tracker", href: "/dsa-tracker", icon: Code2 },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "AI Mock Interview", href: "/mock-interview", icon: BrainCircuit },
  { label: "Resume", href: "/resume", icon: FileText },
  { label: "Notes Workspace", href: "/notes", icon: NotebookPen },
  { label: "Discussion Forum", href: "#", icon: MessageSquare, comingSoon: true },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar();
  const { showToast } = useToast();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleComingSoon = (label: string) => {
    showToast(`${label} — coming soon!`, "info");
    closeMobile();
  };

  const navLinkClass = (isActive: boolean) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full ${
      isActive
        ? "bg-gradient-to-r from-[#6c5ce7]/20 to-transparent text-white border border-[#6c5ce7]/30"
        : "text-muted hover:text-foreground hover:bg-surface-hover"
    }`;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-border
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}`}
        style={{ background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="animate-fade-in flex-1 min-w-0">
              <h1 className="text-base font-bold gradient-text leading-tight">PlacePrep AI</h1>
              <p className="text-[10px] text-muted tracking-wider uppercase">Placement Platform</p>
            </div>
          )}
          <button
            type="button"
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-hover text-muted"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isComingSoon = "comingSoon" in item && item.comingSoon;
            const isActive = !isComingSoon && pathname === item.href;
            const Icon = item.icon;

            if (isComingSoon) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleComingSoon(item.label)}
                  title="Coming soon"
                  className={`${navLinkClass(false)} cursor-pointer`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-muted group-hover:text-foreground transition-colors" />
                  {(!collapsed || mobileOpen) && (
                    <span className="flex items-center gap-2">
                      {item.label}
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-muted/20 text-muted">
                        Soon
                      </span>
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                className={navLinkClass(isActive)}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#a29bfe]" : "text-muted group-hover:text-foreground"
                  }`}
                />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                {isActive && (!collapsed || mobileOpen) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="animate-fade-in min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted truncate">{user?.email || ""}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              closeMobile();
              logout();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border items-center justify-center hover:bg-surface-hover hover:border-accent/40 transition-all z-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-muted" />
          )}
        </button>
      </aside>
    </>
  );
}
