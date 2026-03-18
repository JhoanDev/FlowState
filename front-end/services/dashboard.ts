import type {
  DashboardStats,
  ActivityEntry,
  HeatmapDay,
  DistributionChart,
} from "@/types";
import {
  getMockStats,
  getMockActivities,
  getMockActivitiesByDate,
  getMockHeatmap,
  getMockWorkDistribution,
  getMockStudyDistribution,
  getMockTopRatedWork,
  getMockTopRatedStudy,
  type TopRatedItem,
} from "@/mocks/dashboard";

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


export async function getStats(): Promise<DashboardStats> {
  if (isTauri()) {
    const res = await invokeTauri<DashboardStats>("get_dashboard_stats");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockStats();
}

export async function getRecentActivities(): Promise<ActivityEntry[]> {
  if (isTauri()) {
    const res = await invokeTauri<ActivityEntry[]>("get_recent_activities");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivities();
}

export async function getActivitiesByDate(date: string): Promise<ActivityEntry[]> {
  if (isTauri()) {
    const res = await invokeTauri<ActivityEntry[]>("get_activities_by_date", { date });
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivitiesByDate(date);
}

export async function getHeatmap(): Promise<HeatmapDay[]> {
  if (isTauri()) {
    const res = await invokeTauri<HeatmapDay[]>("get_heatmap");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockHeatmap();
}

export async function getWorkDistribution(): Promise<DistributionChart> {
  if (isTauri()) {
    const res = await invokeTauri<DistributionChart>("get_work_distribution");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockWorkDistribution();
}

export async function getStudyDistribution(): Promise<DistributionChart> {
  if (isTauri()) {
    const res = await invokeTauri<DistributionChart>("get_study_distribution");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockStudyDistribution();
}

export async function getTopRatedWork(): Promise<TopRatedItem[]> {
  if (isTauri()) {
    const res = await invokeTauri<TopRatedItem[]>("get_top_rated_work");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockTopRatedWork();
}

export async function getTopRatedStudy(): Promise<TopRatedItem[]> {
  if (isTauri()) {
    const res = await invokeTauri<TopRatedItem[]>("get_top_rated_study");
    if (res) return res;
  }
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockTopRatedStudy();
}
