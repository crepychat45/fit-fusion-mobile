import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

/**
 * LazySection - Only renders children when they enter the viewport
 * Reduces initial DOM size and improves performance
 */
export function LazySection({
  children,
  fallback = null,
  rootMargin = '200px',
  threshold = 0.01,
  className = '',
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Once rendered, keep it rendered (don't unmount)
    if (hasRendered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasRendered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasRendered]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}

/**
 * PlaceholderSection - Minimal placeholder that maintains layout
 */
export function PlaceholderSection({ height = '200px' }: { height?: string }) {
  return (
    <div 
      style={{ minHeight: height }} 
      className="animate-pulse bg-muted/20 rounded-lg"
      aria-hidden="true"
    />
  );
}
