import type { Tag } from "@/types";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockTags.map((t) => t.id)) + 1;

export async function getTags(): Promise<Tag[]> {
  // Future: return await invoke('get_tags');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockTags;
}

export async function createTag(
  name: string,
  color: string = "#a78bfa"
): Promise<Tag> {
  // Future: return await invoke('create_tag', { name, color });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newTag: Tag = {
    id: nextId++,
    name,
    color,
    createdAt: new Date().toISOString(),
  };
  mockTags.push(newTag);
  return newTag;
}

export async function deleteTag(id: number): Promise<void> {
  // Future: return await invoke('delete_tag', { id });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockTags.findIndex((t) => t.id === id);
  if (idx !== -1) mockTags.splice(idx, 1);
}
