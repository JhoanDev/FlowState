import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-base font-semibold transition-all duration-200 ease-in-out rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants (Strictly Flat)
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90":
              variant === "default",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--border)]/50 text-[var(--foreground)]":
              variant === "outline",
            "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90":
              variant === "secondary",
            "hover:bg-[var(--border)]/50 text-[var(--foreground)]": variant === "ghost",
            // Sizes
            "h-11 px-6 py-3": size === "default",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-10": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
