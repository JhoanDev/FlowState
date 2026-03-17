"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X, type LucideIcon } from "lucide-react";

export interface ListItem {
  id: string;
  name: string;
}

interface ListManagerProps {
  title: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  themeClass: "theme-work" | "theme-study";
  items: ListItem[];
  isLoading: boolean;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function ListManager({
  title,
  description,
  icon: Icon,
  placeholder,
  themeClass,
  items,
  isLoading,
  onAdd,
  onRemove,
  className,
}: ListManagerProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAdd(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className={cn("flex flex-col gap-6", themeClass, className)}>
      <div className="border-b border-border pb-5">
        <h2 className="text-base font-semibold flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 ml-10.5">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="h-4 w-4 mr-1.5" />
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No items yet.</p>
        ) : (
          items.map((item) => (
            <span
              key={item.id}
              className="group inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-border bg-primary/5 text-foreground rounded-lg transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
            >
              {item.name}
              <button
                onClick={() => onRemove(item.id)}
                className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
