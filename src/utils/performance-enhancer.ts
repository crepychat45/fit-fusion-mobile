/**
 * Performance Enhancer v6.2.5
 * Comprehensive performance optimization utilities
 * Handles caching, lazy loading, and resource optimization
 */

interface CacheConfig {
  maxAge?: number;
  maxSize?: number;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  networkDelay: number;
  memoryUsage: number;
  timestamp: Date;
}

class PerformanceEnhancer {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private metrics: PerformanceMetrics[] = [];
  private maxCacheSize = 50;
  private cacheMaxAge = 3600000; // 1 hour

  /**
   * Optimize images for web delivery
   */
  optimizeImage(imageUrl: string, maxWidth: number = 800): string {
    // Add cache-busting and optimization parameters
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}w=${maxWidth}&q=80&f=auto&fmt=webp`;
  }

  /**
   * Lazy load components with intersection observer
   */
  setupLazyLoading(element: Element, callback: () => void): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return observer;
  }

  /**
   * Cache data with automatic expiration
   */
  setCache(key: string, data: any, maxAge: number = this.cacheMaxAge): void {
    // Clean expired cache
    this.cleanExpiredCache();

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries()).reduce((oldest, current) =>
        current[1].timestamp < oldest[1].timestamp ? current : oldest
      )[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now() + maxAge,
    });
  }

  /**
   * Get cached data if available and not expired
   */
  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.timestamp) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Record performance metrics
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: new Date(),
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  /**
   * Get average performance metrics
   */
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        networkDelay: acc.networkDelay + metric.networkDelay,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
      }),
      { loadTime: 0, renderTime: 0, networkDelay: 0, memoryUsage: 0 }
    );

    return {
      loadTime: sum.loadTime / this.metrics.length,
      renderTime: sum.renderTime / this.metrics.length,
      networkDelay: sum.networkDelay / this.metrics.length,
      memoryUsage: sum.memoryUsage / this.metrics.length,
    };
  }

  /**
   * Prefetch resources
   */
  prefetchResource(url: string, type: 'script' | 'style' | 'fetch' = 'fetch'): void {
    if (type === 'fetch') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Optimize network requests with request coalescing
   */
  coalescedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
    const cached = this.getCache(key);
    if (cached) return Promise.resolve(cached);

    const result = fetcher();
    result.then((data) => this.setCache(key, data));
    return result;
  }

  /**
   * Enable service worker for offline support
   */
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.log('⚠️ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Cleanup cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; items: number } {
    let size = 0;
    for (const [, value] of this.cache.entries()) {
      size += JSON.stringify(value.data).length;
    }
    return { size, items: this.cache.size };
  }
}

export const performanceEnhancer = new PerformanceEnhancer();
export type { PerformanceMetrics, CacheConfig };
