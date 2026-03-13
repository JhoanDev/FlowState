"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, LucideIcon } from "lucide-react";

export interface ListItem {
  id: string;
  label: string;
}

interface ListManagerProps {
  title: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  themeClass: "theme-work" | "theme-study";
  initialItems?: ListItem[];
  className?: string;
}

export function ListManager({
  title,
  description,
  icon: Icon,
  placeholder,
  themeClass,
  initialItems = [],
  className,
}: ListManagerProps) {
  const [items, setItems] = React.useState<ListItem[]>(initialItems);
  const [inputValue, setInputValue] = React.useState("");

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newItem: ListItem = {
      id: Math.random().toString(36).substring(7),
      label: inputValue.trim(),
    };

    setItems([...items, newItem]);
    setInputValue("");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((t) => t.id !== id));
  };

  return (
    <div className={cn("flex flex-col gap-6", themeClass, className)}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
            {title}
          </h2>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">
            {description}
          </p>
        </div>
      </div>

      <form onSubmit={handleAddItem} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)]"
          />
          <Button type="submit" variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border transition-colors",
              "border-[var(--border)] bg-[var(--primary)]/10 text-[var(--foreground)] hover:border-[var(--primary)]"
            )}
          >
            {item.label}
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="p-0.5 hover:bg-[var(--primary)]/20 text-[var(--foreground)]/50 hover:text-[var(--primary)] transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[var(--foreground)]/50 italic py-4">No items found.</p>
        )}
      </div>
    </div>
  );
}
