"use client";

import Link from "next/link";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-xl rounded-3xl border border-border bg-surface p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold">Dashboard error</h1>
        <p className="mt-4 text-sm text-muted">We could not load the dashboard content.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-background p-4 text-left text-xs text-danger">{error.message}</pre>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Reload
          </button>
          <Link href="/" className="rounded-xl border border-border px-4 py-2 text-sm text-foreground">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
