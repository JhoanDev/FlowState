"use client";

import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface PomodoroDisplayProps {
  workSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  cyclesBeforeLongBreak: number;
  onFinish: (totalWorkSeconds: number) => void;
}

function AnimatedDigit({ digit, isActive }: { digit: string; isActive: boolean }) {
  return (
    <span className="relative inline-block w-[1ch] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
          className={cn(
            "block tabular-nums transition-colors duration-500",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function TimerSeparator({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-[0.5ch] text-center transition-colors duration-500",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      :
    </span>
  );
}

function PhaseDots({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const dots = Array.from({ length: total });
  return (
    <div className="flex gap-1.5 items-center">
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className={cn(
            "inline-block w-2 h-2 rounded-full transition-colors duration-500",
            i < completed % total || (completed > 0 && completed % total === 0 && i < total)
              ? "bg-primary"
              : "bg-muted-foreground/30"
          )}
          animate={{ scale: i === completed % total && completed % total !== 0 ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.4 }}
        />
      ))}
    </div>
  );
}

export function PomodoroDisplay({
  workSeconds,
  shortBreakSeconds,
  longBreakSeconds,
  cyclesBeforeLongBreak,
  onFinish,
}: PomodoroDisplayProps) {
  const { t } = useTranslation();
  const {
    seconds,
    formattedTime,
    phase,
    completedPomodoros,
    accumulatedWorkSeconds,
    formattedAccumulated,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    skipBreak,
    finish,
  } = usePomodoroTimer({
    workSeconds,
    shortBreakSeconds,
    longBreakSeconds,
    cyclesBeforeLongBreak,
    onFinish,
  });

  const running = isActive && !isPaused;
  const isBreak = phase !== "WORK";

  const phaseLabel =
    phase === "WORK"
      ? t("session.pomodoroFocus")
      : phase === "SHORT_BREAK"
      ? t("session.pomodoroShortBreak")
      : t("session.pomodoroLongBreak");

  const statusLabel = isActive
    ? isPaused
      ? t("session.pause")
      : phaseLabel
    : "Ready";

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-0">
        {/* Phase header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border",
                isBreak
                  ? "text-blue-500 border-blue-500/30 bg-blue-500/10"
                  : "text-primary border-primary/30 bg-primary/10"
              )}
            >
              {phaseLabel}
            </motion.span>
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <PhaseDots
              completed={completedPomodoros}
              total={cyclesBeforeLongBreak}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {t("session.pomodoroRound", { n: Math.floor(completedPomodoros / cyclesBeforeLongBreak) + 1 })}
            </span>
          </div>
        </div>

        {/* Time Display */}
        <div className="flex flex-col items-center justify-center py-16 px-8 border-b border-border">
          <div className="text-[8rem] font-bold tabular-nums tracking-tighter leading-none flex items-center">
            {formattedTime.split("").map((char, i) =>
              char === ":" ? (
                <TimerSeparator key={`sep-${i}`} isActive={running} />
              ) : (
                <AnimatedDigit key={`pos-${i}`} digit={char} isActive={running} />
              )
            )}
          </div>

          <span
            className={cn(
              "mt-6 text-xs font-medium tracking-widest uppercase transition-colors duration-300",
              running
                ? isBreak ? "text-blue-500" : "text-primary"
                : "text-muted-foreground"
            )}
          >
            {statusLabel}
          </span>

          <AnimatePresence>
            {accumulatedWorkSeconds > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-muted-foreground"
              >
                {t("session.pomodoroAccumulated", { time: formattedAccumulated })}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-3 p-4">
          {!isActive || isPaused ? (
            <button
              onClick={isActive ? resume : start}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-200 hover:bg-primary/90 active:scale-[0.97]"
            >
              <Play className="h-4 w-4 fill-current" />
              {isActive ? t("session.resume") : t("session.start")}
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg bg-foreground text-background text-sm font-semibold transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
            >
              <Pause className="h-4 w-4 fill-current" />
              {t("session.pause")}
            </button>
          )}

          <AnimatePresence>
            {isBreak && isActive && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onClick={skipBreak}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent active:scale-[0.97] overflow-hidden whitespace-nowrap"
              >
                <SkipForward className="h-4 w-4" />
                {t("session.pomodoroSkipBreak")}
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={finish}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent active:scale-[0.97]"
          >
            <Square className="h-4 w-4 fill-current" />
            {t("session.pomodoroEndSession")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
