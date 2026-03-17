"use client";

import { useSessionTimer } from "@/hooks/use-session-timer";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/types";

interface TimerDisplayProps {
  initialSeconds?: number;
  mode?: TimerMode;
  onFinish?: () => void;
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

  return (
    <div className="flex flex-col w-full rounded-lg border border-border bg-card overflow-hidden">
      {/* Time Display */}
      <div className="flex flex-col items-center justify-center py-28 px-8 border-b border-border relative">
        <span className={cn(
          "text-9xl font-bold tabular-nums tracking-tighter leading-none transition-colors duration-500",
          isActive && !isPaused ? "text-foreground" : "text-muted-foreground"
        )}>
          {formattedTime}
        </span>
        <span className={cn(
          "mt-8 text-sm font-medium tracking-widest uppercase transition-colors duration-300",
          isActive && !isPaused ? "text-primary" : "text-muted-foreground"
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
      <div className="flex gap-3 p-5 bg-muted/20">
        {!isActive || isPaused ? (
          <button
            onClick={isActive ? resume : start}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            {isActive ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-lg bg-foreground text-background text-sm font-semibold transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
          >
            <Pause className="h-4.5 w-4.5 fill-current" />
            Pause
          </button>
        )}

        <button
          onClick={() => {
            stop();
            onFinish?.();
          }}
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent active:scale-[0.98]"
        >
          <Square className="h-4 w-4 fill-current" />
          End
        </button>
      </div>
    </div>
  );
}
