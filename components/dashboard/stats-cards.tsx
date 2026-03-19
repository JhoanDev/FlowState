"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Clock, Flame, Target } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  data: DashboardStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  trend?: number;
  icon: React.ElementType;
  accentClass: string;
}

function StatCard({ label, value, subtext, trend, icon: Icon, accentClass }: StatCardProps) {
  return (
    <Card className="group cursor-default hover:shadow-md">
      <CardContent className="p-7">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-all duration-300",
            `group-hover:bg-${accentClass}/10`
          )}>
            <Icon className={cn(
              "h-[18px] w-[18px] text-muted-foreground transition-all duration-300",
              `group-hover:text-${accentClass} group-hover:scale-110`
            )} />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <p className="text-sm text-muted-foreground mt-2.5">
          {trend !== undefined && (
            <span className="text-success font-semibold">+{trend}% </span>
          )}
          {subtext}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-7">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-36 mt-2.5" />
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-6 grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-4">
      <StatCard
        label="Work Time"
        value={`${data.workHours}h`}
        subtext="from last month"
        trend={data.workTrend}
        icon={Clock}
        accentClass="work"
      />
      <StatCard
        label="Study Time"
        value={`${data.studyHours}h`}
        subtext="from last month"
        trend={data.studyTrend}
        icon={Clock}
        accentClass="study"
      />
      <StatCard
        label="Current Streak"
        value={`${data.currentStreak} days`}
        subtext={`Best: ${data.bestStreak} days`}
        icon={Flame}
        accentClass="success"
      />
      <StatCard
        label="Goals Met"
        value={`${data.goalsMet}/${data.goalsTotal}`}
        subtext="this week"
        icon={Target}
        accentClass="primary"
      />
    </div>
  );
}
