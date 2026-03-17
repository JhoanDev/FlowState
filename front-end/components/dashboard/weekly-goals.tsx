"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
    <div className="group space-y-3 p-4 -mx-2 rounded-lg transition-colors duration-200 hover:bg-accent cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "h-2.5 w-2.5 rounded-full",
            isWork ? "bg-work" : "bg-study"
          )} />
          <span className="text-sm font-medium">
            {isWork ? "Work" : "Study"} ({goal.label})
          </span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {goal.currentHours} / {goal.targetHours}h
        </span>
      </div>
      <Progress
        value={percentage}
        indicatorClassName={cn(isWork ? "bg-work" : "bg-study")}
      />
    </div>
  );
}

export function WeeklyGoals({ data, isLoading }: WeeklyGoalsProps) {
  return (
    <Card className="col-span-2 flex flex-col">
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
        <CardDescription>Progress toward target hours this week.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {isLoading || !data ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No goals set for this week.
          </p>
        ) : (
          data.map((goal) => <GoalItem key={goal.id} goal={goal} />)
        )}
      </CardContent>
    </Card>
  );
}
