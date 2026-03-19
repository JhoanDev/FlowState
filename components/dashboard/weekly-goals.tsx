"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WeeklyGoal } from "@/types";

interface WeeklyGoalsProps {
  data: WeeklyGoal[] | null;
  isLoading: boolean;
}

function GoalItem({ goal }: { goal: WeeklyGoal }) {
  const percentage = Math.round((goal.currentHours / goal.targetHours) * 100);
  const isWork = goal.type === "WORK";

  return (
    <div className="group flex-1 space-y-2 p-3 rounded-lg transition-colors duration-200 hover:bg-accent cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "h-2.5 w-2.5 rounded-full transition-transform duration-200 group-hover:scale-110",
            isWork ? "bg-work" : "bg-study"
          )} />
          <span className="text-xs font-medium">
            {isWork ? "Work" : "Study"} — {goal.label}
          </span>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {goal.currentHours}/{goal.targetHours}h
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2"
        indicatorClassName={cn(isWork ? "bg-work" : "bg-study")}
      />
    </div>
  );
}

export function WeeklyGoals({ data, isLoading }: WeeklyGoalsProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm">Weekly Goals</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading || !data ? (
          <div className="flex overflow-x-auto gap-4 snap-x pb-2 lg:pb-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[240px] lg:min-w-0 snap-center space-y-2 p-3 shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No goals set for this week.
          </p>
        ) : (
          <div className="flex overflow-x-auto gap-4 snap-x pb-2 lg:pb-0">
            {data.map((goal) => (
              <div key={goal.id} className="flex-1 min-w-[240px] lg:min-w-0 snap-center shrink-0">
                <GoalItem goal={goal} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
