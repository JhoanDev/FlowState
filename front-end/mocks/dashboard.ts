import type { DashboardStats, WeeklyGoal, ActivityEntry } from "@/types";

export const mockStats: DashboardStats = {
  workHours: 128.5,
  workTrend: 5,
  studyHours: 42.0,
  studyTrend: 12,
  currentStreak: 14,
  bestStreak: 32,
  goalsMet: 3,
  goalsTotal: 4,
};

export const mockWeeklyGoals: WeeklyGoal[] = [
  {
    id: "g1",
    type: "WORK",
    label: "FlowState App",
    targetHours: 20,
    currentHours: 15,
  },
  {
    id: "g2",
    type: "STUDY",
    label: "Algorithms",
    targetHours: 10,
    currentHours: 3,
  },
];

export const mockActivities: ActivityEntry[] = [
  {
    id: "a1",
    type: "WORK",
    category: "FlowState (Next.js)",
    duration: "2h 15m",
    timeAgo: "2 hours ago",
    notes: "Built dashboard components following flat design.",
  },
  {
    id: "a2",
    type: "STUDY",
    category: "Competitive Programming",
    duration: "45m",
    timeAgo: "5 hours ago",
    notes: "Solved DP problems on LeetCode.",
  },
  {
    id: "a3",
    type: "WORK",
    category: "Rust Tauri Core",
    duration: "1h 30m",
    timeAgo: "Yesterday",
    notes: "Setup SQLite plugin and DB connections.",
  },
];
