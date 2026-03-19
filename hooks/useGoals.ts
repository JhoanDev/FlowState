import { useState, useCallback, useEffect } from "react";
import { goalsService } from "@/services/goalsService";
import type { WeeklyGoal, WeeklyGoalInput, WeeklyGoalSummary } from "@/types";

export function useGoals(weekStart?: string) {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [history, setHistory] = useState<{ weekStart: string; goals: WeeklyGoal[] }[]>([]);
  const [summary, setSummary] = useState<WeeklyGoalSummary | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const g = await goalsService.getWeeklyGoalsWithProgression(weekStart);
      setGoals(g);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch goals"));
    } finally {
      setIsLoading(false);
    }
  }, [weekStart]);

  const fetchHistoryAndSummary = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([
        goalsService.getGoalsHistory(),
        goalsService.getGoalsSummary()
      ]);
      setHistory(h);
      setSummary(s);
    } catch (err) {
      console.error("Failed to fetch history/summary", err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchHistoryAndSummary();
  }, [fetchGoals, fetchHistoryAndSummary]);

  const addGoal = async (input: WeeklyGoalInput) => {
    setIsLoading(true);
    try {
      const newGoal = await goalsService.createWeeklyGoal(input);
      setGoals((prev) => [...prev, newGoal]);
      await fetchHistoryAndSummary(); // Refresh summary and history
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create goal"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const editGoal = async (id: number, data: { targetHours?: number }) => {
    setIsLoading(true);
    try {
      const updated = await goalsService.updateWeeklyGoal(id, data);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update goal"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (id: number) => {
    setIsLoading(true);
    try {
      await goalsService.deleteWeeklyGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await fetchHistoryAndSummary(); // Refresh summary and history
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete goal"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    goals,
    history,
    summary,
    isLoading,
    error,
    addGoal,
    editGoal,
    removeGoal,
    refreshGoals: fetchGoals,
  };
}
