import type { DashboardStats, WeeklyGoal, ActivityEntry } from "@/types";
import { mockStats, mockWeeklyGoals, mockActivities } from "@/mocks/dashboard";

const SIMULATED_DELAY = 300;

export async function getStats(): Promise<DashboardStats> {
  // Future: return await invoke('get_dashboard_stats');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockStats;
}

export async function getWeeklyGoals(): Promise<WeeklyGoal[]> {
  // Future: return await invoke('get_weekly_goals');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockWeeklyGoals;
}

export async function getRecentActivities(): Promise<ActivityEntry[]> {
  // Future: return await invoke('get_recent_activities');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockActivities;
}
