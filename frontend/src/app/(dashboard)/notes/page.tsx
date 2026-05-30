"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const extractErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message || fallback;
};

export default function NotesWorkspacePage() {
  const [notes, setNotes] = useState<CodingNote[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isDirty = useRef(false);

  const selected = useMemo(
    () => notes.find((n) => n._id === selectedId) || null,
    [notes, selectedId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadNotes = useCallback(async () => {
    try {
      setError("");
      const { data } = await api.get("/notes", {
        params: { search: debouncedSearch || undefined },
      });
      setNotes(data.notes || []);
      setSelectedId((current) => {
        if (current && data.notes?.some((n: CodingNote) => n._id === current)) {
          return current;
        }
        return data.notes?.[0]?._id || null;
      });
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to load notes"));
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async () => {
    try {
      setError("");
      const { data } = await api.post("/notes", defaultNote);
      setNotes((prev) => [data.note, ...prev]);
      setSelectedId(data.note._id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to create note"));
    }
  };

  const updateLocal = (patch: Partial<CodingNote>) => {
    if (!selected) return;
    isDirty.current = true;
    setNotes((prev) => prev.map((n) => (n._id === selected._id ? { ...n, ...patch } : n)));
  };

  useEffect(() => {
    if (!selected || !isDirty.current) return;
    const snapshot = selected;
    const timer = setTimeout(async () => {
      try {
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
        isDirty.current = false;
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "Failed to save note"));
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [selected]);

  const deleteCurrent = async () => {
    if (!selected) return;
    try {
      setError("");
      await api.delete(`/notes/${selected._id}`);
      const next = notes.filter((n) => n._id !== selected._id);
      setNotes(next);
      setSelectedId(next[0]?._id || null);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to delete note"));
    }
  };

  const togglePin = async () => {
    if (!selected) return;
    try {
      setError("");
      const { data } = await api.patch(`/notes/${selected._id}/pin`);
      setNotes((prev) => prev.map((n) => (n._id === selected._id ? data.note : n)));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to update pin"));
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] rounded-2xl border border-border overflow-hidden bg-surface">
      {error && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-500/10 border-b border-red-500/20">
          {error}
        </div>
      )}
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
