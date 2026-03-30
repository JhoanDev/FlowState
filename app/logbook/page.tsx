"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { LogbookCalendar } from "@/components/logbook/logbook-calendar";
import { SessionReviewList } from "@/components/logbook/session-review-list";
import { useLogbook } from "@/hooks/useLogbook";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <AppLayout title={t("logbook.title")}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-5rem)] lg:h-full overflow-y-auto lg:overflow-hidden pb-4 lg:pb-0 w-full max-w-full">
        {/* Left Column: Calendar (Flexible width to keep big modern squares) */}
        <div className="flex-none lg:flex-1 min-w-0 h-auto lg:h-full">
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
        <div className="flex-none lg:flex-[1.2] min-w-0 flex flex-col h-auto lg:h-full">
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
