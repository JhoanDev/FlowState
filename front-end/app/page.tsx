"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAsync } from "@/hooks/use-async";
import { getStats, getWeeklyGoals, getRecentActivities } from "@/services/dashboard";

export default function Dashboard() {
  const stats = useAsync(getStats);
  const goals = useAsync(getWeeklyGoals);
  const activities = useAsync(getRecentActivities);

  return (
    <AppLayout title="Dashboard">
      <div className="flex flex-col gap-6 h-full">
        {/* Top — Stats fill full width */}
        <StatsCards data={stats.data} isLoading={stats.isLoading} />

        {/* Bottom — Cards stretch to fill remaining height */}
        <div className="grid gap-6 grid-cols-5 flex-1 min-h-0">
          <WeeklyGoals data={goals.data} isLoading={goals.isLoading} />
          <RecentActivity data={activities.data} isLoading={activities.isLoading} />
        </div>
      </div>
    </AppLayout>
  );
}
