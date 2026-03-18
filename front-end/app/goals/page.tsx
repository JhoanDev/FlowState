"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { CurrentWeekGoals } from "@/components/goals/current-week-goals";
import { GoalsHistory } from "@/components/goals/goals-history";
import { StreakCard } from "@/components/goals/streak-card";
import { ConsistencyGrid } from "@/components/goals/consistency-grid";

import { useGoals } from "@/hooks/useGoals";
import { useStats } from "@/hooks/useStats";
import { useAsync } from "@/hooks/use-async";

import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import type { SessionType } from "@/types";

export default function GoalsPage() {
  const { 
    goals, 
    history, 
    summary, 
    isLoading: isLoadingGoals, 
    addGoal, 
    editGoal, 
    removeGoal 
  } = useGoals();
  
  const { 
    streakInfo, 
    consistencyDays, 
    isLoading: isLoadingStats 
  } = useStats();

  const projectsQuery = useAsync(getProjects);
  const tagsQuery = useAsync(getTags);

  const handleAddGoal = async (input: import("@/types").WeeklyGoalInput) => {
    let resolvedProjectId = input.projectId;
    let resolvedTagId = input.tagId;

    if (!resolvedProjectId && input.type === "WORK" && projectsQuery.data) {
       // Only resolve from label if projectId is not defined, wait, the input might not have label anymore?
       // The UI usually sends what we need, but let's pass it directly.
    }

    await addGoal({ ...input, projectId: resolvedProjectId, tagId: resolvedTagId });
  };

  const handleEditGoal = async (id: number, data: { targetHours?: number }) => {
    await editGoal(id, data);
  };

  const handleRemoveGoal = async (id: number) => {
    await removeGoal(id);
  };

  return (
    <AppLayout title="Goals & Streaks">
      <div className="flex flex-col gap-4 h-full overflow-hidden">
        {/* Row 1 — Streak + Consistency */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <StreakCard data={streakInfo} isLoading={isLoadingStats} />
          <ConsistencyGrid data={consistencyDays} isLoading={isLoadingStats} />
        </div>

        {/* Row 2 — Current Week Goals + History */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <CurrentWeekGoals
            goals={goals}
            projects={projectsQuery.data ?? []}
            tags={tagsQuery.data ?? []}
            isLoading={isLoadingGoals}
            onAdd={handleAddGoal}
            onEdit={handleEditGoal}
            onRemove={handleRemoveGoal}
          />
          <GoalsHistory
            history={history}
            summary={summary}
            isLoading={isLoadingGoals}
          />
        </div>
      </div>
    </AppLayout>
  );
}
