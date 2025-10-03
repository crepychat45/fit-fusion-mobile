import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Mobile compatibility utilities
export function useMobileCompatibility() {
  const isMobile = useIsMobile();
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    const handleResize = () => {
      updateViewport();
      // Handle mobile viewport changes
      if (isMobile) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    };

    const handleOrientationChange = () => {
      setTimeout(updateViewport, 100); // Delay to account for browser UI changes
    };

    updateViewport();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isMobile]);

  return {
    isMobile,
    orientation,
    viewport,
    isSmallScreen: viewport.width < 768,
    isTouchDevice: "ontouchstart" in window,
  };
}

// Safe area utilities for mobile devices
export function applySafeAreaStyles() {
  useEffect(() => {
    // Apply safe area CSS variables for mobile devices
    const root = document.documentElement;
    
    // Check if safe area is supported
    if (CSS.supports("padding: env(safe-area-inset-top)")) {
      root.style.setProperty("--safe-area-top", "env(safe-area-inset-top)");
      root.style.setProperty("--safe-area-bottom", "env(safe-area-inset-bottom)");
      root.style.setProperty("--safe-area-left", "env(safe-area-inset-left)");
      root.style.setProperty("--safe-area-right", "env(safe-area-inset-right)");
    } else {
      // Fallback for devices without safe area support
      root.style.setProperty("--safe-area-top", "0px");
      root.style.setProperty("--safe-area-bottom", "0px");
      root.style.setProperty("--safe-area-left", "0px");
      root.style.setProperty("--safe-area-right", "0px");
    }
  }, []);
}

// Prevent iOS zoom on input focus
export function preventMobileZoom() {
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const handleTouchEnd = (event: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
}