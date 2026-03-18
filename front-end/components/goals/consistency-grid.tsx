"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck } from "lucide-react";
import type { ConsistencyDay } from "@/types";

interface ConsistencyGridProps {
  data: ConsistencyDay[] | null;
  isLoading: boolean;
}

function DayCell({ day }: { day: ConsistencyDay }) {
  const date = new Date(day.date);
  const dayNum = date.getDate();
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
  const isToday = day.date === "2026-03-18";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md p-1.5 transition-colors duration-200",
        day.hasActivity
          ? "bg-success/15 text-success"
          : "bg-muted/50 text-muted-foreground",
        isToday && "ring-1 ring-primary/50"
      )}
      title={`${day.date}${day.hasActivity ? " — active" : " — no activity"}`}
    >
      <span className="text-[10px] leading-none">{dayName}</span>
      <span className="text-sm font-medium tabular-nums leading-tight">{dayNum}</span>
    </div>
  );
}

export function ConsistencyGrid({ data, isLoading }: ConsistencyGridProps) {
  const activeDays = data?.filter((d) => d.hasActivity).length ?? 0;
  const totalDays = data?.length ?? 30;
  const rate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            Consistency
          </CardTitle>
          {data && (
            <span className="text-sm text-muted-foreground">
              {activeDays}/{totalDays} days ({rate}%)
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        {isLoading || !data ? (
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-1.5">
            {data.map((day) => (
              <DayCell key={day.date} day={day} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
