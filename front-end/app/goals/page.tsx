"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { CurrentWeekGoals } from "@/components/goals/current-week-goals";
import { GoalsHistory } from "@/components/goals/goals-history";
import { StreakCard } from "@/components/goals/streak-card";
import { ConsistencyGrid } from "@/components/goals/consistency-grid";
import { useAsync } from "@/hooks/use-async";
import {
  getWeeklyGoals,
  createWeeklyGoal,
  updateWeeklyGoal,
  deleteWeeklyGoal,
  getGoalsSummary,
  getGoalsHistory,
} from "@/services/weekly-goals";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import { getStreakInfo, getConsistencyDays } from "@/services/streaks";
import type { SessionType } from "@/types";

export default function GoalsPage() {
  const goalsQuery = useAsync(getWeeklyGoals);
  const historyQuery = useAsync(getGoalsHistory);
  const summaryQuery = useAsync(getGoalsSummary);
  const projectsQuery = useAsync(getProjects);
  const tagsQuery = useAsync(getTags);
  const streakQuery = useAsync(getStreakInfo);
  const consistencyQuery = useAsync(getConsistencyDays);

  const [goals, setGoals] = React.useState(goalsQuery.data ?? []);

  React.useEffect(() => {
    if (goalsQuery.data) setGoals(goalsQuery.data);
  }, [goalsQuery.data]);

  const handleAddGoal = async (type: SessionType, label: string, targetHours: number) => {
    const newGoal = await createWeeklyGoal({ type, label, targetHours, referenceId: null });
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleEditGoal = async (id: number, data: { targetHours?: number }) => {
    const updated = await updateWeeklyGoal(id, data);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const handleRemoveGoal = async (id: number) => {
    await deleteWeeklyGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <AppLayout title="Goals & Streaks">
      <div className="flex flex-col gap-4 h-full">
        {/* Row 1 — Streak + Consistency */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <StreakCard data={streakQuery.data} isLoading={streakQuery.isLoading} />
          <ConsistencyGrid data={consistencyQuery.data} isLoading={consistencyQuery.isLoading} />
        </div>

        {/* Row 2 — Current Week Goals + History */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <CurrentWeekGoals
            goals={goals}
            projects={projectsQuery.data ?? []}
            tags={tagsQuery.data ?? []}
            isLoading={goalsQuery.isLoading}
            onAdd={handleAddGoal}
            onEdit={handleEditGoal}
            onRemove={handleRemoveGoal}
          />
          <GoalsHistory
            history={historyQuery.data}
            summary={summaryQuery.data}
            isLoading={historyQuery.isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
