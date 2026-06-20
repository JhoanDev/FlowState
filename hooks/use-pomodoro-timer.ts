import { useState, useEffect, useCallback, useRef } from "react";
import type { PomodoroPhase } from "@/types";

export type { PomodoroPhase };

interface UsePomodoroTimerProps {
  workSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  cyclesBeforeLongBreak: number;
  onFinish: (totalWorkSeconds: number) => void;
}

export function usePomodoroTimer({
  workSeconds,
  shortBreakSeconds,
  longBreakSeconds,
  cyclesBeforeLongBreak,
  onFinish,
}: UsePomodoroTimerProps) {
  const [phase, setPhase] = useState<PomodoroPhase>("WORK");
  const [seconds, setSeconds] = useState(workSeconds);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [accumulatedWorkSeconds, setAccumulatedWorkSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs to avoid stale closures in the tick
  const phaseRef = useRef(phase);
  const secondsRef = useRef(seconds);
  const completedRef = useRef(completedPomodoros);
  const accumulatedRef = useRef(accumulatedWorkSeconds);
  const workSecondsRef = useRef(workSeconds);
  const shortBreakRef = useRef(shortBreakSeconds);
  const longBreakRef = useRef(longBreakSeconds);
  const cyclesRef = useRef(cyclesBeforeLongBreak);
  const onFinishRef = useRef(onFinish);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);
  useEffect(() => { completedRef.current = completedPomodoros; }, [completedPomodoros]);
  useEffect(() => { accumulatedRef.current = accumulatedWorkSeconds; }, [accumulatedWorkSeconds]);
  useEffect(() => { workSecondsRef.current = workSeconds; }, [workSeconds]);
  useEffect(() => { shortBreakRef.current = shortBreakSeconds; }, [shortBreakSeconds]);
  useEffect(() => { longBreakRef.current = longBreakSeconds; }, [longBreakSeconds]);
  useEffect(() => { cyclesRef.current = cyclesBeforeLongBreak; }, [cyclesBeforeLongBreak]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current;
    const completed = completedRef.current;
    const accumulated = accumulatedRef.current;

    if (currentPhase === "WORK") {
      const newCompleted = completed + 1;
      const newAccumulated = accumulated + workSecondsRef.current;
      setCompletedPomodoros(newCompleted);
      setAccumulatedWorkSeconds(newAccumulated);
      completedRef.current = newCompleted;
      accumulatedRef.current = newAccumulated;

      if (newCompleted % cyclesRef.current === 0) {
        setPhase("LONG_BREAK");
        phaseRef.current = "LONG_BREAK";
        setSeconds(longBreakRef.current);
      } else {
        setPhase("SHORT_BREAK");
        phaseRef.current = "SHORT_BREAK";
        setSeconds(shortBreakRef.current);
      }
    } else {
      setPhase("WORK");
      phaseRef.current = "WORK";
      setSeconds(workSecondsRef.current);
    }
  }, []);

  const tick = useCallback(() => {
    setSeconds((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(advancePhase, 0);
        return 0;
      }
      return next;
    });
  }, [advancePhase]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, tick]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const skipBreak = useCallback(() => {
    if (phaseRef.current === "WORK") return;
    setPhase("WORK");
    phaseRef.current = "WORK";
    setSeconds(workSecondsRef.current);
  }, []);

  const finish = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);

    let total = accumulatedRef.current;
    if (phaseRef.current === "WORK" && secondsRef.current < workSecondsRef.current) {
      total += workSecondsRef.current - secondsRef.current;
    }
    onFinishRef.current(Math.max(1, total));
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(m)}:${pad(s)}`;
  };

  const formatAccumulated = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return {
    seconds,
    formattedTime: formatTime(seconds),
    phase,
    completedPomodoros,
    accumulatedWorkSeconds,
    formattedAccumulated: formatAccumulated(accumulatedWorkSeconds),
    isActive,
    isPaused,
    start,
    pause,
    resume,
    skipBreak,
    finish,
  };
}
