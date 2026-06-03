"use client";

import { Pin } from "lucide-react";
import type { CodingNote } from "@/types/notes";
import PaginationControls from "@/components/common/PaginationControls";

interface Props {
  notes: CodingNote[];
  selectedId: string | null;
  search: string;
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
}

export default function NotesSidebar({
  notes,
  selectedId,
  search,
  page,
  totalPages,
  isLoading,
  onSearch,
  onSelect,
  onCreate,
  onPageChange,
}: Props) {
  return (
    <div className="w-full md:w-80 border-r border-border bg-surface/70 flex flex-col">
      <div className="p-3 border-b border-border space-y-2">
        <button onClick={onCreate} className="w-full py-2 rounded-xl bg-accent text-white text-sm">
          + New Note
        </button>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
        />
      </div>
      <div className="overflow-y-auto">
        {notes.map((note) => (
          <button
            key={note._id}
            onClick={() => onSelect(note._id)}
            className={`w-full text-left px-3 py-3 border-b border-border/40 hover:bg-surface-hover ${
              selectedId === note._id ? "bg-accent/10" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{note.title}</p>
              {note.pinned && <Pin className="w-3.5 h-3.5 text-warning" />}
            </div>
            <p className="text-xs text-muted truncate">
              {note.topic} · {note.difficulty}
            </p>
          </button>
        ))}
        {notes.length === 0 && <p className="p-4 text-sm text-muted">No notes found.</p>}
      </div>
      <div className="p-3">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
