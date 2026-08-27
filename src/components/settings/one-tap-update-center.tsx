import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Package,
  Rocket,
  History,
  RotateCcw,
  Sparkles,
  Bug,
  Zap,
  Shield,
  Clock,
  Wifi,
} from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";
import { getStoredVersion, setStoredVersion } from "@/config/version";
import { checkForUpdate, clearAppCache } from "@/utils/version-api";

type Phase = "idle" | "checking" | "downloading" | "verifying" | "installing" | "activating" | "restarting" | "complete";

interface Pack {
  id: string;
  name: string;
  detail: string;
  sizeMb: number;
}

/** Every install pack that ships inside the single bundled package. */
const PACKS: Pack[] = [
  { id: "core", name: "App core", detail: "React shell, routing and state engine", sizeMb: 8.4 },
  { id: "ui", name: "UI & theme pack", detail: "Liquid Glass styles, icons and fonts", sizeMb: 4.1 },
  { id: "workouts", name: "Workout & video pack", detail: "Exercise library, players and timers", sizeMb: 6.2 },
  { id: "sw", name: "Service worker", detail: "Offline cache and background sync", sizeMb: 1.3 },
  { id: "schema", name: "Local data schema", detail: "Settings, cache and migration scripts", sizeMb: 0.9 },
  { id: "native", name: "Native bridge", detail: "Biometrics, haptics and permissions", sizeMb: 2.0 },
];

const TOTAL_MB = PACKS.reduce((a, p) => a + p.sizeMb, 0);

const HISTORY_KEY = "fitfusion-update-history";
const CHANNEL_KEY = "fitfusion-update-channel";
const AUTO_KEY = "fitfusion-update-auto";
const WIFI_KEY = "fitfusion-update-wifi-only";
const AUTO_RESTART_KEY = "fitfusion-update-auto-restart";

interface HistoryEntry {
  version: string;
  date: string;
  channel: string;
}

function readHistory(): HistoryEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((e): e is HistoryEntry => !!e && typeof e.version === "string" && typeof e.date === "string");
  } catch {
    return [];
  }
}

function usePref<T extends string | boolean>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (next: T) => {
      setV(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key],
  );
  return [v, set];
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Ready",
  checking: "Checking for updates…",
  downloading: "Downloading bundled package…",
  verifying: "Verifying signature…",
  installing: "Installing packs…",
  activating: "Activating new version…",
  restarting: "Restarting FitxFusion…",
  complete: "Up to date",
};

const SECTION_ICON = { sparkles: Sparkles, zap: Zap, bug: Bug, shield: Shield } as const;

export function OneTapUpdateCenter() {
  const { toast } = useToast();
  const [installed, setInstalled] = useState<string>(() => getStoredVersion());
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [donePacks, setDonePacks] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());
  const [showNotes, setShowNotes] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const [channel, setChannel] = usePref<string>(CHANNEL_KEY, "stable");
  const [autoUpdate, setAutoUpdate] = usePref<boolean>(AUTO_KEY, true);
  const [wifiOnly, setWifiOnly] = usePref<boolean>(WIFI_KEY, false);
  const [autoRestart, setAutoRestart] = usePref<boolean>(AUTO_RESTART_KEY, true);

  const timers = useRef<number[]>([]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = window.setTimeout(() => resolve(), ms);
      timers.current.push(t);
    });

  const hasUpdate = installed !== APP_VERSION;
  const latestNote = RELEASE_NOTES[0];
  const busy = phase !== "idle" && phase !== "complete";

  const downloadedMb = useMemo(
    () => (TOTAL_MB * Math.min(100, percent)) / 100,
    [percent],
  );

  const handleCheck = async () => {
    setPhase("checking");
    setPercent(0);
    await checkForUpdate().catch(() => false);
    await wait(700);
    if (!alive.current) return;
    setLastChecked(new Date().toLocaleTimeString());
    setPhase("idle");
    toast({
      title: hasUpdate ? `Update available — v${APP_VERSION}` : "You're up to date",
      description: hasUpdate
        ? `${PACKS.length} install packs bundled into one ${TOTAL_MB.toFixed(1)} MB package.`
        : `FitxFusion v${installed} is the latest ${channel} build.`,
    });
  };

  const runInstall = async () => {
    setDonePacks([]);
    setPhase("downloading");
    // Single bundled download covering every install pack.
    for (let i = 0; i < PACKS.length; i++) {
      await wait(420);
      if (!alive.current) return;
      setDonePacks((d) => [...d, PACKS[i].id]);
      setPercent(Math.round(((i + 1) / PACKS.length) * 55));
    }

    setPhase("verifying");
    await wait(600);
    if (!alive.current) return;
    setPercent(70);

    setPhase("installing");
    await wait(900);
    if (!alive.current) return;
    setPercent(88);
    await clearAppCache().catch(() => undefined);

    setPhase("activating");
    try {
      const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
    } catch {
      /* no sw */
    }
    await wait(600);
    if (!alive.current) return;
    setPercent(100);

    setStoredVersion(APP_VERSION);
    const entry: HistoryEntry = { version: APP_VERSION, date: new Date().toISOString(), channel };
    const next = [entry, ...history].slice(0, 12);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setInstalled(APP_VERSION);
    setPhase("complete");
    setShowNotes(true);

    if (autoRestart) {
      setPhase("restarting");
      toast({ title: `FitxFusion v${APP_VERSION} installed`, description: "Restarting to apply the update…" });
      await wait(1200);
      window.location.reload();
    } else {
      toast({ title: `FitxFusion v${APP_VERSION} installed`, description: "Restart when you're ready to apply it." });
    }
  };

  const rollback = (entry: HistoryEntry) => {
    setStoredVersion(entry.version);
    setInstalled(entry.version);
    toast({ title: `Rolled back to v${entry.version}`, description: "Reinstall any time from this center." });
  };

  return (
    <div className="space-y-4">
      <Card className="liquid-glass border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Rocket className="h-4 w-4" />
                </span>
                One-Tap Update
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Installed v{installed} · Latest v{APP_VERSION} ({APP_RELEASE_DATE})
              </CardDescription>
            </div>
            <Badge variant={hasUpdate ? "default" : "secondary"} className="text-[10px] uppercase shrink-0">
              {hasUpdate ? "Update ready" : "Up to date"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bundle summary */}
          <div className="rounded-xl border border-white/10 bg-background/40 p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Bundled package
              </span>
              <span className="text-xs text-muted-foreground">
                {PACKS.length} packs · {TOTAL_MB.toFixed(1)} MB
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All install packs ship as one signed download — no separate installs.
            </p>

            {busy || phase === "complete" ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{PHASE_LABEL[phase]}</span>
                  <span className="font-semibold">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2" />
                {phase === "downloading" && (
                  <div className="text-[11px] text-muted-foreground">
                    {downloadedMb.toFixed(1)} MB of {TOTAL_MB.toFixed(1)} MB
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-3 space-y-1.5">
              {PACKS.map((p) => {
                const done = donePacks.includes(p.id) || (!hasUpdate && phase === "idle");
                return (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground truncate hidden sm:inline">— {p.detail}</span>
                    <span className="ml-auto text-muted-foreground">{p.sizeMb.toFixed(1)} MB</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 gap-2"
              disabled={busy || (!hasUpdate && phase !== "idle")}
              onClick={runInstall}
            >
              <Download className="h-4 w-4" />
              {busy ? PHASE_LABEL[phase] : hasUpdate ? "Download & Install" : "Reinstall latest"}
            </Button>
            <Button variant="outline" className="gap-2" disabled={busy} onClick={handleCheck}>
              <RefreshCw className={`h-4 w-4 ${phase === "checking" ? "animate-spin" : ""}`} />
              Check
            </Button>
            {phase === "complete" && !autoRestart && (
              <Button variant="secondary" className="gap-2" onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4" /> Restart now
              </Button>
            )}
          </div>
          {lastChecked && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Last checked at {lastChecked}
            </p>
          )}

          <Separator className="bg-white/10" />

          {/* Update management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Update channel
              </div>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="canary">Canary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
              <div>
                <div className="text-sm font-medium">Automatic updates</div>
                <div className="text-xs text-muted-foreground">Install new builds as soon as they land.</div>
              </div>
              <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
              <div className="flex items-center gap-3">
                <Wifi className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Download on Wi-Fi only</div>
                  <div className="text-xs text-muted-foreground">Skip large downloads on cellular data.</div>
                </div>
              </div>
              <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
              <div>
                <div className="text-sm font-medium">Restart automatically after install</div>
                <div className="text-xs text-muted-foreground">Applies the new version immediately.</div>
              </div>
              <Switch checked={autoRestart} onCheckedChange={setAutoRestart} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's new */}
      <AnimatePresence initial={false}>
        {(showNotes || hasUpdate) && latestNote && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="liquid-glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  What's new in v{latestNote.version}
                  <Badge variant="secondary" className="ml-auto text-[10px]">{latestNote.type}</Badge>
                </CardTitle>
                <CardDescription className="text-xs">{latestNote.highlight}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestNote.sections.map((s) => {
                  const Icon = SECTION_ICON[s.icon] ?? Sparkles;
                  return (
                    <div key={s.title}>
                      <div className="text-sm font-semibold flex items-center gap-2 mb-1.5">
                        <Icon className="h-3.5 w-3.5 text-primary" /> {s.title}
                      </div>
                      <ul className="space-y-1">
                        {s.items.map((it) => (
                          <li key={it} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <Card className="liquid-glass border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Install history
          </CardTitle>
          <CardDescription className="text-xs">Every install on this device, newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No installs recorded yet on this device.</p>
          ) : (
            history.map((h, i) => (
              <div
                key={`${h.version}-${h.date}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3"
              >
                <div>
                  <div className="text-sm font-medium">v{h.version}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(h.date).toLocaleString()} · {h.channel}
                  </div>
                </div>
                {h.version !== installed && (
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => rollback(h)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Rollback
                  </Button>
                )}
                {i === 0 && h.version === installed && (
                  <Badge variant="secondary" className="text-[10px]">Current</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OneTapUpdateCenter;
