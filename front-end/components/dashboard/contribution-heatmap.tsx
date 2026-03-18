"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/types";

interface ContributionHeatmapProps {
  data: HeatmapDay[] | null;
  isLoading: boolean;
}

const CELL = 10;
const GAP = 3;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LABEL_W = 28;

const intensityClasses: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/20",
  2: "bg-primary/40",
  3: "bg-primary/70",
  4: "bg-primary",
};

function HeatmapGrid({ days }: { days: HeatmapDay[] }) {
  const weeks: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  const firstDate = new Date(days[0].date);
  const startPad = firstDate.getDay();
  for (let i = 0; i < startPad; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  // Month labels at the first week where a new month appears
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  for (let wi = 0; wi < weeks.length; wi++) {
    const firstDay = weeks[wi].find((d) => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ weekIndex: wi, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    }
  }

  const gridW = weeks.length * (CELL + GAP) - GAP;
  const gridH = 7 * (CELL + GAP) - GAP;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: LABEL_W + gridW }}>
        {/* Month labels */}
        <div className="flex" style={{ paddingLeft: LABEL_W, height: 15 }}>
          <div className="relative w-full">
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="absolute text-[10px] text-muted-foreground leading-none"
                style={{ left: weekIndex * (CELL + GAP) }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Day labels + grid */}
        <div className="flex">
          <div
            className="flex flex-col shrink-0"
            style={{ width: LABEL_W, height: gridH }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex items-center text-[10px] text-muted-foreground leading-none"
                style={{ height: CELL, marginBottom: i < 6 ? GAP : 0 }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={cn(
                      "rounded-[2px] transition-all duration-150",
                      day !== null
                        ? cn(
                            intensityClasses[day.intensity],
                            "hover:ring-1 hover:ring-primary/50 hover:scale-125 cursor-default"
                          )
                        : "bg-transparent"
                    )}
                    style={{ width: CELL, height: CELL }}
                    title={
                      day?.date
                        ? `${day.date} — ${day.sessionCount} session${day.sessionCount !== 1 ? "s" : ""}, ${Math.round(day.totalSeconds / 60)}min`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContributionHeatmap({ data, isLoading }: ContributionHeatmapProps) {
  return (
    <Card className="flex flex-col w-fit shrink-0">
      <CardHeader className="pb-0 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Activity</CardTitle>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn("rounded-[2px]", intensityClasses[level])}
                style={{ width: CELL, height: CELL }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 flex-1">
        {isLoading || !data ? (
          <Skeleton className="h-full w-full rounded-md" />
        ) : (
          <HeatmapGrid days={data} />
        )}
      </CardContent>
    </Card>
  );
}
