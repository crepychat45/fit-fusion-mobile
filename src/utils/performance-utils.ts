// Performance optimization utilities

export class PerformanceUtils {
  // Debounce function to limit API calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }

  // Throttle function for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Lazy load images
  static lazyLoadImages() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    
    try {
      const images = document.querySelectorAll("img[data-src]");
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove("lazy");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    } catch (error) {
      console.warn("Failed to set up lazy loading:", error);
    }
  }

  // Preload critical resources
  static preloadResource(href: string, as: string) {
    if (typeof window === "undefined") return;
    
    try {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    } catch (error) {
      console.warn("Failed to preload resource:", error);
    }
  }

  // Monitor Core Web Vitals
  static measurePerformance() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;
    
    try {
      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === "paint" &&
            entry.name === "first-contentful-paint"
          ) {
            console.log("FCP:", entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ["paint"] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log("LCP:", lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log("FID:", (entry as any).processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("Failed to set up performance monitoring:", error);
    }
  }

  // Cache API responses
  static cacheResponse(key: string, data: any, ttl: number = 300000) {
    if (typeof window === "undefined") return;
    
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to cache response:", error);
    }
  }

  static getCachedResponse(key: string) {
    if (typeof window === "undefined") return null;
    
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const item = JSON.parse(cached);
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn("Failed to get cached response:", error);
      return null;
    }
  }

  // Bundle size analyzer (development only)
  static analyzeBundleSize() {
    if (process.env.NODE_ENV === "development") {
      const scripts = document.querySelectorAll("script[src]");
      let totalSize = 0;

      scripts.forEach(async (script) => {
        const src = (script as HTMLScriptElement).src;
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          totalSize += blob.size;
          console.log(
            `Script: ${src.split("/").pop()}, Size: ${(blob.size / 1024).toFixed(2)}KB`,
          );
        } catch (error) {
          console.warn("Could not fetch script size:", src);
        }
      });

      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    }
  }
}

// Service Worker registration for PWA
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  
  try {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  } catch (error) {
    console.warn("Failed to register service worker:", error);
  }
}
