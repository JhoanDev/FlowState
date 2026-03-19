"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy } from "lucide-react";
import type { StreakInfo } from "@/types";

interface StreakCardProps {
  data: StreakInfo | null;
  isLoading: boolean;
}

export function StreakCard({ data, isLoading }: StreakCardProps) {
  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          Streaks
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        {isLoading || !data ? (
          <div className="flex gap-6">
            <Skeleton className="h-20 flex-1 rounded-lg" />
            <Skeleton className="h-20 flex-1 rounded-lg" />
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Current Streak */}
            <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center space-y-1">
              <Flame className="h-6 w-6 text-work mx-auto" />
              <div className="text-3xl font-bold tabular-nums">{data.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak (days)</div>
            </div>

            {/* Best Streak */}
            <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center space-y-1">
              <Trophy className="h-6 w-6 text-primary mx-auto" />
              <div className="text-3xl font-bold tabular-nums">{data.bestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak (days)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
