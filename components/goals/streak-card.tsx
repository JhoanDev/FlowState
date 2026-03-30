"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy } from "lucide-react";
import type { StreakInfo } from "@/types";
import { useTranslation } from "react-i18next";

interface StreakCardProps {
  data: StreakInfo | null;
  isLoading: boolean;
}

export function StreakCard({ data, isLoading }: StreakCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
          {t("goals.streak")}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3">
        {isLoading || !data ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-20 flex-1 rounded-lg" />
            <Skeleton className="h-20 flex-1 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Current Streak */}
            <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center space-y-1">
              <Flame className="h-6 w-6 text-work mx-auto" />
              <div className="text-3xl font-bold tabular-nums">{data.currentStreak}</div>
              <div className="text-xs text-muted-foreground">{t("goals.currentStreak")} ({t("dashboard.days")})</div>
            </div>

            {/* Best Streak */}
            <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center space-y-1">
              <Trophy className="h-6 w-6 text-primary mx-auto" />
              <div className="text-3xl font-bold tabular-nums">{data.bestStreak}</div>
              <div className="text-xs text-muted-foreground">{t("goals.bestStreak")} ({t("dashboard.days")})</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
