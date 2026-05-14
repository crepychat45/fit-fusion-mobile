import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 backdrop-blur-md text-primary-foreground border border-primary/30 hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
        destructive:
          "bg-destructive/90 backdrop-blur-md text-destructive-foreground border border-destructive/30 hover:bg-destructive/80 hover:shadow-lg hover:shadow-destructive/25",
        outline:
          "border border-input/50 bg-background/50 backdrop-blur-md hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/50 hover:shadow-md",
        secondary:
          "bg-secondary/80 backdrop-blur-md text-secondary-foreground border border-secondary/30 hover:bg-secondary/70 hover:shadow-md",
        ghost: "hover:bg-accent/50 backdrop-blur-sm hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline backdrop-blur-none",
        premium:
          "bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-md text-primary-foreground border border-white/20 hover:from-primary-dark hover:to-accent hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1",
        ai: "bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-md text-white border border-white/20 hover:from-blue-600/90 hover:to-purple-700/90 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1",
        security:
          "bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-md text-white border border-white/20 hover:from-green-600/90 hover:to-emerald-700/90 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1",
        glass:
          "bg-white/10 backdrop-blur-xl border border-white/20 text-foreground hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
