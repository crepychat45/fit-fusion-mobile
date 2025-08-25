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
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  // Preload critical resources
  static preloadResource(href: string, as: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // Monitor Core Web Vitals
  static measurePerformance() {
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
  }

  // Cache API responses
  static cacheResponse(key: string, data: any, ttl: number = 300000) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  }

  static getCachedResponse(key: string) {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const item = JSON.parse(cached);
    if (Date.now() - item.timestamp > item.ttl) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return item.data;
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
  if ("serviceWorker" in navigator) {
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
  }
}
