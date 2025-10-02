import React, { ReactNode } from 'react';
import { motion, MotionProps, useReducedMotion } from 'framer-motion';

/**
 * Optimized Motion Wrapper - Prevents forced reflows
 * Uses GPU-accelerated transforms and disables layout animations
 */

interface OptimizedMotionProps extends Omit<MotionProps, 'animate'> {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  enableTap?: boolean;
  animate?: boolean;
}

/**
 * OptimizedMotion - Smart motion component that prevents forced reflows
 * - Uses transform instead of layout properties
 * - Respects reduced motion preference
 * - GPU-accelerated animations
 */
export function OptimizedMotion({
  children,
  className = '',
  enableHover = false,
  enableTap = false,
  animate = true,
  ...props
}: OptimizedMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render static div
  if (shouldReduceMotion || !animate) {
    return <div className={className}>{children}</div>;
  }

  // Optimized hover animation - GPU accelerated, no layout reflow
  const hoverProps = enableHover
    ? {
        whileHover: {
          scale: 1.02,
          transition: {
            duration: 0.2,
            ease: 'easeOut' as const,
          },
        },
        style: {
          willChange: 'transform',
        } as React.CSSProperties,
      }
    : {};

  // Optimized tap animation
  const tapProps = enableTap
    ? {
        whileTap: {
          scale: 0.98,
          transition: { duration: 0.1, ease: 'easeOut' as const },
        },
      }
    : {};

  return (
    <motion.div
      className={className}
      layout={false} // CRITICAL: Disable layout animations to prevent forced reflows
      {...hoverProps}
      {...tapProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaticMotion - For animations that don't need interactivity
 * Best performance for fade-in effects
 */
export function StaticMotion({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut' as const,
      }}
      layout={false}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * GPUAcceleratedMotion - Forces GPU acceleration
 * Use for smooth animations without layout thrashing
 */
export function GPUAcceleratedMotion({
  children,
  className = '',
  ...props
}: OptimizedMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      layout={false}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)', // Force GPU layer
        backfaceVisibility: 'hidden',
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </motion.div>
  );
}
