"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Check, Pencil, type LucideIcon } from "lucide-react";

const COLOR_PRESETS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#d97706", // amber-dark
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#16a34a", // green-dark
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0891b2", // cyan-dark
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#2563eb", // blue-dark
  "#6366f1", // indigo
  "#4f46e5", // indigo-dark
  "#8b5cf6", // violet
  "#7c3aed", // violet-dark
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#c026d3", // fuchsia-dark
  "#ec4899", // pink
  "#f43f5e", // rose
  "#e11d48", // rose-dark
  "#78716c", // stone
  "#64748b", // slate
];

export interface ListItem {
  id: number;
  name: string;
  color: string;
}

interface ListManagerProps {
  title: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  themeClass: "theme-work" | "theme-study";
  items: ListItem[];
  isLoading: boolean;
  onAdd: (name: string, color: string) => void;
  onEdit: (id: number, data: { name?: string; color?: string }) => void;
  onRemove: (id: number) => void;
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  hideHeader?: boolean;
  className?: string;
}

// ─── Color Picker ───────────────────────────────────────────────

function ColorPicker({
  selected,
  usedColors,
  currentItemColor,
  onChange,
}: {
  selected: string;
  usedColors: Set<string>;
  currentItemColor?: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PRESETS.map((color) => {
        const isTaken = usedColors.has(color) && color !== currentItemColor;
        const isSelected = selected === color;

        return (
          <button
            key={color}
            type="button"
            disabled={isTaken}
            onClick={() => onChange(color)}
            className={cn(
              "h-6 w-6 rounded-full transition-all duration-200 border-2",
              isTaken
                ? "opacity-20 cursor-not-allowed border-transparent"
                : isSelected
                  ? "scale-110 border-foreground"
                  : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

// ─── Edit Popover (floats below the clicked item) ───────────────

function EditPopover({
  item,
  usedColors,
  onSave,
  onCancel,
}: {
  item: ListItem;
  usedColors: Set<string>;
  onSave: (data: { name: string; color: string }) => void;
  onCancel: () => void;
}) {
  const [editName, setEditName] = React.useState(item.name);
  const [editColor, setEditColor] = React.useState(item.color);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    if (trimmed === item.name && editColor === item.color) {
      onCancel();
      return;
    }
    onSave({ name: trimmed, color: editColor });
  };

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editName, editColor, item.name, item.color, onCancel, onSave]); 

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-2 z-50 w-80 space-y-4 p-5 rounded-lg border border-border bg-card shadow-lg"
    >
      {/* Name input + action buttons */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 bg-transparent px-3 text-sm font-medium rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all duration-200"
        />
        <button
          type="button"
          onClick={handleSave}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-accent transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Color grid */}
      <ColorPicker
        selected={editColor}
        usedColors={usedColors}
        currentItemColor={item.color}
        onChange={setEditColor}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function ListManager({
  title,
  description,
  icon: Icon,
  placeholder,
  themeClass,
  items,
  isLoading,
  onAdd,
  onEdit,
  onRemove,
  selectedId,
  onSelect,
  hideHeader,
  className,
}: ListManagerProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const usedColors = new Set(items.map((i) => i.color));
  const availableColors = COLOR_PRESETS.filter((c) => !usedColors.has(c));

  const [selectedColor, setSelectedColor] = React.useState(
    () => availableColors[0] ?? COLOR_PRESETS[0]
  );

  React.useEffect(() => {
    if (usedColors.has(selectedColor) && availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
    }
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (usedColors.has(selectedColor)) return;
    onAdd(inputValue.trim(), selectedColor);
    setInputValue("");
    const nextAvailable = COLOR_PRESETS.filter(
      (c) => !usedColors.has(c) && c !== selectedColor
    );
    if (nextAvailable.length > 0) {
      setSelectedColor(nextAvailable[0]);
    }
  };

  const handleEditSave = (id: number, data: { name: string; color: string }) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const changes: { name?: string; color?: string } = {};
    if (data.name !== item.name) changes.name = data.name;
    if (data.color !== item.color) changes.color = data.color;

    if (Object.keys(changes).length > 0) {
      onEdit(id, changes);
    }
    setEditingId(null);
  };

  return (
    <Card className={cn("flex flex-col h-auto lg:h-full", themeClass, className)}>
      {!hideHeader && (
        <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
          <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
            {title}
          </CardTitle>
          <p className="text-[10px] xl:text-xs text-muted-foreground mt-1 xl:mt-1.5 ml-5 max-w-[90%]">
            {description}
          </p>
        </CardHeader>
      )}

      <CardContent className={cn("p-3 xl:p-4 flex-1 flex flex-col gap-3 xl:gap-4 min-h-0 md:overflow-y-auto", hideHeader ? "pt-3 xl:pt-4" : "pt-3")}>
        {/* Add form */}
        <div className="space-y-2 xl:space-y-3 shrink-0">
          <label className="text-[10px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            New {title.toLowerCase().replace(/s$/, "")}
          </label>
          <form onSubmit={handleSubmit} className="flex gap-2.5">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-8 xl:h-9 text-xs xl:text-sm"
            />
            <Button type="submit" size="sm" className="h-8 xl:h-9 px-3 xl:px-4 gap-1.5 xl:gap-2 text-[10px] xl:text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              Add
            </Button>
          </form>

          {/* Color picker */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] xl:text-xs font-medium text-muted-foreground shrink-0">Color:</span>
            <ColorPicker
              selected={selectedColor}
              usedColors={usedColors}
              onChange={setSelectedColor}
            />
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 min-h-0">
          <div className="flex flex-wrap gap-2.5 content-start">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-lg" />
              ))
            ) : items.length === 0 ? (
              <p className="text-base text-muted-foreground py-6 w-full text-center">
                No items yet.
              </p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="relative">
                  <span
                    className={cn(
                      "group inline-flex items-center justify-between gap-2 xl:gap-3 px-2.5 xl:px-4 py-1.5 xl:py-2.5 text-xs xl:text-sm font-semibold border rounded-lg transition-all duration-200 cursor-pointer min-w-0 xl:min-w-[140px] flex-1 xl:flex-none",
                      editingId === item.id
                        ? "bg-accent/50 ring-2 ring-primary/30"
                        : selectedId === item.id
                          ? "shadow-sm"
                          : "hover:bg-accent/40 bg-transparent"
                    )}
                    style={{ 
                      borderColor: selectedId === item.id ? item.color : `${item.color}40`,
                      backgroundColor: selectedId === item.id ? `${item.color}15` : undefined,
                      boxShadow: selectedId === item.id ? `0 0 0 1px ${item.color}` : undefined
                    }}
                    onClick={() => {
                      if (onSelect) onSelect(item.id);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>

                    <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(editingId === item.id ? null : item.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedId === item.id && onSelect) onSelect(-1); // Deselect on remove
                          onRemove(item.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </span>

                  {/* Edit popover — floats below the item */}
                  {editingId === item.id && (
                    <EditPopover
                      item={item}
                      usedColors={usedColors}
                      onSave={(data) => handleEditSave(item.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
