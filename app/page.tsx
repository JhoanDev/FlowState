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
      <div className="flex flex-col gap-4 h-full">
        {/* Row 1 — Heatmap (fit content) + Recent Sessions (fills rest) */}
        <div className="flex gap-4 h-[400px] shrink-0">
          <ContributionHeatmap 
            data={heatmap.data} 
            isLoading={heatmap.isLoading} 
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            selectedActivities={selectedActivities}
            isLoadingSelected={isLoadingSelected}
          />
          <div className="flex-1 min-w-0">
            <RecentActivity data={activities.data} isLoading={activities.isLoading} />
          </div>
        </div>

        {/* Row 2 — Distribution Charts & Ranking (expands to fill) */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 flex-1 min-h-0">
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
