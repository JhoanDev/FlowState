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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Target, label: "Session", href: "/session" },
  { icon: Folder, label: "Projects & Tags", href: "/projects" },
  { icon: BookOpen, label: "Logbook", href: "/logbook" },
  { icon: BarChart2, label: "Reports", href: "/reports" },
];

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
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

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-[280px] flex-col bg-card",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3.5 px-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-[18px] w-[18px] text-primary" />
        </div>
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
        />
      </div>
    </aside>
  );
}
