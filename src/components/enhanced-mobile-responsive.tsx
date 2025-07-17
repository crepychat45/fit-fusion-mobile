import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Tablet, Monitor, Palette, Eye } from "lucide-react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ResponsiveContainer({
  children,
  className = "",
  mobileClassName = "",
  tabletClassName = "",
  desktopClassName = ""
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveClassName = () => {
    switch (screenSize) {
      case 'mobile':
        return cn(className, mobileClassName);
      case 'tablet':
        return cn(className, tabletClassName);
      case 'desktop':
        return cn(className, desktopClassName);
      default:
        return className;
    }
  };

  return (
    <div className={getResponsiveClassName()}>
      {children}
    </div>
  );
}

export function TouchFeedback({ 
  children, 
  className = "", 
  disabled = false 
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("cursor-pointer select-none", className)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        opacity: isPressed ? 0.8 : 1
      }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function MobileOptimizedGrid({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "grid gap-4",
      isMobile 
        ? "grid-cols-1 px-4 py-2" 
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 py-4"
    )}>
      {children}
    </div>
  );
}

export function AdaptiveNavigation({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <nav className={cn(
      "navigation-container",
      isMobile 
        ? "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-50" 
        : "sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40"
    )}>
      <div className={cn(
        "container mx-auto",
        isMobile ? "px-4 py-2" : "px-6 py-4"
      )}>
        {children}
      </div>
    </nav>
  );
}

export function ResponsiveModal({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ 
              scale: 0.8, 
              opacity: 0,
              y: isMobile ? "100%" : 0
            }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: 0
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0,
              y: isMobile ? "100%" : 0
            }}
            className={cn(
              "bg-background rounded-lg shadow-lg max-h-[90vh] overflow-auto",
              isMobile 
                ? "w-full max-w-none mx-4 rounded-t-lg" 
                : "w-full max-w-md"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            )}
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DevicePreview() {
  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const devices = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'desktop', icon: Monitor, label: 'Desktop' }
  ];

  return (
    <Card className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-medium">Preview Mode</span>
        </div>
        <div className="flex gap-1">
          {devices.map((device) => (
            <Button
              key={device.id}
              variant={currentDevice === device.id ? "default" : "outline"}
              size="sm"
              className="p-2"
              onClick={() => setCurrentDevice(device.id as any)}
            >
              <device.icon className="h-3 w-3" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// CSS-in-JS for better mobile typography
export const mobileTypographyStyles = {
  heading: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight",
  subheading: "text-lg sm:text-xl md:text-2xl font-semibold",
  body: "text-sm sm:text-base leading-relaxed",
  caption: "text-xs sm:text-sm text-muted-foreground"
};

// Mobile-optimized spacing
export const mobileSpacing = {
  container: "px-4 sm:px-6 lg:px-8",
  section: "py-4 sm:py-6 lg:py-8",
  element: "p-3 sm:p-4 lg:p-6"
};