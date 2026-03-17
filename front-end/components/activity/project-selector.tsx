"use client";

import { cn } from "@/lib/utils";
import { FolderGit2, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/types";

interface ProjectSelectorProps {
  value: string;
  onChange: (projectId: string) => void;
  projects: Project[];
  isLoading: boolean;
}

export function ProjectSelector({
  value,
  onChange,
  projects,
  isLoading,
}: ProjectSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Project
      </label>
      <div className="relative group">
        <FolderGit2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors duration-200 group-hover:text-foreground" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex h-12 w-full appearance-none rounded-lg border border-input bg-transparent pl-11 pr-10 py-3 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring hover:border-muted-foreground/40 cursor-pointer"
          )}
        >
          <option value="" disabled className="bg-background">
            Select a project
          </option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id} className="bg-background">
              {proj.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
