"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
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
  
  const cells: (HeatmapDay | null)[] = [];
  const days = baseDays.map((baseDay) => rawDaysMap.get(baseDay.date) || baseDay);

  const firstDate = new Date(days[0].date + "T00:00:00Z");
  const startPad = firstDate.getUTCDay();
  for (let i = 0; i < startPad; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);

  const colCount = cells.length / 7;
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let c = 0; c < colCount; c++) {
    const firstCellInCol = cells[c * 7];
    if (firstCellInCol) {
      const d = new Date(firstCellInCol.date + "T00:00:00Z");
      if (d.getMonth() !== lastMonth) {
        monthLabels.push({ col: c, label: d.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }) });
        lastMonth = d.getMonth();
      }
    }
  }

  // Day labels dynamically translated
  const labelRefDate = new Date("2024-01-01T12:00:00Z"); // Start on a Monday
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    if (i % 2 === 0) return "";
    const d = new Date(labelRefDate);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" }).slice(0, 3);
  });

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="relative w-full h-[15px] shrink-0" style={{ paddingLeft: '28px' }}>
        {monthLabels.map(({ col, label }) => (
          <span
            key={`${col}-${label}`}
            className="absolute text-[8px] xl:text-[10px] text-muted-foreground leading-none"
            style={{ left: `calc(28px + ${col} * (100% - 28px) / ${colCount})` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex w-full aspect-[28/7]">
        <div className="flex flex-col justify-between shrink-0 h-full py-[1.5%] w-[20px] xl:w-[28px]">
          {dayLabels.map((label, i) => (
            <div key={i} className="flex items-center text-[8px] xl:text-[10px] text-muted-foreground leading-none h-full">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-rows-7 grid-flow-col gap-0.5 xl:gap-1 flex-1 min-w-0 h-full w-full">
          {cells.map((day, i) => {
            const isSelected = day?.date === selectedDate;
            const isInteractive = !!day && day.sessionCount > 0;
            return (
              <div
                key={i}
                onClick={() => {
                  if (isInteractive && onSelectDate) onSelectDate(day.date);
                }}
                className={cn(
                  "rounded-[2%] transition-all w-full h-full shrink-0 duration-150",
                  day !== null
                    ? cn(
                        intensityClasses[day.intensity],
                        isInteractive && "hover:ring-2 hover:ring-primary/50 cursor-pointer z-10",
                        !isInteractive && "cursor-default",
                        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background z-20 hover:ring-primary"
                      )
                    : "bg-transparent"
                )}
                title={
                  day?.date
                    ? `${new Date(day.date + "T12:00:00Z").toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })} — ${day.sessionCount} sessions`
                    : undefined
                }
              />
            );
          })}
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
    <Card className="flex flex-col w-full h-full md:overflow-hidden min-h-0 border-border">
      <CardHeader className="pb-0 p-3 xl:p-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
            Activity
          </CardTitle>
          <div className="flex items-center gap-1.5 text-[8px] xl:text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn("rounded-sm w-2 h-2 xl:w-3 xl:h-3", intensityClasses[level])}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardHeader>
      <div className="p-3 xl:p-4 pt-2 xl:pt-3 flex-none shrink-0 border-b border-transparent">
        {isLoading || !data ? (
          <Skeleton className="aspect-[28/7] w-full rounded-md" />
        ) : (
          <HeatmapGrid days={data} selectedDate={selectedDate} onSelectDate={onSelectDate} locale={locale} />
        )}
      </div>

      <div className="flex-1 min-h-[220px] md:min-h-0 border-t border-border bg-accent/30 flex flex-col">
        {selectedDate ? (
          <RecentActivity 
            data={selectedActivities ?? null} 
            isLoading={isLoadingSelected ?? false} 
            title={`Sessions on ${displaySelectedDate}`} 
            emptyMessage={`No sessions found for this day`}
            hideCard={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <span className="text-xs xl:text-sm text-muted-foreground italic select-none">
              Select a day on the heatmap to view its sessions
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
