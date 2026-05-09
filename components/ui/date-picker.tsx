"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  
  const uiLocale = i18n.language || "en-US";
  const dateFormat = settings?.dateFormat || "US";

  const monthNames = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const name = new Date(2024, i, 1).toLocaleDateString(uiLocale, { month: "long" });
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }, [uiLocale]);

  const dayNames = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const name = new Date(2024, 0, 7 + i).toLocaleDateString(uiLocale, { weekday: "short" });
      const clean = name.replace(/\./g, "").slice(0, 2);
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });
  }, [uiLocale]);

  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse initial value or default to today
  const initDate = value ? new Date(value + "T12:00:00") : new Date();
  
  const [currentMonth, setCurrentMonth] = React.useState(initDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(initDate.getFullYear());

  React.useEffect(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const selectDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleSelectDay = (day: number) => {
    selectDate(new Date(currentYear, currentMonth, day, 12, 0, 0));
  };

  const selectToday = () => {
    selectDate(new Date());
  };

  const selectYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    selectDate(d);
  };

  const toggleOpen = () => setIsOpen(prev => !prev);

  // Calendar grid math
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Formatting display
  let displayDate = t("common.date") || "Date";
  if (value) {
    const [y, m, d] = value.split("-");
    displayDate = dateFormat === "BR" ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-2 h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm font-medium transition-all duration-200 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring/50",
          isOpen && "ring-2 ring-ring/50 border-ring"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className={!value ? "text-muted-foreground" : "text-foreground tabular-nums tracking-wide"}>
          {displayDate}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[280px] rounded-xl border border-border bg-card/95 backdrop-blur-md emissive-border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 pb-3 border-b border-border/50">
              <button 
                onClick={selectToday}
                className="flex-1 py-1.5 text-xs font-semibold rounded-md bg-accent/50 hover:bg-accent text-foreground transition-colors"
              >
                {t("common.today") || "Hoje"}
              </button>
              <button 
                onClick={selectYesterday}
                className="flex-1 py-1.5 text-xs font-semibold rounded-md bg-accent/50 hover:bg-accent text-foreground transition-colors"
              >
                {t("common.yesterday") || "Ontem"}
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold text-foreground capitalize">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d, i) => (
                <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="h-8 w-8" />
              ))}
              {days.map(day => {
                const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-accent flex items-center justify-center",
                      isSelected 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : isToday 
                          ? "text-primary font-bold bg-primary/10" 
                          : "text-foreground"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
