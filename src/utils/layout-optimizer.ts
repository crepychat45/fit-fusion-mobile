// Layout optimization utilities to prevent forced reflows

/**
 * Batch layout reads to prevent forced reflows
 * Use this to schedule DOM measurements in the next frame
 */
export class LayoutBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  /**
   * Schedule a DOM read operation
   */
  read(callback: () => void): void {
    this.readQueue.push(callback);
    this.scheduleFlush();
  }

  /**
   * Schedule a DOM write operation
   */
  write(callback: () => void): void {
    this.writeQueue.push(callback);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    // Execute all reads first
    const reads = this.readQueue.slice();
    this.readQueue.length = 0;
    reads.forEach((read) => read());

    // Then execute all writes
    const writes = this.writeQueue.slice();
    this.writeQueue.length = 0;
    writes.forEach((write) => write());

    this.scheduled = false;

    // If new tasks were queued during execution, schedule another flush
    if (this.readQueue.length > 0 || this.writeQueue.length > 0) {
      this.scheduleFlush();
    }
  }
}

// Global layout batcher instance
export const layoutBatcher = new LayoutBatcher();

/**
 * Optimized scroll into view that prevents forced reflows
 */
export function scrollIntoViewOptimized(
  element: HTMLElement | null,
  options?: ScrollIntoViewOptions
): void {
  if (!element) return;

  layoutBatcher.write(() => {
    element.scrollIntoView(options);
  });
}

/**
 * Debounced layout measurement to prevent excessive reflows
 */
export function measureLayout<T>(
  callback: () => T,
  immediate = false
): Promise<T> {
  return new Promise((resolve) => {
    if (immediate) {
      layoutBatcher.read(() => {
        resolve(callback());
      });
    } else {
      requestAnimationFrame(() => {
        layoutBatcher.read(() => {
          resolve(callback());
        });
      });
    }
  });
}

/**
 * Throttle function for scroll/resize handlers
 */
export function createThrottledHandler<T extends (...args: any[]) => void>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRun >= limit) {
      lastRun = now;
      callback.apply(null, args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastRun = Date.now();
        callback.apply(null, args);
      }, limit - (now - lastRun));
    }
  };
}

/**
 * Optimized scroll handler that batches reads
 */
export function createOptimizedScrollHandler(
  callback: (scrollTop: number) => void
): (e: React.UIEvent<HTMLElement>) => void {
  return (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    
    // Read scroll position in next frame to avoid forced reflow
    requestAnimationFrame(() => {
      const scrollTop = target.scrollTop;
      callback(scrollTop);
    });
  };
}
