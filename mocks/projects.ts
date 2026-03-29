import type { Project } from "@/types";

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "FlowState CLI",
    color: "#8b5cf6",
    archived: false,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "FlowState App",
    color: "#3b82f6",
    archived: false,
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: 3,
    name: "ZAPAPI",
    color: "#f97316",
    archived: false,
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: 4,
    name: "Portfolio",
    color: "#10b981",
    archived: false,
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: 5,
    name: "DevBlog",
    color: "#ec4899",
    archived: false,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: 6,
    name: "Dotfiles",
    color: "#84cc16",
    archived: true,
    createdAt: "2026-01-05T10:00:00Z",
  },
];
