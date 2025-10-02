import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

/**
 * Optimized motion wrapper that reduces DOM nesting
 * Only adds animation wrapper when animations are actually needed
 */

interface OptimizedMotionProps extends MotionProps {
  children: ReactNode;
  animate?: boolean;
  className?: string;
}

/**
 * SimpleFade - Minimal fade animation without extra wrappers
 */
export function SimpleFade({
  children,
  className = '',
  animate = true,
  ...props
}: OptimizedMotionProps) {
  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * SimpleSlide - Minimal slide animation
 */
export function SimpleSlide({
  children,
  className = '',
  direction = 'up',
  animate = true,
  ...props
}: OptimizedMotionProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return { y: 20 };
      case 'down':
        return { y: -20 };
      case 'left':
        return { x: 20 };
      case 'right':
        return { x: -20 };
      default:
        return { y: 20 };
    }
  };

  return (
    <motion.div
      initial={{ ...getInitialTransform(), opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * ConditionalMotion - Only applies motion when needed
 */
export function ConditionalMotion({
  children,
  condition,
  variants,
  className = '',
}: {
  children: ReactNode;
  condition: boolean;
  variants?: any;
  className?: string;
}) {
  if (!condition) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}
