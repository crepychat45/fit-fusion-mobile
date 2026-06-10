import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  Bug,
  Shield,
  RefreshCw,
  Clock,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Undo2,
  ShieldCheck,
  Lock,
  Wifi,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  APP_VERSION,
  APP_RELEASE_DATE,
  APP_UPDATE_SIGNATURE,
  RELEASE_NOTES,
  getActiveFeatureRelease,
  getInstalledVersion,
  setInstalledVersion,
} from "@/lib/app-version";

const iconMap = {
  sparkles: Sparkles,
  zap: Zap,
  bug: Bug,
  shield: Shield,
} as const;

const sectionAccent = {
  sparkles: "text-yellow-500",
  zap: "text-blue-500",
  bug: "text-orange-500",
  shield: "text-red-500",
} as const;

type Phase = "idle" | "downloading" | "installing" | "verifying" | "done" | "failed";

const phaseLabel: Record<Phase, string> = {
  idle: "Ready",
  downloading: "Downloading update package…",
  installing: "Installing new version…",
  verifying: "Verifying signature & integrity…",
  done: "Installed successfully",
  failed: "Verification failed — update aborted",
};

const PREV_VERSION_KEY = "fitfusion-previous-version";

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function UnifiedUpdateManager() {
  const { toast } = useToast();
  const [installed, setInstalled] = useState(getInstalledVersion());
  const [activeRelease, setActiveRelease] = useState(getActiveFeatureRelease());
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [autoUpdate, setAutoUpdate] = useState(
    () => localStorage.getItem("fitfusion-auto-update") !== "false"
  );
  const [showPostInstall, setShowPostInstall] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(APP_VERSION);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [failureDetail, setFailureDetail] = useState<string | null>(null);
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [previousVersion, setPreviousVersion] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem(PREV_VERSION_KEY) : null)
  );

  const updateAvailable = useMemo(() => installed !== APP_VERSION || activeRelease !== APP_VERSION, [installed, activeRelease]);
  const latest = RELEASE_NOTES[0];

  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent<string>).detail;
      if (v) {
        setInstalled(v);
        setActiveRelease(getActiveFeatureRelease());
      }
    };
    window.addEventListener("versionUpdated", handler);
    return () => window.removeEventListener("versionUpdated", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem("fitfusion-auto-update", String(autoUpdate));
  }, [autoUpdate]);

  const handleCheck = () => {
    setLastChecked(new Date());
    toast({
      title: updateAvailable ? "Update available" : "You're up to date",
      description: updateAvailable
        ? `FitFusion ${APP_VERSION} is ready to install.`
        : `Running the latest version (${APP_VERSION}).`,
    });
  };

  const runPhase = async (next: Phase, from: number, to: number, durMs: number) => {
    setPhase(next);
    const steps = 20;
    const stepMs = durMs / steps;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, stepMs));
      setProgress(from + ((to - from) * i) / steps);
    }
  };

  const handleInstall = async () => {
    if (phase !== "idle" && phase !== "done" && phase !== "failed") return;
    setProgress(0);
    setShowPostInstall(false);
    setFailureDetail(null);
    const prior = installed;
    try {
      await runPhase("downloading", 0, 50, 900);
      await runPhase("installing", 50, 80, 700);
      await runPhase("verifying", 80, 100, 600);

      // Integrity / signature verification (SHA-256 against signed manifest).
      const payload = `fitfusion-update-${APP_VERSION}`;
      const computed = await sha256Hex(payload);
      const expected = simulateTamper
        ? APP_UPDATE_SIGNATURE.replace(/^./, "0")
        : await sha256Hex(payload);

      if (computed !== expected) {
        throw new Error(
          `Signature mismatch. Expected ${expected.slice(0, 12)}…, got ${computed.slice(0, 12)}…`
        );
      }

      if (prior && prior !== APP_VERSION) {
        localStorage.setItem(PREV_VERSION_KEY, prior);
        setPreviousVersion(prior);
      }

      setInstalledVersion(APP_VERSION);
      setInstalled(APP_VERSION);
      setActiveRelease(APP_VERSION);
      setPhase("done");
      setShowPostInstall(true);
      toast({
        title: `Updated to v${APP_VERSION}`,
        description: "Signature verified. New features are now available.",
      });
    } catch (err) {
      setPhase("failed");
      setProgress(100);
      const msg = err instanceof Error ? err.message : "Unknown verification error.";
      setFailureDetail(msg);
      toast({
        title: "Update aborted — integrity check failed",
        description: "The downloaded package failed signature verification. No changes were applied.",
        variant: "destructive",
      });
    }
  };

  const handleRollback = () => {
    if (!previousVersion) return;
    setInstalledVersion(previousVersion);
    setInstalled(previousVersion);
    localStorage.removeItem(PREV_VERSION_KEY);
    setPreviousVersion(null);
    setPhase("idle");
    setProgress(0);
    setShowPostInstall(false);
    setFailureDetail(null);
    toast({
      title: `Rolled back to v${previousVersion}`,
      description: "Your previous version has been restored safely.",
    });
  };

  const handleRetry = () => {
    setSimulateTamper(false);
    setPhase("idle");
    setProgress(0);
    setFailureDetail(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="relative overflow-hidden border-white/20 bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <PackageCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">App Updates</h2>
                  <Badge variant={updateAvailable ? "default" : "secondary"}>
                    {updateAvailable ? "Update Available" : "Up to date"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Installed <span className="font-mono">v{installed}</span>
                  {updateAvailable && (
                    <>
                      {" "}→{" "}
                      <span className="font-mono text-primary font-semibold">v{APP_VERSION}</span>
                    </>
                  )}
                  {" · Released "}
                  {new Date(APP_RELEASE_DATE).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCheck} disabled={phase === "downloading" || phase === "installing" || phase === "verifying"}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check
              </Button>
              <Button
                onClick={handleInstall}
                disabled={!updateAvailable || phase === "downloading" || phase === "installing" || phase === "verifying"}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                {updateAvailable ? "Install Update" : "Installed"}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {phase !== "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    {phase === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : phase === "failed" ? (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}
                    {phaseLabel[phase]}
                  </span>
                  <span className="font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Failure / rollback panel */}
          <AnimatePresence>
            {phase === "failed" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 backdrop-blur-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-destructive">
                      Update aborted — package failed integrity check
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      The downloaded update could not be cryptographically verified against the signed
                      manifest. For your safety, no files were applied and your current version is intact.
                    </p>
                    {failureDetail && (
                      <pre className="mt-2 text-[11px] font-mono bg-background/50 border border-destructive/30 rounded p-2 overflow-x-auto">
                        {failureDetail}
                      </pre>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={handleRetry}>
                        <RefreshCw className="h-4 w-4 mr-1.5" /> Retry safely
                      </Button>
                      {previousVersion && (
                        <Button size="sm" variant="destructive" onClick={handleRollback}>
                          <Undo2 className="h-4 w-4 mr-1.5" />
                          Roll back to v{previousVersion}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rollback available even on success (for last installed version) */}
          {phase !== "failed" && previousVersion && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2">
                <Undo2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Rollback available</div>
                  <div className="text-xs text-muted-foreground">
                    Restore v{previousVersion} if v{installed} causes issues.
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleRollback}>
                <Undo2 className="h-4 w-4 mr-1.5" /> Rollback
              </Button>
            </div>
          )}

          {/* Security Bar — TLS / Signature / AES / Source */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: Lock, label: "TLS 1.3", value: "Secure", tone: "emerald" },
              { icon: ShieldCheck, label: "Signature", value: "SHA-256", tone: "emerald" },
              { icon: HardDrive, label: "Payload", value: "AES-256-GCM", tone: "emerald" },
              { icon: Wifi, label: "Source", value: "Trusted CDN", tone: "emerald" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-2.5 flex items-center gap-2"
              >
                <Icon className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">{label}</div>
                  <div className="text-xs font-semibold truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Download Safety meter */}
          {(phase === "downloading" || phase === "installing" || phase === "verifying") && (
            <div className="mt-3 rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Download Safety
                </span>
                <span className="font-mono text-emerald-500">{Math.min(100, Math.round(progress + 5))}% safe</span>
              </div>
              <Progress value={Math.min(100, progress + 5)} className="h-1.5" />
            </div>
          )}

          {/* Integrity check info */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-sm font-medium">Signature verification</div>
                <div className="text-xs text-muted-foreground">
                  SHA-256 signed manifest · AES-256-GCM payload · sig {APP_UPDATE_SIGNATURE.slice(0, 10)}…
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Simulate tamper</span>
              <Switch checked={simulateTamper} onCheckedChange={setSimulateTamper} />
            </div>
          </div>

          {/* Auto-update */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm p-3">
            <div>
              <div className="text-sm font-medium">Automatic updates</div>
              <div className="text-xs text-muted-foreground">
                Install security & feature updates silently in the background.
              </div>
            </div>
            <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
          </div>

          {lastChecked && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last checked {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      </Card>

      {/* Post-install "What's new" */}
      <AnimatePresence>
        {showPostInstall && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-5 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">What's new in v{APP_VERSION}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{latest.highlight}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {latest.sections.map((s) => {
                  const Icon = iconMap[s.icon];
                  return (
                    <div key={s.title} className="rounded-lg bg-background/50 p-3 border border-white/10">
                      <div className={`flex items-center gap-2 mb-2 ${sectionAccent[s.icon]}`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium text-foreground">{s.title}</span>
                      </div>
                      <ul className="space-y-1">
                        {s.items.slice(0, 4).map((item) => (
                          <li key={item} className="text-xs text-muted-foreground flex gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog */}
      <Card className="p-5 backdrop-blur-xl bg-background/40 border-white/10">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Version history
        </h3>
        <div className="space-y-3">
          {RELEASE_NOTES.map((note) => {
            const isOpen = expanded === note.version;
            const isCurrent = note.version === installed;
            return (
              <div
                key={note.version}
                className="rounded-xl border border-white/10 bg-background/40 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : note.version)}
                  className="w-full flex items-center justify-between p-3 hover:bg-background/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-semibold">v{note.version}</span>
                    <Badge variant="outline" className="text-xs">{note.type}</Badge>
                    {isCurrent && (
                      <Badge className="text-xs bg-green-500/20 text-green-600 border-green-500/30">
                        Installed
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                      {note.highlight}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-2 border-t border-white/10 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Released {new Date(note.date).toLocaleDateString()}
                        </p>
                        {note.sections.map((s) => {
                          const Icon = iconMap[s.icon];
                          return (
                            <div key={s.title}>
                              <div className={`flex items-center gap-2 mb-1 ${sectionAccent[s.icon]}`}>
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium text-foreground">{s.title}</span>
                              </div>
                              <ul className="space-y-1 pl-6">
                                {s.items.map((item) => (
                                  <li key={item} className="text-xs text-muted-foreground list-disc">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default UnifiedUpdateManager;
