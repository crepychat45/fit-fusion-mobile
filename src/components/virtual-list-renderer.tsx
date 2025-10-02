import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight?: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtual List Renderer - Only renders visible items to reduce DOM size
 * Much more efficient than rendering all items at once
 */
export function VirtualListRenderer<T>({
  items,
  itemHeight,
  containerHeight = 600,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  
  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  // Optimized scroll handler using RAF
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Simpler windowed list for smaller datasets
 */
export function WindowedList<T>({
  items,
  renderItem,
  windowSize = 20,
  className = '',
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  windowSize?: number;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(windowSize);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + windowSize, items.length));
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
      
      {hasMore && (
        <button
          onClick={handleShowMore}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show more ({items.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
