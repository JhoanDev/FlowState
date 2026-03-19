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
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base">Configure Session</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          What&apos;s the goal for the next block?
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1 flex flex-col gap-5 min-h-0 lg:overflow-y-auto">
        <SessionTypeToggle value={sessionType} onChange={setSessionType} />

        {/* Timer Mode */}
        <div className="space-y-2.5 shrink-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Timer Mode
          </label>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setTimerMode("PROGRESSIVE")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border rounded-lg transition-all duration-200",
                timerMode === "PROGRESSIVE"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Timer className="h-4 w-4" />
              Progressive
            </button>
            <button
              type="button"
              onClick={() => setTimerMode("REGRESSIVE")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border rounded-lg transition-all duration-200",
                timerMode === "REGRESSIVE"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Hourglass className="h-4 w-4" />
              Pomodoro
            </button>
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
                <div className="flex gap-2.5 pt-2">
                  {POMODORO_PRESETS.map((preset) => (
                    <button
                      key={preset.seconds}
                      type="button"
                      onClick={() => setPlannedSeconds(preset.seconds)}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium border rounded-md transition-all duration-200",
                        plannedSeconds === preset.seconds
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-accent"
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
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
        <div className="space-y-2.5 shrink-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
