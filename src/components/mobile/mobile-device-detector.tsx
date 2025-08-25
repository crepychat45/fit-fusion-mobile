import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Battery,
  Signal,
  Info,
  Settings,
  RefreshCw,
} from "lucide-react";

interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  screen: {
    width: number;
    height: number;
    ratio: number;
  };
  features: {
    touchSupport: boolean;
    orientation: string;
    connection: string;
    battery?: {
      level: number;
      charging: boolean;
    };
  };
}

interface MobileDeviceDetectorProps {
  onDeviceChange?: (device: DeviceInfo) => void;
}

export function MobileDeviceDetector({
  onDeviceChange,
}: MobileDeviceDetectorProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const detectDevice = (): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Device type detection
    let type: "mobile" | "tablet" | "desktop" = "desktop";
    if (width < 768) {
      type = "mobile";
    } else if (width < 1024) {
      type = "tablet";
    }

    // OS detection
    let os = "Unknown";
    if (/Android/i.test(userAgent)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
    else if (/Windows/i.test(userAgent)) os = "Windows";
    else if (/Mac/i.test(userAgent)) os = "macOS";
    else if (/Linux/i.test(userAgent)) os = "Linux";

    // Browser detection
    let browser = "Unknown";
    if (/Chrome/i.test(userAgent)) browser = "Chrome";
    else if (/Firefox/i.test(userAgent)) browser = "Firefox";
    else if (/Safari/i.test(userAgent)) browser = "Safari";
    else if (/Edge/i.test(userAgent)) browser = "Edge";

    // Features detection
    const touchSupport =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const orientation = width > height ? "landscape" : "portrait";

    let connection = "Unknown";
    if ("connection" in navigator) {
      const nav = navigator as any;
      connection = nav.connection?.effectiveType || "Unknown";
    }

    return {
      type,
      os,
      browser,
      screen: {
        width,
        height,
        ratio: Math.round((width / height) * 100) / 100,
      },
      features: {
        touchSupport,
        orientation,
        connection,
      },
    };
  };

  const updateDeviceInfo = () => {
    const newDeviceInfo = detectDevice();
    setDeviceInfo(newDeviceInfo);
    onDeviceChange?.(newDeviceInfo);

    toast({
      title: "📱 Device Detected",
      description: `${newDeviceInfo.type} • ${newDeviceInfo.os} • ${newDeviceInfo.screen.width}x${newDeviceInfo.screen.height}`,
    });
  };

  useEffect(() => {
    updateDeviceInfo();

    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100); // Small delay for orientation change
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getDeviceColor = (type: string) => {
    switch (type) {
      case "mobile":
        return "bg-blue-100 text-blue-600 border-blue-300";
      case "tablet":
        return "bg-purple-100 text-purple-600 border-purple-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  if (!deviceInfo) return null;

  return (
    <>
      {/* Floating Device Info Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50 rounded-full p-2 bg-white/90 backdrop-blur-sm border-2"
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* Device Info Panel */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
        >
          <Card className="bg-white/95 backdrop-blur-lg border-2 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(getDeviceIcon(deviceInfo.type), {
                    className: "h-5 w-5 text-primary",
                  })}
                  <h3 className="font-semibold text-sm">Device Info</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="p-1 h-auto"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-3">
                {/* Device Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge
                    className={`text-xs ${getDeviceColor(deviceInfo.type)}`}
                  >
                    {deviceInfo.type}
                  </Badge>
                </div>

                {/* OS & Browser */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">OS:</span>
                    <p className="font-medium">{deviceInfo.os}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Browser:</span>
                    <p className="font-medium">{deviceInfo.browser}</p>
                  </div>
                </div>

                {/* Screen Info */}
                <div className="p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Screen
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium">
                        {deviceInfo.screen.width} × {deviceInfo.screen.height}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ratio:</span>
                      <p className="font-medium">{deviceInfo.screen.ratio}:1</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Features</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {deviceInfo.features.touchSupport
                        ? "👆 Touch"
                        : "🖱️ Mouse"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      📱 {deviceInfo.features.orientation}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      📶 {deviceInfo.features.connection}
                    </Badge>
                  </div>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={updateDeviceInfo}
                  className="w-full text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
