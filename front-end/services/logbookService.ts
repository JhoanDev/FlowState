import { invokeTauri } from "@/services/tauri";
import { mockSessions } from "@/mocks/sessions";

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  hasActivity: boolean;
  intensity: number; // 0-4 matching heatmap logic
  totalSeconds: number;
}

const SIMULATED_DELAY = 300;

export function getMockCalendarDays(year: number, month: number): CalendarDay[] {
  // Month is 0-indexed in JS Dates
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const completedSessions = mockSessions.filter((s) => s.status === "COMPLETED");

  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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

      days.push({
        date: dateStr,
        hasActivity: true,
        intensity,
        totalSeconds,
      });
    } else {
      days.push({
        date: dateStr,
        hasActivity: false,
        intensity: 0,
        totalSeconds: 0,
      });
    }
  }

  return days;
}

export async function getCalendarDays(year: number, month: number): Promise<CalendarDay[]> {
  const res = await invokeTauri<CalendarDay[]>("get_calendar_days", { year, month });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockCalendarDays(year, month);
}
