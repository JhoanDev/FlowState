// ─── Core Domain Types ───────────────────────────────────────────
// Mirrors Rust/SQLite structs exactly. Keep in sync with backend.

export type SessionType = "WORK" | "STUDY";

export type TimerMode = "PROGRESSIVE" | "REGRESSIVE";

export type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

// ─── Entity Types (map 1:1 to SQLite tables) ────────────────────

export interface Project {
  id: number;
  name: string;
  color: string; // hex e.g. "#8b5cf6"
  archived: boolean;
  createdAt: string; // ISO 8601
}

export interface Tag {
  id: number;
  name: string;
  color: string; // hex
  createdAt: string;
}

export interface Session {
  id: number;
  type: SessionType;
  projectId: number | null;
  timerMode: TimerMode;
  status: SessionStatus;
  plannedDurationSeconds: number | null; // for REGRESSIVE mode
  durationSeconds: number;
  startedAt: string; // ISO 8601
  finishedAt: string | null;
  rating: number | null; // 1-5, set on review
  notes: string;
  createdAt: string;
}

export interface SessionTag {
  sessionId: number;
  tagId: number;
}

export interface WeeklyGoal {
  id: number;
  type: SessionType;
  label: string; // derived from project.name or tag.name
  targetHours: number;
  projectId: number | null; // FK → projects (used when type = 'WORK')
  tagId: number | null; // FK → tags (used when type = 'STUDY')
  currentHours: number; // computed from sessions, not stored in DB
  weekStart: string; // ISO date (YYYY-MM-DD), always a Monday
  createdAt: string;
}

// ─── Derived / View Types (not stored directly) ─────────────────

export interface ActivityEntryTag {
  name: string;
  color: string; // hex from tag entity
}

export interface ActivityEntry {
  id: number;
  type: SessionType;
  projectName: string | null;
  projectColor: string | null; // hex from project entity
  tags: ActivityEntryTag[];
  durationSeconds: number;
  startedAt: string;
  rating: number | null;
  notes: string;
}

export interface DashboardStats {
  workHours: number;
  workTrend: number; // percentage vs previous period
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

export interface SessionStartConfig {
  type: SessionType;
  timerMode: TimerMode;
  plannedDurationSeconds: number | null;
  projectId: number | null;
  tagIds: number[];
}

export interface TodayStats {
  sessionCount: number;
  totalSeconds: number;
  avgSeconds: number; // average per session
}

// ─── Dashboard Visualization Types ──────────────────────────────

export interface HeatmapDay {
  date: string; // ISO date (YYYY-MM-DD)
  totalSeconds: number;
  sessionCount: number;
  intensity: number; // 0-4 (computed from totalSeconds)
}

export interface DistributionSlice {
  label: string;
  value: number; // hours
  color: string; // hex from project/tag color
  type: SessionType | "other";
}

export interface DistributionChart {
  title: string;
  total: number;
  slices: DistributionSlice[];
}

// ─── Weekly Goals Management ────────────────────────────────────

export interface WeeklyGoalInput {
  type: SessionType;
  targetHours: number;
  projectId: number | null; // set when type = 'WORK'
  tagId: number | null; // set when type = 'STUDY'
}

export interface WeeklyGoalSummary {
  totalCreated: number;
  totalMet: number;
  avgHoursPerWeek: number;
}

// ─── Streaks & Consistency ──────────────────────────────────────

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
}

export interface ConsistencyDay {
  date: string; // YYYY-MM-DD
  hasActivity: boolean;
}

// ─── Session with Relations (joined query result) ───────────────

export interface SessionWithRelations extends Session {
  project: Pick<Project, "id" | "name" | "color"> | null;
  tags: Pick<Tag, "id" | "name" | "color">[];
}
