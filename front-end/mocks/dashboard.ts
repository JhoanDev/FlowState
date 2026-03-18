import type {
  DashboardStats,
  WeeklyGoal,
  ActivityEntry,
  HeatmapDay,
  DistributionChart,
} from "@/types";
import { mockSessions, mockSessionTags } from "./sessions";
import { mockProjects } from "./projects";
import { mockTags } from "./tags";

// ─── Helpers ────────────────────────────────────────────────────

function secondsToHours(s: number): number {
  return Math.round((s / 3600) * 10) / 10;
}

function getProjectName(projectId: number | null): string | null {
  if (projectId === null) return null;
  return mockProjects.find((p) => p.id === projectId)?.name ?? null;
}

function getSessionTags(sessionId: number): { name: string; color: string }[] {
  const tagIds = mockSessionTags
    .filter((st) => st.sessionId === sessionId)
    .map((st) => st.tagId);
  return mockTags
    .filter((t) => tagIds.includes(t.id))
    .map((t) => ({ name: t.name, color: t.color }));
}

function getProjectColor(projectId: number | null): string {
  if (projectId === null) return "#71717a";
  return mockProjects.find((p) => p.id === projectId)?.color ?? "#71717a";
}

// ─── Stats (computed from sessions) ─────────────────────────────

const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");

const totalWorkSeconds = completedSessions
  .filter((s) => s.type === "WORK")
  .reduce((sum, s) => sum + s.durationSeconds, 0);

const totalStudySeconds = completedSessions
  .filter((s) => s.type === "STUDY")
  .reduce((sum, s) => sum + s.durationSeconds, 0);

export const mockStats: DashboardStats = {
  workHours: secondsToHours(totalWorkSeconds),
  workTrend: 5,
  studyHours: secondsToHours(totalStudySeconds),
  studyTrend: 12,
  currentStreak: 14,
  bestStreak: 32,
  goalsMet: 3,
  goalsTotal: 4,
};

// ─── Weekly Goals ───────────────────────────────────────────────

const currentWeekStart = "2026-03-16"; // Monday of current week

// Compute current hours from sessions this week
const weekSessions = completedSessions.filter(
  (s) => s.startedAt >= `${currentWeekStart}T00:00:00Z`
);

const flowstateWeekHours = secondsToHours(
  weekSessions
    .filter((s) => s.projectId === 2)
    .reduce((sum, s) => sum + s.durationSeconds, 0)
);

const algoWeekHours = secondsToHours(
  weekSessions
    .filter((s) => {
      const tagIds = mockSessionTags
        .filter((st) => st.sessionId === s.id)
        .map((st) => st.tagId);
      return tagIds.includes(6); // Algorithms tag
    })
    .reduce((sum, s) => sum + s.durationSeconds, 0)
);

export const mockWeeklyGoals: WeeklyGoal[] = [
  {
    id: 1,
    type: "WORK",
    label: "FlowState App",
    targetHours: 20,
    currentHours: flowstateWeekHours,
    weekStart: currentWeekStart,
    createdAt: "2026-03-16T00:00:00Z",
  },
  {
    id: 2,
    type: "STUDY",
    label: "Algorithms",
    targetHours: 10,
    currentHours: algoWeekHours,
    weekStart: currentWeekStart,
    createdAt: "2026-03-16T00:00:00Z",
  },
];

// ─── Recent Activities (derived view) ───────────────────────────

export const mockActivities: ActivityEntry[] = completedSessions
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  .slice(0, 8)
  .map((s) => ({
    id: s.id,
    type: s.type,
    projectName: getProjectName(s.projectId),
    projectColor: getProjectColor(s.projectId !== null ? s.projectId : null),
    tags: getSessionTags(s.id),
    durationSeconds: s.durationSeconds,
    startedAt: s.startedAt,
    rating: s.rating,
    notes: s.notes,
  }));

// ─── Heatmap (~1 year) ───────────────────────────────────────────

function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date("2026-03-18");

  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Check real sessions for this date
    const daySessions = completedSessions.filter(
      (s) => s.startedAt.split("T")[0] === dateStr
    );

    if (daySessions.length > 0) {
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      const hours = totalSeconds / 3600;
      let intensity: number;
      if (hours < 1) intensity = 1;
      else if (hours < 3) intensity = 2;
      else if (hours < 5) intensity = 3;
      else intensity = 4;

      days.push({ date: dateStr, totalSeconds, sessionCount: daySessions.length, intensity });
    } else {
      // Simulated historical data for older dates
      const rand = Math.random();
      let intensity: number;
      let totalSeconds: number;
      if (rand < 0.15) {
        intensity = 0;
        totalSeconds = 0;
      } else if (rand < 0.35) {
        intensity = 1;
        totalSeconds = 1800;
      } else if (rand < 0.60) {
        intensity = 2;
        totalSeconds = 5400;
      } else if (rand < 0.85) {
        intensity = 3;
        totalSeconds = 10800;
      } else {
        intensity = 4;
        totalSeconds = 18000;
      }

      days.push({
        date: dateStr,
        totalSeconds,
        sessionCount: intensity > 0 ? Math.ceil(intensity * 0.8) : 0,
        intensity,
      });
    }
  }
  return days;
}

export const mockHeatmap: HeatmapDay[] = generateHeatmap();

// ─── Distribution Charts ────────────────────────────────────────

function buildWorkDistribution(): DistributionChart {
  const workSessions = completedSessions.filter((s) => s.type === "WORK");
  const byProject = new Map<number | null, number>();

  for (const s of workSessions) {
    byProject.set(s.projectId, (byProject.get(s.projectId) ?? 0) + s.durationSeconds);
  }

  const slices = Array.from(byProject.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([projectId, seconds]) => ({
      label: getProjectName(projectId) ?? "Other",
      value: secondsToHours(seconds),
      color: getProjectColor(projectId),
      type: "WORK" as const,
    }));

  return {
    title: "Work Focus",
    total: secondsToHours(totalWorkSeconds),
    slices,
  };
}

function buildStudyDistribution(): DistributionChart {
  const studySessions = completedSessions.filter((s) => s.type === "STUDY");
  const byTag = new Map<string, { seconds: number; color: string }>();

  for (const s of studySessions) {
    const tags = mockSessionTags
      .filter((st) => st.sessionId === s.id)
      .map((st) => mockTags.find((t) => t.id === st.tagId))
      .filter(Boolean);

    if (tags.length === 0) {
      const prev = byTag.get("Other") ?? { seconds: 0, color: "#71717a" };
      byTag.set("Other", { seconds: prev.seconds + s.durationSeconds, color: "#71717a" });
    } else {
      // Split time equally across tags
      const perTag = s.durationSeconds / tags.length;
      for (const tag of tags) {
        if (!tag) continue;
        const prev = byTag.get(tag.name) ?? { seconds: 0, color: tag.color };
        byTag.set(tag.name, { seconds: prev.seconds + perTag, color: tag.color });
      }
    }
  }

  const slices = Array.from(byTag.entries())
    .sort((a, b) => b[1].seconds - a[1].seconds)
    .map(([label, { seconds, color }]) => ({
      label,
      value: secondsToHours(seconds),
      color,
      type: "STUDY" as const,
    }));

  return {
    title: "Study Focus",
    total: secondsToHours(totalStudySeconds),
    slices,
  };
}

export const mockWorkDistribution: DistributionChart = buildWorkDistribution();
export const mockStudyDistribution: DistributionChart = buildStudyDistribution();
