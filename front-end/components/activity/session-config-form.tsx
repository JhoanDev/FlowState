"use client";

import * as React from "react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface SessionConfigFormProps {
  onStart?: (type: "WORK" | "STUDY") => void;
}

export function SessionConfigForm({ onStart }: SessionConfigFormProps) {
  const [sessionType, setSessionType] = React.useState<"WORK" | "STUDY">("WORK");
  const [project, setProject] = React.useState<string>("");
  const [tags, setTags] = React.useState<string[]>([]);
  
  const handleStartSession = () => {
    // In future: Save to sqlite etc.
    if (onStart) {
      onStart(sessionType);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-lg mx-auto min-h-[500px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out shadow-sm">
      <div className="text-center flex-none">
        <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">Configure Session</h3>
        <p className="text-sm text-[var(--foreground)]/60 font-medium">What's the goal for the next block?</p>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <SessionTypeToggle value={sessionType} onChange={setSessionType} />

        <div className="relative overflow-hidden min-h-[300px]">
          {sessionType === "WORK" ? (
            <div key="work-block" className="absolute inset-x-0 top-0 space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
              <ProjectSelector value={project} onChange={setProject} />
            </div>
          ) : (
            <div key="study-block" className="absolute inset-x-0 top-0 space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
              <label className="text-sm font-semibold text-[var(--foreground)]/70 uppercase tracking-wider">
                Focus Tags
              </label>
              <TagSelector tags={tags} onChange={setTags} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-[var(--border)] flex-none">
        <Button className="w-full flex gap-3 h-12 text-base font-semibold shadow-sm transition-all duration-200" onClick={handleStartSession}>
          <Play className="h-5 w-5 fill-current" />
          START FOCUS
        </Button>
      </div>
    </div>
  );
}
