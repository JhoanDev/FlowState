"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { DistributionChartCard } from "@/components/dashboard/distribution-chart";
import { useAsync } from "@/hooks/use-async";
import {
  getWeeklyGoals,
  getRecentActivities,
  getHeatmap,
  getWorkDistribution,
  getStudyDistribution,
} from "@/services/dashboard";

export default function Dashboard() {
  const goals = useAsync(getWeeklyGoals);
  const activities = useAsync(getRecentActivities);
  const heatmap = useAsync(getHeatmap);
  const workDist = useAsync(getWorkDistribution);
  const studyDist = useAsync(getStudyDistribution);

  return (
    <AppLayout title="Overview">
      <div className="flex flex-col gap-4 h-full">
        {/* Row 1 — Weekly Goals (compact, full width) */}
        <WeeklyGoals data={goals.data} isLoading={goals.isLoading} />

        {/* Row 2 — Heatmap (fit content) + Recent Sessions (fills rest) */}
        <div className="flex gap-4 h-[400px] shrink-0">
          <ContributionHeatmap data={heatmap.data} isLoading={heatmap.isLoading} />
          <div className="flex-1 min-w-0">
            <RecentActivity data={activities.data} isLoading={activities.isLoading} />
          </div>
        </div>

        {/* Row 3 — Distribution Charts (expands to fill) */}
        <div className="grid gap-4 grid-cols-2 flex-1 min-h-0">
          <DistributionChartCard data={workDist.data} isLoading={workDist.isLoading} />
          <DistributionChartCard data={studyDist.data} isLoading={studyDist.isLoading} />
        </div>
      </div>
    </AppLayout>
  );
}
