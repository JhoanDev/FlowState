"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/use-async";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import type { SessionType } from "@/types";

interface SessionConfigFormProps {
  onStart?: (type: SessionType) => void;
}

export function SessionConfigForm({ onStart }: SessionConfigFormProps) {
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");
  const [projectId, setProjectId] = React.useState("");
  const [tagIds, setTagIds] = React.useState<number[]>([]);

  const projects = useAsync(getProjects);
  const tags = useAsync(getTags);

  const handleStart = () => {
    onStart?.(sessionType);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-10 w-full rounded-lg border border-border bg-card p-10 transition-colors duration-500",
        sessionType === "STUDY" ? "theme-study" : "theme-work"
      )}
    >
      <div>
        <h3 className="text-xl font-semibold tracking-tight">Configure Session</h3>
        <p className="text-sm text-muted-foreground mt-2">
          What&apos;s the goal for the next block?
        </p>
      </div>

      <SessionTypeToggle value={sessionType} onChange={setSessionType} />

      <div className="min-h-[200px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {sessionType === "WORK" ? (
            <motion.div
              key="work-selector"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <ProjectSelector
                value={projectId}
                onChange={setProjectId}
                projects={projects.data ?? []}
                isLoading={projects.isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="study-selector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-3"
            >
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Focus Tags
              </label>
              <TagSelector
                selectedIds={tagIds}
                onChange={setTagIds}
                tags={tags.data ?? []}
                isLoading={tags.isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-border">
        <Button className="w-full gap-2.5" size="lg" onClick={handleStart}>
          <Play className="h-5 w-5 fill-current" />
          Start Focus
        </Button>
      </div>
    </div>
  );
}
