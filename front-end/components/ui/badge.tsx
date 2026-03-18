import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "work" | "study";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ease-out",
        {
          "border-transparent bg-primary/10 text-primary":
            variant === "default",
          "border-transparent bg-muted text-foreground":
            variant === "secondary",
          "border-border text-foreground": variant === "outline",
          "border-transparent bg-work/10 text-work": variant === "work",
          "border-transparent bg-study/10 text-study": variant === "study",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
