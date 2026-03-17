"use client";

import { cn } from "@/lib/utils";

export function TopNav({
  className,
  title = "Dashboard",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-16 items-center px-8 border-b border-border bg-background shrink-0",
        className
      )}
    >
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </header>
  );
}
