"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ListManager, ListItem } from "@/components/projects/list-manager";
import { FolderGit2, Tag as TagIcon } from "lucide-react";

// --- Mock Data ---
const MOCK_PROJECTS: ListItem[] = [
  { id: "1", label: "FlowState CLI" },
  { id: "2", label: "FlowState App" },
  { id: "3", label: "ZAPAPI" },
  { id: "4", label: "Portfolio" },
];

const MOCK_TAGS: ListItem[] = [
  { id: "t1", label: "React" },
  { id: "t2", label: "Rust" },
  { id: "t3", label: "Next.js" },
  { id: "t4", label: "Go" },
  { id: "t5", label: "C++" },
];

export default function ProjectsPage() {
  return (
    <AppLayout title="Projects & Tags">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in duration-500 ease-in-out items-start">
        
        {/* Left Column: Projects (Work) */}
        <ListManager
          title="Projects"
          description="Manage your active work repositories"
          icon={FolderGit2}
          placeholder="Ex: API Backend, Web Frontend"
          themeClass="theme-work"
          initialItems={MOCK_PROJECTS}
        />

        {/* Right Column: Tags (Study) */}
        <ListManager
          title="Tags"
          description="Manage topics and technologies you study"
          icon={TagIcon}
          placeholder="Ex: Rust, Next.js, Algorithms"
          themeClass="theme-study"
          initialItems={MOCK_TAGS}
        />
        
      </div>
    </AppLayout>
  );
}
