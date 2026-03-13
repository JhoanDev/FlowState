"use client";

import { cn } from "@/lib/utils";
import { BarChart2, BookOpen, Clock, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Logbook", href: "/logbook" },
  { icon: BarChart2, label: "Reports", href: "/reports" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-[var(--border)] bg-[var(--background)]",
        className
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-[var(--primary)]" />
          <span className="font-bold text-lg tracking-tight">FlowState</span>
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
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--foreground)]/70 hover:bg-[var(--border)]/50 hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className="h-4 w-4" />
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
            "flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--foreground)]/70 hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors",
            pathname === "/settings" && "bg-[var(--primary)]/10 text-[var(--primary)]"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
