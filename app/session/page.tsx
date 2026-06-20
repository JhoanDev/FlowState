"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SessionConfigForm } from "@/components/activity/session-config-form";
import { ManualSessionForm } from "@/components/activity/manual-session-form";
import { TimerDisplay } from "@/components/activity/timer-display";
import { SessionReviewForm } from "@/components/activity/session-review-form";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Play, ClipboardList } from "lucide-react";
import type { SessionStartConfig, SessionReviewData, Session } from "@/types";
import { useSettings } from "@/providers/settings-provider";
import { saveManualSession } from "@/services/sessions";
import { useTranslation } from "react-i18next";

type SessionState = "IDLE" | "ACTIVE" | "REVIEW";

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
};

type ActivePanel = "config" | "manual";

export default function SessionPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = React.useState<SessionState>("IDLE");
  const [sessionConfig, setSessionConfig] = React.useState<SessionStartConfig | null>(null);
  const [startedAt, setStartedAt] = React.useState<Date | null>(null);
  const [finishedAt, setFinishedAt] = React.useState<Date | null>(null);
  const [activePanel, setActivePanel] = React.useState<ActivePanel>("config");
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number | null>(null);
  const { settings } = useSettings();
  const { t } = useTranslation();

  React.useEffect(() => {
    // Automatically manage strict mode (fullscreen) based on session state
    if (sessionState === "ACTIVE" && settings?.strictModeDefault) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Strict mode fullscreen request failed:", err);
        });
      }
    } else if (sessionState === "REVIEW" || sessionState === "IDLE") {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn("Failed to exit fullscreen:", err);
        });
      }
    }
  }, [sessionState, settings?.strictModeDefault]);

  const handleSessionStarted = (config: SessionStartConfig) => {
    setSessionConfig(config);
    setStartedAt(new Date());
    setElapsedSeconds(null);
    setSessionState("ACTIVE");
  };

  const handleTimerFinished = (secs: number) => {
    setElapsedSeconds(secs);
    setFinishedAt(new Date());
    setSessionState("REVIEW");
  };

  const handleReviewSaved = async (data: SessionReviewData) => {
    if (!sessionConfig || !startedAt) {
      router.push("/");
      return;
    }

    const finalFinishedAt = finishedAt || new Date();
    const durationSeconds = elapsedSeconds !== null
      ? elapsedSeconds
      : Math.max(1, Math.round((finalFinishedAt.getTime() - startedAt.getTime()) / 1000));

    const sessionPayload: Omit<Session, "id" | "createdAt"> = {
      type: sessionConfig.type,
      projectId: sessionConfig.projectId || null,
      timerMode: sessionConfig.timerMode,
      status: "COMPLETED",
      plannedDurationSeconds: sessionConfig.plannedDurationSeconds || null,
      durationSeconds,
      startedAt: startedAt.toISOString(),
      finishedAt: finalFinishedAt.toISOString(),
      rating: data.rating,
      notes: data.notes || "",
    };

    try {
      await saveManualSession(sessionPayload, sessionConfig.tagIds);
    } catch (error) {
      console.error("Failed to save session:", error);
    } finally {
      router.push("/");
    }
  };

  const handleManualSaved = () => {
    router.push("/");
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getSessionSummary = () => {
    if (!startedAt || !finishedAt) return null;
    const duration = elapsedSeconds !== null
      ? elapsedSeconds
      : Math.max(1, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));
    return (
      <div className="mb-6 p-4 rounded-lg bg-accent/30 border border-border flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t("session.startedAt")}</span>
          <span className="font-mono font-medium">{startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t("session.finishedAt")}</span>
          <span className="font-mono font-medium">{finishedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="h-px bg-border/50 my-1" />
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t("session.totalTime")}</span>
          <span className="font-mono font-semibold text-primary">{formatDuration(duration)}</span>
        </div>
      </div>
    );
  };

  const themeClass = sessionState !== "IDLE" && sessionConfig
    ? (sessionConfig.type === "STUDY" ? "theme-study" : "theme-work")
    : undefined;

  return (
    <AppLayout title={t("session.title")}>
      <div className={cn("h-[calc(100vh-5rem)] lg:h-full overflow-y-auto lg:overflow-hidden pb-4 lg:pb-0 flex flex-col gap-4 transition-colors duration-500 w-full max-w-full", themeClass)}>
        <AnimatePresence mode="wait">
          {sessionState === "IDLE" && (
            <motion.div
              key="config"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-auto lg:h-full min-h-0 shrink-0"
            >
              <div className="min-h-[400px] lg:min-h-0 flex flex-col">
                <AnimatePresence mode="wait">
                  {activePanel === "config" ? (
                    <motion.div
                      key="config-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <SessionConfigForm onStart={handleSessionStarted} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="config-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <Card
                        className="h-full flex flex-col items-center justify-center gap-6 cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/30 transition-all duration-300 group"
                        onClick={() => setActivePanel("config")}
                      >
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                          <Play className="h-7 w-7 text-primary fill-primary" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-semibold">{t("session.startSession")}</p>
                          <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                            {t("session.configureTimer")}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-primary/70 border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/10 transition-colors duration-200">
                          {t("session.clickToConfigure")}
                        </span>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="min-h-[400px] lg:min-h-0 flex flex-col pt-2 lg:pt-0">
                <AnimatePresence mode="wait">
                  {activePanel === "manual" ? (
                    <motion.div
                      key="manual-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ManualSessionForm onSaved={handleManualSaved} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <Card
                        className="h-full flex flex-col items-center justify-center gap-6 cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/30 transition-all duration-300 group"
                        onClick={() => setActivePanel("manual")}
                      >
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                          <ClipboardList className="h-7 w-7 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-semibold">{t("session.logPastSession")}</p>
                          <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                            {t("session.recordPast")}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-primary/70 border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/10 transition-colors duration-200">
                          {t("session.clickToLog")}
                        </span>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {sessionState === "ACTIVE" && sessionConfig && (
            <motion.div
              key="timer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center h-full"
            >
              <TimerDisplay
                mode={sessionConfig.timerMode}
                initialSeconds={
                  sessionConfig.timerMode === "REGRESSIVE" && sessionConfig.plannedDurationSeconds
                    ? sessionConfig.plannedDurationSeconds
                    : 0
                }
                onFinish={handleTimerFinished}
              />
            </motion.div>
          )}

          {sessionState === "REVIEW" && (
            <motion.div
              key="review"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-lg">
                {getSessionSummary()}
                <SessionReviewForm onSave={handleReviewSaved} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
