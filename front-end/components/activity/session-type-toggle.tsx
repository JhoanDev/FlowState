"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { SessionType } from "@/types";

interface SessionTypeToggleProps {
  value: SessionType;
  onChange: (value: SessionType) => void;
}

const options: { value: SessionType; label: string }[] = [
  { value: "WORK", label: "Work" },
  { value: "STUDY", label: "Study" },
];

export function SessionTypeToggle({ value, onChange }: SessionTypeToggleProps) {
  return (
    <div className="relative flex w-full items-center gap-1 p-1 rounded-lg border border-border bg-muted">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex-1 py-3 text-sm font-semibold tracking-wide rounded-md transition-colors duration-200",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
            {isActive && (
              <motion.span
                layoutId="session-toggle-bg"
                className="absolute inset-0 rounded-md bg-primary shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
