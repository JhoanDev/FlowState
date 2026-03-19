"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ListManager } from "@/components/projects/list-manager";
import { FilteredSessionsView } from "@/components/projects/filtered-sessions-view";
import { FolderGit2, Tag as TagIcon } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { getProjects, createProject, updateProject, deleteProject } from "@/services/projects";
import { getTags, createTag, updateTag, deleteTag } from "@/services/tags";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const projectsQuery = useAsync(getProjects);
  const tagsQuery = useAsync(getTags);

  const [projects, setProjects] = React.useState(projectsQuery.data ?? []);
  const [tags, setTags] = React.useState(tagsQuery.data ?? []);

  const [activeTab, setActiveTab] = React.useState<"PROJECTS" | "TAGS">("PROJECTS");
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null);
  const [selectedTagId, setSelectedTagId] = React.useState<number | null>(null);

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
    <AppLayout title="Projects & Tags">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-5rem)] lg:h-full overflow-y-auto lg:overflow-hidden pb-4 lg:pb-0 w-full max-w-full">
        {/* Management Left Pane (Master) */}
        <div className="flex-none lg:flex-[3] flex flex-col min-w-0 bg-card rounded-xl border border-border shadow-sm shrink-0 lg:overflow-hidden h-auto lg:h-full">
          
          {/* Internal Toggle Header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-border/50 shrink-0">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Registry</h2>
            <div className="flex p-1 bg-accent/40 rounded-lg max-w-[400px]">
               <Button
                 variant="ghost"
                 className={cn("flex-1 h-9 text-xs sm:text-sm font-bold tracking-wide transition-all px-2", activeTab === "PROJECTS" && "bg-background shadow-sm text-foreground")}
                 onClick={() => setActiveTab("PROJECTS")}
               >
                 <FolderGit2 className="h-4 w-4 mr-2" />
                 Work Projects
               </Button>
               <Button
                 variant="ghost"
                 className={cn("flex-1 h-9 text-xs sm:text-sm font-bold tracking-wide transition-all px-2", activeTab === "TAGS" && "bg-background shadow-sm text-foreground")}
                 onClick={() => setActiveTab("TAGS")}
               >
                 <TagIcon className="h-4 w-4 mr-2" />
                 Study Tags
               </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
             {activeTab === "PROJECTS" ? (
                <ListManager
                  title="Projects"
                  description="Click to select and filter, hover to edit or delete."
                  icon={FolderGit2}
                  placeholder="Ex: API Backend, Web Frontend"
                  themeClass="theme-work"
                  className="border-none shadow-none rounded-none"
                  items={projects}
                  isLoading={projectsQuery.isLoading}
                  onAdd={handleAddProject}
                  onEdit={handleEditProject}
                  onRemove={handleRemoveProject}
                  selectedId={selectedProjectId}
                  onSelect={handleProjectSelect}
                />
             ) : (
                <ListManager
                  title="Tags"
                  description="Click to select and filter, hover to edit or delete."
                  icon={TagIcon}
                  placeholder="Ex: Rust, Next.js, Algorithms"
                  themeClass="theme-study"
                  className="border-none shadow-none rounded-none"
                  items={tags}
                  isLoading={tagsQuery.isLoading}
                  onAdd={handleAddTag}
                  onEdit={handleEditTag}
                  onRemove={handleRemoveTag}
                  selectedId={selectedTagId}
                  onSelect={handleTagSelect}
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
