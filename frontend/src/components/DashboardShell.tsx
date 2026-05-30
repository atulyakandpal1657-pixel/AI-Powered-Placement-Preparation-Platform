"use client";

import { Menu } from "lucide-react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/Sidebar";

function DashboardMain({ children }: { children: React.ReactNode }) {
  const { collapsed, setMobileOpen } = useSidebar();

  const mainMargin = collapsed ? "md:ml-[72px]" : "md:ml-[260px]";

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold gradient-text">PlacePrep AI</span>
      </header>
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-[margin] duration-300 ml-0 ${mainMargin}`}
      >
        {children}
      </main>
    </>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </SidebarProvider>
  );
}
