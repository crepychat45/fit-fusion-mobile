import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download, CheckCircle, RefreshCw, Package, Sparkles, Gift, Clock, Rocket, ShieldCheck, Zap,
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
  currentVersion = "5.8.0",
  onUpdateComplete,
}: EnhancedUpdateSystemProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStage, setUpdateStage] = useState("");
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const latestVersion = "5.9.0";

  const updateInfo: UpdateInfo = {
    version: "5.9.0",
    releaseDate: "2026-02-22",
    features: [
      "🤖 AI Workout Builder — generate custom routines from your goals",
      "📈 3-Month Progress Prediction Charts",
      "🌟 Community Transformation Stories",
      "🏋️ Enhanced Workout Tabs with AI Build",
    ],
    improvements: [
      "Faster animation transitions across the app",
      "Improved vault file preview stability",
      "Better community page with Stories tab",
      "Enhanced update installation animation",
    ],
    fixes: [
      "Fixed vault image preview crash on upload",
      "Fixed profile name editing persistence",
      "Fixed startup popup notifications",
      "Improved edge function error handling",
    ],
    size: "15.8 MB",
    priority: "high",
    changelog: "AI Workout Builder, progress predictions, transformation stories, and stability improvements.",
  };

  useEffect(() => {
    const timer = setTimeout(() => checkForUpdates(), 1500);
    return () => clearTimeout(timer);
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());
    await new Promise((r) => setTimeout(r, 1200));
    const needsUpdate = compareVersions(currentVersion, latestVersion) < 0;
    if (needsUpdate) {
      setAvailableUpdate(updateInfo);
    }
    setIsChecking(false);
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;
    setIsUpdating(true);
    setUpdateProgress(0);

    const stages = [
      { msg: "Preparing update...", icon: "🔍", progress: 15 },
      { msg: "Downloading packages...", icon: "📦", progress: 35 },
      { msg: "Installing components...", icon: "🔧", progress: 55 },
      { msg: "Applying patches...", icon: "⚙️", progress: 75 },
      { msg: "Optimizing performance...", icon: "⚡", progress: 90 },
      { msg: "Finalizing update...", icon: "✨", progress: 100 },
    ];

    for (const stage of stages) {
      setUpdateStage(`${stage.icon} ${stage.msg}`);
      await new Promise((r) => setTimeout(r, 800));
      setUpdateProgress(stage.progress);
    }

    localStorage.setItem("app-version", availableUpdate.version);
    localStorage.setItem("fitfusion-app-version", availableUpdate.version);
    localStorage.setItem("fitfusion-last-update", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("versionUpdated", { detail: availableUpdate.version }));

    setAvailableUpdate(null);
    setIsUpdating(false);
    setUpdateProgress(0);
    onUpdateComplete?.();

    toast({ title: "🚀 Update Installed!", description: `FitFusion v${latestVersion} is now active.` });
    setTimeout(() => window.location.reload(), 1500);
  };

  const compareVersions = (v1: string, v2: string): number => {
    const p1 = v1.split(".").map(Number);
    const p2 = v2.split(".").map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      if ((p1[i] || 0) < (p2[i] || 0)) return -1;
      if ((p1[i] || 0) > (p2[i] || 0)) return 1;
    }
    return 0;
  };

  return (
    <Card className="relative overflow-hidden border-2">
      {availableUpdate && (
        <motion.div
          animate={{
            background: [
              "linear-gradient(90deg, hsl(var(--primary)), hsl(270 70% 60%))",
              "linear-gradient(90deg, hsl(270 70% 60%), hsl(330 70% 60%))",
              "linear-gradient(90deg, hsl(330 70% 60%), hsl(var(--primary)))",
            ],
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
            <Badge variant="outline" className="font-mono">v{currentVersion}</Badge>
            {availableUpdate && (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                  <Gift className="h-3 w-3 mr-1" />New
                </Badge>
              </motion.div>
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
              className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Rocket className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="font-semibold">Installing v{availableUpdate?.version || latestVersion}</p>
                    <p className="text-sm text-muted-foreground">{updateStage}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">{Math.round(updateProgress)}%</span>
              </div>
              <Progress value={updateProgress} className="h-3" />
              <p className="text-xs text-center text-muted-foreground">Please keep the app open during installation...</p>
            </motion.div>
          ) : availableUpdate ? (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl p-6 space-y-4 border"
            >
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">🎉 v{availableUpdate.version} Available!</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="text-sm px-3 py-1 font-mono bg-gradient-to-r from-primary to-purple-600">v{availableUpdate.version}</Badge>
                  <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{availableUpdate.changelog}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <Zap className="h-4 w-4 text-primary" /><span>Performance</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-green-500" /><span>Security</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-500" /><span>New Features</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>📅 {new Date(availableUpdate.releaseDate).toLocaleDateString()}</span>
                  <span>📦 {availableUpdate.size}</span>
                </div>
                <Button onClick={installUpdate} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Download className="h-4 w-4 mr-2" />Install Now
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uptodate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border"
            >
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">FitFusion v{currentVersion} is the latest version.</p>
              {lastCheck && (
                <p className="text-xs text-muted-foreground mt-2">Last checked: {lastCheck.toLocaleString()}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={checkForUpdates} disabled={isChecking || isUpdating} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
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
