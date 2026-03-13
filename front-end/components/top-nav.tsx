import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function TopNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--background)]",
        className
      )}
    >
      <div>
        {/* Placeholder for page title or breadcrumbs if needed in the future */}
        <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Placeholder for generic action or global timer toggle */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold transition-colors hover:bg-[var(--primary)]/90"
        >
          <Play className="h-4 w-4" />
          Start Session
        </button>
      </div>
    </header>
  );
}
