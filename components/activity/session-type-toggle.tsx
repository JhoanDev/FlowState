"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Briefcase, BookOpen } from "lucide-react";
import type { SessionType } from "@/types";

interface SessionTypeToggleProps {
  value: SessionType;
  onChange: (value: SessionType) => void;
}

const options = [
  { value: "WORK" as SessionType, label: "Work", Icon: Briefcase },
  { value: "STUDY" as SessionType, label: "Study", Icon: BookOpen },
];

export function SessionTypeToggle({ value, onChange }: SessionTypeToggleProps) {
  return (
    <div className="relative flex w-full items-center p-0.5 xl:p-1 rounded-[10px] border border-border bg-muted">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center py-2 xl:py-2.5 text-xs xl:text-sm font-bold tracking-wide rounded-lg transition-colors duration-200",
              isActive
                ? "text-primary-foreground cursor-default"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            )}
          >
            <opt.Icon className="w-4 h-4 mr-2" />
            {opt.label}
            {isActive && (
              <motion.span
                layoutId="session-toggle-bg"
                className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
