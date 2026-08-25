import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, ShieldCheck, Palette, EyeOff, BellRing, Ruler, MessageSquare,
  Database, Terminal, Info, Gauge, Timer, Zap, Cloud, Lock, Wand2, Activity,
  KeyRound, Search, History, PackageCheck, RotateCcw, Copy, Download, Trash2,
  Moon, Sun, Volume2, Globe, Fingerprint, HeartPulse, Calendar,
} from "lucide-react";
import {
  APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES,
  getInstalledVersion, setInstalledVersion, getActiveFeatureRelease,
} from "@/lib/app-version";

/* ------------------------------- primitives ------------------------------- */

function readJson<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted<T extends Record<string, unknown>>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readJson(key, initial));
  const patch = useCallback((p: Partial<T>) => {
    setState((prev) => {
      const next = { ...prev, ...p };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      window.dispatchEvent(new CustomEvent("fitfusion-settings-changed", { detail: { key, value: next } }));
      return next;
    });
  }, [key]);
  return [state, patch] as const;
}

const Toggle = ({
  icon: Icon, title, desc, checked, onChange,
}: { icon: React.ElementType; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0">
        <Label className="text-sm font-medium">{title}</Label>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const Panel = ({
  title, desc, icon: Icon, badge, children,
}: { title: string; desc: string; icon: React.ElementType; badge?: string; children: React.ReactNode }) => (
  <Card className="border-primary/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />{title}
        {badge && <Badge variant="secondary" className="ml-auto text-[10px]">{badge}</Badge>}
      </CardTitle>
      <CardDescription>{desc}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const SliderRow = ({
  label, value, min, max, step, suffix, onChange,
}: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) => (
  <div className="rounded-xl border border-border/50 p-3 space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Badge variant="outline">{value}{suffix}</Badge>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
  </div>
);

const Pick = ({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

/* --------------------------------- ACCOUNT -------------------------------- */

export function AccountNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-account-nova", {
    trainingSplit: "push / pull / legs",
    weeklySessions: 4,
    experience: "intermediate",
    coachTone: "motivating",
    autoRestDays: true,
    calendarSync: false,
    signatureQuote: "",
  });

  return (
    <Panel title="Training Identity" desc="Shape how FitXFusion plans and speaks to you" icon={Sparkles} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <Pick label="Training split" value={cfg.trainingSplit}
          options={["full body", "upper / lower", "push / pull / legs", "bro split", "hybrid endurance"]}
          onChange={(v) => patch({ trainingSplit: v })} />
        <Pick label="Experience" value={cfg.experience}
          options={["beginner", "intermediate", "advanced", "athlete"]}
          onChange={(v) => patch({ experience: v })} />
      </div>
      <SliderRow label="Sessions per week" value={cfg.weeklySessions} min={1} max={14} step={1} suffix="x" onChange={(v) => patch({ weeklySessions: v })} />
      <Pick label="Coach tone" value={cfg.coachTone} options={["motivating", "calm", "drill sergeant", "scientific", "minimal"]} onChange={(v) => patch({ coachTone: v })} />
      <Toggle icon={Calendar} title="Auto rest days" desc="Insert recovery days when readiness drops" checked={cfg.autoRestDays} onChange={(v) => patch({ autoRestDays: v })} />
      <Toggle icon={Cloud} title="Calendar sync" desc="Export planned sessions to your device calendar" checked={cfg.calendarSync} onChange={(v) => patch({ calendarSync: v })} />
      <div className="space-y-1.5">
        <Label className="text-sm">Profile signature quote</Label>
        <Textarea value={cfg.signatureQuote} rows={2} maxLength={140} placeholder="No excuses, only reps."
          onChange={(e) => patch({ signatureQuote: e.target.value })} />
      </div>
      <Button className="w-full" onClick={() => toast({ title: "Training identity saved", description: `${cfg.weeklySessions}x/week · ${cfg.trainingSplit}` })}>
        Save training identity
      </Button>
    </Panel>
  );
}

/* -------------------------------- SECURITY -------------------------------- */

export function SecurityNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-security-nova", {
    trustedDeviceDays: 30,
    blockUnknownDevices: false,
    requireBiometricExport: true,
    maskSensitiveData: true,
    loginAlertEmail: true,
    failedAttemptLimit: 5,
  });

  const score = useMemo(() => {
    let s = 40;
    if (cfg.blockUnknownDevices) s += 15;
    if (cfg.requireBiometricExport) s += 15;
    if (cfg.maskSensitiveData) s += 10;
    if (cfg.loginAlertEmail) s += 10;
    if (cfg.failedAttemptLimit <= 5) s += 10;
    return Math.min(100, s);
  }, [cfg]);

  return (
    <Panel title="Device Trust & Hardening" desc="Control device trust, exports and alerting" icon={ShieldCheck} badge="New">
      <div className="rounded-xl border border-border/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Hardening score</Label>
          <Badge variant={score >= 80 ? "default" : "outline"}>{score}/100</Badge>
        </div>
        <Progress value={score} className="h-2" />
      </div>
      <SliderRow label="Trusted device expiry" value={cfg.trustedDeviceDays} min={1} max={180} step={1} suffix=" days" onChange={(v) => patch({ trustedDeviceDays: v })} />
      <SliderRow label="Failed unlock limit" value={cfg.failedAttemptLimit} min={3} max={15} step={1} suffix=" tries" onChange={(v) => patch({ failedAttemptLimit: v })} />
      <Toggle icon={Fingerprint} title="Biometric for data export" desc="Require Face/Touch unlock before exporting data" checked={cfg.requireBiometricExport} onChange={(v) => patch({ requireBiometricExport: v })} />
      <Toggle icon={Lock} title="Block unknown devices" desc="New devices must be approved from a trusted session" checked={cfg.blockUnknownDevices} onChange={(v) => patch({ blockUnknownDevices: v })} />
      <Toggle icon={EyeOff} title="Mask sensitive values" desc="Hide weight, health and billing values until tapped" checked={cfg.maskSensitiveData} onChange={(v) => patch({ maskSensitiveData: v })} />
      <Toggle icon={KeyRound} title="Email login alerts" desc="Notify me by email on every new sign-in" checked={cfg.loginAlertEmail} onChange={(v) => patch({ loginAlertEmail: v })} />
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Security posture re-checked", description: `Hardening score ${score}/100.` })}>
        Run security self-check
      </Button>
    </Panel>
  );
}

/* --------------------------------- DISPLAY -------------------------------- */

export function DisplayNovaExtras() {
  const [cfg, patch] = usePersisted("fitfusion-display-nova", {
    cornerRadius: 16,
    accentHue: 217,
    glassStrength: 16,
    dimAfterDark: false,
    compactCards: false,
    animatedGradients: true,
  });

  const apply = (p: Partial<typeof cfg>) => {
    patch(p);
    const root = document.documentElement;
    if (p.cornerRadius !== undefined) root.style.setProperty("--radius", `${p.cornerRadius}px`);
    if (p.glassStrength !== undefined) root.style.setProperty("--glass-blur", `${p.glassStrength}px`);
    if (p.accentHue !== undefined) root.style.setProperty("--nova-accent-hue", String(p.accentHue));
    if (p.compactCards !== undefined) root.classList.toggle("compact-cards", p.compactCards);
    if (p.animatedGradients !== undefined) root.classList.toggle("no-animated-gradients", !p.animatedGradients);
  };

  useEffect(() => { apply(cfg); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <Panel title="Interface Studio" desc="Live-tune shape, glass and colour of the UI" icon={Palette} badge="New">
      <SliderRow label="Corner radius" value={cfg.cornerRadius} min={0} max={28} step={2} suffix="px" onChange={(v) => apply({ cornerRadius: v })} />
      <SliderRow label="Glass blur strength" value={cfg.glassStrength} min={0} max={32} step={2} suffix="px" onChange={(v) => apply({ glassStrength: v })} />
      <SliderRow label="Accent hue" value={cfg.accentHue} min={0} max={360} step={1} suffix="°" onChange={(v) => apply({ accentHue: v })} />
      <Toggle icon={Gauge} title="Compact cards" desc="Tighter padding to fit more on screen" checked={cfg.compactCards} onChange={(v) => apply({ compactCards: v })} />
      <Toggle icon={Sparkles} title="Animated gradients" desc="Subtle motion on hero surfaces" checked={cfg.animatedGradients} onChange={(v) => apply({ animatedGradients: v })} />
      <Toggle icon={Moon} title="Dim after sunset" desc="Lower brightness of surfaces in the evening" checked={cfg.dimAfterDark} onChange={(v) => apply({ dimAfterDark: v })} />
      <Button variant="outline" className="w-full" onClick={() => apply({ cornerRadius: 16, glassStrength: 16, accentHue: 217, compactCards: false, animatedGradients: true })}>
        <RotateCcw className="h-4 w-4 mr-2" />Reset interface studio
      </Button>
    </Panel>
  );
}

/* --------------------------------- PRIVACY -------------------------------- */

export function PrivacyNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-privacy-nova", {
    anonymousLeaderboard: false,
    blurProgressPhotos: true,
    stripPhotoMetadata: true,
    shareHealthWithCoach: false,
    autoDeleteChats: 0,
    incognitoWorkouts: false,
  });
  return (
    <Panel title="Data Minimisation" desc="Limit what leaves your device and how long it lives" icon={EyeOff} badge="New">
      <Toggle icon={EyeOff} title="Anonymous on leaderboards" desc="Show as “Athlete” instead of your name" checked={cfg.anonymousLeaderboard} onChange={(v) => patch({ anonymousLeaderboard: v })} />
      <Toggle icon={Lock} title="Blur progress photos" desc="Photos stay blurred until you tap to reveal" checked={cfg.blurProgressPhotos} onChange={(v) => patch({ blurProgressPhotos: v })} />
      <Toggle icon={ShieldCheck} title="Strip photo metadata" desc="Remove GPS and device info before upload" checked={cfg.stripPhotoMetadata} onChange={(v) => patch({ stripPhotoMetadata: v })} />
      <Toggle icon={HeartPulse} title="Share health with coach" desc="Allow AI coach to read heart-rate and sleep data" checked={cfg.shareHealthWithCoach} onChange={(v) => patch({ shareHealthWithCoach: v })} />
      <Toggle icon={Activity} title="Incognito workouts" desc="Log sessions privately, hidden from the feed" checked={cfg.incognitoWorkouts} onChange={(v) => patch({ incognitoWorkouts: v })} />
      <SliderRow label="Auto-delete chats after" value={cfg.autoDeleteChats} min={0} max={365} step={5} suffix={cfg.autoDeleteChats === 0 ? " (off)" : " days"} onChange={(v) => patch({ autoDeleteChats: v })} />
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Privacy rules applied", description: "New rules take effect immediately on this device." })}>
        Apply privacy rules
      </Button>
    </Panel>
  );
}

/* ------------------------------ NOTIFICATIONS ----------------------------- */

export function NotificationNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-notification-nova", {
    workoutReminderTime: "18:00",
    hydrationEvery: 90,
    streakRescue: true,
    prCelebration: true,
    sound: "chime",
    vibrate: true,
  });

  const testNotification = async () => {
    try {
      if (!("Notification" in window)) throw new Error("unsupported");
      const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (perm !== "granted") { toast({ title: "Notifications blocked", description: "Enable them in the Permission Center.", variant: "destructive" }); return; }
      new Notification("FitXFusion", { body: "This is how your reminders will look." });
      toast({ title: "Test notification sent" });
    } catch {
      toast({ title: "Preview shown in-app", description: "This device does not support web notifications." });
    }
  };

  return (
    <Panel title="Smart Reminders" desc="Timing, tone and rescue alerts" icon={BellRing} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Daily workout nudge</Label>
          <Input type="time" className="h-9" value={cfg.workoutReminderTime} onChange={(e) => patch({ workoutReminderTime: e.target.value })} />
        </div>
        <Pick label="Alert sound" value={cfg.sound} options={["chime", "pulse", "beep", "silent"]} onChange={(v) => patch({ sound: v })} />
      </div>
      <SliderRow label="Hydration reminder interval" value={cfg.hydrationEvery} min={30} max={240} step={15} suffix=" min" onChange={(v) => patch({ hydrationEvery: v })} />
      <Toggle icon={Zap} title="Streak rescue alert" desc="Ping me late in the day if my streak is at risk" checked={cfg.streakRescue} onChange={(v) => patch({ streakRescue: v })} />
      <Toggle icon={Sparkles} title="PR celebrations" desc="Instant alert when you beat a personal record" checked={cfg.prCelebration} onChange={(v) => patch({ prCelebration: v })} />
      <Toggle icon={Volume2} title="Vibrate with alerts" desc="Haptic feedback alongside notifications" checked={cfg.vibrate} onChange={(v) => patch({ vibrate: v })} />
      <Button variant="outline" className="w-full" onClick={testNotification}>Send test notification</Button>
    </Panel>
  );
}

/* ---------------------------------- UNITS --------------------------------- */

const PACE_FACTOR = 0.621371;

export function UnitsNovaExtras() {
  const [cfg, patch] = usePersisted("fitfusion-units-nova", {
    energy: "kcal", pace: "min/km", temperature: "celsius", waterUnit: "ml", clock: "24h", firstDayNumeric: 1,
  });
  const [pace, setPace] = useState("5:30");

  const converted = useMemo(() => {
    const [m, s] = pace.split(":").map((n) => parseInt(n, 10));
    if (Number.isNaN(m)) return "—";
    const total = m * 60 + (Number.isNaN(s) ? 0 : s);
    const other = cfg.pace === "min/km" ? total / PACE_FACTOR : total * PACE_FACTOR;
    return `${Math.floor(other / 60)}:${String(Math.round(other % 60)).padStart(2, "0")} ${cfg.pace === "min/km" ? "min/mi" : "min/km"}`;
  }, [pace, cfg.pace]);

  return (
    <Panel title="Measurement Studio" desc="Every unit the app uses, plus a live pace converter" icon={Ruler} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <Pick label="Energy" value={cfg.energy} options={["kcal", "kJ"]} onChange={(v) => patch({ energy: v })} />
        <Pick label="Pace" value={cfg.pace} options={["min/km", "min/mi"]} onChange={(v) => patch({ pace: v })} />
        <Pick label="Temperature" value={cfg.temperature} options={["celsius", "fahrenheit"]} onChange={(v) => patch({ temperature: v })} />
        <Pick label="Water" value={cfg.waterUnit} options={["ml", "fl oz", "cups"]} onChange={(v) => patch({ waterUnit: v })} />
        <Pick label="Clock" value={cfg.clock} options={["24h", "12h"]} onChange={(v) => patch({ clock: v })} />
      </div>
      <div className="rounded-xl border border-border/50 p-3 space-y-2">
        <Label className="text-sm">Pace converter ({cfg.pace})</Label>
        <div className="flex items-center gap-2">
          <Input className="h-9" value={pace} onChange={(e) => setPace(e.target.value)} placeholder="5:30" />
          <Badge variant="outline" className="shrink-0">{converted}</Badge>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- CHAT ---------------------------------- */

export function ChatNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-chat-nova", {
    bubbleStyle: "rounded", sendOnEnter: true, showTypingIndicator: true, autoTranslate: false,
    language: "english", readReceipts: true, historyLimit: 200,
  });
  return (
    <Panel title="Conversation Controls" desc="Composer behaviour, bubbles and history" icon={MessageSquare} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <Pick label="Bubble style" value={cfg.bubbleStyle} options={["rounded", "square", "minimal"]} onChange={(v) => patch({ bubbleStyle: v })} />
        <Pick label="Assistant language" value={cfg.language} options={["english", "hindi", "spanish", "french", "german"]} onChange={(v) => patch({ language: v })} />
      </div>
      <SliderRow label="Keep last messages" value={cfg.historyLimit} min={50} max={1000} step={50} suffix="" onChange={(v) => patch({ historyLimit: v })} />
      <Toggle icon={Zap} title="Send on Enter" desc="Enter sends, Shift+Enter adds a new line" checked={cfg.sendOnEnter} onChange={(v) => patch({ sendOnEnter: v })} />
      <Toggle icon={Activity} title="Typing indicator" desc="Show when the coach is composing a reply" checked={cfg.showTypingIndicator} onChange={(v) => patch({ showTypingIndicator: v })} />
      <Toggle icon={Globe} title="Auto-translate replies" desc="Translate incoming messages to your language" checked={cfg.autoTranslate} onChange={(v) => patch({ autoTranslate: v })} />
      <Toggle icon={ShieldCheck} title="Read receipts" desc="Let others see when you read a message" checked={cfg.readReceipts} onChange={(v) => patch({ readReceipts: v })} />
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Chat preferences saved" })}>Save chat preferences</Button>
    </Panel>
  );
}

/* ---------------------------------- DATA ---------------------------------- */

export function DataNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-data-nova", {
    syncOnCellular: true, backupFrequency: "daily", conflictStrategy: "newest wins", compressUploads: true,
  });
  const [usage, setUsage] = useState<{ keys: number; bytes: number }>({ keys: 0, bytes: 0 });

  const scan = useCallback(() => {
    let bytes = 0, keys = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      keys++;
      bytes += k.length + (localStorage.getItem(k)?.length ?? 0);
    }
    setUsage({ keys, bytes });
  }, []);

  useEffect(() => { scan(); }, [scan]);

  const exportAll = () => {
    const dump: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("fitfusion")) dump[k] = localStorage.getItem(k) ?? "";
    }
    const blob = new Blob([JSON.stringify({ version: APP_VERSION, exportedAt: new Date().toISOString(), data: dump }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitxfusion-settings-${APP_VERSION}.json`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Settings exported", description: `${Object.keys(dump).length} entries saved.` });
  };

  const clearCaches = async () => {
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      scan();
      toast({ title: "Caches cleared", description: "Fresh assets will download on next load." });
    } catch {
      toast({ title: "Could not clear caches", variant: "destructive" });
    }
  };

  return (
    <Panel title="Storage & Sync Rules" desc="Local footprint, backups and conflict handling" icon={Database} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Local entries</p>
          <p className="text-lg font-semibold">{usage.keys}</p>
        </div>
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Local size</p>
          <p className="text-lg font-semibold">{(usage.bytes / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Pick label="Backup frequency" value={cfg.backupFrequency} options={["hourly", "daily", "weekly", "manual"]} onChange={(v) => patch({ backupFrequency: v })} />
        <Pick label="Conflict strategy" value={cfg.conflictStrategy} options={["newest wins", "cloud wins", "device wins", "ask me"]} onChange={(v) => patch({ conflictStrategy: v })} />
      </div>
      <Toggle icon={Cloud} title="Sync on mobile data" desc="Allow background sync when not on Wi-Fi" checked={cfg.syncOnCellular} onChange={(v) => patch({ syncOnCellular: v })} />
      <Toggle icon={Zap} title="Compress uploads" desc="Shrink photos and payloads before sending" checked={cfg.compressUploads} onChange={(v) => patch({ compressUploads: v })} />
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={scan}><RotateCcw className="h-4 w-4 mr-1" />Rescan</Button>
        <Button variant="outline" size="sm" onClick={exportAll}><Download className="h-4 w-4 mr-1" />Export</Button>
        <Button variant="outline" size="sm" onClick={clearCaches}><Trash2 className="h-4 w-4 mr-1" />Caches</Button>
      </div>
    </Panel>
  );
}

/* -------------------------------- DEVELOPER ------------------------------- */

export function DeveloperNovaExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-developer-nova", {
    verboseLogs: false, showRenderCount: false, mockSlowNetwork: false, featureFlagBeta: false,
  });
  const [fps, setFps] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    let frames = 0, last = performance.now();
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) { setFps(frames); frames = 0; last = now; }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const copyDiagnostics = async () => {
    const info = {
      version: APP_VERSION,
      installed: getInstalledVersion(),
      ua: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      fps,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
      toast({ title: "Diagnostics copied to clipboard" });
    } catch {
      toast({ title: "Clipboard blocked", description: "Allow clipboard access in the Permission Center.", variant: "destructive" });
    }
  };

  return (
    <Panel title="Live Diagnostics" desc="Runtime instrumentation and feature flags" icon={Terminal} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Live FPS</p>
          <p className="text-lg font-semibold">{fps || "—"}</p>
        </div>
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Viewport</p>
          <p className="text-lg font-semibold">{window.innerWidth}×{window.innerHeight}</p>
        </div>
      </div>
      <Toggle icon={Terminal} title="Verbose logging" desc="Print detailed logs to the console" checked={cfg.verboseLogs} onChange={(v) => patch({ verboseLogs: v })} />
      <Toggle icon={Gauge} title="Render counters" desc="Overlay component render counts in dev builds" checked={cfg.showRenderCount} onChange={(v) => patch({ showRenderCount: v })} />
      <Toggle icon={Timer} title="Simulate slow network" desc="Throttle requests to test loading states" checked={cfg.mockSlowNetwork} onChange={(v) => patch({ mockSlowNetwork: v })} />
      <Toggle icon={Sparkles} title="Beta feature flags" desc="Enable experimental features early" checked={cfg.featureFlagBeta} onChange={(v) => patch({ featureFlagBeta: v })} />
      <Button variant="outline" className="w-full" onClick={copyDiagnostics}><Copy className="h-4 w-4 mr-2" />Copy diagnostics</Button>
    </Panel>
  );
}

/* ---------------------------------- ABOUT --------------------------------- */

export function AboutNovaExtras() {
  const latest = RELEASE_NOTES[0];
  return (
    <Panel title="Build Information" desc="What exactly is running on this device" icon={Info} badge="New">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["App version", APP_VERSION],
          ["Installed", getInstalledVersion()],
          ["Released", APP_RELEASE_DATE],
          ["Release type", latest.type],
          ["Platform", navigator.platform || "web"],
          ["Language", navigator.language],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="font-medium truncate">{v}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{latest.highlight}</p>
    </Panel>
  );
}

/* ------------------------- UPDATES: version manager ----------------------- */

const CHANNEL_KEY = "fitfusion-update-channel";
const HISTORY_KEY = "fitfusion-update-history";

type HistoryEntry = { version: string; at: string; action: "installed" | "rolled back" };

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.version === "string") : [];
  } catch { return []; }
}

function writeHistory(entries: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 30))); } catch { /* noop */ }
}

export function UpdateNovaCenter() {
  const { toast } = useToast();
  const [installed, setInstalled] = useState(getInstalledVersion());
  const [channel, setChannel] = useState(() => localStorage.getItem(CHANNEL_KEY) || "stable");
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  useEffect(() => {
    const onVersion = () => setInstalled(getInstalledVersion());
    window.addEventListener("versionUpdated", onVersion);
    return () => window.removeEventListener("versionUpdated", onVersion);
  }, []);

  useEffect(() => { localStorage.setItem(CHANNEL_KEY, channel); }, [channel]);

  const updateAvailable = installed !== APP_VERSION || getActiveFeatureRelease() !== APP_VERSION;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RELEASE_NOTES.slice(0, 6);
    return RELEASE_NOTES.filter((r) =>
      r.version.includes(q) ||
      r.highlight.toLowerCase().includes(q) ||
      r.sections.some((s) => s.items.some((i) => i.toLowerCase().includes(q)))
    ).slice(0, 8);
  }, [query]);

  const pushHistory = (entry: HistoryEntry) => {
    const next = [entry, ...history];
    setHistory(next);
    writeHistory(next);
  };

  const install = async () => {
    if (busy) return;
    setBusy(true);
    setProgress(0);
    const steps = [15, 38, 62, 84, 100];
    for (const p of steps) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((res) => { timers.current.push(window.setTimeout(res, 320)); });
      setProgress(p);
    }
    setInstalledVersion(APP_VERSION);
    setInstalled(APP_VERSION);
    pushHistory({ version: APP_VERSION, at: new Date().toISOString(), action: "installed" });
    setBusy(false);
    toast({ title: `FitXFusion ${APP_VERSION} installed`, description: "All new features are unlocked." });
  };

  const rollback = () => {
    const previous = history.find((h) => h.version !== installed)?.version;
    if (!previous) { toast({ title: "No previous build recorded", variant: "destructive" }); return; }
    setInstalledVersion(previous);
    setInstalled(previous);
    pushHistory({ version: previous, at: new Date().toISOString(), action: "rolled back" });
    toast({ title: `Rolled back to ${previous}` });
  };

  const check = async () => {
    setCheckedAt(new Date());
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
    } catch { /* noop */ }
    toast({
      title: updateAvailable ? "Update available" : "You're up to date",
      description: updateAvailable ? `Version ${APP_VERSION} is ready to install.` : `Running ${APP_VERSION} on the ${channel} channel.`,
    });
  };

  return (
    <Panel title="Version Management Center" desc="Channels, install history, rollback and changelog search" icon={PackageCheck} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Installed</p>
          <p className="text-lg font-semibold">v{installed}</p>
        </div>
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Latest</p>
          <p className="text-lg font-semibold flex items-center gap-2">
            v{APP_VERSION}
            {updateAvailable ? <Badge className="text-[10px]">new</Badge> : <Badge variant="outline" className="text-[10px]">current</Badge>}
          </p>
        </div>
      </div>

      <Pick label="Update channel" value={channel} options={["stable", "beta", "canary"]} onChange={setChannel} />

      {busy && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">Installing update… {progress}%</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" onClick={install} disabled={busy || !updateAvailable}>
          <Download className="h-4 w-4 mr-1" />{updateAvailable ? "Install" : "Installed"}
        </Button>
        <Button size="sm" variant="outline" onClick={check} disabled={busy}><RotateCcw className="h-4 w-4 mr-1" />Check</Button>
        <Button size="sm" variant="outline" onClick={rollback} disabled={busy}><History className="h-4 w-4 mr-1" />Rollback</Button>
      </div>
      {checkedAt && <p className="text-xs text-muted-foreground">Last checked {checkedAt.toLocaleTimeString()}</p>}

      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2"><Search className="h-3.5 w-3.5" />Search the changelog</Label>
        <Input className="h-9" placeholder="e.g. passkey, settings, network" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.length === 0 && <p className="text-xs text-muted-foreground">No release notes match “{query}”.</p>}
          {filtered.map((r) => (
            <div key={r.version} className="rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">v{r.version}</p>
                <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.date} · {r.highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Install history</Label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {history.slice(0, 8).map((h, i) => (
              <div key={`${h.version}-${h.at}-${i}`} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-xs">
                <span className="font-medium">v{h.version}</span>
                <span className="text-muted-foreground">{h.action} · {new Date(h.at).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => { setHistory([]); writeHistory([]); toast({ title: "Update history cleared" }); }}>
            Clear history
          </Button>
        </div>
      )}
    </Panel>
  );
}
