/**
 * Motion Configuration
 * Global settings to prevent forced reflows from animations
 */

import { MotionConfig } from 'framer-motion';

/**
 * Global motion config that prevents layout animations
 * and forced reflows throughout the app
 */
export const globalMotionConfig = {
  // Disable layout animations globally to prevent forced reflows
  layout: false,
  
  // Reduced motion override
  reducedMotion: 'user',
  
  // Default transition config - GPU accelerated
  transition: {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.3,
  },
} as const;

/**
 * Optimized animation variants that don't cause reflows
 * Uses only transform and opacity (GPU accelerated)
 */
export const safeAnimationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20, transform: 'translateZ(0)' },
    animate: { opacity: 1, y: 0, transform: 'translateZ(0)' },
    exit: { opacity: 0, y: -20, transform: 'translateZ(0)' },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95, transform: 'translateZ(0)' },
    animate: { opacity: 1, scale: 1, transform: 'translateZ(0)' },
    exit: { opacity: 0, scale: 0.95, transform: 'translateZ(0)' },
  },
  
  slideFromRight: {
    initial: { opacity: 0, x: 50, transform: 'translateZ(0)' },
    animate: { opacity: 1, x: 0, transform: 'translateZ(0)' },
    exit: { opacity: 0, x: 50, transform: 'translateZ(0)' },
  },
} as const;

/**
 * Optimized hover animation config
 * Minimal scale change to prevent layout shifts
 */
export const safeHoverConfig = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeOut',
  },
} as const;

/**
 * Optimized tap animation config
 */
export const safeTapConfig = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: 'easeOut',
  },
} as const;

/**
 * CSS that should be applied to all motion elements
 * to prevent forced reflows
 */
export const motionCSS = {
  willChange: 'transform, opacity' as const,
  transform: 'translateZ(0)' as const,
  backfaceVisibility: 'hidden' as const,
} as const;
