import type { StreakInfo, ConsistencyDay } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockSessions } from "@/mocks/sessions";

const SIMULATED_DELAY = 300;

// ─── Helpers (UTC-safe date operations) ─────────────────────────

function getActiveDatesFromSessions(): string[] {
  const dates = new Set<string>();
  for (const s of mockSessions) {
    if (s.status === "COMPLETED") {
      dates.add(s.startedAt.split("T")[0]);
    }
  }
  return [...dates].sort((a, b) => b.localeCompare(a));
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function calculateCurrentStreak(activeDates: string[], today: string): number {
  if (activeDates.length === 0) return 0;

  const dateSet = new Set(activeDates);
  const todayDate = new Date(today + "T00:00:00Z");

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

  let streak = 0;
  while (dateSet.has(toDateStr(checkDate))) {
    streak++;
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  return streak;
}

function calculateBestStreak(activeDates: string[]): number {
  if (activeDates.length === 0) return 0;

  const sorted = [...activeDates].sort();
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
  }

  return best;
}

// ─── Services Implementation ──────────────────────────────────────

export const statsService = {
  async getCurrentStreak(): Promise<StreakInfo> {
    const res = await invokeTauri<StreakInfo>("get_streak_info");
    if (res) return res;

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const activeDates = getActiveDatesFromSessions();
    const today = toDateStr(new Date()); // Dynamic system date

    const currentStreak = calculateCurrentStreak(activeDates, today);
    const bestStreak = Math.max(calculateBestStreak(activeDates), currentStreak);

    return { currentStreak, bestStreak };
  },

  async getConsistencyDays(): Promise<ConsistencyDay[]> {
    const res = await invokeTauri<ConsistencyDay[]>("get_consistency_days", { days: 30 });
    if (res) return res;

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const today = new Date();
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
};
