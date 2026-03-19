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
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-out group",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0 transition-all duration-200",
        isActive ? "text-primary" : "group-hover:text-foreground group-hover:scale-110"
      )} />
      {label}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}

export function Sidebar({ className, onNavClick }: { className?: string; onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-[280px] flex-col bg-card border-r border-border shrink-0",
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
          onClick={onNavClick}
        />
      </div>
    </aside>
  );
}
