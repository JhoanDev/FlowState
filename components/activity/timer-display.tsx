"use client";

import { useSessionTimer } from "@/hooks/use-session-timer";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { TimerMode } from "@/types";

interface TimerDisplayProps {
  initialSeconds?: number;
  mode?: TimerMode;
  onFinish?: () => void;
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

export function TimerDisplay({
  initialSeconds = 0,
  mode = "PROGRESSIVE",
  onFinish,
}: TimerDisplayProps) {
  const {
    formattedTime,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
  } = useSessionTimer({ initialSeconds, mode, onTimerComplete: onFinish });

  const running = isActive && !isPaused;

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-0">
        {/* Time Display */}
        <div className="flex flex-col items-center justify-center py-20 px-8 border-b border-border">
          <div className="text-[8rem] font-bold tabular-nums tracking-tighter leading-none flex items-center">
            {formattedTime.split("").map((char, i) =>
              char === ":" ? (
                <TimerSeparator key={`sep-${i}`} isActive={running} />
              ) : (
                <AnimatedDigit key={`pos-${i}`} digit={char} isActive={running} />
              )
            )}
          </div>
          <span className={cn(
            "mt-6 text-xs font-medium tracking-widest uppercase transition-colors duration-300",
            running ? "text-primary" : "text-muted-foreground"
          )}>
            {isActive
              ? isPaused
                ? "Paused"
                : mode === "PROGRESSIVE"
                  ? "Session Active"
                  : "Focus Time"
              : "Ready"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-3 p-4">
          {!isActive || isPaused ? (
            <button
              onClick={isActive ? resume : start}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-200 hover:bg-primary/90 active:scale-[0.97]"
            >
              <Play className="h-4 w-4 fill-current" />
              {isActive ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg bg-foreground text-background text-sm font-semibold transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
            >
              <Pause className="h-4 w-4 fill-current" />
              Pause
            </button>
          )}

          <button
            onClick={() => {
              stop();
              onFinish?.();
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent active:scale-[0.97]"
          >
            <Square className="h-4 w-4 fill-current" />
            End
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
