"use client";

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 ease-in-out lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          className="w-full h-full emissive-border lg:shadow-none" 
          onNavClick={() => setIsMobileMenuOpen(false)} 
          layoutIdPrefix="mobile"
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
