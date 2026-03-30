"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Timer, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/use-async";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import type { SessionType, TimerMode, SessionStartConfig } from "@/types";

interface SessionConfigFormProps {
  onStart?: (config: SessionStartConfig) => void;
}

const POMODORO_PRESETS = [
  { label: "25m", seconds: 25 * 60 },
  { label: "45m", seconds: 45 * 60 },
  { label: "60m", seconds: 60 * 60 },
  { label: "90m", seconds: 90 * 60 },
];

export function SessionConfigForm({ onStart }: SessionConfigFormProps) {
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");
  const [timerMode, setTimerMode] = React.useState<TimerMode>("PROGRESSIVE");
  const [plannedSeconds, setPlannedSeconds] = React.useState(25 * 60);
  const [projectId, setProjectId] = React.useState<number | null>(null);
  const [tagIds, setTagIds] = React.useState<number[]>([]);

  const projects = useAsync(getProjects);
  const tags = useAsync(getTags);

  const handleStart = () => {
    onStart?.({
      type: sessionType,
      timerMode,
      plannedDurationSeconds: timerMode === "REGRESSIVE" ? plannedSeconds : null,
      projectId: sessionType === "WORK" ? projectId : null,
      tagIds,
    });
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-auto lg:h-full transition-colors duration-500",
        sessionType === "STUDY" ? "theme-study" : "theme-work"
      )}
    >
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
          Configure Session
        </CardTitle>
        <p className="text-[10px] xl:text-xs text-muted-foreground mt-1 xl:mt-1.5 ml-5 max-w-[90%]">
          What&apos;s the goal for the next block?
        </p>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3 flex-1 flex flex-col gap-4 min-h-0 md:overflow-y-auto">
        <SessionTypeToggle value={sessionType} onChange={setSessionType} />

        {/* Timer Mode */}
        <div className="space-y-2 xl:space-y-3 shrink-0">
          <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Timer Mode
          </label>
          <div className="relative flex w-full items-center p-0.5 xl:p-1 rounded-[10px] border border-border bg-muted">
            {(["PROGRESSIVE", "REGRESSIVE"] as const).map((mode) => {
              const isActive = timerMode === mode;
              const isProgressive = mode === "PROGRESSIVE";
              const Icon = isProgressive ? Timer : Hourglass;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimerMode(mode)}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center py-2 xl:py-2.5 text-[10px] xl:text-xs font-bold tracking-wide rounded-lg transition-colors duration-200 uppercase",
                    isActive
                      ? "text-primary-foreground cursor-default"
                      : "text-muted-foreground hover:text-foreground cursor-pointer"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 xl:mr-2" />
                  {isProgressive ? "Progressive" : "Pomodoro"}
                  {isActive && (
                    <motion.span
                      layoutId="timer-mode-bg"
                      className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {timerMode === "REGRESSIVE" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-2 xl:pt-3">
                  {POMODORO_PRESETS.map((preset) => (
                    <button
                      key={preset.seconds}
                      type="button"
                      onClick={() => setPlannedSeconds(preset.seconds)}
                      className={cn(
                        "flex-1 py-1.5 xl:py-2 text-[10px] xl:text-xs font-bold border rounded-md transition-all duration-200",
                        plannedSeconds === preset.seconds
                          ? "border-primary bg-primary text-primary-foreground cursor-default"
                          : "border-border bg-card text-muted-foreground hover:bg-accent focus:outline-none cursor-pointer"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Project selector (WORK only) */}
        <AnimatePresence>
          {sessionType === "WORK" && (
            <motion.div
              key="project-selector"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden shrink-0"
            >
              <div className="space-y-2 xl:space-y-3">
                <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project
                </label>
                <ProjectSelector
                  value={projectId}
                  onChange={setProjectId}
                  projects={projects.data ?? []}
                  isLoading={projects.isLoading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags (always visible) */}
        <div className="space-y-2 xl:space-y-3 shrink-0">
          <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tags
          </label>
          <TagSelector
            selectedIds={tagIds}
            onChange={setTagIds}
            tags={tags.data ?? []}
            isLoading={tags.isLoading}
          />
        </div>

        <div className="flex-1" />

        <div className="pt-4 border-t border-border shrink-0">
          <Button className="w-full gap-2.5 text-sm" size="lg" onClick={handleStart}>
            <Play className="h-4 w-4 fill-current" />
            Start Focus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
