"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SessionConfigForm } from "@/components/activity/session-config-form";
import { TimerDisplay } from "@/components/activity/timer-display";
import { SessionReviewForm } from "@/components/activity/session-review-form";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Keyboard, Zap, Clock } from "lucide-react";
import type { SessionType, SessionReviewData } from "@/types";

type SessionState = "IDLE" | "ACTIVE" | "REVIEW";

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

function SessionSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <Zap className="h-[18px] w-[18px] text-primary" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>Choose <span className="text-work font-medium">Work</span> for project-based tasks and <span className="text-study font-medium">Study</span> for learning sessions.</p>
          <p>The timer counts up — focus as long as you need, then end when done.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <Keyboard className="h-[18px] w-[18px] text-primary" />
            Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "Space", action: "Start / Pause" },
            { key: "Esc", action: "End session" },
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{shortcut.action}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-mono border border-border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <Clock className="h-[18px] w-[18px] text-primary" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sessions</span>
            <span className="font-semibold tabular-nums">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total time</span>
            <span className="font-semibold tabular-nums">4h 30m</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg. focus</span>
            <span className="font-semibold tabular-nums">1h 30m</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SessionPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = React.useState<SessionState>("IDLE");
  const [sessionType, setSessionType] = React.useState<SessionType>("WORK");

  const handleSessionStarted = (type: SessionType) => {
    setSessionType(type);
    setSessionState("ACTIVE");
  };

  const handleTimerFinished = () => {
    setSessionState("REVIEW");
  };

  const handleReviewSaved = (data: SessionReviewData) => {
    console.log("Session Finalized:", { type: sessionType, review: data });
    router.push("/");
  };

  const themeClass = sessionState !== "IDLE"
    ? (sessionType === "STUDY" ? "theme-study" : "theme-work")
    : undefined;

  return (
    <AppLayout title="Session">
      <div className={cn("h-full transition-colors duration-500", themeClass)}>
        <AnimatePresence mode="wait">
          {sessionState === "IDLE" && (
            <motion.div
              key="config"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-5 gap-8 h-full items-start"
            >
              <div className="col-span-3">
                <SessionConfigForm onStart={handleSessionStarted} />
              </div>
              <div className="col-span-2">
                <SessionSidebar />
              </div>
            </motion.div>
          )}

          {sessionState === "ACTIVE" && (
            <motion.div
              key="timer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-3xl">
                <TimerDisplay
                  mode="PROGRESSIVE"
                  onFinish={handleTimerFinished}
                />
              </div>
            </motion.div>
          )}

          {sessionState === "REVIEW" && (
            <motion.div
              key="review"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-5 gap-8 h-full items-start"
            >
              <div className="col-span-3">
                <SessionReviewForm onSave={handleReviewSaved} />
              </div>
              <div className="col-span-2">
                <SessionSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
