import type { Session, SessionReviewData, SessionWithRelations, TodayStats } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockSessions, mockSessionTags } from "@/mocks/sessions";
import { mockProjects } from "@/mocks/projects";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockSessions.map((s) => s.id)) + 1;

export async function saveSession(
  session: Omit<Session, "id" | "createdAt">
): Promise<Session> {
  const res = await invokeTauri<Session>("save_session", { session });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newSession: Session = {
    ...session,
    id: nextId++,
    createdAt: new Date().toISOString(),
  };
  mockSessions.push(newSession);
  return newSession;
}

export async function saveSessionReview(
  sessionId: number,
  review: SessionReviewData
): Promise<void> {
  const res = await invokeTauri<void>("save_session_review", {
    sessionId,
    rating: review.rating,
    notes: review.notes,
  });
  if (res !== null) return;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const session = mockSessions.find((s) => s.id === sessionId);
  if (session) {
    session.rating = review.rating;
    session.notes = review.notes;
  }
}

export async function getSessionWithRelations(
  sessionId: number
): Promise<SessionWithRelations | null> {
  const res = await invokeTauri<SessionWithRelations>("get_session", { sessionId });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const project = session.projectId
    ? mockProjects.find((p) => p.id === session.projectId) ?? null
    : null;

  const tagIds = mockSessionTags
    .filter((st) => st.sessionId === sessionId)
    .map((st) => st.tagId);
  const tags = mockTags.filter((t) => tagIds.includes(t.id));

  return {
    ...session,
    project: project ?? undefined,
    tags,
  };
}

export async function saveManualSession(
  session: Omit<Session, "id" | "createdAt">,
  tagIds: number[]
): Promise<Session> {
  const res = await invokeTauri<Session>("save_manual_session", { session, tagIds });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newSession: Session = {
    ...session,
    id: nextId++,
    createdAt: new Date().toISOString(),
  };
  mockSessions.push(newSession);
  for (const tagId of tagIds) {
    mockSessionTags.push({ sessionId: newSession.id, tagId });
  }
  return newSession;
}

export async function deleteSession(sessionId: number): Promise<void> {
  const res = await invokeTauri<void>("delete_session", { sessionId });
  if (res !== null) return;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockSessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) mockSessions.splice(idx, 1);
  // Also remove session_tags
  for (let i = mockSessionTags.length - 1; i >= 0; i--) {
    if (mockSessionTags[i].sessionId === sessionId) {
      mockSessionTags.splice(i, 1);
    }
  }
}

export async function getTodayStats(): Promise<TodayStats> {
  const res = await invokeTauri<TodayStats>("get_today_stats");
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = mockSessions.filter(
    (s) => s.status === "COMPLETED" && s.startedAt.split("T")[0] === today
  );
  const totalSeconds = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  return {
    sessionCount: todaySessions.length,
    totalSeconds,
    avgSeconds: todaySessions.length > 0 ? Math.round(totalSeconds / todaySessions.length) : 0,
  };
}
