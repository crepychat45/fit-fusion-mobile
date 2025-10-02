import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();
  
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

  // If reduced motion or not animated, render static div
  if (!animated || shouldReduceMotion) {
    return (
      <div className={effectClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={effectClasses}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      layout={false}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
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