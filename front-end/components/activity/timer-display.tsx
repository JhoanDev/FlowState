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
    <div className="flex flex-col w-full rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      {/* Time Display */}
      <div className="flex flex-col items-center justify-center py-32 px-10 border-b border-border relative">
        <span className={cn(
          "text-[10rem] font-bold tabular-nums tracking-tighter leading-none transition-colors duration-500",
          isActive && !isPaused ? "text-foreground" : "text-muted-foreground"
        )}>
          {formattedTime}
        </span>
        <span className={cn(
          "mt-10 text-base font-medium tracking-widest uppercase transition-colors duration-300",
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
      <div className="flex gap-4 p-6 bg-muted/20">
        {!isActive || isPaused ? (
          <button
            onClick={isActive ? resume : start}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-lg bg-primary text-primary-foreground text-base font-semibold transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
          >
            <Play className="h-5 w-5 fill-current" />
            {isActive ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-lg bg-foreground text-background text-base font-semibold transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
          >
            <Pause className="h-5 w-5 fill-current" />
            Pause
          </button>
        )}

        <button
          onClick={() => {
            stop();
            onFinish?.();
          }}
          className="flex items-center justify-center gap-3 px-8 py-5 rounded-lg border border-border text-base font-semibold text-foreground transition-all duration-200 hover:bg-accent active:scale-[0.97]"
        >
          <Square className="h-[18px] w-[18px] fill-current" />
          End
        </button>
      </div>
    </div>
  );
}
