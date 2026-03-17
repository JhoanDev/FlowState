"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  tags: Tag[];
  isLoading: boolean;
}

export function TagSelector({
  selectedIds,
  onChange,
  tags,
  isLoading,
}: TagSelectorProps) {
  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {tags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className="outline-none active:scale-95 transition-transform duration-100"
          >
            <Badge
              className={cn(
                "px-4 py-2 text-sm font-medium cursor-pointer border rounded-lg transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground hover:bg-accent"
              )}
            >
              {tag.name}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
