import type { Session, SessionReviewData, SessionWithRelations } from "@/types";
import { mockSessions, mockSessionTags } from "@/mocks/sessions";
import { mockProjects } from "@/mocks/projects";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockSessions.map((s) => s.id)) + 1;

export async function saveSession(
  session: Omit<Session, "id" | "createdAt">
): Promise<Session> {
  // Future: return await invoke('save_session', { session });
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
  // Future: return await invoke('save_session_review', { sessionId, review });
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
  // Future: return await invoke('get_session', { sessionId });
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
    project: project ? { id: project.id, name: project.name, color: project.color } : null,
    tags: tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
  };
}
