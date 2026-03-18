import type { StreakInfo, ConsistencyDay } from "@/types";
import { mockSessions } from "@/mocks/sessions";

const SIMULATED_DELAY = 300;

// ─── Helpers (UTC-safe date operations) ─────────────────────────

/** Extract unique YYYY-MM-DD dates from COMPLETED sessions, sorted desc. */
function getActiveDatesFromSessions(): string[] {
  // Simulates: SELECT DISTINCT DATE(started_at) FROM sessions WHERE status = 'COMPLETED'
  const dates = new Set<string>();
  for (const s of mockSessions) {
    if (s.status === "COMPLETED") {
      dates.add(s.startedAt.split("T")[0]);
    }
  }
  return [...dates].sort((a, b) => b.localeCompare(a));
}

/** Format a Date to YYYY-MM-DD using UTC to avoid timezone drift. */
function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Calculate current streak from today backwards.
 * A streak counts consecutive days with at least 1 COMPLETED session.
 * The streak can start from today or yesterday (if today has no session yet).
 *
 * Simulates the CTE query from CONTEXT.md:
 *   WITH days AS (SELECT DISTINCT DATE(started_at) AS d FROM sessions WHERE status='COMPLETED' ORDER BY d DESC),
 *   streak AS (SELECT d, ROW_NUMBER() OVER (ORDER BY d DESC) AS rn FROM days)
 *   SELECT COUNT(*) FROM streak WHERE JULIANDAY(DATE('now')) - JULIANDAY(d) = rn - 1;
 */
function calculateCurrentStreak(activeDates: string[], today: string): number {
  if (activeDates.length === 0) return 0;

  const dateSet = new Set(activeDates);
  const todayDate = new Date(today + "T00:00:00Z");

  // Determine streak start: today or yesterday
  let checkDate: Date;
  if (dateSet.has(today)) {
    checkDate = new Date(todayDate);
  } else {
    const yesterday = new Date(todayDate);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    if (dateSet.has(toDateStr(yesterday))) {
      checkDate = yesterday;
    } else {
      return 0;
    }
  }

  // Walk backwards counting consecutive days
  let streak = 0;
  while (dateSet.has(toDateStr(checkDate))) {
    streak++;
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  return streak;
}

/**
 * Find the longest streak in the entire session history.
 * Scans all active dates sorted ascending and finds the max consecutive run.
 *
 * Simulates:
 *   WITH ordered AS (SELECT DISTINCT DATE(started_at) AS d FROM sessions WHERE status='COMPLETED' ORDER BY d),
 *   grouped AS (SELECT d, d - ROW_NUMBER() OVER (ORDER BY d) * INTERVAL '1 day' AS grp FROM ordered)
 *   SELECT MAX(COUNT(*)) FROM grouped GROUP BY grp;
 */
function calculateBestStreak(activeDates: string[]): number {
  if (activeDates.length === 0) return 0;

  const sorted = [...activeDates].sort(); // ascending
  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00Z");
    const curr = new Date(sorted[i] + "T00:00:00Z");
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      if (current > best) best = current;
    } else if (diffDays > 1) {
      current = 1;
    }
    // diffDays === 0 → same day, skip
  }

  return best;
}

// ─── Services ───────────────────────────────────────────────────

/**
 * Get current streak and best streak, computed from real sessions only.
 * Future: return await invoke('get_streak_info');
 */
export async function getStreakInfo(): Promise<StreakInfo> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const activeDates = getActiveDatesFromSessions();
  const today = "2026-03-18";

  const currentStreak = calculateCurrentStreak(activeDates, today);
  const bestStreak = Math.max(calculateBestStreak(activeDates), currentStreak);

  return { currentStreak, bestStreak };
}

/**
 * Get last 30 days with boolean hasActivity flag.
 * Each day is checked against real COMPLETED sessions.
 * Future: return await invoke('get_consistency_days', { days: 30 });
 */
export async function getConsistencyDays(): Promise<ConsistencyDay[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));

  const today = new Date("2026-03-18T00:00:00Z");
  const activeDateSet = new Set(getActiveDatesFromSessions());

  const days: ConsistencyDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = toDateStr(d);
    days.push({
      date: dateStr,
      hasActivity: activeDateSet.has(dateStr),
    });
  }

  return days;
}
