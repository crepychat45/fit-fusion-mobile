/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Monitor First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Monitor Cumulative Layout Shift (CLS)
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              this.recordMetric('CLS', clsScore);
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value);
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.recordMetric(`Function: ${name}`, duration);
    
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.recordMetric(`Async Function: ${name}`, duration);
    
    return result;
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    return {
      LCP: this.metrics.find(m => m.name === 'LCP')?.value,
      FID: this.metrics.find(m => m.name === 'FID')?.value,
      CLS: this.metrics.find(m => m.name === 'CLS')?.value,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return [...this.metrics];
  }

  /**
   * Get navigation timing
   */
  getNavigationTiming() {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!timing) return null;

    return {
      DNS: timing.domainLookupEnd - timing.domainLookupStart,
      TCP: timing.connectEnd - timing.connectStart,
      Request: timing.responseStart - timing.requestStart,
      Response: timing.responseEnd - timing.responseStart,
      DOMParsing: timing.domInteractive - timing.responseEnd,
      DOMContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      Load: timing.loadEventEnd - timing.loadEventStart,
      Total: timing.loadEventEnd - timing.fetchStart,
    };
  }

  /**
   * Get resource timing
   */
  getResourceTiming() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: (resource as any).transferSize || 0,
    }));
  }

  /**
   * Check memory usage (if available)
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1048576, // Convert to MB
        totalJSHeapSize: memory.totalJSHeapSize / 1048576,
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576,
      };
    }
    return null;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    return {
      coreWebVitals: this.getCoreWebVitals(),
      navigationTiming: this.getNavigationTiming(),
      memoryUsage: this.getMemoryUsage(),
      customMetrics: this.getAllMetrics(),
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return performanceMonitor;
}
