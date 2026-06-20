import type { Session, SessionTag } from "@/types";

// ─── Sessions (~6 weeks of realistic data) ─────────────────────
// Mirrors the sessions table in SQLite exactly.
// All historical sessions are COMPLETED or CANCELLED.
// projectId references mockProjects, tagIds via session_tags.
// STUDY sessions always have projectId: null.

export const mockSessions: Session[] = [
  // ══════════════════════════════════════════════════════════════
  // Week 6 — current week (2026-03-16 Mon → 2026-03-22 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-03-18 (Wednesday) ──
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
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 2700,
    durationSeconds: 2700, // 45m
    startedAt: "2026-03-18T14:00:00Z",
    finishedAt: "2026-03-18T14:45:00Z",
    rating: 3,
    notes: "Solved DP problems on LeetCode.",
    createdAt: "2026-03-18T14:00:00Z",
  },
  {
    id: 3,
    type: "WORK",
    projectId: 5,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-18T16:00:00Z",
    finishedAt: "2026-03-18T17:00:00Z",
    rating: 4,
    notes: "Blog post on Tauri v2 migration tips.",
    createdAt: "2026-03-18T16:00:00Z",
  },

  // ── 2026-03-17 (Tuesday) ──
  {
    id: 4,
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
    id: 5,
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

  // ── 2026-03-16 (Monday) ──
  {
    id: 6,
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
    id: 7,
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

  // ══════════════════════════════════════════════════════════════
  // Week 5 (2026-03-09 Mon → 2026-03-15 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-03-15 (Sunday) ──
  {
    id: 8,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
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
    id: 9,
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

  // ── 2026-03-14 (Saturday) ──
  {
    id: 10,
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
    id: 11,
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

  // ── 2026-03-13 (Friday) ──
  {
    id: 12,
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
    id: 13,
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

  // ── 2026-03-12 (Thursday) ──
  {
    id: 14,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
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
    id: 15,
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

  // ── 2026-03-11 (Wednesday) ──
  {
    id: 16,
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
    id: 17,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-11T15:00:00Z",
    finishedAt: "2026-03-11T16:30:00Z",
    rating: 4,
    notes: "C++ templates and metaprogramming basics.",
    createdAt: "2026-03-11T15:00:00Z",
  },

  // ── 2026-03-10 (Tuesday) ──
  {
    id: 18,
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
    id: 19,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-10T14:00:00Z",
    finishedAt: "2026-03-10T16:00:00Z",
    rating: 4,
    notes: "Heatmap contribution grid with intensity levels.",
    createdAt: "2026-03-10T14:00:00Z",
  },

  // ── 2026-03-09 (Monday) ──
  {
    id: 20,
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
    id: 21,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "CANCELLED",
    plannedDurationSeconds: null,
    durationSeconds: 1800, // 30m (cancelled early)
    startedAt: "2026-03-09T14:00:00Z",
    finishedAt: "2026-03-09T14:30:00Z",
    rating: null,
    notes: "",
    createdAt: "2026-03-09T14:00:00Z",
  },

  // ══════════════════════════════════════════════════════════════
  // Week 4 (2026-03-02 Mon → 2026-03-08 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-03-08 (Sunday) ──
  {
    id: 22,
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
    id: 23,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 2700,
    durationSeconds: 2700, // 45m
    startedAt: "2026-03-08T15:00:00Z",
    finishedAt: "2026-03-08T15:45:00Z",
    rating: 3,
    notes: "Codeforces round — two problems solved.",
    createdAt: "2026-03-08T15:00:00Z",
  },

  // ── 2026-03-07 (Saturday) ──
  {
    id: 24,
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
  {
    id: 25,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-07T14:00:00Z",
    finishedAt: "2026-03-07T16:00:00Z",
    rating: 5,
    notes: "Docker multi-stage builds and layer optimization.",
    createdAt: "2026-03-07T14:00:00Z",
  },

  // ── 2026-03-06 (Friday) ──
  {
    id: 26,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-03-06T08:00:00Z",
    finishedAt: "2026-03-06T11:00:00Z",
    rating: 5,
    notes: "Logbook page with calendar and drill-down by tag.",
    createdAt: "2026-03-06T08:00:00Z",
  },
  {
    id: 27,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 3600,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-06T15:00:00Z",
    finishedAt: "2026-03-06T16:00:00Z",
    rating: 4,
    notes: "Go goroutines and channels — concurrency patterns.",
    createdAt: "2026-03-06T15:00:00Z",
  },

  // ── 2026-03-05 (Thursday) ──
  {
    id: 28,
    type: "WORK",
    projectId: 5,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-05T09:00:00Z",
    finishedAt: "2026-03-05T10:30:00Z",
    rating: 3,
    notes: "MDX setup and syntax highlighting for code blocks.",
    createdAt: "2026-03-05T09:00:00Z",
  },
  {
    id: 29,
    type: "WORK",
    projectId: 4,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-05T14:00:00Z",
    finishedAt: "2026-03-05T16:00:00Z",
    rating: 4,
    notes: "Portfolio responsive grid and dark mode toggle.",
    createdAt: "2026-03-05T14:00:00Z",
  },

  // ── 2026-03-04 (Wednesday) ──
  {
    id: 30,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 9000, // 2h 30m
    startedAt: "2026-03-04T08:00:00Z",
    finishedAt: "2026-03-04T10:30:00Z",
    rating: 4,
    notes: "WebSocket support for real-time notifications.",
    createdAt: "2026-03-04T08:00:00Z",
  },
  {
    id: 31,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-04T15:00:00Z",
    finishedAt: "2026-03-04T16:30:00Z",
    rating: 4,
    notes: "Rust async runtime — tokio fundamentals.",
    createdAt: "2026-03-04T15:00:00Z",
  },

  // ── 2026-03-03 (Tuesday) ──
  {
    id: 32,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-03T09:00:00Z",
    finishedAt: "2026-03-03T11:00:00Z",
    rating: 4,
    notes: "Settings page with theme switcher and locale config.",
    createdAt: "2026-03-03T09:00:00Z",
  },
  {
    id: 33,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 5400,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-03T14:00:00Z",
    finishedAt: "2026-03-03T15:30:00Z",
    rating: 5,
    notes: "Segment trees and range queries for CP.",
    createdAt: "2026-03-03T14:00:00Z",
  },

  // ── 2026-03-02 (Monday) ──
  {
    id: 34,
    type: "WORK",
    projectId: 1,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-03-02T08:00:00Z",
    finishedAt: "2026-03-02T09:30:00Z",
    rating: 4,
    notes: "CLI import command — JSON to SQLite restore.",
    createdAt: "2026-03-02T08:00:00Z",
  },
  {
    id: 35,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-03-02T15:00:00Z",
    finishedAt: "2026-03-02T16:00:00Z",
    rating: 3,
    notes: "Linux systemd unit files and service management.",
    createdAt: "2026-03-02T15:00:00Z",
  },

  // ══════════════════════════════════════════════════════════════
  // Week 3 (2026-02-23 Mon → 2026-03-01 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-03-01 (Sunday) ──
  {
    id: 36,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 7200,
    durationSeconds: 7200, // 2h
    startedAt: "2026-03-01T10:00:00Z",
    finishedAt: "2026-03-01T12:00:00Z",
    rating: 5,
    notes: "Competitive programming contest — 4 problems solved.",
    createdAt: "2026-03-01T10:00:00Z",
  },

  // ── 2026-02-28 (Saturday) ──
  {
    id: 37,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-02-28T08:00:00Z",
    finishedAt: "2026-02-28T11:00:00Z",
    rating: 5,
    notes: "Mini-player PiP window with always-on-top.",
    createdAt: "2026-02-28T08:00:00Z",
  },
  {
    id: 38,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-02-28T14:00:00Z",
    finishedAt: "2026-02-28T15:30:00Z",
    rating: 4,
    notes: "CORS configuration and API versioning.",
    createdAt: "2026-02-28T14:00:00Z",
  },

  // ── 2026-02-27 (Friday) ──
  {
    id: 39,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 4500, // 1h 15m
    startedAt: "2026-02-27T10:00:00Z",
    finishedAt: "2026-02-27T11:15:00Z",
    rating: 4,
    notes: "Go error handling patterns and custom error types.",
    createdAt: "2026-02-27T10:00:00Z",
  },
  {
    id: 40,
    type: "WORK",
    projectId: 5,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-02-27T14:00:00Z",
    finishedAt: "2026-02-27T15:00:00Z",
    rating: 3,
    notes: "Blog RSS feed and sitemap generation.",
    createdAt: "2026-02-27T14:00:00Z",
  },

  // ── 2026-02-26 (Thursday) ──
  {
    id: 41,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 9000, // 2h 30m
    startedAt: "2026-02-26T08:00:00Z",
    finishedAt: "2026-02-26T10:30:00Z",
    rating: 4,
    notes: "Tauri IPC bridge and invoke abstraction layer.",
    createdAt: "2026-02-26T08:00:00Z",
  },
  {
    id: 42,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 3600,
    durationSeconds: 3600, // 1h
    startedAt: "2026-02-26T16:00:00Z",
    finishedAt: "2026-02-26T17:00:00Z",
    rating: 4,
    notes: "TypeScript advanced generics and conditional types.",
    createdAt: "2026-02-26T16:00:00Z",
  },

  // ── 2026-02-25 (Wednesday) ──
  {
    id: 43,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-02-25T08:00:00Z",
    finishedAt: "2026-02-25T10:00:00Z",
    rating: 4,
    notes: "Input validation middleware with custom error responses.",
    createdAt: "2026-02-25T08:00:00Z",
  },
  {
    id: 44,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "CANCELLED",
    plannedDurationSeconds: null,
    durationSeconds: 900, // 15m (cancelled — interruption)
    startedAt: "2026-02-25T15:00:00Z",
    finishedAt: "2026-02-25T15:15:00Z",
    rating: null,
    notes: "",
    createdAt: "2026-02-25T15:00:00Z",
  },

  // ── 2026-02-24 (Tuesday) ──
  {
    id: 45,
    type: "WORK",
    projectId: 4,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-02-24T09:00:00Z",
    finishedAt: "2026-02-24T10:30:00Z",
    rating: 4,
    notes: "Portfolio contact form with email validation.",
    createdAt: "2026-02-24T09:00:00Z",
  },
  {
    id: 46,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 5400,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-02-24T14:00:00Z",
    finishedAt: "2026-02-24T15:30:00Z",
    rating: 5,
    notes: "C++ STL containers deep dive — map, unordered_map, set.",
    createdAt: "2026-02-24T14:00:00Z",
  },

  // ── 2026-02-23 (Monday) ──
  {
    id: 47,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-02-23T08:00:00Z",
    finishedAt: "2026-02-23T11:00:00Z",
    rating: 5,
    notes: "Session review modal with rating and notes.",
    createdAt: "2026-02-23T08:00:00Z",
  },

  // ══════════════════════════════════════════════════════════════
  // Week 2 (2026-02-16 Mon → 2026-02-22 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-02-22 (Sunday) ──
  {
    id: 48,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-02-22T10:00:00Z",
    finishedAt: "2026-02-22T11:30:00Z",
    rating: 4,
    notes: "Docker compose networking and volume management.",
    createdAt: "2026-02-22T10:00:00Z",
  },

  // ── 2026-02-20 (Friday) ──
  {
    id: 49,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-02-20T08:00:00Z",
    finishedAt: "2026-02-20T10:00:00Z",
    rating: 4,
    notes: "Project and tag CRUD with optimistic updates.",
    createdAt: "2026-02-20T08:00:00Z",
  },
  {
    id: 50,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 2700,
    durationSeconds: 2700, // 45m
    startedAt: "2026-02-20T16:00:00Z",
    finishedAt: "2026-02-20T16:45:00Z",
    rating: 3,
    notes: "Codeforces Div.2 — greedy and math problems.",
    createdAt: "2026-02-20T16:00:00Z",
  },

  // ── 2026-02-19 (Thursday) ──
  {
    id: 51,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-02-19T08:00:00Z",
    finishedAt: "2026-02-19T11:00:00Z",
    rating: 5,
    notes: "Full CRUD endpoints for resources with pagination.",
    createdAt: "2026-02-19T08:00:00Z",
  },

  // ── 2026-02-18 (Wednesday) ──
  {
    id: 52,
    type: "WORK",
    projectId: 1,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-02-18T09:00:00Z",
    finishedAt: "2026-02-18T10:00:00Z",
    rating: 4,
    notes: "CLI interactive mode with colored output.",
    createdAt: "2026-02-18T09:00:00Z",
  },
  {
    id: 53,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 4500, // 1h 15m
    startedAt: "2026-02-18T14:00:00Z",
    finishedAt: "2026-02-18T15:15:00Z",
    rating: 4,
    notes: "Rust traits and trait objects — dynamic dispatch.",
    createdAt: "2026-02-18T14:00:00Z",
  },

  // ── 2026-02-17 (Tuesday) ──
  {
    id: 54,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 9000, // 2h 30m
    startedAt: "2026-02-17T08:00:00Z",
    finishedAt: "2026-02-17T10:30:00Z",
    rating: 4,
    notes: "Backup import/export with file dialog integration.",
    createdAt: "2026-02-17T08:00:00Z",
  },

  // ══════════════════════════════════════════════════════════════
  // Week 1 (2026-02-09 Mon → 2026-02-15 Sun)
  // ══════════════════════════════════════════════════════════════

  // ── 2026-02-14 (Friday) ──
  {
    id: 55,
    type: "WORK",
    projectId: 2,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 10800, // 3h
    startedAt: "2026-02-14T08:00:00Z",
    finishedAt: "2026-02-14T11:00:00Z",
    rating: 5,
    notes: "Initial Tauri v2 project scaffold and window config.",
    createdAt: "2026-02-14T08:00:00Z",
  },

  // ── 2026-02-13 (Thursday) ──
  {
    id: 56,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-02-13T10:00:00Z",
    finishedAt: "2026-02-13T12:00:00Z",
    rating: 5,
    notes: "Rust error handling with thiserror and anyhow.",
    createdAt: "2026-02-13T10:00:00Z",
  },

  // ── 2026-02-12 (Wednesday) ──
  {
    id: 57,
    type: "WORK",
    projectId: 4,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 5400, // 1h 30m
    startedAt: "2026-02-12T09:00:00Z",
    finishedAt: "2026-02-12T10:30:00Z",
    rating: 3,
    notes: "Portfolio hero section animations with Framer Motion.",
    createdAt: "2026-02-12T09:00:00Z",
  },
  {
    id: 58,
    type: "STUDY",
    projectId: null,
    timerMode: "POMODORO",
    status: "COMPLETED",
    plannedDurationSeconds: 3600,
    durationSeconds: 3600, // 1h
    startedAt: "2026-02-12T15:00:00Z",
    finishedAt: "2026-02-12T16:00:00Z",
    rating: 4,
    notes: "Linux networking — iptables and nftables basics.",
    createdAt: "2026-02-12T15:00:00Z",
  },

  // ── 2026-02-10 (Monday) ──
  {
    id: 59,
    type: "WORK",
    projectId: 3,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 7200, // 2h
    startedAt: "2026-02-10T08:00:00Z",
    finishedAt: "2026-02-10T10:00:00Z",
    rating: 4,
    notes: "ZAPAPI project bootstrap — Go module and router setup.",
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: 60,
    type: "STUDY",
    projectId: null,
    timerMode: "PROGRESSIVE",
    status: "COMPLETED",
    plannedDurationSeconds: null,
    durationSeconds: 3600, // 1h
    startedAt: "2026-02-10T15:00:00Z",
    finishedAt: "2026-02-10T16:00:00Z",
    rating: 3,
    notes: "Go interfaces and composition over inheritance.",
    createdAt: "2026-02-10T15:00:00Z",
  },
];

// ─── Session ↔ Tag junction table ───────────────────────────────
// Mirrors the session_tags table exactly (composite PK: session_id, tag_id).
// WORK sessions get technology tags used in the project.
// STUDY sessions get subject/topic tags.

export const mockSessionTags: SessionTag[] = [
  // Session 1: FlowState App → React, Next.js
  { sessionId: 1, tagId: 1 },
  { sessionId: 1, tagId: 3 },
  // Session 2: Study → Algorithms, Competitive Programming
  { sessionId: 2, tagId: 6 },
  { sessionId: 2, tagId: 8 },
  // Session 3: DevBlog → Next.js, TypeScript
  { sessionId: 3, tagId: 3 },
  { sessionId: 3, tagId: 9 },
  // Session 4: FlowState App → Rust
  { sessionId: 4, tagId: 2 },
  // Session 5: Study → Rust
  { sessionId: 5, tagId: 2 },
  // Session 6: ZAPAPI → Go
  { sessionId: 6, tagId: 4 },
  // Session 7: FlowState App → React, Next.js
  { sessionId: 7, tagId: 1 },
  { sessionId: 7, tagId: 3 },
  // Session 8: Study → Algorithms
  { sessionId: 8, tagId: 6 },
  // Session 9: FlowState CLI → Rust
  { sessionId: 9, tagId: 2 },
  // Session 10: ZAPAPI → Go
  { sessionId: 10, tagId: 4 },
  // Session 11: Study → Rust
  { sessionId: 11, tagId: 2 },
  // Session 12: FlowState App → React, Next.js, TypeScript
  { sessionId: 12, tagId: 1 },
  { sessionId: 12, tagId: 3 },
  { sessionId: 12, tagId: 9 },
  // Session 13: Portfolio → React
  { sessionId: 13, tagId: 1 },
  // Session 14: Study → Algorithms, Competitive Programming
  { sessionId: 14, tagId: 6 },
  { sessionId: 14, tagId: 8 },
  // Session 15: FlowState App → React, Next.js
  { sessionId: 15, tagId: 1 },
  { sessionId: 15, tagId: 3 },
  // Session 16: ZAPAPI → Go
  { sessionId: 16, tagId: 4 },
  // Session 17: Study → C++
  { sessionId: 17, tagId: 5 },
  // Session 18: Study → Linux
  { sessionId: 18, tagId: 7 },
  // Session 19: FlowState App → React, Next.js
  { sessionId: 19, tagId: 1 },
  { sessionId: 19, tagId: 3 },
  // Session 20: FlowState App → React, Next.js
  { sessionId: 20, tagId: 1 },
  { sessionId: 20, tagId: 3 },
  // Session 21: ZAPAPI → Go (cancelled, but still has tags)
  { sessionId: 21, tagId: 4 },
  // Session 22: FlowState CLI → Rust
  { sessionId: 22, tagId: 2 },
  // Session 23: Study → Algorithms, Competitive Programming
  { sessionId: 23, tagId: 6 },
  { sessionId: 23, tagId: 8 },
  // Session 24: ZAPAPI → Go
  { sessionId: 24, tagId: 4 },
  // Session 25: Study → Docker
  { sessionId: 25, tagId: 10 },
  // Session 26: FlowState App → React, Next.js, TypeScript
  { sessionId: 26, tagId: 1 },
  { sessionId: 26, tagId: 3 },
  { sessionId: 26, tagId: 9 },
  // Session 27: Study → Go
  { sessionId: 27, tagId: 4 },
  // Session 28: DevBlog → Next.js, TypeScript
  { sessionId: 28, tagId: 3 },
  { sessionId: 28, tagId: 9 },
  // Session 29: Portfolio → React, TypeScript
  { sessionId: 29, tagId: 1 },
  { sessionId: 29, tagId: 9 },
  // Session 30: ZAPAPI → Go
  { sessionId: 30, tagId: 4 },
  // Session 31: Study → Rust
  { sessionId: 31, tagId: 2 },
  // Session 32: FlowState App → React, Next.js
  { sessionId: 32, tagId: 1 },
  { sessionId: 32, tagId: 3 },
  // Session 33: Study → Algorithms, Competitive Programming
  { sessionId: 33, tagId: 6 },
  { sessionId: 33, tagId: 8 },
  // Session 34: FlowState CLI → Rust
  { sessionId: 34, tagId: 2 },
  // Session 35: Study → Linux
  { sessionId: 35, tagId: 7 },
  // Session 36: Study → Algorithms, Competitive Programming
  { sessionId: 36, tagId: 6 },
  { sessionId: 36, tagId: 8 },
  // Session 37: FlowState App → React, Next.js, TypeScript
  { sessionId: 37, tagId: 1 },
  { sessionId: 37, tagId: 3 },
  { sessionId: 37, tagId: 9 },
  // Session 38: ZAPAPI → Go
  { sessionId: 38, tagId: 4 },
  // Session 39: Study → Go
  { sessionId: 39, tagId: 4 },
  // Session 40: DevBlog → Next.js, TypeScript
  { sessionId: 40, tagId: 3 },
  { sessionId: 40, tagId: 9 },
  // Session 41: FlowState App → React, Next.js
  { sessionId: 41, tagId: 1 },
  { sessionId: 41, tagId: 3 },
  // Session 42: Study → TypeScript
  { sessionId: 42, tagId: 9 },
  // Session 43: ZAPAPI → Go
  { sessionId: 43, tagId: 4 },
  // Session 44: Study cancelled — no tags
  // Session 45: Portfolio → React
  { sessionId: 45, tagId: 1 },
  // Session 46: Study → C++
  { sessionId: 46, tagId: 5 },
  // Session 47: FlowState App → React, Next.js
  { sessionId: 47, tagId: 1 },
  { sessionId: 47, tagId: 3 },
  // Session 48: Study → Docker
  { sessionId: 48, tagId: 10 },
  // Session 49: FlowState App → React, Next.js
  { sessionId: 49, tagId: 1 },
  { sessionId: 49, tagId: 3 },
  // Session 50: Study → Algorithms, Competitive Programming
  { sessionId: 50, tagId: 6 },
  { sessionId: 50, tagId: 8 },
  // Session 51: ZAPAPI → Go
  { sessionId: 51, tagId: 4 },
  // Session 52: FlowState CLI → Rust
  { sessionId: 52, tagId: 2 },
  // Session 53: Study → Rust
  { sessionId: 53, tagId: 2 },
  // Session 54: FlowState App → React, Next.js, TypeScript
  { sessionId: 54, tagId: 1 },
  { sessionId: 54, tagId: 3 },
  { sessionId: 54, tagId: 9 },
  // Session 55: FlowState App → React, Next.js, TypeScript
  { sessionId: 55, tagId: 1 },
  { sessionId: 55, tagId: 3 },
  { sessionId: 55, tagId: 9 },
  // Session 56: Study → Rust
  { sessionId: 56, tagId: 2 },
  // Session 57: Portfolio → React
  { sessionId: 57, tagId: 1 },
  // Session 58: Study → Linux
  { sessionId: 58, tagId: 7 },
  // Session 59: ZAPAPI → Go
  { sessionId: 59, tagId: 4 },
  // Session 60: Study → Go
  { sessionId: 60, tagId: 4 },
];
