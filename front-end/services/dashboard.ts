import type {
  DashboardStats,
  ActivityEntry,
  HeatmapDay,
  DistributionChart,
} from "@/types";
import {
  mockStats,
  mockActivities,
  mockHeatmap,
  mockWorkDistribution,
  mockStudyDistribution,
} from "@/mocks/dashboard";

const SIMULATED_DELAY = 300;

export async function getStats(): Promise<DashboardStats> {
  // Future: return await invoke('get_dashboard_stats');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockStats;
}

export async function getRecentActivities(): Promise<ActivityEntry[]> {
  // Future: return await invoke('get_recent_activities');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockActivities;
}

export async function getHeatmap(): Promise<HeatmapDay[]> {
  // Future: return await invoke('get_heatmap');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockHeatmap;
}

export async function getWorkDistribution(): Promise<DistributionChart> {
  // Future: return await invoke('get_work_distribution');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockWorkDistribution;
}

export async function getStudyDistribution(): Promise<DistributionChart> {
  // Future: return await invoke('get_study_distribution');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockStudyDistribution;
}
