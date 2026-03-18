"use client";

import { cn } from "@/lib/utils";

export function TopNav({
  className,
  title = "Overview",
  subtitle,
}: {
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-[72px] items-center px-10 bg-background shrink-0",
        className
      )}
    >
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
