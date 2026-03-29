import type {
  DashboardStats,
  ActivityEntry,
  HeatmapDay,
  DistributionChart,
  StudyTagRankingItem,
} from "@/types";
import {
  getMockStats,
  getMockActivities,
  getMockActivitiesByDate,
  getMockActivitiesByProject,
  getMockActivitiesByTag,
  getMockHeatmap,
  getMockWorkDistribution,
  getMockStudyTagRanking,
  getMockTopRatedWork,
  getMockTopRatedStudy,
  type TopRatedItem,
} from "@/mocks/dashboard";
import { invokeTauri } from "@/services/tauri";

const SIMULATED_DELAY = 300;

export async function getStats(): Promise<DashboardStats> {
  const res = await invokeTauri<DashboardStats>("get_dashboard_stats");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockStats();
}

export async function getRecentActivities(): Promise<ActivityEntry[]> {
  const res = await invokeTauri<ActivityEntry[]>("get_recent_activities");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivities();
}

export async function getActivitiesByDate(date: string): Promise<ActivityEntry[]> {
  const res = await invokeTauri<ActivityEntry[]>("get_activities_by_date", { date });
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivitiesByDate(date);
}

export async function getActivitiesByProject(projectId: number): Promise<ActivityEntry[]> {
  const res = await invokeTauri<ActivityEntry[]>("get_activities_by_project", { projectId });
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivitiesByProject(projectId);
}

export async function getActivitiesByTag(tagId: number): Promise<ActivityEntry[]> {
  const res = await invokeTauri<ActivityEntry[]>("get_activities_by_tag", { tagId });
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockActivitiesByTag(tagId);
}

export async function getHeatmap(): Promise<HeatmapDay[]> {
  const res = await invokeTauri<HeatmapDay[]>("get_heatmap");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockHeatmap();
}

export async function getWorkDistribution(): Promise<DistributionChart> {
  const res = await invokeTauri<DistributionChart>("get_work_distribution");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockWorkDistribution();
}

export async function getStudyTagRanking(): Promise<StudyTagRankingItem[]> {
  const res = await invokeTauri<StudyTagRankingItem[]>("get_study_tag_ranking");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockStudyTagRanking();
}

export async function getTopRatedWork(): Promise<TopRatedItem[]> {
  const res = await invokeTauri<TopRatedItem[]>("get_top_rated_work");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockTopRatedWork();
}

export async function getTopRatedStudy(): Promise<TopRatedItem[]> {
  const res = await invokeTauri<TopRatedItem[]>("get_top_rated_study");
  if (res) return res;
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return getMockTopRatedStudy();
}
