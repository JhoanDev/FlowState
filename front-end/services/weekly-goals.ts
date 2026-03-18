import type { WeeklyGoal, WeeklyGoalInput, WeeklyGoalSummary } from "@/types";
import { mockWeeklyGoals, getNextGoalId } from "@/mocks/weekly-goals";
import { mockSessions, mockSessionTags } from "@/mocks/sessions";
import { mockProjects } from "@/mocks/projects";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

// ─── Date Helpers (Monday-based weeks, timezone-safe) ───────────
// All dates are treated as UTC strings (YYYY-MM-DD) to avoid
// timezone drift. This mirrors how SQLite stores DATE fields.

/**
 * Returns the Monday (YYYY-MM-DD) of the week containing `date`.
 * Uses UTC methods exclusively to avoid local timezone issues.
 */
function getWeekStartUTC(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}

/** Returns `weekStart + 7 days` as ISO date string (exclusive end). */
function getWeekEndUTC(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().split("T")[0];
}

function secondsToHours(s: number): number {
  return Math.round((s / 3600) * 10) / 10;
}

// ─── Relational Helpers (simulate SQL JOINs) ────────────────────

/** Resolve label from FK: project.name (WORK) or tag.name (STUDY) */
function resolveLabel(goal: WeeklyGoal): string {
  if (goal.type === "WORK" && goal.projectId !== null) {
    return mockProjects.find((p) => p.id === goal.projectId)?.name ?? "Unknown Project";
  }
  if (goal.type === "STUDY" && goal.tagId !== null) {
    return mockTags.find((t) => t.id === goal.tagId)?.name ?? "Unknown Tag";
  }
  return "General";
}

/**
 * Compute currentHours for a goal by querying sessions in the goal's week.
 *
 * Equivalent SQL for WORK goals:
 *   SELECT COALESCE(SUM(s.duration_seconds), 0) / 3600.0
 *   FROM sessions s
 *   WHERE s.status = 'COMPLETED'
 *     AND s.type = 'WORK'
 *     AND s.project_id = :projectId
 *     AND s.started_at >= :weekStart
 *     AND s.started_at < :weekEnd
 *
 * Equivalent SQL for STUDY goals:
 *   SELECT COALESCE(SUM(s.duration_seconds), 0) / 3600.0
 *   FROM sessions s
 *   JOIN session_tags st ON s.id = st.session_id
 *   WHERE s.status = 'COMPLETED'
 *     AND s.type = 'STUDY'
 *     AND st.tag_id = :tagId
 *     AND s.started_at >= :weekStart
 *     AND s.started_at < :weekEnd
 */
function computeCurrentHours(goal: WeeklyGoal): number {
  const weekStartISO = `${goal.weekStart}T00:00:00Z`;
  const weekEndISO = `${getWeekEndUTC(goal.weekStart)}T00:00:00Z`;

  // Filter sessions: COMPLETED + correct type + within week range
  const weekSessions = mockSessions.filter(
    (s) =>
      s.status === "COMPLETED" &&
      s.type === goal.type &&
      s.startedAt >= weekStartISO &&
      s.startedAt < weekEndISO
  );

  if (goal.type === "WORK" && goal.projectId !== null) {
    // JOIN: sessions WHERE project_id = goal.projectId
    const matched = weekSessions.filter((s) => s.projectId === goal.projectId);
    return secondsToHours(matched.reduce((sum, s) => sum + s.durationSeconds, 0));
  }

  if (goal.type === "STUDY" && goal.tagId !== null) {
    // JOIN: sessions → session_tags WHERE tag_id = goal.tagId
    const matched = weekSessions.filter((s) => {
      const sessionTagIds = mockSessionTags
        .filter((st) => st.sessionId === s.id)
        .map((st) => st.tagId);
      return sessionTagIds.includes(goal.tagId!);
    });
    return secondsToHours(matched.reduce((sum, s) => sum + s.durationSeconds, 0));
  }

  // Fallback: sum all sessions of matching type in the week
  return secondsToHours(weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0));
}

/** Hydrate a raw goal row with computed fields (label + currentHours). */
function hydrateGoal(goal: WeeklyGoal): WeeklyGoal {
  return {
    ...goal,
    label: resolveLabel(goal),
    currentHours: computeCurrentHours(goal),
  };
}

// ─── CRUD ───────────────────────────────────────────────────────

/**
 * Fetch weekly goals for a given week (defaults to current).
 * Simulates: SELECT * FROM weekly_goals WHERE week_start = :weekStart
 * Then hydrates with computed currentHours via session JOINs.
 */
export async function getWeeklyGoals(weekStart?: string): Promise<WeeklyGoal[]> {
  // Future: return await invoke('get_weekly_goals', { weekStart });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const targetWeek = weekStart ?? getWeekStartUTC(new Date("2026-03-18"));
  const goals = mockWeeklyGoals.filter((g) => g.weekStart === targetWeek);

  return goals.map(hydrateGoal);
}

/**
 * Create a new weekly goal for the current week.
 * Simulates: INSERT INTO weekly_goals (type, target_hours, project_id, tag_id, week_start)
 */
export async function createWeeklyGoal(input: WeeklyGoalInput): Promise<WeeklyGoal> {
  // Future: return await invoke('create_weekly_goal', input);
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const weekStart = getWeekStartUTC(new Date("2026-03-18"));
  const newGoal: WeeklyGoal = {
    id: getNextGoalId(),
    type: input.type,
    label: "", // resolved by hydrate
    targetHours: input.targetHours,
    projectId: input.projectId,
    tagId: input.tagId,
    currentHours: 0,
    weekStart,
    createdAt: new Date().toISOString(),
  };
  mockWeeklyGoals.push(newGoal);
  return hydrateGoal(newGoal);
}

/**
 * Update a weekly goal's target hours.
 * Simulates: UPDATE weekly_goals SET target_hours = :targetHours WHERE id = :id
 */
export async function updateWeeklyGoal(
  id: number,
  data: { targetHours?: number }
): Promise<WeeklyGoal> {
  // Future: return await invoke('update_weekly_goal', { id, ...data });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const goal = mockWeeklyGoals.find((g) => g.id === id);
  if (!goal) throw new Error(`WeeklyGoal ${id} not found`);

  if (data.targetHours !== undefined) goal.targetHours = data.targetHours;

  return hydrateGoal(goal);
}

/**
 * Delete a weekly goal.
 * Simulates: DELETE FROM weekly_goals WHERE id = :id
 */
export async function deleteWeeklyGoal(id: number): Promise<void> {
  // Future: return await invoke('delete_weekly_goal', { id });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const idx = mockWeeklyGoals.findIndex((g) => g.id === id);
  if (idx !== -1) mockWeeklyGoals.splice(idx, 1);
}

// ─── Progress & History ─────────────────────────────────────────

/**
 * Get real-time progress for a single goal.
 * Simulates the same JOIN query as computeCurrentHours.
 */
export async function getGoalProgress(
  goalId: number
): Promise<{ currentHours: number; percentage: number }> {
  // Future: return await invoke('get_goal_progress', { goalId });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const goal = mockWeeklyGoals.find((g) => g.id === goalId);
  if (!goal) throw new Error(`WeeklyGoal ${goalId} not found`);

  const currentHours = computeCurrentHours(goal);
  const percentage = Math.round((currentHours / goal.targetHours) * 100);

  return { currentHours, percentage };
}

/**
 * Summarize past weeks: total goals created, total met, avg hours/week.
 * Each past goal's currentHours is recomputed dynamically from sessions.
 *
 * Simulates:
 *   SELECT COUNT(*) as total, SUM(CASE WHEN computed >= target THEN 1 END) as met
 *   FROM weekly_goals WHERE week_start < :currentWeek
 */
export async function getGoalsSummary(): Promise<WeeklyGoalSummary> {
  // Future: return await invoke('get_goals_summary');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const currentWeek = getWeekStartUTC(new Date("2026-03-18"));
  const pastGoals = mockWeeklyGoals
    .filter((g) => g.weekStart < currentWeek)
    .map(hydrateGoal);

  const totalCreated = pastGoals.length;
  const totalMet = pastGoals.filter((g) => g.currentHours >= g.targetHours).length;

  // Average logged hours per week (across all past weeks that had goals)
  const weekStarts = [...new Set(pastGoals.map((g) => g.weekStart))];
  const totalHours = pastGoals.reduce((sum, g) => sum + g.currentHours, 0);
  const avgHoursPerWeek =
    weekStarts.length > 0
      ? Math.round((totalHours / weekStarts.length) * 10) / 10
      : 0;

  return { totalCreated, totalMet, avgHoursPerWeek };
}

/**
 * Get all weeks (current + past) with hydrated goals for history view.
 * Groups by week_start, sorted descending.
 */
export async function getGoalsHistory(): Promise<
  { weekStart: string; goals: WeeklyGoal[] }[]
> {
  // Future: return await invoke('get_goals_history');
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
