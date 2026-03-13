"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SessionTypeToggleProps {
  value: "WORK" | "STUDY";
  onChange: (value: "WORK" | "STUDY") => void;
}

export function SessionTypeToggle({ value, onChange }: SessionTypeToggleProps) {
  return (
    <div className="flex w-full items-center p-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] shadow-inner">
      <button
        type="button"
        onClick={() => onChange("WORK")}
        className={cn(
          "flex-1 py-2.5 text-sm font-bold tracking-wide rounded-[calc(var(--radius)-0.25rem)] transition-all duration-300 focus:outline-none",
          value === "WORK"
            ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
            : "bg-transparent text-[var(--foreground)]/50 hover:bg-[var(--border)]/30 hover:text-[var(--foreground)]"
        )}
      >
        WORK
      </button>
      <button
        type="button"
        onClick={() => onChange("STUDY")}
        className={cn(
          "flex-1 py-2.5 text-sm font-bold tracking-wide rounded-[calc(var(--radius)-0.25rem)] transition-all duration-300 focus:outline-none",
          value === "STUDY"
            ? "bg-blue-800 text-white shadow-sm" 
            : "bg-transparent text-[var(--foreground)]/50 hover:bg-[var(--border)]/30 hover:text-[var(--foreground)]"
        )}
      >
        STUDY
      </button>
    </div>
  );
}
