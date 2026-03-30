"use client";

import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useTranslation } from "react-i18next";

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
  const { open: openPalette } = useCommandPalette();
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        "flex h-14 items-center px-4 bg-background shrink-0 gap-3 border-b border-border lg:hidden",
        className
      )}
    >
      <Button variant="ghost" size="sm" className="shrink-0 mr-1 -ml-2" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-base font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {/* Search/Command Palette trigger for mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 -mr-2"
        onClick={openPalette}
        aria-label={t("commandPalette.hint")}
      >
        <Search className="h-5 w-5" />
      </Button>
    </header>
  );
}
