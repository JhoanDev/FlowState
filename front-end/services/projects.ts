import type { Project } from "@/types";
import { mockProjects } from "@/mocks/projects";

const SIMULATED_DELAY = 300;

export async function getProjects(): Promise<Project[]> {
  // Future: return await invoke('get_projects');
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockProjects;
}

export async function createProject(name: string): Promise<Project> {
  // Future: return await invoke('create_project', { name });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  mockProjects.push(newProject);
  return newProject;
}

export async function deleteProject(id: string): Promise<void> {
  // Future: return await invoke('delete_project', { id });
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockProjects.findIndex((p) => p.id === id);
  if (idx !== -1) mockProjects.splice(idx, 1);
}
