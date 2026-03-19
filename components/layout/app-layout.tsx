"use client";

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import * as React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav title={title} subtitle={subtitle} />

        <main className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
