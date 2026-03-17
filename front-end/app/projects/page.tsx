"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ListManager } from "@/components/projects/list-manager";
import { FolderGit2, Tag as TagIcon } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { getProjects, createProject, deleteProject } from "@/services/projects";
import { getTags, createTag, deleteTag } from "@/services/tags";

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

  const handleAddProject = async (name: string) => {
    const newProject = await createProject(name);
    setProjects((prev) => [...prev, newProject]);
  };

  const handleRemoveProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddTag = async (name: string) => {
    const newTag = await createTag(name);
    setTags((prev) => [...prev, newTag]);
  };

  const handleRemoveTag = async (id: string) => {
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppLayout title="Projects & Tags">
      <div className="grid grid-cols-2 gap-12 max-w-5xl items-start">
        <ListManager
          title="Projects"
          description="Manage your active work repositories"
          icon={FolderGit2}
          placeholder="Ex: API Backend, Web Frontend"
          themeClass="theme-work"
          items={projects}
          isLoading={projectsQuery.isLoading}
          onAdd={handleAddProject}
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
          onRemove={handleRemoveTag}
        />
      </div>
    </AppLayout>
  );
}
