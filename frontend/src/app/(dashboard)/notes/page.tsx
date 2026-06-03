"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagination } from "@/hooks/usePagination";
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
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function NotesWorkspacePage() {
  const [notes, setNotes] = useState<CodingNote[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { page, limit, setPage, resetPage } = usePagination({ initialPage: 1, initialLimit: 10 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const { request, loading: loadingNotes } = useApi<{ notes: CodingNote[]; page: number; totalPages: number }>();

  const selected = useMemo(
    () => notes.find((n) => n._id === selectedId) || null,
    [notes, selectedId]
  );

  const loadNotes = useCallback(async () => {
    try {
      setError("");
      const response = await request({
        method: "get",
        url: "/notes",
        params: {
          search: debouncedSearch || undefined,
          page,
          limit,
        },
      });

      const data = response.data;
      setNotes(data.notes || []);
      setTotalPages(data.totalPages ?? 1);
      setSelectedId((current) => {
        if (current && data.notes?.some((n) => n._id === current)) {
          return current;
        }
        return data.notes?.[0]?._id || null;
      });
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to load notes"));
    }
  }, [debouncedSearch, limit, page, request]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  useEffect(() => {
    resetPage();
  }, [debouncedSearch, resetPage]);

  const createNote = async () => {
    try {
      setError("");
      const response = await request<{ note: CodingNote }>({
        method: "post",
        url: "/notes",
        data: defaultNote,
      });

      setNotes((prev) => [response.data.note, ...prev]);
      setSelectedId(response.data.note._id);
      setPage(1);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to create note"));
    }
  };

  const updateLocal = (patch: Partial<CodingNote>) => {
    if (!selected) return;
    setNotes((prev) => prev.map((n) => (n._id === selected._id ? { ...n, ...patch } : n)));
  };

  useEffect(() => {
    if (!selected) return;
    const snapshot = selected;
    const timer = window.setTimeout(async () => {
      try {
        setSaving(true);
        await request({
          method: "put",
          url: `/notes/${snapshot._id}`,
          data: {
            title: snapshot.title,
            topic: snapshot.topic,
            difficulty: snapshot.difficulty,
            tags: snapshot.tags,
            personalExplanation: snapshot.personalExplanation,
            codeSolution: snapshot.codeSolution,
            revisionNotes: snapshot.revisionNotes,
          },
        });
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "Failed to save note"));
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [request, selected]);

  const deleteCurrent = async () => {
    if (!selected) return;
    try {
      setError("");
      await request({ method: "delete", url: `/notes/${selected._id}` });
      const remaining = notes.filter((n) => n._id !== selected._id);
      setNotes(remaining);
      if (remaining.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        setSelectedId(remaining[0]?._id || null);
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to delete note"));
    }
  };

  const togglePin = async () => {
    if (!selected) return;
    try {
      setError("");
      const response = await request<{ note: CodingNote }>({ method: "patch", url: `/notes/${selected._id}/pin` });
      setNotes((prev) => prev.map((n) => (n._id === selected._id ? response.data.note : n)));
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
          page={page}
          totalPages={totalPages}
          isLoading={loadingNotes}
          onSearch={setSearch}
          onSelect={setSelectedId}
          onCreate={createNote}
          onPageChange={setPage}
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
