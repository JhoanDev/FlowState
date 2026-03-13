import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Flame, Target } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Work Hours */}
      <Card className="group cursor-default hover:bg-[var(--work)]/5 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/60">Work Time</CardTitle>
          <div className="p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--work)]/30 group-hover:bg-[var(--work)]/10 transition-colors duration-300">
            <Clock className="h-4 w-4 text-[var(--foreground)]/50 group-hover:text-[var(--work)] group-hover:scale-110 transition-all duration-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter tabular-nums">128.5h</div>
          <p className="text-sm font-medium text-[var(--foreground)]/50 mt-2">
            <span className="text-emerald-500 font-bold">+5%</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Total Study Hours */}
      <Card className="group cursor-default hover:bg-[var(--study)]/5 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/60">Study Time</CardTitle>
          <div className="p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--study)]/30 group-hover:bg-[var(--study)]/10 transition-colors duration-300">
            <Clock className="h-4 w-4 text-[var(--foreground)]/50 group-hover:-rotate-12 group-hover:text-[var(--study)] transition-all duration-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter tabular-nums">42.0h</div>
          <p className="text-sm font-medium text-[var(--foreground)]/50 mt-2">
            <span className="text-emerald-500 font-bold">+12%</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Active Streak */}
      <Card className="group cursor-default hover:bg-emerald-500/5 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/60">Current Streak</CardTitle>
          <div className="p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors duration-300">
            <Flame className="h-4 w-4 text-[var(--foreground)]/50 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter tabular-nums">14<span className="text-2xl text-[var(--foreground)]/30 ml-1 font-bold tracking-normal">days</span></div>
          <p className="text-sm font-medium text-[var(--foreground)]/50 mt-2">
            Best: 32 days
          </p>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="group cursor-default hover:bg-emerald-500/5 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/60">Goals Met</CardTitle>
          <div className="p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors duration-300">
            <Target className="h-4 w-4 text-[var(--foreground)]/50 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter tabular-nums text-emerald-500">3/4</div>
          <p className="text-sm font-medium text-[var(--foreground)]/50 mt-2">
            Focus needed on algorithms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
