"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  tags: Tag[];
  isLoading: boolean;
}

export function TagSelector({
  selectedIds,
  onChange,
  tags,
  isLoading,
}: TagSelectorProps) {
  const toggleTag = (id: number) => {
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
          <Skeleton key={i} className="h-10 w-32 rounded-lg" />
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
            <span
              className={cn(
                "inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium cursor-pointer border rounded-lg transition-all duration-200",
                isSelected
                  ? "shadow-sm"
                  : "border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              style={isSelected ? {
                borderColor: tag.color,
                backgroundColor: `${tag.color}15`,
                color: tag.color,
              } : undefined}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
