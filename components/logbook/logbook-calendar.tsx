"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/services/logbookService";

interface LogbookCalendarProps {
  currentMonth: Date;
  days: CalendarDay[];
  isLoading: boolean;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const intensityStyles: Record<number, string> = {
  0: "bg-card border-border hover:border-primary/50",
  1: "bg-primary/10 border-primary/20",
  2: "bg-primary/30 border-primary/40",
  3: "bg-primary/60 border-primary/70 text-primary-foreground",
  4: "bg-primary border-primary text-primary-foreground",
};

export function LogbookCalendar({
  currentMonth,
  days,
  isLoading,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}: LogbookCalendarProps) {
  const monthName = MONTH_NAMES[currentMonth.getUTCMonth()];
  const year = currentMonth.getUTCFullYear();

  const startPad = currentMonth.getUTCDay();

  // Encontrar o dia de maior esforço do mês para a escala limite 100%
  const maxSeconds = Math.max(...days.map(d => d.totalSeconds || 0), 1);

  return (
    <Card className="flex flex-col shrink-0 w-full h-auto lg:h-full min-h-0 lg:overflow-hidden shadow-none border-border">
      <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            {monthName} {year}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3 font-medium text-xs" onClick={onGoToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 shrink-0">
          {DAY_LABELS.map((day) => (
            <div key={day} className="text-center text-[10px] sm:text-xs font-semibold tracking-wide text-muted-foreground uppercase py-1">
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 lg:overflow-y-auto min-h-0 relative px-0.5">
          {isLoading ? (
            <Skeleton className="absolute inset-0 rounded-lg aspect-[7/6]" />
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: startPad }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square rounded-lg border border-dashed border-border/40 bg-transparent" />
              ))}

              {days.map((day) => {
                const dayNum = parseInt(day.date.split("-")[2], 10);
                const isSelected = day.date === selectedDate;
                const isToday = day.date === new Date().toISOString().split("T")[0];

                // The highest working day of the month takes 100% of the bar!
                const percentage = day.hasActivity ? Math.min(100, Math.round(((day.totalSeconds || 0) / maxSeconds) * 100)) : 0;
                
                // Formato horas exatas para hover
                const exactHours = Math.round((day.totalSeconds || 0) / 360) / 10; 

                return (
                  <div
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={cn(
                      "aspect-square group flex flex-col p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer overflow-hidden relative border",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5 z-10 shadow-sm"
                        : day.hasActivity
                          ? "border-primary/20 bg-card hover:border-primary/50 hover:bg-accent/40"
                          : "border-border/60 bg-card hover:border-border",
                      isToday && !isSelected && "border-foreground/30",
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1 z-10 gap-0.5 sm:gap-1">
                      <span className={cn(
                         "text-xs sm:text-base font-bold font-mono tracking-tight leading-none",
                         day.hasActivity ? "text-foreground" : "text-muted-foreground",
                         isSelected && "text-primary"
                      )}>
                        {dayNum}
                      </span>
                      {isToday && (
                         <div className="flex justify-start">
                           <span className={cn(
                             "hidden sm:inline-block text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-1 sm:px-1.5 py-0.5 rounded-sm",
                             isSelected ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                           )}>
                             Today
                           </span>
                           <span className={cn(
                             "sm:hidden block h-1 w-1 rounded-full shrink-0",
                             isSelected ? "bg-primary" : "bg-foreground"
                           )} />
                         </div>
                      )}
                    </div>
                    
                    <div className="flex-1" />
                    
                    {day.hasActivity && (
                       <div className="flex flex-col justify-end w-full h-full z-10">
                         {/* Intensity Progress Bar */}
                         <div className="h-1 sm:h-1.5 w-full bg-primary/10 rounded-full overflow-hidden shrink-0 mt-auto mb-0.5 sm:mb-1" title={`${exactHours} horas`}>
                            <div 
                              className="h-full bg-primary transition-all duration-300 ease-out" 
                              style={{ width: `${percentage}%` }}
                            />
                         </div>
                         <div className="hidden sm:flex text-[9px] sm:text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors justify-between items-center leading-none">
                           <span className="truncate">{percentage === 100 ? "Max Flow" : `${exactHours}h`}</span>
                           <span className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">&rarr;</span>
                         </div>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
