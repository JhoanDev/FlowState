import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-[var(--border)] rounded-[var(--radius)] bg-transparent px-4 py-2 text-base shadow-none transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-[var(--foreground)]/50 hover:border-[var(--primary)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
