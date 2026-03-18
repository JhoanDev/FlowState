import type { Project } from "@/types";
import { mockProjects } from "@/mocks/projects";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockProjects.map((p) => p.id)) + 1;

export async function getProjects(): Promise<Project[]> {
  // Future: return await invoke('get_projects');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockProjects.filter((p) => !p.archived);
}

export async function createProject(
  name: string,
  color: string = "#8b5cf6"
): Promise<Project> {
  // Future: return await invoke('create_project', { name, color });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newProject: Project = {
    id: nextId++,
    name,
    color,
    archived: false,
    createdAt: new Date().toISOString(),
  };
  mockProjects.push(newProject);
  return newProject;
}

export async function deleteProject(id: number): Promise<void> {
  // Future: return await invoke('delete_project', { id });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockProjects.findIndex((p) => p.id === id);
  if (idx !== -1) mockProjects.splice(idx, 1);
}
