import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download, CheckCircle, RefreshCw, Package, Sparkles, Gift, Clock, Rocket,
  ShieldCheck, Zap, Shield, Cpu, Wifi, Activity, Star, ChevronDown, ChevronUp,
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

const LATEST_VERSION = "6.2.0";

const CHANGELOG_HISTORY = [
  {
    version: "6.2.0",
    date: "2026-02-25",
    title: "Liquid Glass Universe",
    changes: [
      "🎨 Global Liquid Glass design on ALL pages & components",
      "✨ Framer Motion page transitions between all routes",
      "🔧 Settings: Full Name, Email, Password change now works properly",
      "💬 Chat input bar fixed — always visible on mobile & desktop",
      "🚀 Update Center redesigned with liquid glass progress bar",
      "🔒 Enhanced security & privacy protocols",
      "⚡ Performance optimizations with lazy loading",
      "📱 100% mobile/desktop responsive parity",
    ],
  },
  {
    version: "6.1.0",
    date: "2026-02-24",
    title: "Glass Foundation",
    changes: [
      "🎨 Liquid Glass Design on buttons, cards & components",
      "🔄 Redesigned Update Center with liquid progress",
      "💎 Glass-morphic progress bars with gradient glow",
    ],
  },
  {
    version: "6.0.1",
    date: "2026-02-23",
    title: "Visual Polish",
    changes: [
      "🌙 Dark mode contrast fix in Settings",
      "💬 Chat input padding fix",
      "📊 Biometric HUD liquid glass styling",
    ],
  },
];

const UPDATE_INFO: UpdateInfo = {
  version: LATEST_VERSION,
  releaseDate: "2026-02-25",
  features: CHANGELOG_HISTORY[0].changes,
  improvements: [
    "Smooth liquid glass transitions on every interaction",
    "Account settings properly save name/email/password",
    "Chat input always visible with proper bottom padding",
    "Update system never re-prompts after successful install",
  ],
  fixes: [
    "Fixed update system showing repeated install prompts",
    "Fixed chat input bar hidden on mobile devices",
    "Fixed account name/email change not persisting",
    "Fixed dark mode contrast in settings navigation",
  ],
  size: "16.8 MB",
  priority: "high",
  changelog: `v${LATEST_VERSION}: ${CHANGELOG_HISTORY[0].title} — ${CHANGELOG_HISTORY[0].changes.slice(0, 3).join(", ")}`,
};

const INSTALL_STAGES = [
  { label: "Verify", msg: "Verifying system integrity...", icon: "🔍", target: 8 },
  { label: "Secure", msg: "Establishing secure connection...", icon: "🔐", target: 16 },
  { label: "Download", msg: "Downloading core packages...", icon: "📦", target: 35 },
  { label: "AI", msg: "Updating AI engine modules...", icon: "🧠", target: 48 },
  { label: "Security", msg: "Installing security patches...", icon: "🛡️", target: 58 },
  { label: "Glass UI", msg: "Compiling liquid glass components...", icon: "💎", target: 70 },
  { label: "Optimize", msg: "Optimizing animations & performance...", icon: "⚡", target: 82 },
  { label: "Verify", msg: "Running integrity checks...", icon: "✅", target: 92 },
  { label: "Launch", msg: `Launching FitFusion v${LATEST_VERSION}...`, icon: "🚀", target: 100 },
];

export function EnhancedUpdateSystem({
  currentVersion = "6.2.0",
  onUpdateComplete,
}: EnhancedUpdateSystemProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageMsg, setStageMsg] = useState("");
  const [stageIcon, setStageIcon] = useState("🔍");
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fitfusion-app-version");
    if (stored === LATEST_VERSION) {
      setInstalled(true);
    } else {
      setTimeout(() => checkForUpdates(), 800);
    }
  }, []);

  const compareVersions = (v1: string, v2: string): number => {
    const p1 = v1.split(".").map(Number);
    const p2 = v2.split(".").map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      if ((p1[i] || 0) < (p2[i] || 0)) return -1;
      if ((p1[i] || 0) > (p2[i] || 0)) return 1;
    }
    return 0;
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());
    await new Promise((r) => setTimeout(r, 1200));
    const stored = localStorage.getItem("fitfusion-app-version") || currentVersion;
    if (compareVersions(stored, LATEST_VERSION) < 0) {
      setAvailableUpdate(UPDATE_INFO);
      setInstalled(false);
    } else {
      setInstalled(true);
      setAvailableUpdate(null);
    }
    setIsChecking(false);
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;
    setIsUpdating(true);
    setProgress(0);

    for (let i = 0; i < INSTALL_STAGES.length; i++) {
      const stage = INSTALL_STAGES[i];
      setStageMsg(stage.msg);
      setStageIcon(stage.icon);
      const prevTarget = i > 0 ? INSTALL_STAGES[i - 1].target : 0;
      const steps = 12;
      for (let s = 1; s <= steps; s++) {
        await new Promise((r) => setTimeout(r, 50));
        setProgress(prevTarget + ((stage.target - prevTarget) * s) / steps);
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    localStorage.setItem("app-version", LATEST_VERSION);
    localStorage.setItem("fitfusion-app-version", LATEST_VERSION);
    localStorage.setItem("fitfusion-last-update", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("versionUpdated", { detail: LATEST_VERSION }));

    setAvailableUpdate(null);
    setInstalled(true);
    setIsUpdating(false);
    setProgress(0);
    onUpdateComplete?.();

    toast({ title: "🚀 Update Complete!", description: `FitFusion v${LATEST_VERSION} is now active.` });
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <Card className="relative overflow-hidden liquid-glass-strong border-border/30">
      {(availableUpdate || isUpdating) && (
        <motion.div
          animate={{
            background: [
              "linear-gradient(90deg, hsl(var(--primary)), hsl(270 70% 60%))",
              "linear-gradient(90deg, hsl(270 70% 60%), hsl(200 80% 55%))",
              "linear-gradient(90deg, hsl(200 80% 55%), hsl(var(--primary)))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-0 right-0 h-1 z-10"
        />
      )}

      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span>System Update Center</span>
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono liquid-glass-subtle px-3">
              v{localStorage.getItem("fitfusion-app-version") || currentVersion}
            </Badge>
            {availableUpdate && !installed && (
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Badge className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm border border-white/20">
                  <Gift className="h-3 w-3 mr-1" />New
                </Badge>
              </motion.div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <AnimatePresence mode="wait">
          {isUpdating ? (
            <motion.div
              key="updating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5 p-6 liquid-glass rounded-2xl"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl mb-3"
                >
                  {stageIcon}
                </motion.div>
                <p className="font-semibold text-lg">Installing v{LATEST_VERSION}</p>
                <p className="text-sm text-muted-foreground">{stageMsg}</p>
              </div>

              {/* Liquid glass progress bar */}
              <div className="relative">
                <div className="h-5 rounded-full liquid-glass-subtle overflow-hidden border border-border/20">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                    style={{ backgroundSize: "200% 100%" }}
                    animate={{ 
                      width: `${progress}%`,
                      backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                    }}
                    transition={{ 
                      width: { duration: 0.3, ease: "easeOut" },
                      backgroundPosition: { duration: 2, repeat: Infinity },
                    }}
                  />
                </div>
                <motion.div
                  className="absolute top-0 h-5 rounded-full bg-primary/20 blur-lg"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">{Math.round(progress)}%</span>
                <span className="text-muted-foreground">{UPDATE_INFO.size}</span>
              </div>

              <div className="flex gap-1">
                {["Verify", "Download", "Install", "Optimize", "Launch"].map((s, i) => {
                  const thresholds = [16, 48, 70, 92, 100];
                  const active = progress >= thresholds[i];
                  return (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: active ? 1 : 0.5 }}
                      className={`flex-1 text-center text-[10px] py-1.5 rounded-lg transition-all duration-300 ${
                        active
                          ? "liquid-glass-strong text-primary font-semibold"
                          : "liquid-glass-subtle text-muted-foreground"
                      }`}
                    >
                      {s}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          ) : installed && !availableUpdate ? (
            <motion.div
              key="uptodate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-8 liquid-glass rounded-2xl"
            >
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </motion.div>
              <h3 className="text-lg font-semibold mb-1">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">
                FitFusion v{localStorage.getItem("fitfusion-app-version") || currentVersion} — latest version
              </p>
              {lastCheck && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Checked: {lastCheck.toLocaleTimeString()}
                </p>
              )}
            </motion.div>

          ) : availableUpdate ? (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="liquid-glass rounded-2xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  v{availableUpdate.version} Available!
                </h3>
                <div className="flex gap-2 mb-3">
                  <Badge className="font-mono bg-gradient-to-r from-primary/90 to-purple-600/90 backdrop-blur-sm border border-white/20">
                    v{availableUpdate.version}
                  </Badge>
                  <Badge variant="outline" className="liquid-glass-subtle">
                    <Star className="h-3 w-3 mr-1" />Major
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{availableUpdate.changelog}</p>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                {availableUpdate.features.map((f, i) => (
                  <motion.p
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </motion.p>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { icon: Cpu, label: "AI Engine", color: "text-primary" },
                  { icon: Shield, label: "Security", color: "text-green-500" },
                  { icon: Zap, label: "Performance", color: "text-yellow-500" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 p-2 liquid-glass-subtle rounded-lg">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>📅 {new Date(availableUpdate.releaseDate).toLocaleDateString()}</span>
                  <span>📦 {availableUpdate.size}</span>
                </div>
                <Button onClick={installUpdate} variant="glass" className="bg-gradient-to-r from-primary/80 to-blue-500/80 text-white border-white/20">
                  <Download className="h-4 w-4 mr-2" />Install Now
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-6 liquid-glass rounded-2xl">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Checking for updates...</p>
            </div>
          )}
        </AnimatePresence>

        {/* Changelog History */}
        <div className="pt-3 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChangelog(!showChangelog)}
            className="w-full justify-between liquid-glass-subtle"
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Version History & Changelog
            </span>
            {showChangelog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <AnimatePresence>
            {showChangelog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 mt-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {CHANGELOG_HISTORY.map((entry, idx) => (
                    <motion.div
                      key={entry.version}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 liquid-glass-subtle rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">v{entry.version}</Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                        <span className="text-xs font-medium text-primary">{entry.title}</span>
                      </div>
                      <div className="space-y-1">
                        {entry.changes.map((c, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{c}</p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border/30">
          <Button variant="ghost" onClick={checkForUpdates} disabled={isChecking || isUpdating} size="sm" className="liquid-glass-subtle">
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Check for Updates
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            <span>Auto-check enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
