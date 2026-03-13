import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border rounded-[var(--radius)] px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
        {
          "border-transparent bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20":
            variant === "default",
          "border-transparent bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/80":
            variant === "secondary",
          "border-[var(--border)] text-[var(--foreground)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
