"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SessionConfigForm } from "@/components/activity/session-config-form";
import { TimerDisplay } from "@/components/activity/timer-display";
import { SessionReviewForm, SessionReviewData } from "@/components/activity/session-review-form";
import { AppLayout } from "@/components/layout/app-layout";

type SessionState = "IDLE" | "ACTIVE" | "REVIEW";

export default function SessionPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = React.useState<SessionState>("IDLE");
  const [sessionType, setSessionType] = React.useState<"WORK" | "STUDY">("WORK");

  const handleSessionStarted = (type: "WORK" | "STUDY") => {
    setSessionType(type);
    setSessionState("ACTIVE");
  };

  const handleTimerFinished = () => {
    setSessionState("REVIEW");
  };

  const handleReviewSaved = (data: SessionReviewData) => {
    console.log("Session Finalized:", { type: sessionType, review: data });
    // Future Tauri/SQLite invoke goes here
    
    // Return to dashboard
    router.push("/");
  };

  return (
    <AppLayout title="Session">
      {/* Immersive Main Content Area centered inside AppLayout main content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <div className="w-full max-w-4xl flex justify-center animate-in fade-in duration-500">
          
          {sessionState === "IDLE" && (
            <div className="w-full max-w-lg">
              <SessionConfigForm onStart={handleSessionStarted} />
            </div>
          )}

          {sessionState === "ACTIVE" && (
            <div className="w-full">
              <TimerDisplay
                mode={sessionType === "WORK" ? "PROGRESSIVE" : "PROGRESSIVE"}
                onFinish={handleTimerFinished}
              />
            </div>
          )}

          {sessionState === "REVIEW" && (
            <div className="w-full flex justify-center">
              <SessionReviewForm onSave={handleReviewSaved} className="w-full max-w-xl" />
            </div>
          )}
          
        </div>
      </div>
    </AppLayout>
  );
}
