import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Clock,
  Zap,
  Shield,
  Sparkles,
  Info,
  Star,
  Gift,
  Smartphone,
  Calendar,
  Bug,
  ArrowUp,
  Wifi,
  HardDrive,
} from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  security: string[];
  size: string;
  priority: "low" | "medium" | "high" | "critical";
  downloadUrl?: string;
  changelog?: string;
}

interface SystemInfo {
  platform: string;
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  cookiesEnabled: boolean;
  onlineStatus: boolean;
}

export function VersionManager() {
  const { toast } = useToast();
  const { appVersion, setAppVersion } = useSettings();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(
    null,
  );
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [networkSpeed, setNetworkSpeed] = useState<string>("Unknown");
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    available: number;
  } | null>(null);

  const currentVersion = appVersion;
  const latestVersion = "4.9.2";

  const updateInfo: UpdateInfo = {
    version: "4.9.2",
    releaseDate: "2025-01-03",
    features: [
      "🤖 Revolutionary AI-powered workout recommendations with machine learning",
      "🔐 Advanced biometric authentication with enhanced security protocols",
      "🎯 Real-time group fitness challenges with leaderboards",
      "📱 Smart nutrition tracking with barcode scanning and AI analysis",
      "📴 Offline workout mode with intelligent sync capabilities",
      "🎨 New dynamic theme system with customizable color palettes",
      "📊 Enhanced analytics dashboard with predictive insights",
    ],
    improvements: [
      "⚡ 60% faster app startup time with optimized loading",
      "🔋 Improved battery optimization reducing consumption by 40%",
      "🛡️ Enhanced security protocols with zero-trust architecture",
      "♿ Better accessibility features meeting WCAG 2.1 AA standards",
      "✨ Smoother animations with 120fps support",
      "🌐 Improved offline functionality with intelligent caching",
      "📱 Better mobile responsiveness across all device sizes",
    ],
    fixes: [
      "🔧 Fixed workout timer synchronization issues across devices",
      "💬 Resolved chat notification bugs and message delivery",
      "📈 Fixed progress chart data accuracy and real-time updates",
      "🧠 Improved memory usage optimization reducing RAM by 35%",
      "🌙 Fixed dark mode theme inconsistencies and contrast issues",
      "🔄 Resolved sync conflicts between multiple devices",
      "🎵 Fixed audio playback issues during workouts",
    ],
    security: [
      "🔒 End-to-end encryption for all user communications",
      "🛡️ Advanced threat detection and prevention system",
      "🔐 Multi-factor authentication with biometric support",
      "🚫 Enhanced data privacy controls with granular permissions",
      "🔍 Security audit compliance with SOC 2 Type II standards",
    ],
    size: "15.2 MB",
    priority: "high",
    changelog:
      "This major update introduces revolutionary AI features, enhanced security, and significant performance improvements.",
  };

  const releaseHistory = [
    { version: "4.9.2", date: "2025-01-03", type: "Major Release" },
    { version: "4.8.1", date: "2024-12-15", type: "Security Update" },
    { version: "4.8.0", date: "2024-12-01", type: "Feature Update" },
    { version: "4.7.0", date: "2024-11-15", type: "Major Release" },
  ];

  useEffect(() => {
    initializeSystemInfo();
    checkForUpdates();
    measureNetworkSpeed();
    checkStorageInfo();
  }, []);

  const initializeSystemInfo = () => {
    setSystemInfo({
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    });
  };

  const measureNetworkSpeed = async () => {
    try {
      const startTime = performance.now();
      await fetch("/placeholder.svg", { method: "HEAD" });
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration < 100) setNetworkSpeed("Fast (>10 Mbps)");
      else if (duration < 300) setNetworkSpeed("Medium (1-10 Mbps)");
      else setNetworkSpeed("Slow (<1 Mbps)");
    } catch {
      setNetworkSpeed("Offline");
    }
  };

  const checkStorageInfo = async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: Math.round((estimate.usage || 0) / 1024 / 1024), // MB
          available: Math.round((estimate.quota || 0) / 1024 / 1024), // MB
        });
      } catch (error) {
        console.log("Storage estimation not available");
      }
    }
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());

    try {
      // Simulate enhanced API call
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const needsUpdate = compareVersions(currentVersion, latestVersion) < 0;

      if (needsUpdate) {
        setAvailableUpdate(updateInfo);
        toast({
          title: "🎉 Major Update Available!",
          description: `FitFusion ${latestVersion} is ready with exciting new features!`,
        });
      } else {
        toast({
          title: "✅ You're up to date!",
          description: "You have the latest version with all features.",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Update check failed",
        description:
          "Unable to check for updates. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;

    setIsUpdating(true);
    setUpdateProgress(0);

    try {
      const stages = [
        { message: "🔍 Preparing update environment...", progress: 10 },
        { message: "📦 Downloading update package...", progress: 30 },
        { message: "🔐 Verifying digital signature...", progress: 50 },
        { message: "⚙️ Installing new features...", progress: 70 },
        { message: "🔧 Updating configuration files...", progress: 85 },
        { message: "✨ Finalizing installation...", progress: 95 },
        { message: "🎉 Update complete!", progress: 100 },
      ];

      for (const stage of stages) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setUpdateProgress(stage.progress);

        toast({
          title: stage.message,
          description: `${stage.progress}% complete`,
        });
      }

      // Update the version and clear available update
      setAppVersion(availableUpdate.version);
      setAvailableUpdate(null);

      toast({
        title: "🚀 Update Installed Successfully!",
        description: `Welcome to FitFusion ${availableUpdate.version}! Enjoy the new features.`,
      });
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description:
          "Installation failed. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-600";
      case "medium":
        return "bg-yellow-600";
      case "low":
        return "bg-green-600";
      default:
        return "bg-blue-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return AlertTriangle;
      case "high":
        return Zap;
      case "medium":
        return Package;
      case "low":
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "features":
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case "fixes":
        return <Bug className="h-4 w-4 text-blue-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "improvements":
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {availableUpdate && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
      )}

      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Advanced Version Manager
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-mono px-3 py-1">
              v{currentVersion}
            </Badge>
            {availableUpdate && (
              <Badge
                variant="default"
                className="animate-pulse bg-gradient-to-r from-orange-500 to-red-500"
              >
                <Gift className="h-3 w-3 mr-1" />
                Update Ready
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Comprehensive version management with real-time updates and system
          monitoring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="updates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="updates" className="relative">
              Updates
              {availableUpdate && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="space-y-4 mt-6">
            {isUpdating ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border"
              >
                <div className="flex justify-between text-sm font-medium">
                  <span>🚀 Installing v{latestVersion}</span>
                  <span>{Math.round(updateProgress)}%</span>
                </div>
                <Progress value={updateProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  ⏳ Please keep the app open during installation...
                </p>
              </motion.div>
            ) : availableUpdate ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 space-y-4 border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-xl text-green-700 dark:text-green-300">
                        🎉 Major Update Available!
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="default"
                        className="text-lg px-3 py-1 font-mono bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        v{availableUpdate.version}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                      <Badge
                        variant="default"
                        className={`${getPriorityColor(availableUpdate.priority)} text-white`}
                      >
                        {React.createElement(
                          getPriorityIcon(availableUpdate.priority),
                          { className: "h-3 w-3 mr-1" },
                        )}
                        {availableUpdate.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      This major release includes revolutionary AI features,
                      enhanced security protocols, significant performance
                      improvements, and exciting new functionality.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Enhanced Security</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>AI Features</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <span>Mobile Optimized</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                    <ArrowUp className="h-4 w-4 text-orange-500" />
                    <span>60% Faster</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      📅{" "}
                      {new Date(
                        availableUpdate.releaseDate,
                      ).toLocaleDateString()}
                    </span>
                    <span>📦 {availableUpdate.size}</span>
                    <span className="flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      {networkSpeed}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangelog(!showChangelog)}
                    >
                      {showChangelog ? "Hide" : "View"} Details
                    </Button>
                    <Button
                      onClick={installUpdate}
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install v{availableUpdate.version}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      ✅ Your application is up to date
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Version {currentVersion} • Latest release with all
                      features and security updates
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastCheck
                    ? `Last checked: ${lastCheck.toLocaleTimeString()}`
                    : "Never checked"}
                </span>
                {systemInfo?.onlineStatus && (
                  <span className="flex items-center gap-1 text-green-600">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkForUpdates}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {isChecking ? "Checking..." : "Check Now"}
              </Button>
            </div>

            {/* Enhanced Changelog Display */}
            <AnimatePresence>
              {showChangelog && availableUpdate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      What's New in v{availableUpdate.version}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Features */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-green-600 flex items-center gap-2">
                          {getChangeIcon("features")}
                          New Features ({availableUpdate.features.length})
                        </h5>
                        <ul className="text-sm space-y-2">
                          {availableUpdate.features.map((feature, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-blue-600 flex items-center gap-2">
                          {getChangeIcon("improvements")}
                          Improvements ({availableUpdate.improvements.length})
                        </h5>
                        <ul className="text-sm space-y-2">
                          {availableUpdate.improvements.map(
                            (improvement, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded"
                              >
                                <ArrowUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{improvement}</span>
                              </motion.li>
                            ),
                          )}
                        </ul>
                      </div>

                      {/* Security */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-red-600 flex items-center gap-2">
                          {getChangeIcon("security")}
                          Security Updates ({availableUpdate.security.length})
                        </h5>
                        <ul className="text-sm space-y-2">
                          {availableUpdate.security.map((security, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded"
                            >
                              <Shield className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{security}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Bug Fixes */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-orange-600 flex items-center gap-2">
                          {getChangeIcon("fixes")}
                          Bug Fixes ({availableUpdate.fixes.length})
                        </h5>
                        <ul className="text-sm space-y-2">
                          {availableUpdate.fixes.map((fix, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded"
                            >
                              <Bug className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{fix}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Version Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Version Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Current Version:
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {currentVersion}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Latest Available:
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {latestVersion}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Update Channel:
                    </span>
                    <span>Stable Release</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Auto-Updates:</span>
                    <span className="text-green-600">✅ Enabled</span>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              {systemInfo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      System Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="font-mono text-xs">
                        {systemInfo.platform}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen:</span>
                      <span className="font-mono text-xs">
                        {systemInfo.screenResolution}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span>{systemInfo.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timezone:</span>
                      <span className="text-xs">{systemInfo.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        {networkSpeed}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Storage Information */}
              {storageInfo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-green-500" />
                      Storage Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used:</span>
                        <span>{storageInfo.used} MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Available:
                        </span>
                        <span>{storageInfo.available} MB</span>
                      </div>
                      <Progress
                        value={(storageInfo.used / storageInfo.available) * 100}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* App Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build:</span>
                    <Badge variant="outline">Production</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <span>Web Application</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600">
                      {availableUpdate
                        ? "🟡 Update Available"
                        : "🟢 Up to Date"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="text-xs">
                      {localStorage.getItem("fitfusion-last-update")
                        ? new Date(
                            localStorage.getItem("fitfusion-last-update")!,
                          ).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Release History
              </h4>
              {releaseHistory.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      v{release.version}
                    </Badge>
                    <div>
                      <span className="text-sm font-medium">
                        {release.type}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {release.date}
                      </p>
                    </div>
                  </div>
                  {release.version === currentVersion && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
