"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle } from "lucide-react";
import type { WeeklyGoal, WeeklyGoalSummary } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

interface GoalsHistoryProps {
  history: { weekStart: string; goals: WeeklyGoal[] }[] | null;
  summary: WeeklyGoalSummary | null;
  isLoading: boolean;
}

// ─── Summary Stats ──────────────────────────────────────────────

function SummaryBar({ summary }: { summary: WeeklyGoalSummary }) {
  const successRate =
    summary.totalCreated > 0
      ? Math.round((summary.totalMet / summary.totalCreated) * 100)
      : 0;

  return (
    <div className="flex gap-4 p-3 rounded-lg bg-muted/50">
      <div className="flex-1 text-center">
        <div className="text-lg font-bold tabular-nums">{summary.totalCreated}</div>
        <div className="text-xs text-muted-foreground">Goals Created</div>
      </div>
      <div className="w-px bg-border" />
      <div className="flex-1 text-center">
        <div className="text-lg font-bold tabular-nums text-success">{summary.totalMet}</div>
        <div className="text-xs text-muted-foreground">Goals Met</div>
      </div>
      <div className="w-px bg-border" />
      <div className="flex-1 text-center">
        <div className="text-lg font-bold tabular-nums">{successRate}%</div>
        <div className="text-xs text-muted-foreground">Success Rate</div>
      </div>
      <div className="w-px bg-border" />
      <div className="flex-1 text-center">
        <div className="text-lg font-bold tabular-nums">{summary.avgHoursPerWeek}h</div>
        <div className="text-xs text-muted-foreground">Avg/Week</div>
      </div>
    </div>
  );
}

// ─── Week Block ─────────────────────────────────────────────────

function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const format = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${format(start)} – ${format(end)}`;
}

function WeekBlock({ weekStart, goals }: { weekStart: string; goals: WeeklyGoal[] }) {
  const totalMet = goals.filter((g) => g.currentHours >= g.targetHours).length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{formatWeekLabel(weekStart)}</span>
        <span className="text-xs text-muted-foreground">
          {totalMet}/{goals.length} met
        </span>
      </div>

      {goals.map((goal) => {
        const percentage = Math.min(
          100,
          Math.round((goal.currentHours / goal.targetHours) * 100)
        );
        const isComplete = goal.currentHours >= goal.targetHours;
        const isWork = goal.type === "WORK";

        return (
          <div key={goal.id} className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isWork ? "bg-work" : "bg-study"
                    )}
                  />
                  <span className="text-xs font-medium truncate">{goal.label}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {goal.currentHours}/{goal.targetHours}h
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-1.5"
                indicatorClassName={cn(
                  isComplete ? "bg-success" : isWork ? "bg-work" : "bg-study"
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function GoalsHistory({ history, summary, isLoading }: GoalsHistoryProps) {
  // Skip current week — show only past weeks
  const pastWeeks = history?.slice(1) ?? [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          Goals History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1 flex flex-col gap-4 min-h-0">
        {/* Summary */}
        {isLoading || !summary ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : (
          <SummaryBar summary={summary} />
        )}

        {/* Past weeks */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-5">
          {isLoading || !history ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : pastWeeks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No past goals yet.
            </p>
          ) : (
            pastWeeks.map(({ weekStart, goals }) => (
              <WeekBlock key={weekStart} weekStart={weekStart} goals={goals} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
