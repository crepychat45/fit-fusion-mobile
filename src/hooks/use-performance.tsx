import { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    // Mark component mount
    performance.mark(`${componentName}-start`);

    return () => {
      // Mark component unmount and measure
      performance.mark(`${componentName}-end`);
      performance.measure(
        `${componentName}-duration`,
        `${componentName}-start`,
        `${componentName}-end`,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;

      setMetrics({
        loadTime: endTime,
        renderTime,
        memoryUsage,
      });

      // Log performance metrics in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Performance metrics for ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: memoryUsage
            ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`
            : "N/A",
        });
      }
    };
  }, [componentName]);

  return metrics;
}
