"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectSelectorProps {
  value: number | null;
  onChange: (projectId: number | null) => void;
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
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-36 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {projects.map((proj) => {
        const isSelected = value === proj.id;
        return (
          <button
            key={proj.id}
            type="button"
            onClick={() => onChange(isSelected ? null : proj.id)}
            className="outline-none active:scale-95 transition-transform duration-100"
          >
            <span
              className={cn(
                "inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium cursor-pointer border rounded-lg transition-all duration-200",
                isSelected
                  ? ""
                  : "border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              style={isSelected ? {
                borderColor: proj.color,
                backgroundColor: `${proj.color}15`,
                color: proj.color,
              } : undefined}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: proj.color }}
              />
              <span className="truncate">{proj.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
