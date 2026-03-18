import type { StreakInfo, ConsistencyDay } from "@/types";
import { mockSessions } from "@/mocks/sessions";

const SIMULATED_DELAY = 300;

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

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
    if (isTauri()) {
      const res = await invokeTauri<StreakInfo>("get_streak_info");
      if (res) return res;
    }

    // Mock Fallback
    await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
    const activeDates = getActiveDatesFromSessions();
    const today = "2026-03-18"; // Simulated current date

    const currentStreak = calculateCurrentStreak(activeDates, today);
    const bestStreak = Math.max(calculateBestStreak(activeDates), currentStreak);

    return { currentStreak, bestStreak };
  },

  async getConsistencyDays(): Promise<ConsistencyDay[]> {
    if (isTauri()) {
      const res = await invokeTauri<ConsistencyDay[]>("get_consistency_days", { days: 30 });
      if (res) return res;
    }

    // Mock Fallback
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
};
