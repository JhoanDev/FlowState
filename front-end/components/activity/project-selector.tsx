"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderGit2 } from "lucide-react";

interface ProjectSelectorProps {
  value: string;
  onChange: (project: string) => void;
}

// Temporary mock options - in the future this will load from SQLite via Tauri command
const MOCK_PROJECTS = ["FlowState Core", "ZAPAPI", "Portfolio", "None"];

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  return (
    <div className="relative w-full">
      <label className="text-xs font-semibold text-[var(--foreground)]/70 mb-2 block uppercase tracking-wider">
        Project
      </label>
      <div className="relative">
        <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex h-14 w-full appearance-none rounded-[var(--radius)] border border-[var(--border)] bg-transparent pl-10 pr-8 py-2 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <option value="" disabled className="bg-[var(--background)]">Select a project</option>
          {MOCK_PROJECTS.map((proj) => (
            <option key={proj} value={proj} className="bg-[var(--background)]">
              {proj}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-[var(--foreground)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
