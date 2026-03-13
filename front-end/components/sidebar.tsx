"use client";

import { cn } from "@/lib/utils";
import { BarChart2, BookOpen, Clock, Settings, LayoutDashboard, Target, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Target, label: "Session", href: "/session" },
  { icon: Folder, label: "Projects & Tags", href: "/projects" },
  { icon: BookOpen, label: "Logbook", href: "/logbook" },
  { icon: BarChart2, label: "Reports", href: "/reports" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-80 border-r border-[var(--border)] bg-[var(--background)]",
        className
      )}
    >
      <div className="flex h-20 items-center px-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Clock className="h-7 w-7 text-[var(--primary)]" />
          <span className="font-bold text-xl tracking-tight">FlowState</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 px-4 py-3 text-base font-medium transition-all duration-200 ease-in-out hover:bg-[var(--primary)]/5",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-3/4 after:w-1 after:bg-[var(--primary)] after:rounded-r-full"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <Link
          href="/settings"
          className={cn(
            "relative flex items-center gap-4 px-4 py-3 text-base font-medium transition-all duration-200 ease-in-out hover:bg-[var(--primary)]/5",
            pathname === "/settings"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-3/4 after:w-1 after:bg-[var(--primary)] after:rounded-r-full"
              : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
