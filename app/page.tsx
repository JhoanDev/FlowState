"use client";

import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { DistributionChartCard } from "@/components/dashboard/distribution-chart";
import { useAsync } from "@/hooks/use-async";
import {
  getRecentActivities,
  getActivitiesByDate,
  getHeatmap,
  getWorkDistribution,
  getStudyDistribution,
  getTopRatedWork,
  getTopRatedStudy,
} from "@/services/dashboard";
import { TopRatedRanking } from "@/components/dashboard/top-rated-ranking";
import type { ActivityEntry } from "@/types";

export default function Dashboard() {
  const activities = useAsync(getRecentActivities);
  const heatmap = useAsync(getHeatmap);
  const workDist = useAsync(getWorkDistribution);
  const studyDist = useAsync(getStudyDistribution);
  const topRatedWork = useAsync(getTopRatedWork);
  const topRatedStudy = useAsync(getTopRatedStudy);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[] | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  const handleSelectDate = useCallback(async (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setSelectedActivities(null);
      return;
    }

    setSelectedDate(date);
    setIsLoadingSelected(true);
    try {
      const data = await getActivitiesByDate(date);
      setSelectedActivities(data);
    } catch (error) {
      console.error(error);
      setSelectedActivities([]);
    } finally {
      setIsLoadingSelected(false);
    }
  }, [selectedDate]);

  return (
    <AppLayout title="Overview">
      <div className="flex flex-col gap-3 xl:gap-4 h-[calc(100vh-5rem)] md:h-full overflow-y-auto md:overflow-hidden pb-4 md:pb-0 transition-all duration-300 w-full max-w-full">
        {/* Row 1 — Heatmap (55% height) + Recent Sessions (45% width) */}
        <div className="flex flex-col md:flex-row gap-3 xl:gap-4 md:flex-[0.55] h-auto md:h-full min-h-0 shrink-0">
          <ContributionHeatmap 
            data={heatmap.data} 
            isLoading={heatmap.isLoading} 
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            selectedActivities={selectedActivities}
            isLoadingSelected={isLoadingSelected}
          />
          <div className="flex-1 min-w-0 flex flex-col h-auto md:h-full min-h-0">
            <RecentActivity data={activities.data} isLoading={activities.isLoading} />
          </div>
        </div>

        {/* Row 2 — Distribution Charts & Ranking (45% height) */}
        <div className="grid gap-3 xl:gap-4 grid-cols-1 md:grid-cols-3 md:flex-[0.45] h-auto md:h-full min-h-0 shrink-0">
          <DistributionChartCard data={workDist.data} isLoading={workDist.isLoading} />
          <DistributionChartCard data={studyDist.data} isLoading={studyDist.isLoading} />
          <TopRatedRanking
            workItems={topRatedWork.data || []}
            studyItems={topRatedStudy.data || []}
            isLoading={topRatedWork.isLoading || topRatedStudy.isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
