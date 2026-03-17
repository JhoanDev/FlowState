// ─── Core Domain Types ───────────────────────────────────────────
// Mirrors future Rust/SQLite structs. Keep in sync with backend.

export type SessionType = "WORK" | "STUDY";

export type TimerMode = "PROGRESSIVE" | "REGRESSIVE";

export interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Session {
  id: string;
  type: SessionType;
  projectId?: string;
  tagIds: string[];
  durationSeconds: number;
  startedAt: string;
  finishedAt: string;
  rating: number; // 1-5
  notes: string;
}

export interface WeeklyGoal {
  id: string;
  type: SessionType;
  label: string;
  targetHours: number;
  currentHours: number;
}

export interface ActivityEntry {
  id: string;
  type: SessionType;
  category: string;
  duration: string;
  timeAgo: string;
  notes: string;
}

export interface DashboardStats {
  workHours: number;
  workTrend: number; // percentage
  studyHours: number;
  studyTrend: number;
  currentStreak: number;
  bestStreak: number;
  goalsMet: number;
  goalsTotal: number;
}

export interface SessionReviewData {
  rating: number;
  notes: string;
}
