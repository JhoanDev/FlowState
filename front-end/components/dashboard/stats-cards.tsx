"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  accentColor: string;
}

function StatCard({ label, value, subtext, trend, icon: Icon, accentColor }: StatCardProps) {
  return (
    <Card className="group cursor-default">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-${accentColor}/10`}>
            <Icon className={`h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-${accentColor} group-hover:scale-110`} />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <p className="text-sm text-muted-foreground mt-2">
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
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-36 mt-2" />
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-5 grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-4">
      <StatCard
        label="Work Time"
        value={`${data.workHours}h`}
        subtext="from last month"
        trend={data.workTrend}
        icon={Clock}
        accentColor="work"
      />
      <StatCard
        label="Study Time"
        value={`${data.studyHours}h`}
        subtext="from last month"
        trend={data.studyTrend}
        icon={Clock}
        accentColor="study"
      />
      <StatCard
        label="Current Streak"
        value={`${data.currentStreak} days`}
        subtext={`Best: ${data.bestStreak} days`}
        icon={Flame}
        accentColor="success"
      />
      <StatCard
        label="Goals Met"
        value={`${data.goalsMet}/${data.goalsTotal}`}
        subtext="this week"
        icon={Target}
        accentColor="primary"
      />
    </div>
  );
}
