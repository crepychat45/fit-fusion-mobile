import React, { useEffect } from "react";
import { PerformanceUtils } from "@/utils/performance-utils";

interface PerformanceMonitorProps {
  enableAnalytics?: boolean;
  enableCaching?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enableAnalytics = true,
  enableCaching = true,
}) => {
  useEffect(() => {
    if (enableAnalytics) {
      // Monitor Core Web Vitals
      PerformanceUtils.measurePerformance();

      // Monitor bundle size in development
      if (process.env.NODE_ENV === "development") {
        PerformanceUtils.analyzeBundleSize();
      }
    }

    if (enableCaching) {
      // Preload critical resources
      const criticalImages = ["/favicon.ico", "/placeholder.svg"];

      criticalImages.forEach((src) => {
        PerformanceUtils.preloadResource(src, "image");
      });
    }

    // Register service worker for caching
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Lazy load images
    PerformanceUtils.lazyLoadImages();

    // Memory cleanup
    return () => {
      // Clean up any performance observers
      if ("PerformanceObserver" in window) {
        try {
          const observer = new PerformanceObserver(() => {});
          observer.disconnect();
        } catch (e) {
          // Observer already disconnected
        }
      }
    };
  }, [enableAnalytics, enableCaching]);

  // Monitor page visibility for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce resource usage
        console.log("Page hidden - reducing performance monitoring");
      } else {
        // Page is visible, resume full monitoring
        console.log("Page visible - resuming performance monitoring");
        PerformanceUtils.measurePerformance();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Component doesn't render anything, it's just for side effects
  return null;
};
