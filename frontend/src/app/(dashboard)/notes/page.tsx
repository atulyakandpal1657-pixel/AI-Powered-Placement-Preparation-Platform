"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import type { CodingNote } from "@/types/notes";
import NotesSidebar from "@/components/notes/NotesSidebar";
import NoteEditor from "@/components/notes/NoteEditor";
import MarkdownPreview from "@/components/notes/MarkdownPreview";

const defaultNote: Omit<CodingNote, "_id" | "updatedAt"> = {
  title: "Untitled Note",
  topic: "General",
  difficulty: "Medium",
  tags: [],
  pinned: false,
  personalExplanation: "",
  codeSolution: "",
  revisionNotes: "",
  checklist: [],
};

export default function NotesWorkspacePage() {
  const [notes, setNotes] = useState<CodingNote[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => notes.find((n) => n._id === selectedId) || null,
    [notes, selectedId]
  );

  const loadNotes = useCallback(async () => {
    const { data } = await api.get("/notes", { params: { search: search || undefined } });
    setNotes(data.notes || []);
    if (!selectedId && data.notes?.length) {
      setSelectedId(data.notes[0]._id);
    }
  }, [search, selectedId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes();
  }, [loadNotes]);

  const createNote = async () => {
    const { data } = await api.post("/notes", defaultNote);
    setNotes((prev) => [data.note, ...prev]);
    setSelectedId(data.note._id);
  };

  const updateLocal = (patch: Partial<CodingNote>) => {
    if (!selected) return;
    setNotes((prev) => prev.map((n) => (n._id === selected._id ? { ...n, ...patch } : n)));
  };

  useEffect(() => {
    if (!selected) return;
    const snapshot = selected;
    const timer = setTimeout(async () => {
      setSaving(true);
      await api.put(`/notes/${snapshot._id}`, {
        title: snapshot.title,
        topic: snapshot.topic,
        difficulty: snapshot.difficulty,
        tags: snapshot.tags,
        personalExplanation: snapshot.personalExplanation,
        codeSolution: snapshot.codeSolution,
        revisionNotes: snapshot.revisionNotes,
      });
      setSaving(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selected]);

  const deleteCurrent = async () => {
    if (!selected) return;
    await api.delete(`/notes/${selected._id}`);
    const next = notes.filter((n) => n._id !== selected._id);
    setNotes(next);
    setSelectedId(next[0]?._id || null);
  };

  const togglePin = async () => {
    if (!selected) return;
    const { data } = await api.patch(`/notes/${selected._id}/pin`);
    setNotes((prev) => prev.map((n) => (n._id === selected._id ? data.note : n)));
  };

  return (
    <div className="h-[calc(100vh-4rem)] rounded-2xl border border-border overflow-hidden bg-surface">
      <div className="h-full flex flex-col md:flex-row">
        <NotesSidebar
          notes={notes}
          selectedId={selectedId}
          search={search}
          onSearch={setSearch}
          onSelect={setSelectedId}
          onCreate={createNote}
        />
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2">
          <div className="border-r border-border overflow-y-auto">
            <div className="px-4 py-2 text-xs text-muted border-b border-border">
              {saving ? "Autosaving..." : "Saved"}
            </div>
            <NoteEditor
              note={selected}
              onChange={updateLocal}
              onDelete={deleteCurrent}
              onTogglePin={togglePin}
            />
          </div>
          <div className="overflow-y-auto bg-background/30">
            <MarkdownPreview
              title={selected?.title || ""}
              markdown={selected?.personalExplanation || ""}
              codeSolution={selected?.codeSolution || ""}
              revisionNotes={selected?.revisionNotes || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
