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
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Target, label: "Session", href: "/session" },
  { icon: Folder, label: "Projects & Tags", href: "/projects" },
  { icon: Flame, label: "Goals & Streaks", href: "/goals" },
  { icon: BookOpen, label: "Logbook", href: "/logbook" },
];

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
      <span className={cn("relative z-10", isActive && "font-bold")}>{label}</span>
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

  return (
    <aside
      className={cn(
        "flex w-[240px] flex-col bg-card border-r border-border shrink-0",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3.5 px-7">
        <Image
          src="/logo.png"
          alt="FlowState Logo"
          width={36}
          height={36}
          className="shrink-0"
        />
        <span className="text-base font-bold tracking-tight">FlowState</span>
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
          label="Settings"
          isActive={pathname === "/settings"}
          layoutIdPrefix={layoutIdPrefix}
          onClick={onNavClick}
        />
      </div>
    </aside>
  );
}
