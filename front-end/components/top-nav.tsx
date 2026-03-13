"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function TopNav({ className, title = "Dashboard" }: { className?: string; title?: string }) {
  return (
    <header
      className={cn(
        "flex h-20 items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--background)] z-50",
        className
      )}
    >
      <div className="flex-1">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      </div>

      <div className="relative flex items-center gap-4 shrink-0">
        {title !== "Session" && (
          <Link
            href="/session"
            className="flex items-center gap-3 px-6 py-3 border-2 border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] text-base font-semibold transition-all duration-200 ease-in-out hover:bg-transparent hover:text-[var(--primary)] hover:border-[var(--primary)] outline-none"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Session
          </Link>
        )}
      </div>
    </header>
  );
}
