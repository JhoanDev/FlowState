import type { Tag } from "@/types";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

export async function getTags(): Promise<Tag[]> {
  // Future: return await invoke('get_tags');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockTags;
}

export async function createTag(name: string): Promise<Tag> {
  // Future: return await invoke('create_tag', { name });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newTag: Tag = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  mockTags.push(newTag);
  return newTag;
}

export async function deleteTag(id: string): Promise<void> {
  // Future: return await invoke('delete_tag', { id });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockTags.findIndex((t) => t.id === id);
  if (idx !== -1) mockTags.splice(idx, 1);
}
