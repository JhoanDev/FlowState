import { useState, useCallback, useEffect } from "react";
import { getCalendarDays, type CalendarDay } from "@/services/logbookService";
import { getActivitiesByDate } from "@/services/dashboard"; // Reuse detailed sessions fetcher
import type { ActivityEntry } from "@/types";

export function useLogbook() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date("2026-03-18T00:00:00Z"); // Mock context "today"
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Fetch Calendar Days for the Month
  useEffect(() => {
    let active = true;
    const fetchMonth = async () => {
      setIsLoadingCalendar(true);
      try {
        const year = currentMonth.getUTCFullYear();
        const month = currentMonth.getUTCMonth();
        const days = await getCalendarDays(year, month);
        if (active) {
          setCalendarDays(days);
        }
      } catch (err) {
        console.error("Failed to fetch calendar days:", err);
      } finally {
        if (active) setIsLoadingCalendar(false);
      }
    };
    fetchMonth();
    return () => { active = false; };
  }, [currentMonth]);

  // Fetch Session Activities for Selected Date
  useEffect(() => {
    if (!selectedDate) {
      setSelectedActivities([]);
      return;
    }

    let active = true;
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const activities = await getActivitiesByDate(selectedDate);
        if (active) {
          setSelectedActivities(activities);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        if (active) setSelectedActivities([]);
      } finally {
        if (active) setIsLoadingActivities(false);
      }
    };
    fetchActivities();
    return () => { active = false; };
  }, [selectedDate]);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)));
    setSelectedDate(null);
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date("2026-03-18T00:00:00Z");
    setCurrentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    setSelectedDate(now.toISOString().split("T")[0]);
  }, []);

  const refetchActivities = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoadingActivities(true);
    try {
      const activities = await getActivitiesByDate(selectedDate);
      setSelectedActivities(activities);
    } catch (err) {
      console.error("Failed to refetch activities:", err);
    } finally {
      setIsLoadingActivities(false);
    }
    // Also refresh calendar days
    try {
      const year = currentMonth.getUTCFullYear();
      const month = currentMonth.getUTCMonth();
      const days = await getCalendarDays(year, month);
      setCalendarDays(days);
    } catch (err) {
      console.error("Failed to refetch calendar:", err);
    }
  }, [selectedDate, currentMonth]);

  return {
    currentMonth,
    calendarDays,
    isLoadingCalendar,
    selectedDate,
    setSelectedDate,
    selectedActivities,
    isLoadingActivities,
    nextMonth,
    prevMonth,
    goToToday,
    refetchActivities,
  };
}
