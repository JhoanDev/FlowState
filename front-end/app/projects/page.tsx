"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ListManager } from "@/components/projects/list-manager";
import { FolderGit2, Tag as TagIcon } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { getProjects, createProject, updateProject, deleteProject } from "@/services/projects";
import { getTags, createTag, updateTag, deleteTag } from "@/services/tags";

export default function ProjectsPage() {
  const projectsQuery = useAsync(getProjects);
  const tagsQuery = useAsync(getTags);

  const [projects, setProjects] = React.useState(projectsQuery.data ?? []);
  const [tags, setTags] = React.useState(tagsQuery.data ?? []);

  React.useEffect(() => {
    if (projectsQuery.data) setProjects(projectsQuery.data);
  }, [projectsQuery.data]);

  React.useEffect(() => {
    if (tagsQuery.data) setTags(tagsQuery.data);
  }, [tagsQuery.data]);

  const handleAddProject = async (name: string, color: string) => {
    const newProject = await createProject(name, color);
    setProjects((prev) => [...prev, newProject]);
  };

  const handleEditProject = async (id: number, data: { name?: string; color?: string }) => {
    const updated = await updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleRemoveProject = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddTag = async (name: string, color: string) => {
    const newTag = await createTag(name, color);
    setTags((prev) => [...prev, newTag]);
  };

  const handleEditTag = async (id: number, data: { name?: string; color?: string }) => {
    const updated = await updateTag(id, data);
    setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleRemoveTag = async (id: number) => {
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppLayout title="Projects & Tags">
      <div className="grid grid-cols-2 gap-6 h-full min-h-0">
        <ListManager
          title="Projects"
          description="Manage your active work repositories"
          icon={FolderGit2}
          placeholder="Ex: API Backend, Web Frontend"
          themeClass="theme-work"
          items={projects}
          isLoading={projectsQuery.isLoading}
          onAdd={handleAddProject}
          onEdit={handleEditProject}
          onRemove={handleRemoveProject}
        />

        <ListManager
          title="Tags"
          description="Manage topics and technologies you study"
          icon={TagIcon}
          placeholder="Ex: Rust, Next.js, Algorithms"
          themeClass="theme-study"
          items={tags}
          isLoading={tagsQuery.isLoading}
          onAdd={handleAddTag}
          onEdit={handleEditTag}
          onRemove={handleRemoveTag}
        />
      </div>
    </AppLayout>
  );
}
