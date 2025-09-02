import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: "subtle" | "normal" | "strong";
  animated?: boolean;
  ripple?: boolean;
  float?: boolean;
  bubble?: boolean;
  onClick?: () => void;
}

export function LiquidGlass({ 
  children, 
  className,
  variant = "normal",
  animated = true,
  ripple = false,
  float = false,
  bubble = false,
  onClick
}: LiquidGlassProps) {
  const baseClasses = "relative overflow-hidden";
  
  const variantClasses = {
    subtle: "liquid-glass-subtle",
    normal: "liquid-glass",
    strong: "liquid-glass-strong"
  };

  const effectClasses = cn(
    baseClasses,
    variantClasses[variant],
    ripple && "liquid-ripple",
    float && "liquid-float",
    bubble && "liquid-bubble",
    "liquid-morph",
    className
  );

  if (animated) {
    return (
      <motion.div
        className={effectClasses}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.46, 0.45, 0.94] 
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={effectClasses} onClick={onClick}>
      {children}
    </div>
  );
}

export function LiquidGlassCard({ children, className, ...props }: LiquidGlassProps) {
  return (
    <LiquidGlass 
      className={cn("p-6 rounded-xl", className)} 
      bubble
      ripple
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

export function LiquidGlassButton({ children, className, ...props }: LiquidGlassProps) {
  return (
    <LiquidGlass 
      className={cn("px-4 py-2 rounded-lg text-center cursor-pointer", className)}
      variant="strong"
      ripple
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}