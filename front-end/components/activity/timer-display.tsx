"use client";

import { useSessionTimer, TimerMode } from "@/hooks/use-session-timer";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col w-full max-w-lg mx-auto rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-[var(--background)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      
      {/* Beautiful Time Display Block */}
      <div className="flex flex-col items-center justify-center py-24 px-8 border-b border-[var(--border)] relative overflow-hidden bg-[var(--background)]">
        {/* Ambient Glow */}
        <div className={cn(
          "absolute inset-0 bg-[var(--primary)]/5 opacity-50 blur-3xl transition-opacity duration-1000",
          isActive ? "opacity-100" : "opacity-0"
        )} />
        
        <span className="relative z-10 text-8xl md:text-9xl font-bold tabular-nums tracking-tighter text-[var(--foreground)] drop-shadow-md leading-none transition-all duration-300">
          {formattedTime}
        </span>
        <span className="relative z-10 mt-8 text-sm font-semibold tracking-[0.2em] uppercase text-[var(--primary)]">
          {mode === "PROGRESSIVE" ? "Session Active" : "Focus Time"}
        </span>
      </div>

      {/* Controls Block */}
      <div className="flex p-6 gap-4 bg-[var(--border)]/10">
        {!isActive || isPaused ? (
          <button
            onClick={isActive ? resume : start}
            className="flex-1 flex items-center justify-center py-4 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-all duration-200 outline-none group shadow-sm"
            title={isActive ? "Resume" : "Start"}
          >
            <Play className="h-6 w-6 mr-2 fill-current" />
            <span className="font-semibold">{isActive ? "RESUME" : "START"}</span>
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 flex items-center justify-center py-4 rounded-[var(--radius)] bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 transition-all duration-200 outline-none group shadow-sm"
            title="Pause"
          >
            <Pause className="h-6 w-6 mr-2 fill-current" />
            <span className="font-semibold">PAUSE</span>
          </button>
        )}

        <button
          onClick={() => {
            stop();
            if (onFinish) onFinish();
          }}
          className="flex-none flex items-center justify-center px-6 rounded-[var(--radius)] border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--border)]/50 transition-all duration-200 uppercase font-semibold text-sm outline-none group"
          title="End Session"
        >
          <Square className="h-5 w-5 mr-2 fill-current" />
          END
        </button>
      </div>
      
    </div>
  );
}
