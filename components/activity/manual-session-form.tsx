"use client";

import * as React from "react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Clock as ClockIcon, Calendar as CalendarIcon, Mouse } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/use-async";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import { saveManualSession } from "@/services/sessions";
import type { SessionType } from "@/types";
import { useTranslation } from "react-i18next";

interface ManualSessionFormProps {
  onSaved?: () => void;
}

export function ManualSessionForm({ onSaved }: ManualSessionFormProps) {
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");
  const [projectId, setProjectId] = React.useState<number | null>(null);
  const [tagIds, setTagIds] = React.useState<number[]>([]);
  
  const [inputMode, setInputMode] = React.useState<"duration" | "exact">("duration");
  const [durationMin, setDurationMin] = React.useState("60");
  
  const [date, setDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = React.useState(() => {
    const d = new Date();
    d.setHours(Math.max(0, d.getHours() - 1));
    return d.toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = React.useState(() => new Date().toTimeString().slice(0, 5));
  
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const { t } = useTranslation();

  const projects = useAsync(getProjects);
  const tags = useAsync(getTags);

  const isCrossDay = React.useMemo(() => {
    if (inputMode === "duration") return false;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return (eh * 60 + em) < (sh * 60 + sm);
  }, [startTime, endTime, inputMode]);

  const durationSeconds = React.useMemo(() => {
    if (inputMode === "duration") {
      const min = parseInt(durationMin, 10);
      return !isNaN(min) && min > 0 ? min * 60 : 0;
    }
    
    const [sh, sm] = startTime.split(":").map(Number);
    let [eh, em] = endTime.split(":").map(Number);
    
    if (isCrossDay) {
      eh += 24;
    }
    
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return diff > 0 ? diff * 60 : 0;
  }, [inputMode, durationMin, startTime, endTime, isCrossDay]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const adjustDuration = (delta: number) => {
    setDurationMin((prev) => {
      let current = parseInt(prev, 10);
      if (isNaN(current)) current = 0;
      return Math.max(1, current + delta).toString();
    });
  };

  const durationWheelRef = React.useRef<HTMLDivElement>(null);
  const adjustDurationRef = React.useRef(adjustDuration);
  React.useEffect(() => { adjustDurationRef.current = adjustDuration; });
  React.useEffect(() => {
    const el = durationWheelRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      adjustDurationRef.current(e.deltaY < 0 ? 5 : -5);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setDurationMin(val);
  };

  const handleDurationBlur = () => {
    let current = parseInt(durationMin, 10);
    if (isNaN(current) || current < 1) current = 1;
    setDurationMin(current.toString());
  };

  const canSave = durationSeconds > 0 && rating > 0;

  const handleSave = async () => {
    if (!canSave) return;
    if (sessionType === "WORK" && projectId === null) {
      setValidationError(t("session.errorProjectRequired"));
      return;
    }
    if (sessionType === "STUDY" && tagIds.length === 0) {
      setValidationError(t("session.errorTagRequired"));
      return;
    }
    setValidationError(null);
    setIsSaving(true);
    try {
      let finalStartedAt: string;
      let finalFinishedAt: string;

      if (inputMode === "duration") {
        finalStartedAt = `${date}T${startTime}:00Z`;
        const [sh, sm] = startTime.split(":").map(Number);
        
        let finishedDate = new Date(date + "T12:00:00");
        const totalEndMin = (sh * 60 + sm) + (durationSeconds / 60);
        
        // Handle cross-day if duration goes beyond midnight
        finishedDate.setDate(finishedDate.getDate() + Math.floor(totalEndMin / (24 * 60)));
        const finalEh = Math.floor(totalEndMin / 60) % 24;
        const finalEm = totalEndMin % 60;
        
        const finishDateStr = finishedDate.toISOString().split("T")[0];
        finalFinishedAt = `${finishDateStr}T${String(finalEh).padStart(2, "0")}:${String(finalEm).padStart(2, "0")}:00Z`;
      } else {
        finalStartedAt = `${date}T${startTime}:00Z`;
        const [eh, em] = endTime.split(":").map(Number);
        
        let finishedDate = new Date(date + "T12:00:00");
        if (isCrossDay) {
          finishedDate.setDate(finishedDate.getDate() + 1);
        }
        const finishDateStr = finishedDate.toISOString().split("T")[0];
        finalFinishedAt = `${finishDateStr}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00Z`;
      }

      await saveManualSession(
        {
          type: sessionType,
          projectId: sessionType === "WORK" ? projectId : null,
          timerMode: "PROGRESSIVE",
          status: "COMPLETED",
          plannedDurationSeconds: null,
          durationSeconds,
          startedAt: finalStartedAt,
          finishedAt: finalFinishedAt,
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
        "flex flex-col h-auto lg:h-full transition-colors duration-500",
        sessionType === "STUDY" ? "theme-study" : "theme-work"
      )}
    >
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
          {t("session.logPastSession")}
        </CardTitle>
        <p className="text-[10px] xl:text-xs text-muted-foreground mt-1 xl:mt-1.5 ml-5 max-w-[90%]">
          {t("session.recordPast")}
        </p>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3 flex-1 flex flex-col gap-4 min-h-0 md:overflow-y-auto">
        <SessionTypeToggle value={sessionType} onChange={(v) => { setSessionType(v); setValidationError(null); }} />

        {/* Input Mode Tabs */}
        <div className="flex bg-accent/50 p-1 rounded-lg w-fit shrink-0">
          <button
            type="button"
            onClick={() => setInputMode("duration")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              inputMode === "duration" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            {t("logbook.duration")}
          </button>
          <button
            type="button"
            onClick={() => setInputMode("exact")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              inputMode === "exact" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {t("common.exact") || "Exato"}
          </button>
        </div>

        {/* Date & Time */}
        <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 w-full shrink-0">
          <div className="space-y-2 w-[135px] shrink-0">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block truncate">
              {t("common.date")}
            </label>
            <DatePicker 
              value={date} 
              onChange={setDate} 
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2 flex-1 min-w-[110px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block truncate">
              {t("session.startedAt")}
            </label>
            <TimePicker 
              value={startTime} 
              onChange={setStartTime} 
              className="cursor-pointer"
            />
          </div>

          <AnimatePresence mode="wait">
            {inputMode === "duration" ? (
              <motion.div 
                key="duration"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2 flex-1 min-w-[110px]"
              >
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block truncate">
                  {t("logbook.duration")} <span className="text-[10px] lowercase">(min)</span>
                </label>
                <div
                  ref={durationWheelRef}
                  className="group flex items-center gap-1.5 h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring"
                >
                  <ClockIcon className="w-4 h-4 text-muted-foreground shrink-0 mr-0.5" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={durationMin}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        adjustDuration(5);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        adjustDuration(-5);
                      }
                    }}
                    className="flex-1 h-full min-w-0 text-center bg-transparent border-none outline-none font-mono text-foreground placeholder:text-muted-foreground/50 p-0 shadow-none focus-visible:ring-0 selection:bg-primary/20 hover:text-primary hover:bg-primary/10 transition-colors cursor-ns-resize rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {/* Intuitive Mouse Hint */}
                  <div className="flex items-center gap-1 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors shrink-0 pointer-events-none">
                    <Mouse className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase font-semibold tracking-wider hidden sm:inline-block">Scroll</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="exact"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2 flex-1 min-w-[110px]"
              >
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate block">
                  {t("session.finishedAt")}
                  {isCrossDay && (
                    <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-in fade-in zoom-in-95 shrink-0">
                      +1 {t("common.day") || "Dia"}
                    </span>
                  )}
                </label>
                <TimePicker 
                  value={endTime} 
                  onChange={setEndTime} 
                  className="cursor-pointer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {durationSeconds > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 105 }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.2 }}
                className="h-10 flex items-center shrink-0 overflow-hidden"
              >
                <div className="flex items-center w-full text-sm ml-1 pr-1">
                  <span className="flex-1 text-center font-semibold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
                    = {formatDuration(durationSeconds)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Project (WORK only) */}
        {sessionType === "WORK" && (
          <div className="space-y-2.5 shrink-0">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("session.project")}
            </label>
            <ProjectSelector
              value={projectId}
              onChange={(v) => { setProjectId(v); setValidationError(null); }}
              projects={projects.data ?? []}
              isLoading={projects.isLoading}
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2.5 shrink-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("session.tags")}
          </label>
          <TagSelector
            selectedIds={tagIds}
            onChange={(v) => { setTagIds(v); setValidationError(null); }}
            tags={tags.data ?? []}
            isLoading={tags.isLoading}
          />
        </div>

        {/* Rating */}
        <div className="space-y-2 shrink-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("logbook.rating")}
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                onMouseEnter={() => setHoverRating(num)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-all duration-200 outline-none hover:scale-110 active:scale-95 cursor-pointer p-0.5"
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
            {t("session.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`${t("session.notes")}... (${t("common.optional")})`}
            className="flex-1 min-h-0 bg-transparent p-3 text-sm rounded-lg border border-input focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none placeholder:text-muted-foreground resize-none transition-all duration-200"
          />
        </div>

        <AnimatePresence>
          {validationError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 shrink-0"
            >
              {validationError}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-border shrink-0">
          <Button
            className="w-full gap-2.5 text-sm cursor-pointer"
            size="lg"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            <Check className="h-4 w-4" />
            {isSaving ? t("common.saving") : t("session.logPastSession")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
