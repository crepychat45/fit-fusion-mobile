import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, ShieldCheck, Palette, EyeOff, BellRing, Ruler, MessageSquare, Database,
  Terminal, Info, Gauge, Timer, Zap, Lock, Activity, Copy, Download, Trash2,
  Globe, HeartPulse, Calendar, Rocket, ClipboardCheck, Wifi, BatteryCharging,
  FileClock, Layers, Target, Coffee, Flame,
} from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";

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

export function AccountPrimeExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-account-prime", {
    displayHandle: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    weekStart: "Monday",
    trainingWindow: "evening",
    restDayReminder: true,
    autoDeload: true,
    deloadEvery: 6,
    dailyMoveGoal: 45,
  });

  return (
    <Panel title="Routine Profile" desc="Personal training rhythm used across plans and reminders" icon={Calendar} badge="New">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Display handle</Label>
          <Input
            className="h-9"
            placeholder="@yourname"
            value={cfg.displayHandle}
            onChange={(e) => patch({ displayHandle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Time zone</Label>
          <Input className="h-9" value={cfg.timezone} onChange={(e) => patch({ timezone: e.target.value })} />
        </div>
        <Pick label="Week starts on" value={cfg.weekStart} options={["Monday", "Sunday", "Saturday"]} onChange={(v) => patch({ weekStart: v })} />
        <Pick label="Preferred training window" value={cfg.trainingWindow} options={["morning", "midday", "evening", "night"]} onChange={(v) => patch({ trainingWindow: v })} />
      </div>
      <SliderRow label="Daily move goal" value={cfg.dailyMoveGoal} min={10} max={180} step={5} suffix=" min" onChange={(v) => patch({ dailyMoveGoal: v })} />
      <SliderRow label="Auto deload every" value={cfg.deloadEvery} min={3} max={16} step={1} suffix=" wks" onChange={(v) => patch({ deloadEvery: v })} />
      <Toggle icon={Coffee} title="Rest-day reminder" desc="Nudge to recover when load spikes" checked={cfg.restDayReminder} onChange={(v) => patch({ restDayReminder: v })} />
      <Toggle icon={Activity} title="Automatic deload weeks" desc="Reduce planned volume on schedule" checked={cfg.autoDeload} onChange={(v) => patch({ autoDeload: v })} />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => toast({ title: "Routine profile applied", description: `Week starts ${cfg.weekStart} · ${cfg.dailyMoveGoal} min/day goal.` })}
      >
        <Target className="h-4 w-4 mr-2" />Apply routine profile
      </Button>
    </Panel>
  );
}

/* -------------------------------- SECURITY -------------------------------- */

export function SecurityPrimeExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-security-prime", {
    reauthOnSensitive: true,
    blockScreenshots: false,
    clipboardAutoClear: true,
    clipboardSeconds: 30,
    trustedNetworksOnly: false,
    panicWipe: false,
    loginAlertEmail: true,
  });

  const score = useMemo(() => {
    const on = [cfg.reauthOnSensitive, cfg.blockScreenshots, cfg.clipboardAutoClear, cfg.trustedNetworksOnly, cfg.loginAlertEmail].filter(Boolean).length;
    return Math.round((on / 5) * 100);
  }, [cfg]);

  return (
    <Panel title="Session Shield" desc="Extra hardening for this device and session" icon={ShieldCheck} badge="New">
      <div className="rounded-xl border border-border/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Hardening score</span>
          <Badge variant={score >= 80 ? "default" : "outline"}>{score}%</Badge>
        </div>
        <Progress value={score} className="h-2" />
      </div>
      <Toggle icon={Lock} title="Re-authenticate for sensitive actions" desc="Ask again before exports and key changes" checked={cfg.reauthOnSensitive} onChange={(v) => patch({ reauthOnSensitive: v })} />
      <Toggle icon={EyeOff} title="Discourage screenshots" desc="Blur sensitive panels when the app loses focus" checked={cfg.blockScreenshots} onChange={(v) => patch({ blockScreenshots: v })} />
      <Toggle icon={Copy} title="Auto-clear clipboard" desc="Wipe copied codes after a short delay" checked={cfg.clipboardAutoClear} onChange={(v) => patch({ clipboardAutoClear: v })} />
      {cfg.clipboardAutoClear && (
        <SliderRow label="Clipboard lifetime" value={cfg.clipboardSeconds} min={5} max={120} step={5} suffix="s" onChange={(v) => patch({ clipboardSeconds: v })} />
      )}
      <Toggle icon={Wifi} title="Trusted networks only" desc="Warn when syncing on unknown Wi-Fi" checked={cfg.trustedNetworksOnly} onChange={(v) => patch({ trustedNetworksOnly: v })} />
      <Toggle icon={BellRing} title="Email me about new sign-ins" desc="Alert on logins from new devices" checked={cfg.loginAlertEmail} onChange={(v) => patch({ loginAlertEmail: v })} />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          try { navigator.clipboard.writeText(""); } catch { /* noop */ }
          toast({ title: "Clipboard cleared", description: "Any copied credential has been removed." });
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />Clear clipboard now
      </Button>
    </Panel>
  );
}

/* --------------------------------- DISPLAY -------------------------------- */

export function DisplayPrimeExtras() {
  const [cfg, patch] = usePersisted("fitfusion-display-prime", {
    contentWidth: 100,
    lineHeight: 150,
    letterSpacing: 0,
    boldText: false,
    highContrast: false,
    dimImages: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--prime-content-width", `${cfg.contentWidth}%`);
    root.style.setProperty("--prime-line-height", String(cfg.lineHeight / 100));
    root.style.setProperty("--prime-letter-spacing", `${cfg.letterSpacing / 100}em`);
    root.style.lineHeight = String(cfg.lineHeight / 100);
    root.style.letterSpacing = `${cfg.letterSpacing / 100}em`;
    root.style.fontWeight = cfg.boldText ? "600" : "";
    root.classList.toggle("prime-high-contrast", cfg.highContrast);
    root.style.setProperty("--prime-image-opacity", cfg.dimImages ? "0.82" : "1");
  }, [cfg]);

  return (
    <Panel title="Readability Studio" desc="Live typography and contrast tuning" icon={Palette} badge="New">
      <SliderRow label="Content width" value={cfg.contentWidth} min={70} max={100} step={5} suffix="%" onChange={(v) => patch({ contentWidth: v })} />
      <SliderRow label="Line height" value={cfg.lineHeight} min={110} max={200} step={5} suffix="%" onChange={(v) => patch({ lineHeight: v })} />
      <SliderRow label="Letter spacing" value={cfg.letterSpacing} min={-2} max={8} step={1} suffix="/100em" onChange={(v) => patch({ letterSpacing: v })} />
      <Toggle icon={Zap} title="Bold text" desc="Heavier weight for all body copy" checked={cfg.boldText} onChange={(v) => patch({ boldText: v })} />
      <Toggle icon={Gauge} title="High contrast" desc="Stronger separation between surfaces" checked={cfg.highContrast} onChange={(v) => patch({ highContrast: v })} />
      <Toggle icon={EyeOff} title="Dim media" desc="Soften bright imagery at night" checked={cfg.dimImages} onChange={(v) => patch({ dimImages: v })} />
    </Panel>
  );
}

/* --------------------------------- PRIVACY -------------------------------- */

export function PrivacyPrimeExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-privacy-prime", {
    shareWorkoutSummary: true,
    hideBodyMetrics: false,
    anonymousLeaderboard: false,
    locationPrecision: "city",
    retentionDays: 180,
  });

  return (
    <Panel title="Sharing & Retention" desc="Control what leaves this device and for how long" icon={EyeOff} badge="New">
      <Toggle icon={Activity} title="Share workout summaries" desc="Publish completed sessions to your feed" checked={cfg.shareWorkoutSummary} onChange={(v) => patch({ shareWorkoutSummary: v })} />
      <Toggle icon={HeartPulse} title="Hide body metrics" desc="Keep weight and measurements private" checked={cfg.hideBodyMetrics} onChange={(v) => patch({ hideBodyMetrics: v })} />
      <Toggle icon={Globe} title="Anonymous leaderboard" desc="Compete without showing your name" checked={cfg.anonymousLeaderboard} onChange={(v) => patch({ anonymousLeaderboard: v })} />
      <Pick label="Location precision" value={cfg.locationPrecision} options={["off", "city", "approximate", "precise"]} onChange={(v) => patch({ locationPrecision: v })} />
      <SliderRow label="Keep activity history" value={cfg.retentionDays} min={30} max={730} step={30} suffix=" days" onChange={(v) => patch({ retentionDays: v })} />
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Privacy rules saved", description: `History kept for ${cfg.retentionDays} days.` })}>
        <ClipboardCheck className="h-4 w-4 mr-2" />Save privacy rules
      </Button>
    </Panel>
  );
}

/* ------------------------------ NOTIFICATIONS ----------------------------- */

export function NotificationPrimePanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-notify-prime", {
    dailyDigest: true,
    digestHour: 8,
    streakSaver: true,
    hydrationPings: false,
    hydrationEvery: 90,
    groupSimilar: true,
    maxPerDay: 8,
  });

  return (
    <Panel title="Delivery Rules" desc="Shape how often and when FitXFusion reaches you" icon={BellRing} badge="New">
      <Toggle icon={FileClock} title="Daily digest" desc="One summary instead of scattered alerts" checked={cfg.dailyDigest} onChange={(v) => patch({ dailyDigest: v })} />
      {cfg.dailyDigest && (
        <SliderRow label="Digest hour" value={cfg.digestHour} min={0} max={23} step={1} suffix=":00" onChange={(v) => patch({ digestHour: v })} />
      )}
      <Toggle icon={Flame} title="Streak saver" desc="Remind you before a streak expires" checked={cfg.streakSaver} onChange={(v) => patch({ streakSaver: v })} />
      <Toggle icon={Timer} title="Hydration pings" desc="Periodic water reminders during the day" checked={cfg.hydrationPings} onChange={(v) => patch({ hydrationPings: v })} />
      {cfg.hydrationPings && (
        <SliderRow label="Ping interval" value={cfg.hydrationEvery} min={30} max={240} step={15} suffix=" min" onChange={(v) => patch({ hydrationEvery: v })} />
      )}
      <Toggle icon={Layers} title="Group similar alerts" desc="Bundle likes, comments and badges" checked={cfg.groupSimilar} onChange={(v) => patch({ groupSimilar: v })} />
      <SliderRow label="Daily cap" value={cfg.maxPerDay} min={1} max={30} step={1} suffix=" alerts" onChange={(v) => patch({ maxPerDay: v })} />
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          try {
            if ("Notification" in window) {
              const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
              if (perm === "granted") {
                new Notification("FitXFusion", { body: "Delivery rules are working." });
                toast({ title: "Test notification sent" });
                return;
              }
            }
            toast({ title: "Notifications blocked", description: "Enable them in your browser settings.", variant: "destructive" });
          } catch {
            toast({ title: "Could not send test", variant: "destructive" });
          }
        }}
      >
        <BellRing className="h-4 w-4 mr-2" />Send test notification
      </Button>
    </Panel>
  );
}

/* ---------------------------------- UNITS --------------------------------- */

export function UnitsPrimeExtras() {
  const [cfg, patch] = usePersisted("fitfusion-units-prime", {
    plateUnit: "kg",
    barWeight: 20,
    roundingStep: 2.5,
    energyUnit: "kcal",
  });
  const [target, setTarget] = useState(100);

  const plates = useMemo(() => {
    const perSide = Math.max(0, (target - cfg.barWeight) / 2);
    const sizes = cfg.plateUnit === "kg" ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];
    let left = Math.round(perSide / cfg.roundingStep) * cfg.roundingStep;
    const out: string[] = [];
    for (const s of sizes) {
      const n = Math.floor(left / s);
      if (n > 0) { out.push(`${n}×${s}`); left = +(left - n * s).toFixed(2); }
    }
    return out.length ? out.join("  ·  ") : "bar only";
  }, [target, cfg]);

  return (
    <Panel title="Plate Math" desc="Instant per-side loading for barbell work" icon={Ruler} badge="New">
      <div className="grid grid-cols-2 gap-2">
        <Pick label="Plate unit" value={cfg.plateUnit} options={["kg", "lb"]} onChange={(v) => patch({ plateUnit: v })} />
        <Pick label="Energy unit" value={cfg.energyUnit} options={["kcal", "kJ"]} onChange={(v) => patch({ energyUnit: v })} />
      </div>
      <SliderRow label="Bar weight" value={cfg.barWeight} min={5} max={30} step={2.5} suffix={` ${cfg.plateUnit}`} onChange={(v) => patch({ barWeight: v })} />
      <SliderRow label="Rounding step" value={cfg.roundingStep} min={0.5} max={5} step={0.5} suffix={` ${cfg.plateUnit}`} onChange={(v) => patch({ roundingStep: v })} />
      <div className="space-y-1.5">
        <Label className="text-sm">Target total ({cfg.plateUnit})</Label>
        <Input type="number" className="h-9" value={target} onChange={(e) => setTarget(Number(e.target.value) || 0)} />
      </div>
      <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-sm">
        <span className="text-muted-foreground">Per side: </span>
        <span className="font-semibold">{plates}</span>
      </div>
    </Panel>
  );
}

/* ---------------------------------- CHAT ---------------------------------- */

export function ChatPrimeExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-chat-prime", {
    quickReplies: true,
    autoScroll: true,
    sendOnEnter: true,
    persona: "coach",
    signature: "",
    contextWindow: 12,
  });

  return (
    <Panel title="Conversation Studio" desc="Fine-tune the coaching assistant" icon={MessageSquare} badge="New">
      <Pick label="Assistant persona" value={cfg.persona} options={["coach", "scientist", "hype", "concise"]} onChange={(v) => patch({ persona: v })} />
      <SliderRow label="Context memory" value={cfg.contextWindow} min={4} max={40} step={2} suffix=" msgs" onChange={(v) => patch({ contextWindow: v })} />
      <Toggle icon={Zap} title="Quick replies" desc="Show suggested follow-up chips" checked={cfg.quickReplies} onChange={(v) => patch({ quickReplies: v })} />
      <Toggle icon={Activity} title="Auto-scroll" desc="Follow the newest message" checked={cfg.autoScroll} onChange={(v) => patch({ autoScroll: v })} />
      <Toggle icon={MessageSquare} title="Send on Enter" desc="Shift+Enter inserts a new line" checked={cfg.sendOnEnter} onChange={(v) => patch({ sendOnEnter: v })} />
      <div className="space-y-1.5">
        <Label className="text-sm">Standing instruction</Label>
        <Textarea
          rows={3}
          placeholder="e.g. I train at home with dumbbells only"
          value={cfg.signature}
          onChange={(e) => patch({ signature: e.target.value })}
        />
      </div>
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Chat preferences saved" })}>
        <ClipboardCheck className="h-4 w-4 mr-2" />Save chat preferences
      </Button>
    </Panel>
  );
}

/* ---------------------------------- DATA ---------------------------------- */

export function DataPrimeExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-data-prime", {
    autoBackup: true,
    backupEvery: "daily",
    wifiOnlySync: true,
    compressBackups: true,
  });
  const [size, setSize] = useState<number | null>(null);

  const scan = useCallback(() => {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) bytes += k.length + (localStorage.getItem(k)?.length || 0);
      }
    } catch { /* noop */ }
    setSize(bytes);
  }, []);

  const exportSettings = () => {
    const dump: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fitfusion")) dump[k] = localStorage.getItem(k) || "";
      }
    } catch { /* noop */ }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitxfusion-settings-${APP_VERSION}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Settings exported", description: `${Object.keys(dump).length} keys saved.` });
  };

  return (
    <Panel title="Backup & Footprint" desc="Local storage insight and scheduled backups" icon={Database} badge="New">
      <Toggle icon={BatteryCharging} title="Automatic backup" desc="Snapshot settings and progress on schedule" checked={cfg.autoBackup} onChange={(v) => patch({ autoBackup: v })} />
      <Pick label="Backup frequency" value={cfg.backupEvery} options={["hourly", "daily", "weekly"]} onChange={(v) => patch({ backupEvery: v })} />
      <Toggle icon={Wifi} title="Wi-Fi only sync" desc="Avoid mobile data for large uploads" checked={cfg.wifiOnlySync} onChange={(v) => patch({ wifiOnlySync: v })} />
      <Toggle icon={Layers} title="Compress backups" desc="Smaller files, slightly slower export" checked={cfg.compressBackups} onChange={(v) => patch({ compressBackups: v })} />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={scan}><Gauge className="h-4 w-4 mr-2" />Scan footprint</Button>
        <Button variant="outline" onClick={exportSettings}><Download className="h-4 w-4 mr-2" />Export settings</Button>
      </div>
      {size !== null && (
        <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-sm">
          Local storage in use: <span className="font-semibold">{(size / 1024).toFixed(1)} KB</span>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------- DEVELOPER ------------------------------- */

export function DeveloperPrimeExtras() {
  const { toast } = useToast();
  const [checks, setChecks] = useState<{ name: string; ok: boolean }[]>([]);

  const run = () => {
    const results = [
      { name: "localStorage", ok: (() => { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch { return false; } })() },
      { name: "Service worker", ok: "serviceWorker" in navigator },
      { name: "Notifications", ok: "Notification" in window },
      { name: "WebAuthn", ok: "credentials" in navigator && "PublicKeyCredential" in window },
      { name: "Online", ok: navigator.onLine },
      { name: "IndexedDB", ok: "indexedDB" in window },
    ];
    setChecks(results);
    toast({ title: "Self-test complete", description: `${results.filter((r) => r.ok).length}/${results.length} checks passed.` });
  };

  return (
    <Panel title="Environment Self-Test" desc="Verify platform capabilities on this device" icon={Terminal} badge="New">
      <Button variant="outline" className="w-full" onClick={run}><Zap className="h-4 w-4 mr-2" />Run self-test</Button>
      {checks.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {checks.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-border/50 p-2 text-xs">
              <span>{c.name}</span>
              <Badge variant={c.ok ? "default" : "destructive"}>{c.ok ? "ok" : "no"}</Badge>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-xs space-y-1">
        <div>User agent: <span className="text-muted-foreground break-all">{navigator.userAgent.slice(0, 90)}</span></div>
        <div>Cores: <span className="text-muted-foreground">{navigator.hardwareConcurrency || "n/a"}</span></div>
        <div>Language: <span className="text-muted-foreground">{navigator.language}</span></div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- ABOUT --------------------------------- */

export function AboutPrimeExtras() {
  const { toast } = useToast();
  const latest = RELEASE_NOTES[0];

  const copyDiag = () => {
    const text = [
      `FitXFusion ${APP_VERSION} (${APP_RELEASE_DATE})`,
      `UA: ${navigator.userAgent}`,
      `Viewport: ${window.innerWidth}×${window.innerHeight}`,
      `Online: ${navigator.onLine}`,
    ].join("\n");
    navigator.clipboard?.writeText(text);
    toast({ title: "Diagnostics copied", description: "Paste it into a support request." });
  };

  return (
    <Panel title="Release Summary" desc="What shipped in the current build" icon={Info} badge={`v${APP_VERSION}`}>
      <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-sm">
        <div className="font-semibold">{latest?.version} · {latest?.type}</div>
        <p className="text-xs text-muted-foreground mt-1">{latest?.highlight}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={copyDiag}><Copy className="h-4 w-4 mr-2" />Copy diagnostics</Button>
    </Panel>
  );
}

/* --------------------------------- UPDATES -------------------------------- */

type Readiness = { name: string; ok: boolean; detail: string };

export function UpdatePrimePanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-update-prime", {
    maintenanceWindow: true,
    windowHour: 3,
    meteredBlock: true,
    batteryFloor: 25,
    preDownload: true,
    keepRollback: true,
    rollbackSlots: 2,
    betaChangelogEmail: false,
  });
  const [ready, setReady] = useState<Readiness[]>([]);
  const [checking, setChecking] = useState(false);

  const runPreflight = async () => {
    setChecking(true);
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
      storage?: { estimate?: () => Promise<{ quota?: number; usage?: number }> };
    };
    let battery = "unknown";
    let batteryOk = true;
    try {
      const b = await nav.getBattery?.();
      if (b) {
        battery = `${Math.round(b.level * 100)}%${b.charging ? " charging" : ""}`;
        batteryOk = b.charging || b.level * 100 >= cfg.batteryFloor;
      }
    } catch { /* noop */ }

    let storageDetail = "unknown";
    let storageOk = true;
    try {
      const est = await nav.storage?.estimate?.();
      if (est?.quota) {
        const freeMb = ((est.quota - (est.usage || 0)) / 1024 / 1024).toFixed(0);
        storageDetail = `${freeMb} MB free`;
        storageOk = Number(freeMb) > 60;
      }
    } catch { /* noop */ }

    const conn = nav.connection?.effectiveType || "unknown";
    const results: Readiness[] = [
      { name: "Network", ok: navigator.onLine, detail: navigator.onLine ? conn : "offline" },
      { name: "Data saver", ok: !(cfg.meteredBlock && nav.connection?.saveData), detail: nav.connection?.saveData ? "enabled" : "off" },
      { name: "Battery", ok: batteryOk, detail: battery },
      { name: "Free storage", ok: storageOk, detail: storageDetail },
      { name: "Service worker", ok: "serviceWorker" in navigator, detail: "serviceWorker" in navigator ? "available" : "unsupported" },
      { name: "Rollback slot", ok: cfg.keepRollback, detail: cfg.keepRollback ? `${cfg.rollbackSlots} kept` : "disabled" },
    ];
    setReady(results);
    setChecking(false);
    const failed = results.filter((r) => !r.ok).length;
    toast({
      title: failed ? "Preflight found issues" : "Ready to update",
      description: failed ? `${failed} check(s) need attention.` : "All checks passed for a safe install.",
      variant: failed ? "destructive" : undefined,
    });
  };

  const score = ready.length ? Math.round((ready.filter((r) => r.ok).length / ready.length) * 100) : 0;

  return (
    <Panel title="Update Guard" desc="Preflight checks and install policies for one-tap updates" icon={Rocket} badge="New">
      <div className="rounded-xl border border-border/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Install readiness</span>
          <Badge variant={score >= 80 ? "default" : "outline"}>{ready.length ? `${score}%` : "not checked"}</Badge>
        </div>
        <Progress value={score} className="h-2" />
        <Button variant="outline" className="w-full" onClick={runPreflight} disabled={checking}>
          <ClipboardCheck className="h-4 w-4 mr-2" />{checking ? "Running preflight…" : "Run preflight check"}
        </Button>
      </div>

      {ready.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ready.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-lg border border-border/50 p-2 text-xs">
              <span className="font-medium">{r.name}</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                {r.detail}
                <Badge variant={r.ok ? "default" : "destructive"} className="text-[10px]">{r.ok ? "pass" : "check"}</Badge>
              </span>
            </div>
          ))}
        </div>
      )}

      <Toggle icon={Timer} title="Maintenance window" desc="Install only during a quiet hour" checked={cfg.maintenanceWindow} onChange={(v) => patch({ maintenanceWindow: v })} />
      {cfg.maintenanceWindow && (
        <SliderRow label="Preferred install hour" value={cfg.windowHour} min={0} max={23} step={1} suffix=":00" onChange={(v) => patch({ windowHour: v })} />
      )}
      <Toggle icon={Wifi} title="Block on metered data" desc="Skip installs when data saver is on" checked={cfg.meteredBlock} onChange={(v) => patch({ meteredBlock: v })} />
      <SliderRow label="Minimum battery to install" value={cfg.batteryFloor} min={5} max={80} step={5} suffix="%" onChange={(v) => patch({ batteryFloor: v })} />
      <Toggle icon={Download} title="Pre-download in background" desc="Fetch the bundle early so install is instant" checked={cfg.preDownload} onChange={(v) => patch({ preDownload: v })} />
      <Toggle icon={FileClock} title="Keep rollback snapshots" desc="Restore the previous build if something breaks" checked={cfg.keepRollback} onChange={(v) => patch({ keepRollback: v })} />
      {cfg.keepRollback && (
        <SliderRow label="Rollback slots" value={cfg.rollbackSlots} min={1} max={5} step={1} suffix="" onChange={(v) => patch({ rollbackSlots: v })} />
      )}
      <Toggle icon={BellRing} title="Changelog notifications" desc="Tell me when new release notes are published" checked={cfg.betaChangelogEmail} onChange={(v) => patch({ betaChangelogEmail: v })} />
    </Panel>
  );
}

export function UpdateHealthPanel() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const repair = async () => {
    setBusy(true);
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
      }
      toast({ title: "Update cache repaired", description: "Stale packages cleared. Reload to fetch fresh assets." });
    } catch {
      toast({ title: "Repair failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Update Health" desc="Fix stuck downloads and stale caches" icon={Sparkles} badge={`v${APP_VERSION}`}>
      <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-xs space-y-1">
        <div>Installed build: <span className="font-semibold">{APP_VERSION}</span></div>
        <div>Released: <span className="text-muted-foreground">{APP_RELEASE_DATE}</span></div>
        <div>Channel host: <span className="text-muted-foreground">{window.location.host}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={repair} disabled={busy}><Zap className="h-4 w-4 mr-2" />{busy ? "Repairing…" : "Repair cache"}</Button>
        <Button variant="outline" onClick={() => window.location.reload()}><Rocket className="h-4 w-4 mr-2" />Restart app</Button>
      </div>
    </Panel>
  );
}
