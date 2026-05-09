"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  BookOpen,
  Clock,
  Settings,
  LayoutDashboard,
  Target,
  Folder,
  Flame,
  Command,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCommandPalette } from "@/hooks/use-command-palette";

// silence unused imports
void BarChart2;
void Clock;

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  layoutIdPrefix,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  layoutIdPrefix?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-out group",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "relative z-10 h-5 w-5 shrink-0 transition-all duration-200",
        isActive ? "text-primary" : "group-hover:text-foreground group-hover:scale-110"
      )} />
      <span className={cn("relative z-10 truncate", isActive && "font-bold")}>{label}</span>
      {isActive && (
        <motion.span 
          layoutId={`sidebar-active-${layoutIdPrefix}`}
          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      {!isActive && (
        <span className="absolute inset-0 bg-transparent group-hover:bg-accent rounded-lg -z-10 transition-colors duration-200" />
      )}
    </Link>
  );
}

export function Sidebar({ className, onNavClick, layoutIdPrefix = "desktop" }: { className?: string; onNavClick?: () => void; layoutIdPrefix?: string }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { open: openPalette } = useCommandPalette();

  const navItems = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), href: "/" },
    { icon: Target, label: t("nav.session"), href: "/session" },
    { icon: Folder, label: t("nav.projects"), href: "/projects" },
    { icon: Flame, label: t("nav.goals"), href: "/goals" },
    { icon: BookOpen, label: t("nav.logbook"), href: "/logbook" },
  ];

  return (
    <aside
      className={cn(
        "flex w-[240px] flex-col bg-card border-r border-border shrink-0",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3.5 px-7">
        <img
          src="/flowstate-mark-light.svg"
          alt="FlowState Logo"
          width={36}
          height={36}
          className="shrink-0 block dark:hidden"
        />
        <img
          src="/flowstate-mark-dark.svg"
          alt="FlowState Logo"
          width={36}
          height={36}
          className="shrink-0 hidden dark:block"
        />
        <span className="text-base font-bold tracking-tight truncate">FlowState</span>
      </div>

      {/* Command Palette trigger */}
      <div className="px-4 pb-3">
        <button
          onClick={() => { onNavClick?.(); openPalette(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-accent border border-border text-muted-foreground hover:text-foreground text-xs font-medium transition-colors duration-200 cursor-pointer group"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 min-w-0 truncate text-left">{t("commandPalette.hint")}...</span>
          <kbd className="hidden xl:flex items-center gap-0.5 shrink-0 text-[10px] font-mono border border-border/50 rounded px-1 py-0.5 group-hover:border-border transition-colors">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            layoutIdPrefix={layoutIdPrefix}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <NavLink
          href="/settings"
          icon={Settings}
          label={t("nav.settings")}
          isActive={pathname === "/settings"}
          layoutIdPrefix={layoutIdPrefix}
          onClick={onNavClick}
        />
      </div>
    </aside>
  );
}
