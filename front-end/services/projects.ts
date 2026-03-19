import type { Project } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockProjects } from "@/mocks/projects";

const SIMULATED_DELAY = 300;

let nextId = Math.max(...mockProjects.map((p) => p.id)) + 1;

export async function getProjects(): Promise<Project[]> {
  const res = await invokeTauri<Project[]>("get_projects");
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return mockProjects.filter((p) => !p.archived);
}

export async function createProject(
  name: string,
  color: string = "#8b5cf6"
): Promise<Project> {
  const res = await invokeTauri<Project>("create_project", { name, color });
  if (res) return res;

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

export async function updateProject(
  id: number,
  data: { name?: string; color?: string }
): Promise<Project> {
  const res = await invokeTauri<Project>("update_project", { id, ...data });
  if (res) return res;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const project = mockProjects.find((p) => p.id === id);
  if (!project) throw new Error(`Project ${id} not found`);
  if (data.name !== undefined) project.name = data.name;
  if (data.color !== undefined) project.color = data.color;
  return { ...project };
}

export async function deleteProject(id: number): Promise<void> {
  const res = await invokeTauri<void>("delete_project", { id });
  if (res !== null) return;

  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  const idx = mockProjects.findIndex((p) => p.id === id);
  if (idx !== -1) mockProjects.splice(idx, 1);
}
