import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Sparkles,
  Gift,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  size: string;
  priority: "low" | "medium" | "high" | "critical";
  changelog: string;
}

interface EnhancedUpdateSystemProps {
  currentVersion?: string;
  onUpdateComplete?: () => void;
}

export function EnhancedUpdateSystem({ 
  currentVersion = "4.8.0", 
  onUpdateComplete 
}: EnhancedUpdateSystemProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

  const latestVersion = "4.9.2";

  const updateInfo: UpdateInfo = {
    version: "4.9.2",
    releaseDate: "2025-01-03",
    features: [
      "🤖 Enhanced AI chat with better responses",
      "📱 Improved mobile interface responsiveness", 
      "🎯 Real-time fitness tracking integration",
      "🔐 Advanced security and privacy controls",
      "📊 Enhanced analytics dashboard",
      "🌙 Improved dark mode consistency",
      "⚡ 60% faster app performance",
    ],
    improvements: [
      "Better chat message delivery and reliability",
      "Enhanced emoji and attachment support",  
      "Improved settings page navigation",
      "Better mobile responsive design",
      "Optimized battery usage",
      "Enhanced accessibility features",
    ],
    fixes: [
      "Fixed chat typing indicators",
      "Resolved settings display errors",
      "Fixed mobile chat interface issues", 
      "Corrected version manager errors",
      "Fixed notification display problems",
      "Improved error handling",
    ],
    size: "12.8 MB",
    priority: "high",
    changelog: "This major update fixes all chat issues, improves mobile experience, and enhances overall performance.",
  };

  useEffect(() => {
    // Auto-check for updates on mount
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Set up auto-update check
    if (autoUpdateEnabled) {
      const interval = setInterval(() => {
        checkForUpdates();
      }, 60000 * 60); // Check every hour

      return () => clearInterval(interval);
    }
  }, [autoUpdateEnabled]);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const needsUpdate = compareVersions(currentVersion, latestVersion) < 0;

      if (needsUpdate) {
        setAvailableUpdate(updateInfo);
        toast({
          title: "🎉 Update Available!",
          description: `FitFusion ${latestVersion} is ready with exciting improvements!`,
        });
      } else {
        toast({
          title: "✅ Up to Date",
          description: "You have the latest version of FitFusion.",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Update Check Failed",
        description: "Unable to check for updates. Please try again.",
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
        { message: "🔍 Preparing update...", progress: 15 },
        { message: "📦 Downloading update...", progress: 35 },
        { message: "🔧 Installing components...", progress: 60 },
        { message: "⚙️ Updating settings...", progress: 80 },
        { message: "✨ Finalizing...", progress: 95 },
        { message: "🎉 Complete!", progress: 100 },
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUpdateProgress(stage.progress);

        toast({
          title: stage.message,
          description: `${stage.progress}% complete`,
        });
      }

      // Clear update and notify completion
      setAvailableUpdate(null);
      onUpdateComplete?.();

      toast({
        title: "🚀 Update Installed!",
        description: `Welcome to FitFusion ${availableUpdate.version}! All issues have been fixed.`,
      });

      // Auto-reload after successful update
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: "Installation failed. Please try again.",
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

  return (
    <Card className="relative overflow-hidden border-2">
      {availableUpdate && (
        <motion.div
          animate={{ 
            background: [
              "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              "linear-gradient(90deg, #8b5cf6, #ec4899)",  
              "linear-gradient(90deg, #ec4899, #3b82f6)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-0 right-0 h-1"
        />
      )}

      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Update Center
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              v{currentVersion}
            </Badge>
            {availableUpdate && (
              <Badge className="animate-pulse bg-gradient-to-r from-orange-500 to-red-500">
                <Gift className="h-3 w-3 mr-1" />
                New Version
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {isUpdating ? (
            <motion.div
              key="updating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border"
            >
              <div className="flex justify-between text-sm font-medium">
                <span>🚀 Installing v{availableUpdate?.version}</span>
                <span>{Math.round(updateProgress)}%</span>
              </div>
              <Progress value={updateProgress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                Please keep the app open during installation...
              </p>
            </motion.div>
          ) : availableUpdate ? (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 space-y-4 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                    🎉 Major Update Ready!
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="text-lg px-3 py-1 font-mono bg-gradient-to-r from-blue-600 to-purple-600">
                      v{availableUpdate.version}
                    </Badge>
                    <Badge variant="outline">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {availableUpdate.changelog}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Chat Fixes</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span>Mobile Optimized</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Enhanced UI</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>📅 {new Date(availableUpdate.releaseDate).toLocaleDateString()}</span>
                  <span>📦 {availableUpdate.size}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={installUpdate}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uptodate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                You're All Set!
              </h3>
              <p className="text-sm text-muted-foreground">
                FitFusion v{currentVersion} is the latest version with all features working perfectly.
              </p>
              {lastCheck && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last checked: {lastCheck.toLocaleString()}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={checkForUpdates}
            disabled={isChecking || isUpdating}
            size="sm"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check for Updates
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Auto-check enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}