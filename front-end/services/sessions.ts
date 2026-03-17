import type { Session, SessionReviewData } from "@/types";

const SIMULATED_DELAY = 300;

export async function saveSession(
  session: Omit<Session, "id">
): Promise<Session> {
  // Future: return await invoke('save_session', { session });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return {
    ...session,
    id: crypto.randomUUID(),
  };
}

export async function saveSessionReview(
  sessionId: string,
  review: SessionReviewData
): Promise<void> {
  // Future: return await invoke('save_session_review', { sessionId, review });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  console.log("[mock] Session review saved:", { sessionId, review });
}
