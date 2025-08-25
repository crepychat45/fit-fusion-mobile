// Image optimization utilities
export class ImageOptimizer {
  private static cache = new Map<string, string>();
  private static observer: IntersectionObserver | null = null;

  // Lazy loading for images
  static setupLazyLoading() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.removeAttribute("data-src");
              this.observer?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      },
    );

    // Observe all images with data-src
    document.querySelectorAll("img[data-src]").forEach((img) => {
      this.observer?.observe(img);
    });
  }

  // WebP format detection and fallback
  static async supportsWebP(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }

  // Generate optimized image URL
  static getOptimizedImageUrl(
    originalUrl: string,
    width?: number,
    height?: number,
  ): string {
    if (!originalUrl || originalUrl.startsWith("/placeholder.svg")) {
      return originalUrl;
    }

    // Check cache first
    const cacheKey = `${originalUrl}-${width}-${height}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let optimizedUrl = originalUrl;

    // For external URLs (like Unsplash), add optimization parameters
    if (
      originalUrl.includes("unsplash.com") ||
      originalUrl.includes("randomuser.me")
    ) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set("w", width.toString());
      if (height) url.searchParams.set("h", height.toString());
      url.searchParams.set("fit", "crop");
      url.searchParams.set("auto", "format,compress");
      optimizedUrl = url.toString();
    }

    // Cache the result
    this.cache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  // Preload critical images
  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  // Create a loading placeholder
  static createPlaceholder(width: number, height: number): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#f3f4f6");
      gradient.addColorStop(1, "#e5e7eb");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add loading icon
      ctx.fillStyle = "#9ca3af";
      ctx.font = `${Math.min(width, height) * 0.1}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading...", width / 2, height / 2);
    }

    return canvas.toDataURL();
  }

  // Check if image exists and is loadable
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      await this.preloadImage(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Initialize lazy loading when DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      ImageOptimizer.setupLazyLoading();
    });
  } else {
    ImageOptimizer.setupLazyLoading();
  }
}
