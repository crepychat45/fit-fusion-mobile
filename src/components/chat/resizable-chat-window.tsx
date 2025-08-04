import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableChatWindowProps {
  children: React.ReactNode;
  onClose?: () => void;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function ResizableChatWindow({
  children,
  onClose,
  defaultWidth = 400,
  defaultHeight = 600,
  minWidth = 300,
  minHeight = 400,
  maxWidth = 800,
  maxHeight = 800
}: ResizableChatWindowProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, action: 'resize' | 'drag') => {
    e.preventDefault();
    
    if (action === 'resize') {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (action === 'drag') {
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setSize(prev => ({
        width: Math.max(minWidth, Math.min(maxWidth, prev.width + deltaX)),
        height: Math.max(minHeight, Math.min(maxHeight, prev.height + deltaY))
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && !isMaximized) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, isDragging, dragStart, position, size]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      setSize({ width: window.innerWidth * 0.9, height: window.innerHeight * 0.9 });
      setPosition({ x: window.innerWidth * 0.05, y: window.innerHeight * 0.05 });
    } else {
      setSize({ width: defaultWidth, height: defaultHeight });
      setPosition({ x: 50, y: 50 });
    }
  };

  return (
    <div
      ref={chatWindowRef}
      className={cn(
        "fixed z-50 bg-background border border-border rounded-lg shadow-2xl",
        "transition-all duration-200 ease-in-out",
        isMaximized && "!w-[90vw] !h-[90vh] !left-[5vw] !top-[5vh]"
      )}
      style={{
        width: isMaximized ? undefined : size.width,
        height: isMaximized ? undefined : size.height,
        left: isMaximized ? undefined : position.x,
        top: isMaximized ? undefined : position.y,
      }}
    >
      {/* Header with drag area */}
      <div
        className="flex items-center justify-between p-3 border-b border-border cursor-move bg-muted/50 rounded-t-lg"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">FitFusion Chat</div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-muted"
            onClick={toggleMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-full overflow-hidden">
        {children}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-muted/50 hover:bg-muted"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
          style={{
            background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, currentColor 40%, currentColor 60%, transparent 60%)'
          }}
        />
      )}
    </div>
  );
}