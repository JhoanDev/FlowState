"use client";

import * as React from "react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/use-async";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import { saveManualSession } from "@/services/sessions";
import type { SessionType } from "@/types";

interface ManualSessionFormProps {
  onSaved?: () => void;
}

export function ManualSessionForm({ onSaved }: ManualSessionFormProps) {
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");
  const [projectId, setProjectId] = React.useState<number | null>(null);
  const [tagIds, setTagIds] = React.useState<number[]>([]);
  const [date, setDate] = React.useState("2026-03-18");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:30");
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const projects = useAsync(getProjects);
  const tags = useAsync(getTags);

  const durationSeconds = React.useMemo(() => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return diff > 0 ? diff * 60 : 0;
  }, [startTime, endTime]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const canSave = durationSeconds > 0 && rating > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const startedAt = `${date}T${startTime}:00Z`;
      const [eh, em] = endTime.split(":").map(Number);
      const finishedAt = `${date}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00Z`;

      await saveManualSession(
        {
          type: sessionType,
          projectId: sessionType === "WORK" ? projectId : null,
          timerMode: "PROGRESSIVE",
          status: "COMPLETED",
          plannedDurationSeconds: null,
          durationSeconds,
          startedAt,
          finishedAt,
          rating,
          notes,
        },
        tagIds
      );
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full transition-colors duration-500",
        sessionType === "STUDY" ? "theme-study" : "theme-work"
      )}
    >
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base">Log Past Session</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Record a session you forgot to track.
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto">
        <SessionTypeToggle value={sessionType} onChange={setSessionType} />

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </label>
            <DatePicker 
              value={date} 
              onChange={setDate} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Start Time
            </label>
            <TimePicker 
              value={startTime} 
              onChange={setStartTime} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              End Time
            </label>
            <TimePicker 
              value={endTime} 
              onChange={setEndTime} 
            />
          </div>
        </div>

        {durationSeconds > 0 && (
          <div className="text-sm text-muted-foreground shrink-0">
            Duration: <span className="font-semibold text-foreground tabular-nums">{formatDuration(durationSeconds)}</span>
          </div>
        )}

        {/* Project (WORK only) */}
        {sessionType === "WORK" && (
          <div className="space-y-2.5 shrink-0">
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
        )}

        {/* Tags */}
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

        {/* Rating */}
        <div className="space-y-2 shrink-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Focus Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                onMouseEnter={() => setHoverRating(num)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-all duration-200 outline-none hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "w-7 h-7 transition-all duration-200",
                    (hoverRating || rating) >= num
                      ? "fill-primary text-primary"
                      : "text-muted fill-transparent hover:text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col min-h-[80px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you work on? (optional)"
            className="flex-1 min-h-0 bg-transparent p-3 text-sm rounded-lg border border-input focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none placeholder:text-muted-foreground resize-none transition-all duration-200"
          />
        </div>

        <div className="pt-4 border-t border-border shrink-0">
          <Button
            className="w-full gap-2.5 text-sm"
            size="lg"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            <Check className="h-4 w-4" />
            {isSaving ? "Saving..." : "Log Session"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
