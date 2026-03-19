import type { Tag } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockTags } from "@/mocks/tags";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockTags.map((t) => t.id)) + 1;

export async function getTags(): Promise<Tag[]> {
  const res = await invokeTauri<Tag[]>("get_tags");
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockTags;
}

export async function createTag(
  name: string,
  color: string = "#a78bfa"
): Promise<Tag> {
  const res = await invokeTauri<Tag>("create_tag", { name, color });
  if (res) return res;

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

export async function updateTag(
  id: number,
  data: { name?: string; color?: string }
): Promise<Tag> {
  const res = await invokeTauri<Tag>("update_tag", { id, ...data });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const tag = mockTags.find((t) => t.id === id);
  if (!tag) throw new Error(`Tag ${id} not found`);
  if (data.name !== undefined) tag.name = data.name;
  if (data.color !== undefined) tag.color = data.color;
  return { ...tag };
}

export async function deleteTag(id: number): Promise<void> {
  const res = await invokeTauri<void>("delete_tag", { id });
  if (res !== null) return;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockTags.findIndex((t) => t.id === id);
  if (idx !== -1) mockTags.splice(idx, 1);
}
