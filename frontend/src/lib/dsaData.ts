export type Difficulty = "Easy" | "Medium" | "Hard";

export interface DSAProblem {
  _id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  solved: boolean;
  link: string;
  createdAt: string;
  updatedAt: string;
}

export interface DSAStats {
  total: number;
  solved: number;
  unsolved: number;
  completionRate: number;
  byDifficulty: Record<Difficulty, { total: number; solved: number }>;
  byTopic: Record<string, { total: number; solved: number }>;
}

export const defaultTopics = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack & Queue",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Binary Search",
  "Backtracking",
  "Heap",
  "Trie",
];
