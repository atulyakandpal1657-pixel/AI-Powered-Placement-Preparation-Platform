export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Solved" | "Attempted" | "Unsolved";

export interface DSAProblem {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  status: Status;
  link: string;
}

export const dsaTopics = [
  "All",
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
] as const;

export const dsaProblems: DSAProblem[] = [
  // Arrays
  { id: 1, title: "Two Sum", topic: "Arrays", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 2, title: "Best Time to Buy and Sell Stock", topic: "Arrays", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 3, title: "Contains Duplicate", topic: "Arrays", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 4, title: "Maximum Subarray", topic: "Arrays", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 5, title: "Product of Array Except Self", topic: "Arrays", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 6, title: "3Sum", topic: "Arrays", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 7, title: "Container With Most Water", topic: "Arrays", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 8, title: "Trapping Rain Water", topic: "Arrays", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Strings
  { id: 9, title: "Valid Anagram", topic: "Strings", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 10, title: "Valid Parentheses", topic: "Strings", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 11, title: "Longest Substring Without Repeating Characters", topic: "Strings", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 12, title: "Longest Palindromic Substring", topic: "Strings", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 13, title: "Minimum Window Substring", topic: "Strings", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Linked List
  { id: 14, title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 15, title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 16, title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy", status: "Attempted", link: "#" },
  { id: 17, title: "Remove Nth Node From End of List", topic: "Linked List", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 18, title: "Merge K Sorted Lists", topic: "Linked List", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Stack & Queue
  { id: 19, title: "Min Stack", topic: "Stack & Queue", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 20, title: "Implement Queue using Stacks", topic: "Stack & Queue", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 21, title: "Daily Temperatures", topic: "Stack & Queue", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 22, title: "Largest Rectangle in Histogram", topic: "Stack & Queue", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Trees
  { id: 23, title: "Maximum Depth of Binary Tree", topic: "Trees", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 24, title: "Invert Binary Tree", topic: "Trees", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 25, title: "Validate Binary Search Tree", topic: "Trees", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 26, title: "Binary Tree Level Order Traversal", topic: "Trees", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 27, title: "Serialize and Deserialize Binary Tree", topic: "Trees", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Graphs
  { id: 28, title: "Number of Islands", topic: "Graphs", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 29, title: "Clone Graph", topic: "Graphs", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 30, title: "Course Schedule", topic: "Graphs", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 31, title: "Word Ladder", topic: "Graphs", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Dynamic Programming
  { id: 32, title: "Climbing Stairs", topic: "Dynamic Programming", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 33, title: "House Robber", topic: "Dynamic Programming", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 34, title: "Coin Change", topic: "Dynamic Programming", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 35, title: "Longest Increasing Subsequence", topic: "Dynamic Programming", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 36, title: "Edit Distance", topic: "Dynamic Programming", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 37, title: "Regular Expression Matching", topic: "Dynamic Programming", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Greedy
  { id: 38, title: "Jump Game", topic: "Greedy", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 39, title: "Gas Station", topic: "Greedy", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 40, title: "Task Scheduler", topic: "Greedy", difficulty: "Medium", status: "Unsolved", link: "#" },
  // Binary Search
  { id: 41, title: "Binary Search", topic: "Binary Search", difficulty: "Easy", status: "Solved", link: "#" },
  { id: 42, title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 43, title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", status: "Unsolved", link: "#" },
  { id: 44, title: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Backtracking
  { id: 45, title: "Subsets", topic: "Backtracking", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 46, title: "Permutations", topic: "Backtracking", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 47, title: "Combination Sum", topic: "Backtracking", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 48, title: "N-Queens", topic: "Backtracking", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Heap
  { id: 49, title: "Kth Largest Element in an Array", topic: "Heap", difficulty: "Medium", status: "Solved", link: "#" },
  { id: 50, title: "Find Median from Data Stream", topic: "Heap", difficulty: "Hard", status: "Unsolved", link: "#" },
  // Trie
  { id: 51, title: "Implement Trie (Prefix Tree)", topic: "Trie", difficulty: "Medium", status: "Attempted", link: "#" },
  { id: 52, title: "Word Search II", topic: "Trie", difficulty: "Hard", status: "Unsolved", link: "#" },
];
