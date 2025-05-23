import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        connected:
          "border-primary bg-primary/20 text-primary-700 dark:text-primary-300 shadow hover:bg-primary/20",
        disconnected:
          "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow hover:bg-amber-500/20",
        loading:
          "relative border-transparent bg-gray-400/10 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-400/20 before:absolute before:inset-0 before:rounded-md before:p-[2px] before:bg-[conic-gradient(from_var(--border-angle),transparent,white,transparent)] before:animate-border before:content-[''] after:absolute after:inset-[2px] after:rounded-[calc(0.375rem-2px)] after:bg-background after:content-['']",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "loading" || variant === "disconnected" ? (
        <span className="relative z-10">{props.children}</span>
      ) : (
        props.children
      )}
    </div>
  );
}

export { Badge, badgeVariants };
