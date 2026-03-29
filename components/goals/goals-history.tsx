"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle } from "lucide-react";
import type { WeeklyGoal, WeeklyGoalSummary } from "@/types";
import { useSettings } from "@/providers/settings-provider";

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
    <div className="flex gap-1.5 xl:gap-4 p-2 xl:p-3 rounded-lg bg-muted/50 overflow-x-auto md:overflow-x-visible">
      <div className="flex-1 text-center shrink-0 min-w-[60px] md:min-w-0">
        <div className="text-sm xl:text-base font-bold tabular-nums">{summary.totalCreated}</div>
        <div className="text-[10px] xl:text-xs text-muted-foreground">Goals Created</div>
      </div>
      <div className="w-px bg-border shrink-0" />
      <div className="flex-1 text-center shrink-0 min-w-[60px] md:min-w-0">
        <div className="text-sm xl:text-base font-bold tabular-nums text-success">{summary.totalMet}</div>
        <div className="text-[10px] xl:text-xs text-muted-foreground">Goals Met</div>
      </div>
      <div className="w-px bg-border shrink-0" />
      <div className="flex-1 text-center shrink-0 min-w-[60px] md:min-w-0">
        <div className="text-sm xl:text-base font-bold tabular-nums">{successRate}%</div>
        <div className="text-[10px] xl:text-xs text-muted-foreground">Success Rate</div>
      </div>
      <div className="w-px bg-border shrink-0" />
      <div className="flex-1 text-center shrink-0 min-w-[60px] md:min-w-0">
        <div className="text-sm xl:text-base font-bold tabular-nums">{summary.avgHoursPerWeek}h</div>
        <div className="text-[10px] xl:text-xs text-muted-foreground">Avg/Week</div>
      </div>
    </div>
  );
}

// ─── Week Block ─────────────────────────────────────────────────

function formatWeekLabel(weekStart: string, locale: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const format = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short", day: "numeric" });

  return `${format(start)} – ${format(end)}`;
}

function WeekBlock({ weekStart, goals, locale }: { weekStart: string; goals: WeeklyGoal[]; locale: string }) {
  const totalMet = goals.filter((g) => g.currentHours >= g.targetHours).length;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
        <span className="text-xs xl:text-sm font-medium">{formatWeekLabel(weekStart, locale)}</span>
        <span className="text-[10px] xl:text-xs text-muted-foreground">
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
  const { settings } = useSettings();
  const locale = settings?.dateFormat === "BR" ? "pt-BR" : "en-US";

  // Skip current week — show only past weeks
  const pastWeeks = history?.slice(1) ?? [];

  return (
    <Card className="flex flex-col h-auto lg:h-full">
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
          Goals History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3 flex-1 flex flex-col gap-4 min-h-0">
        {/* Summary */}
        {isLoading || !summary ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : (
          <SummaryBar summary={summary} />
        )}

        {/* Past weeks */}
        <div className="flex-1 md:overflow-y-auto min-h-0 space-y-5">
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
              <WeekBlock key={weekStart} weekStart={weekStart} goals={goals} locale={locale} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
