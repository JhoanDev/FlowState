"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { LogbookCalendar } from "@/components/logbook/logbook-calendar";
import { SessionReviewList } from "@/components/logbook/session-review-list";
import { useLogbook } from "@/hooks/useLogbook";

export default function LogbookPage() {
  const {
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
  } = useLogbook();

  return (
    <AppLayout title="Logbook & Diary">
      <div className="flex gap-4 h-full overflow-hidden">
        {/* Left Column: Calendar (Flexible width to keep big modern squares) */}
        <div className="flex-1 min-w-0">
          <LogbookCalendar
            currentMonth={currentMonth}
            days={calendarDays}
            isLoading={isLoadingCalendar}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
            onGoToToday={goToToday}
          />
        </div>

        {/* Right Column: Diary Review (Equal width panel) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <SessionReviewList
            date={selectedDate}
            activities={selectedActivities}
            isLoading={isLoadingActivities}
          />
        </div>
      </div>
    </AppLayout>
  );
}
