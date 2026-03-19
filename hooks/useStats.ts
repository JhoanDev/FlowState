import { useState, useCallback, useEffect } from "react";
import { statsService } from "@/services/statsService";
import type { StreakInfo, ConsistencyDay } from "@/types";

export function useStats() {
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [consistencyDays, setConsistencyDays] = useState<ConsistencyDay[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [streaks, days] = await Promise.all([
        statsService.getCurrentStreak(),
        statsService.getConsistencyDays()
      ]);
      setStreakInfo(streaks);
      setConsistencyDays(days);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch stats"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    streakInfo,
    consistencyDays,
    isLoading,
    error,
    refreshStats: fetchStats,
  };
}
