"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { SessionTypeToggle } from "./session-type-toggle";
import { TagSelector } from "./tag-selector";
import { ProjectSelector } from "./project-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Timer, Hourglass, Mouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/use-async";
import { getProjects } from "@/services/projects";
import { getTags } from "@/services/tags";
import type { SessionType, TimerMode, SessionStartConfig } from "@/types";
import { useTranslation } from "react-i18next";

interface SessionConfigFormProps {
  onStart?: (config: SessionStartConfig) => void;
}

interface PomodoroFieldProps {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function PomodoroField({ label, value, unit, step, min, max, onChange }: PomodoroFieldProps) {
  const adjust = (delta: number) =>
    onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div className="space-y-1.5 flex-1 min-w-[72px]">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
        {label}
      </label>
      <div
        className="group flex items-center gap-1 h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring"
        onWheel={(e) => {
          e.preventDefault();
          adjust(e.deltaY < 0 ? step : -step);
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
            if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          onBlur={() => onChange(Math.min(max, Math.max(min, value)))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); adjust(step); }
            if (e.key === "ArrowDown") { e.preventDefault(); adjust(-step); }
          }}
          className="flex-1 h-full min-w-0 text-center bg-transparent border-none outline-none font-mono text-foreground text-xs cursor-ns-resize hover:text-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[10px] text-muted-foreground shrink-0">{unit}</span>
        <Mouse className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0 hidden sm:block" />
      </div>
    </div>
  );
}

export function SessionConfigForm({ onStart }: SessionConfigFormProps) {
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");
  const [timerMode, setTimerMode] = React.useState<TimerMode>("PROGRESSIVE");

  // Pomodoro config in minutes (converted to seconds on submit)
  const [focusMin, setFocusMin] = React.useState(25);
  const [shortMin, setShortMin] = React.useState(5);
  const [longMin, setLongMin] = React.useState(15);
  const [cycles, setCycles] = React.useState(4);

  const [projectId, setProjectId] = React.useState<number | null>(null);
  const [tagIds, setTagIds] = React.useState<number[]>([]);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const { t } = useTranslation();

  const projects = useAsync(getProjects);
  const tags = useAsync(getTags);

  const handleTypeChange = (type: SessionType) => {
    setSessionType(type);
    setValidationError(null);
  };

  const handleStart = () => {
    if (sessionType === "WORK" && projectId === null) {
      setValidationError(t("session.errorProjectRequired"));
      return;
    }
    if (sessionType === "STUDY" && tagIds.length === 0) {
      setValidationError(t("session.errorTagRequired"));
      return;
    }
    setValidationError(null);
    onStart?.({
      type: sessionType,
      timerMode,
      plannedDurationSeconds: timerMode === "POMODORO" ? focusMin * 60 : null,
      projectId: sessionType === "WORK" ? projectId : null,
      tagIds,
      ...(timerMode === "POMODORO" && {
        shortBreakSeconds: shortMin * 60,
        longBreakSeconds: longMin * 60,
        cyclesBeforeLongBreak: cycles,
      }),
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
          {t("session.title")}
        </CardTitle>
        <p className="text-[10px] xl:text-xs text-muted-foreground mt-1 xl:mt-1.5 ml-5 max-w-[90%]">
          {t("session.configureTimer")}
        </p>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3 flex-1 flex flex-col gap-4 min-h-0 md:overflow-y-auto">
        <SessionTypeToggle value={sessionType} onChange={handleTypeChange} />

        {/* Timer Mode toggle */}
        <div className="space-y-2 xl:space-y-3 shrink-0">
          <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("session.timerMode")}
          </label>
          <div className="relative flex w-full items-center p-0.5 xl:p-1 rounded-[10px] border border-border bg-muted">
            {(["PROGRESSIVE", "POMODORO"] as const).map((mode) => {
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
                  {isProgressive ? t("session.progressive") : t("session.pomodoro")}
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

          {/* Pomodoro config — 4 inline steppers */}
          <AnimatePresence>
            {timerMode === "POMODORO" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-end gap-2.5 pt-2 xl:pt-3">
                  <PomodoroField
                    label={t("session.pomodoroFocus")}
                    value={focusMin}
                    unit="min"
                    step={5}
                    min={5}
                    max={120}
                    onChange={setFocusMin}
                  />
                  <PomodoroField
                    label={t("session.pomodoroShortBreak")}
                    value={shortMin}
                    unit="min"
                    step={1}
                    min={1}
                    max={30}
                    onChange={setShortMin}
                  />
                  <PomodoroField
                    label={t("session.pomodoroLongBreak")}
                    value={longMin}
                    unit="min"
                    step={5}
                    min={5}
                    max={60}
                    onChange={setLongMin}
                  />
                  <PomodoroField
                    label={t("session.pomodoroCycles")}
                    value={cycles}
                    unit="×"
                    step={1}
                    min={1}
                    max={8}
                    onChange={setCycles}
                  />

                  {/* Summary badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                  >
                    <p className="text-[10px] text-muted-foreground bg-muted/60 border border-border rounded-md px-2.5 py-1.5 font-mono">
                      {t("session.pomodoroCycleSummary", { focus: focusMin, short: shortMin, long: longMin, cycles })}
                    </p>
                  </motion.div>
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
                  {t("session.project")}
                </label>
                <ProjectSelector
                  value={projectId}
                  onChange={(v) => { setProjectId(v); setValidationError(null); }}
                  projects={projects.data ?? []}
                  isLoading={projects.isLoading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <div className="space-y-2 xl:space-y-3 shrink-0">
          <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("session.tags")}
          </label>
          <TagSelector
            selectedIds={tagIds}
            onChange={(v) => { setTagIds(v); setValidationError(null); }}
            tags={tags.data ?? []}
            isLoading={tags.isLoading}
          />
        </div>

        <div className="flex-1" />

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
          <Button className="w-full gap-2.5 text-sm" size="lg" onClick={handleStart}>
            <Play className="h-4 w-4 fill-current" />
            {t("session.start")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
