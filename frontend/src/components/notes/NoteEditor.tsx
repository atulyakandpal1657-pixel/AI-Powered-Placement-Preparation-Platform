"use client";

import type { CodingNote } from "@/types/notes";

interface Props {
  note: CodingNote | null;
  onChange: (patch: Partial<CodingNote>) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export default function NoteEditor({ note, onChange, onDelete, onTogglePin }: Props) {
  if (!note) {
    return <div className="p-8 text-muted">Select or create a note to start writing.</div>;
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="flex-1 px-3 py-2 rounded-xl bg-background border border-border"
          placeholder="Note title"
        />
        <button onClick={onTogglePin} className="px-3 py-2 rounded-xl border border-border text-sm">
          {note.pinned ? "Unpin" : "Pin"}
        </button>
        <button onClick={onDelete} className="px-3 py-2 rounded-xl border border-danger/30 text-danger text-sm">
          Delete
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={note.topic}
          onChange={(e) => onChange({ topic: e.target.value })}
          className="px-3 py-2 rounded-xl bg-background border border-border"
          placeholder="Topic"
        />
        <select
          value={note.difficulty}
          onChange={(e) => onChange({ difficulty: e.target.value as CodingNote["difficulty"] })}
          className="px-3 py-2 rounded-xl bg-background border border-border"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          value={note.tags.join(", ")}
          onChange={(e) =>
            onChange({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
          }
          className="px-3 py-2 rounded-xl bg-background border border-border"
          placeholder="Tags: array, dp"
        />
      </div>
      <textarea
        value={note.personalExplanation}
        onChange={(e) => onChange({ personalExplanation: e.target.value })}
        className="w-full min-h-[160px] px-3 py-2 rounded-xl bg-background border border-border"
        placeholder="Personal explanation (markdown supported)"
      />
      <textarea
        value={note.codeSolution}
        onChange={(e) => onChange({ codeSolution: e.target.value })}
        className="w-full min-h-[180px] px-3 py-2 rounded-xl bg-background border border-border font-mono text-sm"
        placeholder="Code solution"
      />
      <textarea
        value={note.revisionNotes}
        onChange={(e) => onChange({ revisionNotes: e.target.value })}
        className="w-full min-h-[120px] px-3 py-2 rounded-xl bg-background border border-border"
        placeholder="Revision notes / checklist items"
      />
    </div>
  );
}
