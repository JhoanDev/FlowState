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
import type { SessionStartConfig, SessionReviewData } from "@/types";

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
  const [activePanel, setActivePanel] = React.useState<ActivePanel>("config");

  const handleSessionStarted = (config: SessionStartConfig) => {
    setSessionConfig(config);
    setSessionState("ACTIVE");
  };

  const handleTimerFinished = () => {
    setSessionState("REVIEW");
  };

  const handleReviewSaved = (data: SessionReviewData) => {
    console.log("Session Finalized:", { config: sessionConfig, review: data });
    router.push("/");
  };

  const handleManualSaved = () => {
    router.push("/");
  };

  const themeClass = sessionState !== "IDLE" && sessionConfig
    ? (sessionConfig.type === "STUDY" ? "theme-study" : "theme-work")
    : undefined;

  return (
    <AppLayout title="Session">
      <div className={cn("h-full flex flex-col gap-4 transition-colors duration-500", themeClass)}>
        <AnimatePresence mode="wait">
          {sessionState === "IDLE" && (
            <motion.div
              key="config"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-2 gap-6 h-full min-h-0"
            >
              <div className="min-h-0">
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
                          <p className="text-lg font-semibold">Start Session</p>
                          <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                            Configure timer mode, project and tags to start a focus session
                          </p>
                        </div>
                        <span className="text-xs font-medium text-primary/70 border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/10 transition-colors duration-200">
                          Click to configure
                        </span>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="min-h-0">
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
                          <p className="text-lg font-semibold">Log Past Session</p>
                          <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                            Record a session you forgot to track with date, time and details
                          </p>
                        </div>
                        <span className="text-xs font-medium text-primary/70 border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/10 transition-colors duration-200">
                          Click to log
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
                <SessionReviewForm onSave={handleReviewSaved} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
