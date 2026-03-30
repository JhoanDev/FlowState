"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ListManager } from "@/components/projects/list-manager";
import { FilteredSessionsView } from "@/components/projects/filtered-sessions-view";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Tag as TagIcon, Database } from "lucide-react";
import { motion } from "motion/react";
import { useAsync } from "@/hooks/use-async";
import { getProjects, createProject, updateProject, deleteProject } from "@/services/projects";
import { getTags, createTag, updateTag, deleteTag } from "@/services/tags";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";


export default function ProjectsPage() {
  const projectsQuery = useAsync(getProjects);
  const tagsQuery = useAsync(getTags);

  const [projects, setProjects] = React.useState(projectsQuery.data ?? []);
  const [tags, setTags] = React.useState(tagsQuery.data ?? []);

  const [activeTab, setActiveTab] = React.useState<"PROJECTS" | "TAGS">("PROJECTS");
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null);
  const [selectedTagId, setSelectedTagId] = React.useState<number | null>(null);
  const { t } = useTranslation();

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
    // keep selection if edited
  };

  const handleRemoveProject = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
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
    if (selectedTagId === id) setSelectedTagId(null);
  };

  const handleProjectSelect = (id: number) => {
    if (id === -1) setSelectedProjectId(null); // Explicit clear
    else setSelectedProjectId(id === selectedProjectId ? null : id);
  };

  const handleTagSelect = (id: number) => {
    if (id === -1) setSelectedTagId(null); // Explicit clear
    else setSelectedTagId(id === selectedTagId ? null : id);
  };

  // Derive Data for Filtered View
  let viewerType: "PROJECT" | "TAG" | null = null;
  let viewerId: number | null = null;
  let viewerName = "";
  let viewerColor = "";

  if (activeTab === "PROJECTS" && selectedProjectId !== null) {
     const p = projects.find(p => p.id === selectedProjectId);
     if (p) {
       viewerType = "PROJECT";
       viewerId = p.id;
       viewerName = p.name;
       viewerColor = p.color;
     }
  } else if (activeTab === "TAGS" && selectedTagId !== null) {
     const t = tags.find(t => t.id === selectedTagId);
     if (t) {
       viewerType = "TAG";
       viewerId = t.id;
       viewerName = t.name;
       viewerColor = t.color;
     }
  }

  return (
    <AppLayout title={t("projects.title")}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-5rem)] lg:h-full overflow-y-auto lg:overflow-hidden pb-4 lg:pb-0 w-full max-w-full">
        {/* Management Left Pane (Master) */}
        <div className="flex-none lg:flex-[3] flex flex-col min-w-0 bg-card rounded-xl border border-border emissive-border shrink-0 lg:overflow-hidden h-auto lg:h-full">
          
          {/* Internal Toggle Header */}
          <CardHeader className="p-3 xl:p-4 pb-0 shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4 w-full border-none px-4">
            <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
              {t("projects.registry")}
            </CardTitle>
            <div className={cn("relative flex p-0.5 bg-accent/30 rounded-[10px] xl:max-w-[280px] w-full", activeTab === "PROJECTS" ? "theme-work" : "theme-study")}>
               {(["PROJECTS", "TAGS"] as const).map((tab) => {
                 const isActive = activeTab === tab;
                 const isWork = tab === "PROJECTS";
                 const Icon = isWork ? FolderGit2 : TagIcon;
                 return (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                       "relative z-10 flex-1 flex items-center justify-center h-6 xl:h-7 text-[10px] xl:text-xs font-bold tracking-wide transition-colors duration-200 px-2 rounded-lg",
                       isActive
                         ? "text-primary-foreground cursor-default"
                         : "text-muted-foreground hover:text-foreground cursor-pointer"
                     )}
                   >
                     <Icon className="h-2.5 w-2.5 xl:h-3 xl:w-3 mr-1.5" />
                     {isWork ? t("projects.projects") : t("projects.tags")}
                     {isActive && (
                       <motion.span
                         layoutId="registry-toggle-bg"
                         className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10"
                         transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                       />
                     )}
                   </button>
                 );
               })}
            </div>
          </CardHeader>

          <div className="flex-1 min-h-0 relative mt-4">
             {activeTab === "PROJECTS" ? (
                <ListManager
                  title={t("projects.projects")}
                  description={t("projects.clickToFilter")}
                  icon={FolderGit2}
                  placeholder={t("projects.projectPlaceholder")}
                  themeClass="theme-work"
                  className="border-none rounded-none"
                  items={projects}
                  isLoading={projectsQuery.isLoading}
                  onAdd={handleAddProject}
                  onEdit={handleEditProject}
                  onRemove={handleRemoveProject}
                  selectedId={selectedProjectId}
                  onSelect={handleProjectSelect}
                  hideHeader
                />
             ) : (
                <ListManager
                  title={t("projects.tags")}
                  description={t("projects.clickToFilter")}
                  icon={TagIcon}
                  placeholder={t("projects.tagPlaceholder")}
                  themeClass="theme-study"
                  className="border-none rounded-none"
                  items={tags}
                  isLoading={tagsQuery.isLoading}
                  onAdd={handleAddTag}
                  onEdit={handleEditTag}
                  onRemove={handleRemoveTag}
                  selectedId={selectedTagId}
                  onSelect={handleTagSelect}
                  hideHeader
                />
             )}
          </div>
        </div>

        {/* Viewing Right Pane (Detail) */}
        <div className="flex-none lg:flex-[4] min-w-0 shrink-0 h-auto lg:h-full">
           <FilteredSessionsView 
             type={viewerType} 
             id={viewerId} 
             itemName={viewerName} 
             itemColor={viewerColor} 
             onClear={() => activeTab === "PROJECTS" ? setSelectedProjectId(null) : setSelectedTagId(null)}
           />
        </div>
      </div>
    </AppLayout>
  );
}
