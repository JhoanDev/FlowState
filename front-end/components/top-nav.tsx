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
    </header>
  );
}
