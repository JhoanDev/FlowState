"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeatmapDay, ActivityEntry } from "@/types";
import { RecentActivity } from "./recent-activity";
import { useSettings } from "@/providers/settings-provider";

interface ContributionHeatmapProps {
  data: HeatmapDay[] | null;
  isLoading: boolean;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  selectedActivities?: ActivityEntry[] | null;
  isLoadingSelected?: boolean;
}

const CELL = 14;
const GAP = 4;
const LABEL_W = 28;

const intensityClasses: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/20",
  2: "bg-primary/40",
  3: "bg-primary/70",
  4: "bg-primary",
};

interface HeatmapGridProps {
  days: HeatmapDay[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  locale: string;
}

function generateEmptyDays(count: number): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    days.push({
      date: d.toISOString().split("T")[0],
      totalSeconds: 0,
      sessionCount: 0,
      intensity: 0,
    });
  }
  return days;
}

function HeatmapGrid({ days: rawDays, selectedDate, onSelectDate, locale }: HeatmapGridProps) {
  // Always use a continuous timeline (182 days = 26 weeks)
  const baseDays = generateEmptyDays(182);
  const rawDaysMap = new Map(rawDays.map((d) => [d.date, d]));
  
  const days = baseDays.map((baseDay) => {
    return rawDaysMap.get(baseDay.date) || baseDay;
  });

  const weeks: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  const firstDate = new Date(days[0].date + "T00:00:00Z");
  const startPad = firstDate.getUTCDay();
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
      const d = new Date(firstDay.date + "T00:00:00Z");
      const month = d.getMonth();
      if (month !== lastMonth) {
        const title = d.toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
        monthLabels.push({ weekIndex: wi, label: title });
        lastMonth = month;
      }
    }
  }

  const gridW = weeks.length * (CELL + GAP) - GAP;
  const gridH = 7 * (CELL + GAP) - GAP;

  // Day labels dynamically translated
  const labelRefDate = new Date("2024-01-01T12:00:00Z"); // Start on a Monday
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    if (i % 2 === 0) return "";
    const d = new Date(labelRefDate);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" }).slice(0, 3);
  });

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `calc(${LABEL_W + gridW}px + 0.625rem)` }}>
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
            {dayLabels.map((label, i) => (
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
              <div key={wi} className="flex flex-col shrink-0" style={{ gap: GAP }}>
                {week.map((day, di) => {
                  const isSelected = day?.date === selectedDate;
                  const isInteractive = !!day && day.sessionCount > 0;
                  
                  return (
                    <div
                      key={`${wi}-${di}`}
                      onClick={() => {
                        if (isInteractive && onSelectDate) {
                          onSelectDate(day.date);
                        }
                      }}
                      className={cn(
                        "rounded-[2px] transition-all duration-150 shrink-0",
                        day !== null
                          ? cn(
                              intensityClasses[day.intensity],
                              isInteractive && "hover:ring-2 hover:ring-primary/50 cursor-pointer z-10",
                              !isInteractive && "cursor-default",
                              isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background z-20 hover:ring-primary"
                            )
                          : "bg-transparent"
                      )}
                      style={{ width: CELL, height: CELL }}
                      title={
                        day?.date
                          ? `${new Date(day.date + "T12:00:00Z").toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })} — ${day.sessionCount} session${day.sessionCount !== 1 ? "s" : ""}, ${Math.round(day.totalSeconds / 60)}min`
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContributionHeatmap({ 
  data, 
  isLoading, 
  selectedDate, 
  onSelectDate,
  selectedActivities,
  isLoadingSelected
}: ContributionHeatmapProps) {
  const { settings } = useSettings();
  const locale = settings?.dateFormat === "BR" ? "pt-BR" : "en-US";
  const displaySelectedDate = selectedDate ? new Date(selectedDate + "T12:00:00Z").toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <Card className="flex flex-col w-fit shrink-0 max-h-full overflow-hidden max-w-[75%]">
      <CardHeader className="pb-0 p-4 shrink-0 border-b border-transparent">
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
      <div className="p-4 pt-3 shrink-0">
        {isLoading || !data ? (
          <Skeleton className="h-[120px] w-full rounded-md" />
        ) : (
          <HeatmapGrid days={data} selectedDate={selectedDate} onSelectDate={onSelectDate} locale={locale} />
        )}
      </div>

      {selectedDate && (
        <div className="flex-1 min-h-0 border-t border-border bg-accent/30">
          <RecentActivity 
            data={selectedActivities ?? null} 
            isLoading={isLoadingSelected ?? false} 
            title={`Sessions on ${displaySelectedDate}`} 
            emptyMessage={`No sessions found for ${displaySelectedDate}.`}
            hideCard={true}
          />
        </div>
      )}
    </Card>
  );
}
