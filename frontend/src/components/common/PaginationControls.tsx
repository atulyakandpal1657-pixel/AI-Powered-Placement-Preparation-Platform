"use client";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-sm">
      <span className="text-muted">
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-border px-3 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-border px-3 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
