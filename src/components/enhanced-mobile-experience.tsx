import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Menu, 
  X, 
  Home, 
  Dumbbell, 
  MessageCircle, 
  User, 
  Settings,
  Search,
  Bell,
  Heart,
  Zap,
  Plus,
  Mic,
  Camera,
  Share2,
  Download,
  Bookmark,
  Star,
  Filter,
  Calendar,
  PlayCircle,
  PauseCircle,
  SkipForward,
  Volume2,
  Vibrate,
  Globe,
  Shield,
  Eye,
  Lock,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedMobileExperienceProps {
  children: React.ReactNode;
}

export function EnhancedMobileExperience({ children }: EnhancedMobileExperienceProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isGestureEnabled, setIsGestureEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // Detect device type
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // PWA Installation Detection
  useEffect(() => {
    const checkPWAInstallation = () => {
      // Check if app is running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsPWAInstalled(isStandalone);
    };

    checkPWAInstallation();
  }, []);

  // Haptic Feedback
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (!hapticEnabled) return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Enhanced gesture handling
  const handlePan = (event: any, info: PanInfo) => {
    if (!isGestureEnabled) return;

    const { offset, velocity } = info;
    const threshold = 100;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0) {
        setSwipeDirection("right");
        handleSwipeRight();
      } else {
        setSwipeDirection("left");
        handleSwipeLeft();
      }
      
      triggerHaptic("light");
      
      // Reset swipe direction after animation
      setTimeout(() => setSwipeDirection(null), 300);
    }
  };

  const handleSwipeLeft = () => {
    // Navigate to next section or show quick actions
      toast({
        title: "Swipe Left Detected",
        description: "Quick actions menu"
      });
  };

  const handleSwipeRight = () => {
    // Navigate back or show navigation
      toast({
        title: "Swipe Right Detected", 
        description: "Navigation menu"
      });
  };

  // Touch-friendly button component
  const TouchButton = ({ 
    children, 
    onClick, 
    variant = "default", 
    size = "default",
    className = "",
    hapticType = "light" 
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "ghost" | "outline" | "destructive";
    size?: "default" | "sm" | "lg";
    className?: string;
    hapticType?: "light" | "medium" | "heavy";
  }) => {
    const handleClick = () => {
      triggerHaptic(hapticType);
      onClick?.();
    };

    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant={variant}
          size={size}
          className={`${className} ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
          onClick={handleClick}
        >
          {children}
        </Button>
      </motion.div>
    );
  };

  // Enhanced responsive navigation
  const ResponsiveNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
      { icon: Home, label: "Home", href: "/" },
      { icon: Dumbbell, label: "Workouts", href: "/workouts" },
      { icon: MessageCircle, label: "Chat", href: "/chat" },
      { icon: User, label: "Profile", href: "/profile" },
      { icon: Settings, label: "Settings", href: "/settings" }
    ];

    if (deviceType === "desktop") {
      return (
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <TouchButton
              key={item.label}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </TouchButton>
          ))}
        </nav>
      );
    }

    return (
      <>
        {/* Mobile/Tablet Navigation */}
        <div className={`${deviceType === "mobile" ? "fixed bottom-0 left-0 right-0" : "relative"} z-50`}>
          <Card className="border-t rounded-t-lg lg:rounded-lg shadow-lg">
            <CardContent className="p-2">
              <div className="flex justify-around items-center">
                {navItems.slice(0, deviceType === "mobile" ? 4 : 5).map((item) => (
                  <TouchButton
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center gap-1 py-3 px-2"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </TouchButton>
                ))}
                {deviceType === "mobile" && (
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center gap-1 py-3 px-2"
                    onClick={() => setIsOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="text-xs">More</span>
                  </TouchButton>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Screen Menu for Mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-2xl font-bold">Menu</h2>
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </TouchButton>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-6 space-y-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TouchButton
                        variant="ghost"
                        className="w-full justify-start text-left py-4 px-4 text-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-6 w-6 mr-4" />
                        {item.label}
                      </TouchButton>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Settings */}
                <div className="p-6 border-t space-y-4">
                  <h3 className="font-semibold text-lg">Quick Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <TouchButton
                      variant="outline"
                      className="flex flex-col items-center gap-2 py-4"
                      onClick={() => setIsGestureEnabled(!isGestureEnabled)}
                    >
                      <Smartphone className="h-5 w-5" />
                      <span className="text-sm">Gestures</span>
                      <Badge variant={isGestureEnabled ? "default" : "secondary"} className="text-xs">
                        {isGestureEnabled ? "On" : "Off"}
                      </Badge>
                    </TouchButton>
                    
                    <TouchButton
                      variant="outline"
                      className="flex flex-col items-center gap-2 py-4"
                      onClick={() => setHapticEnabled(!hapticEnabled)}
                    >
                      <Vibrate className="h-5 w-5" />
                      <span className="text-sm">Haptics</span>
                      <Badge variant={hapticEnabled ? "default" : "secondary"} className="text-xs">
                        {hapticEnabled ? "On" : "Off"}
                      </Badge>
                    </TouchButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  // Device-specific layout wrapper
  const DeviceLayout = ({ children }: { children: React.ReactNode }) => {
    const layoutClasses = {
      mobile: "pb-20 px-4",
      tablet: "px-6 pb-6",
      desktop: "px-8 pb-8"
    };

    return (
      <div className={layoutClasses[deviceType]}>
        {children}
      </div>
    );
  };

  // PWA Installation Prompt
  const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
      if (!isPWAInstalled && deviceType === "mobile") {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }, [isPWAInstalled, deviceType]);

    if (!showPrompt || isPWAInstalled) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-40"
      >
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Install FitFusion</h4>
                <p className="text-xs text-muted-foreground">
                  Get the app experience with offline access
                </p>
              </div>
              <div className="flex gap-2">
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrompt(false)}
                >
                  <X className="h-4 w-4" />
                </TouchButton>
                <TouchButton
                  variant="default"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "PWA Installation",
                      description: "Opening installation prompt...",
                    });
                    setShowPrompt(false);
                  }}
                >
                  Install
                </TouchButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Gesture overlay for swipe detection
  const GestureOverlay = () => {
    if (!isGestureEnabled || deviceType === "desktop") return null;

    return (
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        onPan={handlePan}
        style={{ pointerEvents: isGestureEnabled ? "auto" : "none" }}
      >
        <AnimatePresence>
          {swipeDirection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute top-1/2 transform -translate-y-1/2 ${
                swipeDirection === "right" ? "left-4" : "right-4"
              }`}
            >
              <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4">
                <motion.div
                  animate={{ x: swipeDirection === "right" ? [0, 10, 0] : [0, -10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {swipeDirection === "right" ? (
                    <Menu className="h-6 w-6 text-primary" />
                  ) : (
                    <SkipForward className="h-6 w-6 text-primary" />
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Enhanced responsive layout */}
      <DeviceLayout>
        {children}
      </DeviceLayout>

      {/* Enhanced navigation */}
      <ResponsiveNavigation />

      {/* PWA installation prompt */}
      <PWAInstallPrompt />

      {/* Gesture detection overlay */}
      <GestureOverlay />

      {/* Device info badge for debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 right-4 z-50">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              {deviceType === "mobile" && <Smartphone className="h-3 w-3" />}
              {deviceType === "tablet" && <Tablet className="h-3 w-3" />}
              {deviceType === "desktop" && <Monitor className="h-3 w-3" />}
              {deviceType}
            </div>
          </Badge>
        </div>
      )}
    </div>
  );
}