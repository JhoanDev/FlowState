"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

// Global predefined list of tags replacing free-text input
const PRESET_TAGS = [
  "Programação Competitiva",
  "Linux",
  "Algoritmos",
  "Backend",
  "Frontend",
  "Deep Work",
  "Reading",
  "Review"
];

export function TagSelector({ tags, onChange }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter((t) => t !== tag));
    } else {
      onChange([...tags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {PRESET_TAGS.map((tag) => {
        const isSelected = tags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] rounded-[var(--radius)]"
          >
            <Badge
              className={cn(
                "px-4 py-2 text-sm font-medium cursor-pointer border transition-colors duration-200",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-sm"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]/70 hover:bg-[var(--border)]/50 hover:text-[var(--foreground)]"
              )}
            >
              {tag}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
