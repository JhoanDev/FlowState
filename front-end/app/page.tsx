import { AppLayout } from "@/components/layout/app-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="flex flex-col gap-8">
        {/* Top Metrics Row */}
        <StatsCards />

        {/* Main Dashboard Grid */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <WeeklyGoals />
          <RecentActivity />
        </div>
      </div>
    </AppLayout>
  );
}
