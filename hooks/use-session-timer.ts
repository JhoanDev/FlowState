import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerMode } from "@/types";

export type { TimerMode };

interface UseSessionTimerProps {
  initialSeconds?: number;
  mode?: TimerMode;
  onTimerComplete?: () => void;
}

export function useSessionTimer({
  initialSeconds = 0,
  mode = "PROGRESSIVE",
  onTimerComplete,
}: UseSessionTimerProps = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setSeconds((prev) => {
      if (mode === "PROGRESSIVE") return prev + 1;

      const next = prev - 1;
      if (next <= 0) {
        setIsActive(false);
        setIsPaused(false);
        if (prev > 0 && onTimerComplete) {
          setTimeout(onTimerComplete, 0);
        }
        return 0;
      }
      return next;
    });
  }, [mode, onTimerComplete]);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerIntervalRef.current = setInterval(tick, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, isPaused, tick]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
  };
}
