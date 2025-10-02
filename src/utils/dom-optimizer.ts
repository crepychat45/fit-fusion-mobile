/**
 * DOM Optimization Utilities
 * Helps reduce DOM size and improve rendering performance
 */

/**
 * Debounce DOM updates to prevent excessive reflows
 */
export function debouncedRender<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Batch DOM reads to prevent forced reflows
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(callback: () => void): void {
    this.readQueue.push(callback);
    this.schedule();
  }

  write(callback: () => void): void {
    this.writeQueue.push(callback);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Process all reads first
      while (this.readQueue.length) {
        const read = this.readQueue.shift();
        read?.();
      }

      // Then process all writes
      while (this.writeQueue.length) {
        const write = this.writeQueue.shift();
        write?.();
      }

      this.scheduled = false;
    });
  }
}

// Global instance
export const domBatcher = new DOMBatcher();

/**
 * Check if element is in viewport - useful for lazy rendering
 */
export function isInViewport(element: HTMLElement, offset: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

/**
 * Optimize list rendering - only render visible items
 */
export function getVisibleRange(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  buffer: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = start + visibleCount + buffer * 2;
  
  return { start, end };
}

/**
 * Measure DOM size and provide recommendations
 */
export function analyzeDOMSize(): {
  totalElements: number;
  maxDepth: number;
  recommendations: string[];
} {
  const allElements = document.querySelectorAll('*');
  const totalElements = allElements.length;
  
  let maxDepth = 0;
  const getDepth = (element: Element, depth: number = 0): number => {
    if (!element.children.length) return depth;
    
    let childDepth = depth;
    for (let i = 0; i < element.children.length; i++) {
      childDepth = Math.max(childDepth, getDepth(element.children[i], depth + 1));
    }
    return childDepth;
  };
  
  maxDepth = getDepth(document.body);
  
  const recommendations: string[] = [];
  
  if (totalElements > 1500) {
    recommendations.push('Consider implementing virtual scrolling for long lists');
    recommendations.push('Lazy load components that are below the fold');
  }
  
  if (maxDepth > 14) {
    recommendations.push('Reduce component nesting depth');
    recommendations.push('Use React Fragments instead of unnecessary wrapper divs');
  }
  
  return {
    totalElements,
    maxDepth,
    recommendations,
  };
}
