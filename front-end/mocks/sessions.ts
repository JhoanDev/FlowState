import type { Session, SessionTag } from "@/types";

// ─── Sessions (last ~3 weeks of realistic data) ─────────────────
// All sessions are COMPLETED to represent historical data.
// projectId references mockProjects, tagIds via session_tags.

export const mockSessions: Session[] = [
  // ── Today ──
  {
    id: 1,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 8100, // 2h 15m
    startedAt: "2026-03-18T08:00:00Z",
    finishedAt: "2026-03-18T10:15:00Z",
    rating: 4,
    notes: "Built dashboard components following flat design.",
    createdAt: "2026-03-18T08:00:00Z",
  },
  {
    id: 2,
    type: "STUDY",
    projectId: null,
    timerMode: "REGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: 2700,
    durationSeconds: 2700, // 45m
    startedAt: "2026-03-18T14:00:00Z",
    finishedAt: "2026-03-18T14:45:00Z",
    rating: 3,
    notes: "Solved DP problems on LeetCode.",
    createdAt: "2026-03-18T14:00:00Z",
  },
  // ── Yesterday ──
  {
    id: 3,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-17T09:00:00Z",
    finishedAt: "2026-03-17T10:30:00Z",
    rating: 5,
    notes: "Setup SQLite plugin and DB connections.",
    createdAt: "2026-03-17T09:00:00Z",
  },
  {
    id: 4,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 4200, // 1h 10m
    startedAt: "2026-03-17T15:00:00Z",
    finishedAt: "2026-03-17T16:10:00Z",
    rating: 4,
    notes: "Read chapters on lifetimes and borrowing.",
    createdAt: "2026-03-17T15:00:00Z",
  },
  // ── 2 days ago ──
  {
    id: 5,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-03-16T08:30:00Z",
    finishedAt: "2026-03-16T11:30:00Z",
    rating: 4,
    notes: "Connected REST endpoints with frontend services.",
    createdAt: "2026-03-16T08:30:00Z",
  },
  {
    id: 6,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-16T14:00:00Z",
    finishedAt: "2026-03-16T16:00:00Z",
    rating: 3,
    notes: "Refactored component structure for sidebar navigation.",
    createdAt: "2026-03-16T14:00:00Z",
  },
  // ── 3 days ago ──
  {
    id: 7,
    type: "STUDY",
    projectId: null,
    timerMode: "REGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: 5400,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-15T10:00:00Z",
    finishedAt: "2026-03-15T11:30:00Z",
    rating: 5,
    notes: "Graph algorithms — BFS/DFS practice.",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: 8,
    type: "WORK",
    projectId: 1,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-15T14:00:00Z",
    finishedAt: "2026-03-15T15:00:00Z",
    rating: 4,
    notes: "CLI argument parsing with clap.",
    createdAt: "2026-03-15T14:00:00Z",
  },
  // ── 4 days ago ──
  {
    id: 9,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 9000, // 2h 30m
    startedAt: "2026-03-14T08:00:00Z",
    finishedAt: "2026-03-14T10:30:00Z",
    rating: 4,
    notes: "Implemented rate limiting middleware.",
    createdAt: "2026-03-14T08:00:00Z",
  },
  {
    id: 10,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-14T16:00:00Z",
    finishedAt: "2026-03-14T17:00:00Z",
    rating: 3,
    notes: "Rust ownership deep dive — smart pointers.",
    createdAt: "2026-03-14T16:00:00Z",
  },
  // ── 5 days ago ──
  {
    id: 11,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-03-13T08:00:00Z",
    finishedAt: "2026-03-13T11:00:00Z",
    rating: 5,
    notes: "Timer component with progressive/regressive modes.",
    createdAt: "2026-03-13T08:00:00Z",
  },
  {
    id: 12,
    type: "WORK",
    projectId: 4,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-13T14:00:00Z",
    finishedAt: "2026-03-13T15:30:00Z",
    rating: 3,
    notes: "Portfolio layout and project cards.",
    createdAt: "2026-03-13T14:00:00Z",
  },
  // ── 6 days ago ──
  {
    id: 13,
    type: "STUDY",
    projectId: null,
    timerMode: "REGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: 3600,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-12T10:00:00Z",
    finishedAt: "2026-03-12T11:00:00Z",
    rating: 4,
    notes: "Binary search variations and edge cases.",
    createdAt: "2026-03-12T10:00:00Z",
  },
  {
    id: 14,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-12T14:00:00Z",
    finishedAt: "2026-03-12T16:00:00Z",
    rating: 4,
    notes: "Session config form with project/tag selectors.",
    createdAt: "2026-03-12T14:00:00Z",
  },
  // ── Week 2 (7-13 days ago) ──
  {
    id: 15,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-03-11T08:00:00Z",
    finishedAt: "2026-03-11T11:00:00Z",
    rating: 5,
    notes: "Authentication flow — JWT tokens and refresh.",
    createdAt: "2026-03-11T08:00:00Z",
  },
  {
    id: 16,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-10T10:00:00Z",
    finishedAt: "2026-03-10T11:30:00Z",
    rating: 4,
    notes: "Linux kernel modules — basic char device driver.",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: 17,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-09T09:00:00Z",
    finishedAt: "2026-03-09T11:00:00Z",
    rating: 4,
    notes: "Weekly goals progress bars and stats cards.",
    createdAt: "2026-03-09T09:00:00Z",
  },
  {
    id: 18,
    type: "WORK",
    projectId: 1,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-08T08:00:00Z",
    finishedAt: "2026-03-08T09:30:00Z",
    rating: 4,
    notes: "CLI export command — SQLite to JSON.",
    createdAt: "2026-03-08T08:00:00Z",
  },
  {
    id: 19,
    type: "STUDY",
    projectId: null,
    timerMode: "REGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: 2700,
    durationSeconds: 2700, // 45m
    startedAt: "2026-03-08T15:00:00Z",
    finishedAt: "2026-03-08T15:45:00Z",
    rating: 3,
    notes: "Codeforces round — two problems solved.",
    createdAt: "2026-03-08T15:00:00Z",
  },
  {
    id: 20,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 9000, // 2h 30m
    startedAt: "2026-03-07T08:00:00Z",
    finishedAt: "2026-03-07T10:30:00Z",
    rating: 5,
    notes: "Database schema design and migration system.",
    createdAt: "2026-03-07T08:00:00Z",
  },
];

// ─── Session ↔ Tag junction table ───────────────────────────────

export const mockSessionTags: SessionTag[] = [
  // Session 1: FlowState App → React, Next.js
  { sessionId: 1, tagId: 1 },
  { sessionId: 1, tagId: 3 },
  // Session 2: Study → Algorithms, Competitive Programming
  { sessionId: 2, tagId: 6 },
  { sessionId: 2, tagId: 8 },
  // Session 3: FlowState App → Rust
  { sessionId: 3, tagId: 2 },
  // Session 4: Study → Rust
  { sessionId: 4, tagId: 2 },
  // Session 5: ZAPAPI → Go
  { sessionId: 5, tagId: 4 },
  // Session 6: FlowState App → React, Next.js
  { sessionId: 6, tagId: 1 },
  { sessionId: 6, tagId: 3 },
  // Session 7: Study → Algorithms
  { sessionId: 7, tagId: 6 },
  // Session 8: FlowState CLI → Rust
  { sessionId: 8, tagId: 2 },
  // Session 9: ZAPAPI → Go
  { sessionId: 9, tagId: 4 },
  // Session 10: Study → Rust
  { sessionId: 10, tagId: 2 },
  // Session 11: FlowState App → React, Next.js
  { sessionId: 11, tagId: 1 },
  { sessionId: 11, tagId: 3 },
  // Session 12: Portfolio → React
  { sessionId: 12, tagId: 1 },
  // Session 13: Study → Algorithms, Competitive Programming
  { sessionId: 13, tagId: 6 },
  { sessionId: 13, tagId: 8 },
  // Session 14: FlowState App → React, Next.js
  { sessionId: 14, tagId: 1 },
  { sessionId: 14, tagId: 3 },
  // Session 15: ZAPAPI → Go
  { sessionId: 15, tagId: 4 },
  // Session 16: Study → Linux
  { sessionId: 16, tagId: 7 },
  // Session 17: FlowState App → React, Next.js
  { sessionId: 17, tagId: 1 },
  { sessionId: 17, tagId: 3 },
  // Session 18: FlowState CLI → Rust
  { sessionId: 18, tagId: 2 },
  // Session 19: Study → Algorithms, Competitive Programming
  { sessionId: 19, tagId: 6 },
  { sessionId: 19, tagId: 8 },
  // Session 20: ZAPAPI → Go
  { sessionId: 20, tagId: 4 },
];
