import type { WeeklyGoal, WeeklyGoalInput, WeeklyGoalSummary } from "@/types";
import { mockWeeklyGoals, getNextGoalId } from "@/mocks/weekly-goals";
import { mockSessions, mockSessionTags } from "@/mocks/sessions";
import { mockProjects } from "@/mocks/projects";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

// Utility to check if running in Tauri environment
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Dynamically import Tauri's invoke to avoid SSR errors
 */
async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (isTauri()) {
    try {
      // @ts-expect-error: @tauri-apps/api/core might not be installed in the purely mock environment
      const { invoke } = await import("@tauri-apps/api/core");
      // @ts-expect-error: TS cannot infer the return type of dynamic imports easily
      return await invoke<T>(cmd, args);
    } catch (error) {
      console.warn(`Failed to invoke Tauri command: ${cmd}`, error);
      return null;
    }
  }
  return null;
}

// ─── Date Helpers (Monday-based weeks, timezone-safe) ───────────

function getWeekStartUTC(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}

function getWeekEndUTC(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().split("T")[0];
}

function secondsToHours(s: number): number {
  return Math.round((s / 3600) * 10) / 10;
}

// ─── Relational Helpers (simulate SQL JOINs) ────────────────────

function resolveLabel(goal: WeeklyGoal): string {
  if (goal.type === "WORK" && goal.projectId !== null) {
    return mockProjects.find((p) => p.id === goal.projectId)?.name ?? "Unknown Project";
  }
  if (goal.type === "STUDY" && goal.tagId !== null) {
    return mockTags.find((t) => t.id === goal.tagId)?.name ?? "Unknown Tag";
  }
  return "General";
}

function computeCurrentHours(goal: WeeklyGoal): number {
  const weekStartISO = `${goal.weekStart}T00:00:00Z`;
  const weekEndISO = `${getWeekEndUTC(goal.weekStart)}T00:00:00Z`;

  const weekSessions = mockSessions.filter(
    (s) =>
      s.status === "COMPLETED" &&
      s.type === goal.type &&
      s.startedAt >= weekStartISO &&
      s.startedAt < weekEndISO
  );

  if (goal.type === "WORK" && goal.projectId !== null) {
    const matched = weekSessions.filter((s) => s.projectId === goal.projectId);
    return secondsToHours(matched.reduce((sum, s) => sum + s.durationSeconds, 0));
  }

  if (goal.type === "STUDY" && goal.tagId !== null) {
    const matched = weekSessions.filter((s) => {
      const sessionTagIds = mockSessionTags
        .filter((st) => st.sessionId === s.id)
        .map((st) => st.tagId);
      return sessionTagIds.includes(goal.tagId!);
    });
    return secondsToHours(matched.reduce((sum, s) => sum + s.durationSeconds, 0));
  }

  return secondsToHours(weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0));
}

function hydrateGoal(goal: WeeklyGoal): WeeklyGoal {
  return {
    ...goal,
    label: resolveLabel(goal),
    currentHours: computeCurrentHours(goal),
  };
}

// ─── Services Implementation ──────────────────────────────────────

export const goalsService = {
  async getWeeklyGoalsWithProgression(weekStart?: string): Promise<WeeklyGoal[]> {
    if (isTauri()) {
      const res = await invokeTauri<WeeklyGoal[]>("get_weekly_goals", { weekStart });
      if (res) return res; // backend should already return hydrated currentHours
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const targetWeek = weekStart ?? getWeekStartUTC(new Date("2026-03-18")); // Current simulated date
    const goals = mockWeeklyGoals.filter((g) => g.weekStart === targetWeek);
    return goals.map(hydrateGoal);
  },

  async createWeeklyGoal(input: WeeklyGoalInput): Promise<WeeklyGoal> {
    if (isTauri()) {
      const res = await invokeTauri<WeeklyGoal>("create_weekly_goal", { ...input });
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const weekStart = getWeekStartUTC(new Date("2026-03-18"));
    const newGoal: WeeklyGoal = {
      id: getNextGoalId(),
      type: input.type,
      label: "", 
      targetHours: input.targetHours,
      projectId: input.projectId,
      tagId: input.tagId,
      currentHours: 0,
      weekStart,
      createdAt: new Date().toISOString(),
    };
    mockWeeklyGoals.push(newGoal);
    return hydrateGoal(newGoal);
  },

  async updateWeeklyGoal(id: number, data: { targetHours?: number }): Promise<WeeklyGoal> {
    if (isTauri()) {
      const res = await invokeTauri<WeeklyGoal>("update_weekly_goal", { id, ...data });
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const goal = mockWeeklyGoals.find((g) => g.id === id);
    if (!goal) throw new Error(`WeeklyGoal ${id} not found`);
    if (data.targetHours !== undefined) goal.targetHours = data.targetHours;
    return hydrateGoal(goal);
  },

  async deleteWeeklyGoal(id: number): Promise<void> {
    if (isTauri()) {
      const success = await invokeTauri<boolean>("delete_weekly_goal", { id });
      if (success !== null) return;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const idx = mockWeeklyGoals.findIndex((g) => g.id === id);
    if (idx !== -1) mockWeeklyGoals.splice(idx, 1);
  },

  async getGoalProgress(goalId: number): Promise<{ currentHours: number; percentage: number }> {
    if (isTauri()) {
      const res = await invokeTauri<{ currentHours: number; percentage: number }>("get_goal_progress", { goalId });
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const goal = mockWeeklyGoals.find((g) => g.id === goalId);
    if (!goal) throw new Error(`WeeklyGoal ${goalId} not found`);

    const currentHours = computeCurrentHours(goal);
    const percentage = Math.round((currentHours / goal.targetHours) * 100);
    return { currentHours, percentage };
  },

  async getGoalsSummary(): Promise<WeeklyGoalSummary> {
    if (isTauri()) {
      const res = await invokeTauri<WeeklyGoalSummary>("get_goals_summary");
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const currentWeek = getWeekStartUTC(new Date("2026-03-18"));
    const pastGoals = mockWeeklyGoals
      .filter((g) => g.weekStart < currentWeek)
      .map(hydrateGoal);

    const totalCreated = pastGoals.length;
    const totalMet = pastGoals.filter((g) => g.currentHours >= g.targetHours).length;
    const weekStarts = [...new Set(pastGoals.map((g) => g.weekStart))];
    const totalHours = pastGoals.reduce((sum, g) => sum + g.currentHours, 0);
    const avgHoursPerWeek = weekStarts.length > 0 ? Math.round((totalHours / weekStarts.length) * 10) / 10 : 0;

    return { totalCreated, totalMet, avgHoursPerWeek };
  },

  async getGoalsHistory(): Promise<{ weekStart: string; goals: WeeklyGoal[] }[]> {
    if (isTauri()) {
      const res = await invokeTauri<{ weekStart: string; goals: WeeklyGoal[] }[]>("get_goals_history");
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const byWeek = new Map<string, WeeklyGoal[]>();
    for (const g of mockWeeklyGoals) {
      const hydrated = hydrateGoal(g);
      const list = byWeek.get(g.weekStart) ?? [];
      list.push(hydrated);
      byWeek.set(g.weekStart, list);
    }

    return Array.from(byWeek.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([weekStart, goals]) => ({ weekStart, goals }));
  }
};
