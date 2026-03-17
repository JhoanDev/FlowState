import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium rounded-md transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md":
              variant === "default",
            "border border-border bg-transparent hover:bg-accent hover:border-muted-foreground/30 text-foreground":
              variant === "outline",
            "bg-foreground text-background hover:bg-foreground/90 shadow-sm":
              variant === "secondary",
            "hover:bg-accent text-muted-foreground hover:text-foreground":
              variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm":
              variant === "destructive",
            "h-11 px-5 py-2.5 text-sm": size === "default",
            "h-9 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
