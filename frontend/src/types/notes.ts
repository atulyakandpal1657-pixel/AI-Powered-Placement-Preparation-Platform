import type { Difficulty } from "./dsa";

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface CodingNote {
  _id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  tags: string[];
  pinned: boolean;
  personalExplanation: string;
  codeSolution: string;
  revisionNotes: string;
  checklist: ChecklistItem[];
  updatedAt: string;
}
