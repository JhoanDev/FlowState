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
        "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out group",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
        !isActive && "group-hover:scale-110"
      )} />
      {label}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-border bg-card/50",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-bold tracking-tight">FlowState</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
      <div className="p-3 border-t border-border">
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
