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
    label: "", // resolved by service → "FlowState App"
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
  // ── Previous week (2026-03-09) ──
  {
    id: 4,
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
    id: 5,
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
    id: 6,
    type: "WORK",
    label: "",
    targetHours: 12,
    projectId: 3, // ZAPAPI
    tagId: null,
    currentHours: 0,
    weekStart: "2026-03-09",
    createdAt: "2026-03-09T00:00:00Z",
  },
  // ── 2 weeks ago (2026-03-02) ──
  {
    id: 7,
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
    id: 8,
    type: "STUDY",
    label: "",
    targetHours: 6,
    projectId: null,
    tagId: 2, // Rust
    currentHours: 0,
    weekStart: "2026-03-02",
    createdAt: "2026-03-02T00:00:00Z",
  },
];

let nextGoalId = Math.max(...mockWeeklyGoals.map((g) => g.id)) + 1;

export function getNextGoalId(): number {
  return nextGoalId++;
}
