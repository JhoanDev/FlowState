import type {
  DashboardStats,
  ActivityEntry,
  HeatmapDay,
  DistributionChart,
  StudyTagRankingItem,
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

export function getMockStats(): DashboardStats {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");

  const totalWorkSeconds = completedSessions
    .filter((s) => s.type === "WORK")
    .reduce((sum, s) => sum + s.durationSeconds, 0);

  const totalStudySeconds = completedSessions
    .filter((s) => s.type === "STUDY")
    .reduce((sum, s) => sum + s.durationSeconds, 0);

  // Streak computed from real sessions
  const dates = new Set<string>();
  for (const s of completedSessions) {
    dates.add(s.startedAt.split("T")[0]);
  }
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  
  let currentStreak = 0;
  if (sorted.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const dateSet = new Set(sorted);
    const checkDate = new Date(today + "T00:00:00Z");

    if (!dateSet.has(today)) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }
    
    if (dateSet.has(checkDate.toISOString().split("T")[0])) {
       while (dateSet.has(checkDate.toISOString().split("T")[0])) {
         currentStreak++;
         checkDate.setUTCDate(checkDate.getUTCDate() - 1);
       }
    }
  }

  return {
    workHours: secondsToHours(totalWorkSeconds),
    workTrend: 5,
    studyHours: secondsToHours(totalStudySeconds),
    studyTrend: 12,
    currentStreak,
    bestStreak: currentStreak, // simplified for mock
    goalsMet: 3,
    goalsTotal: 4,
  };
}

// ─── Recent Activities (derived view) ───────────────────────────

export function getMockActivities(): ActivityEntry[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");
  return completedSessions
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
}

export function getMockActivitiesByDate(date: string): ActivityEntry[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");
  return completedSessions
    .filter((s) => s.startedAt.startsWith(date))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
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
}

export function getMockActivitiesByProject(projectId: number): ActivityEntry[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED" && s.projectId === projectId);
  return completedSessions
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
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
}

export function getMockActivitiesByTag(tagId: number): ActivityEntry[] {
  const matchingSessionIds = mockSessionTags.filter((st) => st.tagId === tagId).map((st) => st.sessionId);
  const completedSessions = mockSessions.filter(
    (s) => s.status === "COMPLETED" && matchingSessionIds.includes(s.id)
  );
  return completedSessions
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
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
}


// ─── Heatmap (~1 year) ───────────────────────────────────────────

export function getMockHeatmap(): HeatmapDay[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");
  const days: HeatmapDay[] = [];
    const now = new Date(); // Use current system date

  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - i);
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
      // Quando for pra produção, dias sem sessão retornam zerados (sem dados fake)
      days.push({
        date: dateStr,
        totalSeconds: 0,
        sessionCount: 0,
        intensity: 0,
      });
    }
  }
  return days;
}

// ─── Distribution Charts ────────────────────────────────────────

export function getMockWorkDistribution(): DistributionChart {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");
  const workSessions = completedSessions.filter((s) => s.type === "WORK");
  const byProject = new Map<number | null, number>();

  let totalWorkSeconds = 0;
  for (const s of workSessions) {
    byProject.set(s.projectId, (byProject.get(s.projectId) ?? 0) + s.durationSeconds);
    totalWorkSeconds += s.durationSeconds;
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

export function getMockStudyTagRanking(): StudyTagRankingItem[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");
  const studySessions = completedSessions.filter((s) => s.type === "STUDY");
  const byTag = new Map<string, { seconds: number; color: string }>();

  for (const s of studySessions) {
    const tags = mockSessionTags
      .filter((st) => st.sessionId === s.id)
      .map((st) => mockTags.find((t) => t.id === st.tagId))
      .filter(Boolean);

    for (const tag of tags) {
      if (!tag) continue;
      const prev = byTag.get(tag.name) ?? { seconds: 0, color: tag.color };
      byTag.set(tag.name, { seconds: prev.seconds + s.durationSeconds, color: tag.color });
    }
  }

  return Array.from(byTag.entries())
    .sort((a, b) => b[1].seconds - a[1].seconds)
    .map(([label, { seconds, color }]) => ({
      label,
      hours: secondsToHours(seconds),
      color,
    }));
}

// ─── Top Rated Rankings ─────────────────────────────────────────

export interface TopRatedItem {
  id: string;
  name: string;
  color: string;
  averageRating: number;
  totalSessions: number;
}

export function getMockTopRatedWork(): TopRatedItem[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED" && s.type === "WORK");
  
  const byProject = new Map<number | null, { totalRating: number; count: number }>();
  for (const s of completedSessions) {
    if (s.rating) {
      const prev = byProject.get(s.projectId) ?? { totalRating: 0, count: 0 };
      byProject.set(s.projectId, { totalRating: prev.totalRating + s.rating, count: prev.count + 1 });
    }
  }

  const items: TopRatedItem[] = Array.from(byProject.entries())
    .map(([projectId, { totalRating, count }]) => ({
      id: String(projectId ?? "other"),
      name: getProjectName(projectId) ?? "Other",
      color: getProjectColor(projectId),
      averageRating: totalRating / count,
      totalSessions: count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10); // top 10

  return items;
}

export function getMockTopRatedStudy(): TopRatedItem[] {
  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED" && s.type === "STUDY");
  
  const byTag = new Map<string, { totalRating: number; count: number; color: string }>();
  for (const s of completedSessions) {
    if (s.rating) {
      const tags = mockSessionTags
        .filter((st) => st.sessionId === s.id)
        .map((st) => mockTags.find((t) => t.id === st.tagId))
        .filter(Boolean);

      if (tags.length === 0) {
         const prev = byTag.get("Other") ?? { totalRating: 0, count: 0, color: "#71717a" };
         byTag.set("Other", { totalRating: prev.totalRating + s.rating, count: prev.count + 1, color: "#71717a" });
      } else {
         for (const tag of tags) {
           if (!tag) continue;
           const prev = byTag.get(tag.name) ?? { totalRating: 0, count: 0, color: tag.color };
           byTag.set(tag.name, { totalRating: prev.totalRating + s.rating, count: prev.count + 1, color: tag.color });
         }
      }
    }
  }

  const items: TopRatedItem[] = Array.from(byTag.entries())
    .map(([name, { totalRating, count, color }]) => ({
      id: name,
      name,
      color,
      averageRating: totalRating / count,
      totalSessions: count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10); // top 10

  return items;
}

