"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import type { StudyTagRankingItem } from "@/types";

interface StudyTagRankingProps {
  data: StudyTagRankingItem[] | null;
  isLoading: boolean;
}

export function StudyTagRanking({ data, isLoading }: StudyTagRankingProps) {
  const maxHours = data && data.length > 0 ? data[0].hours : 0;

  return (
    <Card className="flex flex-col overflow-hidden h-full min-h-0 border-border bg-card shadow-sm">
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-study" />
          Study Focus
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 md:overflow-y-auto p-3 xl:p-4 pt-3">
        {isLoading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full rounded" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
            No study sessions yet.
          </div>
        ) : (
          <div className="space-y-3 xl:space-y-4">
            {data.map((item) => {
              const pct = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] xl:text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2 w-2 xl:h-2.5 xl:w-2.5 rounded-[2px] shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-foreground truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="tabular-nums font-medium text-foreground shrink-0 ml-2">
                      {Number(item.hours.toFixed(1))}h
                    </span>
                  </div>
                  <div className="h-4 xl:h-5 w-full rounded bg-accent/40 overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: item.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
