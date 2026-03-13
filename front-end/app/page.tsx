import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <div className="flex h-screen w-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {/* Sidebar - hidden on mobile by default, but we'll adapt later for mobile-first */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNav />

        {/* Scrollable Content inside Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
          <div className="flex flex-col gap-8 mx-auto max-w-7xl">
            {/* Top Metrics Row */}
            <StatsCards />

            {/* Main Dashboard Grid */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              <WeeklyGoals />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
