import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Flame, Target } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Work Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Work Time</CardTitle>
          <Clock className="h-4 w-4 text-[var(--foreground)]/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">128.5h</div>
          <p className="text-xs text-[var(--foreground)]/50">
            +5% from last month
          </p>
        </CardContent>
      </Card>

      {/* Total Study Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Clock className="h-4 w-4 text-[var(--foreground)]/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42.0h</div>
          <p className="text-xs text-[var(--foreground)]/50">
            +12% from last month
          </p>
        </CardContent>
      </Card>

      {/* Active Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-[var(--foreground)]/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">14 days</div>
          <p className="text-xs text-[var(--foreground)]/50">
            Best: 32 days
          </p>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals Met</CardTitle>
          <Target className="h-4 w-4 text-[var(--foreground)]/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3/4</div>
          <p className="text-xs text-[var(--foreground)]/50">
            Focus needed on algorithms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
