"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { DistributionChartCard } from "@/components/dashboard/distribution-chart";
import { useAsync } from "@/hooks/use-async";
import {
  getRecentActivities,
  getActivitiesByDate,
  getHeatmap,
  getWorkDistribution,
  getStudyTagRanking,
  getTopRatedWork,
  getTopRatedStudy,
} from "@/services/dashboard";
import { TopRatedRanking } from "@/components/dashboard/top-rated-ranking";
import { StudyTagRanking } from "@/components/dashboard/study-tag-ranking";
import { motion } from "motion/react";
import type { ActivityEntry } from "@/types";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function Dashboard() {
  const activities = useAsync(getRecentActivities);
  const heatmap = useAsync(getHeatmap);
  const workDist = useAsync(getWorkDistribution);
  const studyTags = useAsync(getStudyTagRanking);
  const topRatedWork = useAsync(getTopRatedWork);
  const topRatedStudy = useAsync(getTopRatedStudy);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[] | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  const { t } = useTranslation();

  const handleSessionDeleted = useCallback(() => {
    activities.refetch();
    heatmap.refetch();
    workDist.refetch();
    studyTags.refetch();
    topRatedWork.refetch();
    topRatedStudy.refetch();
    if (selectedDate) {
      getActivitiesByDate(selectedDate).then(setSelectedActivities);
    }
  }, [selectedDate]);

  const handleSelectDate = useCallback(async (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setSelectedActivities(null);
      return;
    }

    setSelectedDate(date);
    setIsLoadingSelected(true);
    try {
      const data = await getActivitiesByDate(date);
      setSelectedActivities(data);
    } catch (error) {
      console.error(error);
      setSelectedActivities([]);
    } finally {
      setIsLoadingSelected(false);
    }
  }, [selectedDate]);

  return (
    <AppLayout title={t("dashboard.title")}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid auto-rows-max md:auto-rows-auto gap-3 xl:gap-4 h-[calc(100vh-5rem)] md:h-full overflow-y-auto md:overflow-hidden pb-4 md:pb-0 w-full max-w-full grid-cols-1 md:grid-cols-3 md:grid-rows-[1.2fr_1fr]"
      >
        {/* Heatmap — 1 column, row 1 */}
        <motion.div variants={itemVariants} className="min-h-0 flex flex-col">
          <ContributionHeatmap
            data={heatmap.data}
            isLoading={heatmap.isLoading}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            selectedActivities={selectedActivities}
            isLoadingSelected={isLoadingSelected}
            onSessionDeleted={handleSessionDeleted}
          />
        </motion.div>

        {/* Recent Sessions — spans 2 columns on desktop */}
        <motion.div variants={itemVariants} className="md:col-span-2 min-h-0 flex flex-col min-w-0">
          <RecentActivity data={activities.data} isLoading={activities.isLoading} onSessionDeleted={handleSessionDeleted} />
        </motion.div>

        {/* Work Distribution — 1 column, row 2 */}
        <motion.div variants={itemVariants} className="min-h-0 flex flex-col">
          <DistributionChartCard data={workDist.data} isLoading={workDist.isLoading} />
        </motion.div>

        {/* Study Focus — 1 column, row 2 */}
        <motion.div variants={itemVariants} className="min-h-0 flex flex-col">
          <StudyTagRanking data={studyTags.data} isLoading={studyTags.isLoading} />
        </motion.div>

        {/* Top Rated — 1 column, row 2 */}
        <motion.div variants={itemVariants} className="min-h-0 flex flex-col">
          <TopRatedRanking
            workItems={topRatedWork.data || []}
            studyItems={topRatedStudy.data || []}
            isLoading={topRatedWork.isLoading || topRatedStudy.isLoading}
          />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
