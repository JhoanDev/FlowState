"use client";

import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav({
  className,
  title = "Overview",
  subtitle,
  onMenuClick,
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}) {
  return (
    <header
      className={cn(
        "flex h-[72px] items-center px-4 lg:px-10 bg-background shrink-0 gap-3 lg:gap-0 border-b lg:border-none border-border",
        className
      )}
    >
      <Button variant="ghost" size="sm" className="lg:hidden shrink-0 px-2" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
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
