import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Lazy loading wrapper component
export function LazyLoader<T extends Record<string, any>>({
  loader,
  fallback,
  error: ErrorComponent,
  ...props
}: {
  loader: () => Promise<{ default: React.ComponentType<T> }>;
  fallback?: React.ReactNode;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
} & T) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const module = await loader();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (error) {
    return ErrorComponent ? (
      <ErrorComponent error={error} retry={loadComponent} />
    ) : (
      <ErrorFallback error={error} retry={loadComponent} />
    );
  }

  if (!Component) {
    return null;
  }

  return <Component {...(props as unknown as T)} />;
}

// Optimized image component with lazy loading
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  onLoad,
  onError,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {!imageLoaded && !imageError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      {!imageError ? (
        <motion.img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
        />
      ) : fallback ? (
        <img
          src={fallback}
          alt={alt}
          className="w-full h-full object-cover opacity-50"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">
            Image failed to load
          </span>
        </div>
      )}
    </div>
  );
});

// Performance monitor component
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
  });

  useEffect(() => {
    // Monitor page load performance
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics((prev) => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
      }));
    }

    // Monitor memory usage (if available)
    if ("memory" in performance) {
      const memInfo = (performance as any).memory;
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100,
      }));
    }

    // Monitor network requests
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      setMetrics((prev) => ({
        ...prev,
        networkRequests: prev.networkRequests + entries.length,
      }));
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => observer.disconnect();
  }, []);

  const getPerformanceScore = () => {
    const loadScore =
      metrics.loadTime < 3000
        ? 100
        : Math.max(0, 100 - (metrics.loadTime - 3000) / 100);
    const memoryScore =
      metrics.memoryUsage < 50
        ? 100
        : Math.max(0, 100 - (metrics.memoryUsage - 50) * 2);
    return Math.round((loadScore + memoryScore) / 2);
  };

  const score = getPerformanceScore();

  return (
    <Card className="fixed bottom-4 right-4 w-64 bg-white/90 backdrop-blur-sm z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs">Overall Score</span>
          <Badge
            variant={
              score > 80 ? "default" : score > 60 ? "secondary" : "destructive"
            }
          >
            {score}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Load Time</span>
            <span>{(metrics.loadTime / 1000).toFixed(2)}s</span>
          </div>
          <Progress
            value={Math.min(100, (3000 - metrics.loadTime) / 30)}
            className="h-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Memory Usage</span>
            <span>{metrics.memoryUsage.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.min(100, metrics.memoryUsage)}
            className="h-1"
          />
        </div>

        <div className="flex justify-between text-xs">
          <span>Network Requests</span>
          <span>{metrics.networkRequests}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Virtual scrolling for large lists
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  className = "",
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1,
  );

  const visibleItems = useMemo(
    () => items.slice(visibleStartIndex, visibleEndIndex + 1),
    [items, visibleStartIndex, visibleEndIndex],
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStartIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStartIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
export const LoadingSpinner = memo(function LoadingSpinner({
  size = "default",
  className = "",
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
    </div>
  );
});

// Error fallback component
export const ErrorFallback = memo(function ErrorFallback({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </CardContent>
    </Card>
  );
});

// Debounced input hook for performance
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}
