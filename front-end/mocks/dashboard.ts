import type {
  DashboardStats,
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

// ─── Stats (fully computed from sessions) ───────────────────────

const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");

const totalWorkSeconds = completedSessions
  .filter((s) => s.type === "WORK")
  .reduce((sum, s) => sum + s.durationSeconds, 0);

const totalStudySeconds = completedSessions
  .filter((s) => s.type === "STUDY")
  .reduce((sum, s) => sum + s.durationSeconds, 0);

// Streak computed from real sessions (same logic as services/streaks.ts)
function computeCurrentStreakFromSessions(): number {
  const dates = new Set<string>();
  for (const s of completedSessions) {
    dates.add(s.startedAt.split("T")[0]);
  }
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  if (sorted.length === 0) return 0;

  const today = "2026-03-18";
  const dateSet = new Set(sorted);
  let checkDate = new Date(today + "T00:00:00Z");

  if (!dateSet.has(today)) {
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    if (!dateSet.has(checkDate.toISOString().split("T")[0])) return 0;
  }

  let streak = 0;
  while (dateSet.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }
  return streak;
}

export const mockStats: DashboardStats = {
  workHours: secondsToHours(totalWorkSeconds),
  workTrend: 5,
  studyHours: secondsToHours(totalStudySeconds),
  studyTrend: 12,
  currentStreak: computeCurrentStreakFromSessions(),
  bestStreak: computeCurrentStreakFromSessions(), // same for mock data (sessions span ~12 days)
  goalsMet: 3,
  goalsTotal: 4,
};

// ─── Recent Activities (derived view) ───────────────────────────
// Simulates: SELECT s.*, p.name, p.color FROM sessions s LEFT JOIN projects p ...

export const mockActivities: ActivityEntry[] = completedSessions
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  .slice(0, 8)
  .map((s) => ({
    id: s.id,
    type: s.type,
    projectName: getProjectName(s.projectId),
    projectColor: getProjectColor(s.projectId),
    tags: getSessionTags(s.id),
    durationSeconds: s.durationSeconds,
    startedAt: s.startedAt,
    rating: s.rating,
    notes: s.notes,
  }));

// ─── Heatmap (~1 year) ───────────────────────────────────────────
// Real sessions used where available, simulated data for older dates.

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
      // Simulated historical data for older dates (seeded for consistency)
      const seed = dateStr.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
      const rand = ((seed * 9301 + 49297) % 233280) / 233280;
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
// Simulates: SELECT p.name, p.color, SUM(s.duration_seconds)/3600.0 as hours
//            FROM sessions s LEFT JOIN projects p ON s.project_id = p.id
//            WHERE s.type = 'WORK' AND s.status = 'COMPLETED'
//            GROUP BY s.project_id ORDER BY hours DESC

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

// Simulates: SELECT t.name, t.color, SUM(s.duration_seconds)/3600.0 as hours
//            FROM sessions s JOIN session_tags st ON s.id = st.session_id
//            JOIN tags t ON st.tag_id = t.id
//            WHERE s.type = 'STUDY' AND s.status = 'COMPLETED'
//            GROUP BY t.id ORDER BY hours DESC

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
