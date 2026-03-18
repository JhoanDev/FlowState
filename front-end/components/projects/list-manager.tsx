"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, X, type LucideIcon } from "lucide-react";

export interface ListItem {
  id: number;
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
  onRemove: (id: number) => void;
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
    <Card className={cn("flex flex-col", themeClass, className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
        <CardDescription className="ml-[52px]">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 flex-1">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button type="submit">
            <Plus className="h-[18px] w-[18px] mr-2" />
            Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-32 rounded-lg" />
            ))
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No items yet.</p>
          ) : (
            items.map((item) => (
              <span
                key={item.id}
                className="group inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium border border-border bg-primary/5 text-foreground rounded-lg transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
              >
                {item.name}
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
