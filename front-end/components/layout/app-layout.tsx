"use client";

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import * as React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden animate-in fade-in duration-500 ease-in-out">
      {/* Shared Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNav title={title} />
        
        {/* Scrollable Content inside Main Area */}
        <main className="flex-1 overflow-y-auto min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
