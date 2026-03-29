import type { WeeklyGoal } from "@/types";

// ─── Weekly Goals (raw "table" rows) ────────────────────────────
// These represent the weekly_goals table in SQLite.
// `currentHours` is always 0 here — computed dynamically by the service
// layer via JOINs on sessions (like the real SQL would).
// `label` is also resolved by the service from project.name / tag.name.
//
// FK references:
//   projectId → mockProjects.id (WORK goals)
//   tagId     → mockTags.id     (STUDY goals)

export const mockWeeklyGoals: WeeklyGoal[] = [
  // ── Current week (2026-03-16, Monday) ──
  {
    id: 1,
    type: "WORK",
    label: "",
    targetHours: 20,
    projectId: 2, // FlowState App
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-16",
    createdAt: "2026-03-16T00:00:00Z",
  },
  {
    id: 2,
    type: "STUDY",
    label: "",
    targetHours: 10,
    projectId: null,
    tagId: 6, // Algorithms
    currentHours: 0,
    weekStart: "2026-03-16",
    createdAt: "2026-03-16T00:00:00Z",
  },
  {
    id: 3,
    type: "WORK",
    label: "",
    targetHours: 15,
    projectId: 3, // ZAPAPI
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-16",
    createdAt: "2026-03-16T00:00:00Z",
  },
  {
    id: 4,
    type: "STUDY",
    label: "",
    targetHours: 5,
    projectId: null,
    tagId: 2, // Rust
    currentHours: 0,
    weekStart: "2026-03-16",
    createdAt: "2026-03-16T00:00:00Z",
  },

  // ── Previous week (2026-03-09) ──
  {
    id: 5,
    type: "WORK",
    label: "",
    targetHours: 20,
    projectId: 2, // FlowState App
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-09",
    createdAt: "2026-03-09T00:00:00Z",
  },
  {
    id: 6,
    type: "STUDY",
    label: "",
    targetHours: 8,
    projectId: null,
    tagId: 6, // Algorithms
    currentHours: 0,
    weekStart: "2026-03-09",
    createdAt: "2026-03-09T00:00:00Z",
  },
  {
    id: 7,
    type: "WORK",
    label: "",
    targetHours: 12,
    projectId: 3, // ZAPAPI
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-09",
    createdAt: "2026-03-09T00:00:00Z",
  },
  {
    id: 8,
    type: "STUDY",
    label: "",
    targetHours: 4,
    projectId: null,
    tagId: 5, // C++
    currentHours: 0,
    weekStart: "2026-03-09",
    createdAt: "2026-03-09T00:00:00Z",
  },

  // ── 2 weeks ago (2026-03-02) ──
  {
    id: 9,
    type: "WORK",
    label: "",
    targetHours: 18,
    projectId: 2, // FlowState App
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-02",
    createdAt: "2026-03-02T00:00:00Z",
  },
  {
    id: 10,
    type: "STUDY",
    label: "",
    targetHours: 6,
    projectId: null,
    tagId: 2, // Rust
    currentHours: 0,
    weekStart: "2026-03-02",
    createdAt: "2026-03-02T00:00:00Z",
  },
  {
    id: 11,
    type: "WORK",
    label: "",
    targetHours: 10,
    projectId: 5, // DevBlog
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-02",
    createdAt: "2026-03-02T00:00:00Z",
  },

  // ── 3 weeks ago (2026-02-23) ──
  {
    id: 12,
    type: "WORK",
    label: "",
    targetHours: 20,
    projectId: 2, // FlowState App
    tagId: null,
    currentHours: 0,
    weekStart: "2026-02-23",
    createdAt: "2026-02-23T00:00:00Z",
  },
  {
    id: 13,
    type: "STUDY",
    label: "",
    targetHours: 8,
    projectId: null,
    tagId: 6, // Algorithms
    currentHours: 0,
    weekStart: "2026-02-23",
    createdAt: "2026-02-23T00:00:00Z",
  },
  {
    id: 14,
    type: "WORK",
    label: "",
    targetHours: 10,
    projectId: 3, // ZAPAPI
    tagId: null,
    currentHours: 0,
    weekStart: "2026-02-23",
    createdAt: "2026-02-23T00:00:00Z",
  },

  // ── 4 weeks ago (2026-02-16) ──
  {
    id: 15,
    type: "WORK",
    label: "",
    targetHours: 15,
    projectId: 2, // FlowState App
    tagId: null,
    currentHours: 0,
    weekStart: "2026-02-16",
    createdAt: "2026-02-16T00:00:00Z",
  },
  {
    id: 16,
    type: "STUDY",
    label: "",
    targetHours: 6,
    projectId: null,
    tagId: 2, // Rust
    currentHours: 0,
    weekStart: "2026-02-16",
    createdAt: "2026-02-16T00:00:00Z",
  },
];

let nextGoalId = Math.max(...mockWeeklyGoals.map((g) => g.id)) + 1;

export function getNextGoalId(): number {
  return nextGoalId++;
}
