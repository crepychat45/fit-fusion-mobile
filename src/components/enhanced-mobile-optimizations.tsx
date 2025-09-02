import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidGlassCard } from "@/components/enhanced-liquid-glass";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Smartphone,
  Wifi,
  Battery,
  Signal,
  Sun,
  Moon,
  Vibrate,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rotate3D
} from "lucide-react";

interface DeviceInfo {
  isOnline: boolean;
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  orientation: string;
  screenSize: { width: number; height: number };
  darkMode: boolean;
  vibrationSupported: boolean;
  isFullscreen: boolean;
}

export function EnhancedMobileOptimizations() {
  const { toast } = useToast();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isOnline: navigator.onLine,
    batteryLevel: 100,
    isCharging: false,
    networkType: "unknown",
    orientation: "portrait",
    screenSize: { width: window.innerWidth, height: window.innerHeight },
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    vibrationSupported: "vibrate" in navigator,
    isFullscreen: false
  });
  const [performanceMode, setPerformanceMode] = useState<"auto" | "performance" | "battery">("auto");

  useEffect(() => {
    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          setDeviceInfo(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging
          }));
        };

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        updateBatteryInfo();
      });
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setDeviceInfo(prev => ({
        ...prev,
        networkType: connection.effectiveType || "unknown"
      }));

      const updateConnectionInfo = () => {
        setDeviceInfo(prev => ({
          ...prev,
          networkType: connection.effectiveType || "unknown"
        }));
      };

      connection.addEventListener('change', updateConnectionInfo);
    }

    // Online/Offline events
    const handleOnline = () => setDeviceInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDeviceInfo(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Orientation change
    const handleOrientationChange = () => {
      setDeviceInfo(prev => ({
        ...prev,
        orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
        screenSize: { width: window.innerWidth, height: window.innerHeight }
      }));
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Dark mode detection
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setDeviceInfo(prev => ({ ...prev, darkMode: e.matches }));
    };
    
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    // Fullscreen API
    const handleFullscreenChange = () => {
      setDeviceInfo(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleVibrate = () => {
    if (deviceInfo.vibrationSupported) {
      navigator.vibrate([100, 50, 100]);
      toast({ title: "🔮 Vibration activated", description: "Device vibration triggered" });
    } else {
      toast({ title: "❌ Vibration not supported", description: "This device doesn't support vibration" });
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        toast({ title: "📺 Fullscreen enabled", description: "App is now in fullscreen mode" });
      } else {
        await document.exitFullscreen();
        toast({ title: "🪟 Fullscreen disabled", description: "Exited fullscreen mode" });
      }
    } catch (error) {
      toast({ 
        title: "❌ Fullscreen error", 
        description: "Unable to toggle fullscreen mode",
        variant: "destructive" 
      });
    }
  };

  const optimizePerformance = (mode: "auto" | "performance" | "battery") => {
    setPerformanceMode(mode);
    
    const optimizations = {
      auto: "Automatic optimization based on device status",
      performance: "Maximum performance mode activated",
      battery: "Battery saving mode activated"
    };

    toast({
      title: `⚡ ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`,
      description: optimizations[mode]
    });

    // Apply actual optimizations
    if (mode === "battery") {
      // Reduce animation frequency, disable non-essential features
      document.documentElement.style.setProperty("--animation-duration", "0.1s");
    } else if (mode === "performance") {
      // Enable high-performance features
      document.documentElement.style.setProperty("--animation-duration", "0.3s");
    } else {
      // Reset to default
      document.documentElement.style.removeProperty("--animation-duration");
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case "4g":
      case "5g":
        return <Signal className="h-4 w-4 text-green-500" />;
      case "3g":
        return <Signal className="h-4 w-4 text-yellow-500" />;
      default:
        return <Wifi className={`h-4 w-4 ${deviceInfo.isOnline ? "text-green-500" : "text-red-500"}`} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Status */}
      <LiquidGlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              Device Status
            </h3>
            <Badge variant={deviceInfo.isOnline ? "default" : "destructive"}>
              {deviceInfo.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Battery className={getBatteryColor(deviceInfo.batteryLevel)} />
              <span>{deviceInfo.batteryLevel}%</span>
              {deviceInfo.isCharging && <span className="text-green-500">⚡</span>}
            </div>

            <div className="flex items-center gap-2">
              {getNetworkIcon(deviceInfo.networkType)}
              <span className="capitalize">{deviceInfo.networkType}</span>
            </div>

            <div className="flex items-center gap-2">
              <Rotate3D className="h-4 w-4 text-purple-500" />
              <span className="capitalize">{deviceInfo.orientation}</span>
            </div>

            <div className="flex items-center gap-2">
              {deviceInfo.darkMode ? (
                <Moon className="h-4 w-4 text-blue-500" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
              <span>{deviceInfo.darkMode ? "Dark" : "Light"}</span>
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Performance Controls */}
      <LiquidGlassCard>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Performance Mode</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["auto", "performance", "battery"].map((mode) => (
              <Button
                key={mode}
                variant={performanceMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => optimizePerformance(mode as any)}
                className="capitalize text-xs"
              >
                {mode}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVibrate}
              disabled={!deviceInfo.vibrationSupported}
            >
              <Vibrate className="h-4 w-4 mr-1" />
              Vibrate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {deviceInfo.isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4 mr-1" />
                  Exit Full
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4 mr-1" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Screen Information */}
      <LiquidGlassCard variant="subtle">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Screen Info</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Resolution: {deviceInfo.screenSize.width} × {deviceInfo.screenSize.height}</div>
            <div>Aspect Ratio: {(deviceInfo.screenSize.width / deviceInfo.screenSize.height).toFixed(2)}:1</div>
            <div>Pixel Density: {window.devicePixelRatio}x</div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}