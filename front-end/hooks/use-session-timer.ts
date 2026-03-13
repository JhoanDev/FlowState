import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "PROGRESSIVE" | "REGRESSIVE";

interface UseSessionTimerProps {
  initialSeconds?: number;
  mode?: TimerMode;
  onTimerComplete?: () => void; // Useful for Pomodoro
}

export function useSessionTimer({
  initialSeconds = 0,
  mode = "PROGRESSIVE",
  onTimerComplete,
}: UseSessionTimerProps = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Use refs to prevent interval drift and unnecessary re-renders of the hook itself
  const expectedEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setSeconds((prev) => {
      let nextSeconds = prev;
      if (mode === "PROGRESSIVE") {
        nextSeconds = prev + 1;
      } else if (mode === "REGRESSIVE") {
        nextSeconds = prev - 1;
        if (nextSeconds <= 0) {
          setIsActive(false);
          setIsPaused(false);
          // Only trigger complete on exactly 0 transition
          if (prev > 0 && onTimerComplete) {
             // We use a timeout to avoid synchronous state dispatch conflicts
             setTimeout(onTimerComplete, 0);
          }
          return 0; // lock at 0
        }
      }
      return nextSeconds;
    });
  }, [mode, onTimerComplete]);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Basic setInterval for the UI updates.
      // In a real Desktop App, we'd also check against `Date.now()` to fix OS suspension drift.
      timerIntervalRef.current = setInterval(tick, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive, isPaused, tick]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  // Format Helper: 00:00:00
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (h > 0) {
       return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
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
