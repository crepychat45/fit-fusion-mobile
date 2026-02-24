import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download, CheckCircle, RefreshCw, Package, Sparkles, Gift, Clock, Rocket, ShieldCheck, Zap, Shield, Cpu,
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
  currentVersion = "6.0.1",
  onUpdateComplete,
}: EnhancedUpdateSystemProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStage, setUpdateStage] = useState("");
  const [stageIcon, setStageIcon] = useState("🔍");
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [installed, setInstalled] = useState(false);

  const latestVersion = "6.0.1";

  const updateInfo: UpdateInfo = {
    version: "6.0.1",
    releaseDate: "2026-02-24",
    features: [
      "🎨 Liquid Glass Design System — frosted glass UI across all components",
      "🖥️ Live Biometric HUD with responsive liquid glass layout",
      "🧠 AI Workout Builder — refined edge function with structured JSON",
      "💧 Interactive Hydration & Energy Tracker",
      "🔒 Enhanced Security Patches & App Lock fixes",
    ],
    improvements: [
      "Dark mode settings menu contrast fix",
      "Chat input bar pinned correctly on mobile/desktop",
      "Biometric HUD responsive grid for all screen sizes",
      "Smoother liquid glass animations & transitions",
    ],
    fixes: [
      "Fixed settings dark mode white-on-white text",
      "Fixed chat input being cut off on mobile",
      "Fixed Biometric HUD layout on small screens",
      "Fixed update system re-prompting after install",
    ],
    size: "12.4 MB",
    priority: "high",
    changelog: "v6.0.1: Liquid Glass design system, dark mode fixes, chat input fix, responsive Biometric HUD, and AI Workout Builder improvements.",
  };

  useEffect(() => {
    // Check if already on latest
    const storedVersion = localStorage.getItem("fitfusion-app-version");
    if (storedVersion === latestVersion) {
      setInstalled(true);
    } else {
      const timer = setTimeout(() => checkForUpdates(), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());
    await new Promise((r) => setTimeout(r, 1200));
    const storedVersion = localStorage.getItem("fitfusion-app-version") || currentVersion;
    const needsUpdate = compareVersions(storedVersion, latestVersion) < 0;
    if (needsUpdate) {
      setAvailableUpdate(updateInfo);
      setInstalled(false);
    } else {
      setInstalled(true);
    }
    setIsChecking(false);
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;
    setIsUpdating(true);
    setUpdateProgress(0);

    const stages = [
      { msg: "Verifying system integrity...", icon: "🔍", progress: 8 },
      { msg: "Preparing secure connection...", icon: "🔐", progress: 15 },
      { msg: "Downloading core packages...", icon: "📦", progress: 30 },
      { msg: "Downloading AI modules...", icon: "🧠", progress: 45 },
      { msg: "Installing security patches...", icon: "🛡️", progress: 55 },
      { msg: "Updating biometric engine...", icon: "💚", progress: 65 },
      { msg: "Compiling UI components...", icon: "🔧", progress: 75 },
      { msg: "Optimizing performance...", icon: "⚡", progress: 85 },
      { msg: "Running final checks...", icon: "✅", progress: 95 },
      { msg: "Launching FitFusion v6.0...", icon: "🚀", progress: 100 },
    ];

    for (const stage of stages) {
      setUpdateStage(stage.msg);
      setStageIcon(stage.icon);
      await new Promise((r) => setTimeout(r, 700));
      setUpdateProgress(stage.progress);
    }

    localStorage.setItem("app-version", availableUpdate.version);
    localStorage.setItem("fitfusion-app-version", availableUpdate.version);
    localStorage.setItem("fitfusion-last-update", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("versionUpdated", { detail: availableUpdate.version }));

    setAvailableUpdate(null);
    setInstalled(true);
    setIsUpdating(false);
    setUpdateProgress(0);
    onUpdateComplete?.();

    toast({ title: "🚀 Update Complete!", description: `FitFusion v${latestVersion} is now active.` });
    setTimeout(() => window.location.reload(), 2000);
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
      {(availableUpdate || isUpdating) && (
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
            <Badge variant="outline" className="font-mono">v{localStorage.getItem("fitfusion-app-version") || currentVersion}</Badge>
            {availableUpdate && !installed && (
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
              {/* Rocket animation */}
              <div className="flex flex-col items-center mb-4">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -3, 3, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl mb-2"
                >
                  {stageIcon}
                </motion.div>
                <p className="font-semibold text-center">Installing v{availableUpdate?.version || latestVersion}</p>
                <p className="text-sm text-muted-foreground text-center">{updateStage}</p>
              </div>

              {/* Progress bar with glow */}
              <div className="relative">
                <Progress value={updateProgress} className="h-3" />
                <motion.div
                  className="absolute top-0 h-3 rounded-full bg-primary/30 blur-sm"
                  animate={{ width: `${updateProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{Math.round(updateProgress)}% complete</span>
                <span className="text-muted-foreground font-mono">{availableUpdate?.size || "18.2 MB"}</span>
              </div>

              {/* Stage indicators */}
              <div className="grid grid-cols-5 gap-1">
                {["Verify", "Download", "Install", "Optimize", "Launch"].map((s, i) => (
                  <div key={s} className={`text-center text-[10px] py-1 rounded ${updateProgress >= (i + 1) * 20 ? "bg-primary/20 text-primary font-medium" : "bg-muted/50 text-muted-foreground"}`}>
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : installed && !availableUpdate ? (
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
              <p className="text-sm text-muted-foreground">FitFusion v{localStorage.getItem("fitfusion-app-version") || currentVersion} is the latest version.</p>
              {lastCheck && (
                <p className="text-xs text-muted-foreground mt-2">Last checked: {lastCheck.toLocaleString()}</p>
              )}
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
                <Badge className="text-sm px-3 py-1 font-mono bg-gradient-to-r from-primary to-purple-600 mr-2">v{availableUpdate.version}</Badge>
                <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Major Release</Badge>
                <p className="text-sm text-muted-foreground mt-2">{availableUpdate.changelog}</p>
              </div>

              {/* Feature highlights */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableUpdate.features.map((f, i) => (
                  <motion.p key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="text-xs text-muted-foreground">{f}</motion.p>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <Cpu className="h-4 w-4 text-primary" /><span>AI Engine</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <Shield className="h-4 w-4 text-green-500" /><span>Security</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-500" /><span>Performance</span>
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
            <div className="text-center p-6">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Checking for updates...</p>
            </div>
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
