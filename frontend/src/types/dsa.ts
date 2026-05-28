export type Difficulty = "Easy" | "Medium" | "Hard";
export type StatusFilter = "All" | "Solved" | "Unsolved";

export interface QuestionItem {
  _id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  companies: string[];
  solveUrl: string;
  solved: boolean;
  bookmarked: boolean;
}

export interface QuestionStats {
  total: number;
  solved: number;
  unsolved: number;
  bookmarked: number;
  progress: number;
  dailyStreak: number;
}
