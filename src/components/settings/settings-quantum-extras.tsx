import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, AlarmClock, Baseline, BellDot, Bot, Clock3, Cloud, Coffee, Database,
  Eye, Gauge, HardDrive, KeyRound, Layers, LifeBuoy, Lock, MessageSquareDashed,
  Moon, Radar, Ruler, ScanFace, Share2, Smartphone, Sparkles, Trash2, Wand2, Wifi,
} from "lucide-react";

/* ------------------------------- helpers ------------------------------- */

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
  const update = useCallback(
    (patch: Partial<T>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* storage blocked */
        }
        window.dispatchEvent(new CustomEvent("fitfusion-settings-changed", { detail: { key, next } }));
        return next;
      });
    },
    [key],
  );
  useEffect(() => {
    const sync = () => setState(readJson(key, initial));
    window.addEventListener("fitfusion-settings-hydrated", sync);
    return () => window.removeEventListener("fitfusion-settings-hydrated", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [state, update] as const;
}

const Row: React.FC<{
  icon?: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 p-3">
    <div className="flex min-w-0 items-start gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div className="min-w-0">
        <Label className="text-sm">{title}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Panel: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, badge = "v7.7", children }) => (
  <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-4 w-4 text-primary" />
        {title}
        <Badge variant="outline" className="ml-auto text-[10px]">{badge}</Badge>
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

/* ------------------------------- Account -------------------------------- */

export function AccountQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-account-quantum", {
    focusMode: false,
    focusStart: "21:00",
    focusEnd: "06:00",
    trainerHandoff: false,
    coachTone: "balanced",
    weeklyDigest: true,
    autoPauseStreak: true,
  });

  return (
    <Panel icon={Sparkles} title="Coaching & Focus" description="Tune how FitxFusion coaches you and when it stays quiet.">
      <Row icon={Moon} title="Focus mode window" description="Suppress non-critical coaching between these hours.">
        <Switch checked={s.focusMode} onCheckedChange={(v) => set({ focusMode: v })} />
      </Row>
      {s.focusMode && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Start</Label>
            <Input type="time" value={s.focusStart} onChange={(e) => set({ focusStart: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">End</Label>
            <Input type="time" value={s.focusEnd} onChange={(e) => set({ focusEnd: e.target.value })} />
          </div>
        </div>
      )}
      <Row icon={Bot} title="Coach tone" description="Voice used by the AI coach across the app.">
        <Select value={s.coachTone} onValueChange={(v) => set({ coachTone: v })}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gentle">Gentle</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="drill">Drill sergeant</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Share2} title="Trainer hand-off" description="Allow a linked trainer to view weekly reports.">
        <Switch checked={s.trainerHandoff} onCheckedChange={(v) => set({ trainerHandoff: v })} />
      </Row>
      <Row icon={Clock3} title="Weekly digest" description="Summary of workouts, PRs and streaks every Sunday.">
        <Switch checked={s.weeklyDigest} onCheckedChange={(v) => set({ weeklyDigest: v })} />
      </Row>
      <Row icon={LifeBuoy} title="Streak freeze" description="Auto-pause streaks on rest and travel days.">
        <Switch checked={s.autoPauseStreak} onCheckedChange={(v) => set({ autoPauseStreak: v })} />
      </Row>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => toast({ title: "Coaching preferences applied", description: "Saved to this device and synced on next login." })}
      >
        Apply coaching profile
      </Button>
    </Panel>
  );
}

/* ------------------------------- Security -------------------------------- */

export function SecurityQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-security-quantum", {
    lockOnBackground: true,
    lockDelay: 30,
    failedAttemptWipe: false,
    maxAttempts: 10,
    duressPin: "",
    hideSensitiveInSwitcher: true,
    reauthForExports: true,
  });

  return (
    <Panel icon={Lock} title="Advanced Lock Rules" description="Extra layers on top of PIN, passkey and biometrics.">
      <Row icon={ScanFace} title="Lock when app backgrounded" description="Require unlock as soon as you leave the app.">
        <Switch checked={s.lockOnBackground} onCheckedChange={(v) => set({ lockOnBackground: v })} />
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Lock delay</Label>
          <span className="text-xs font-medium">{s.lockDelay}s</span>
        </div>
        <Slider value={[s.lockDelay]} min={0} max={300} step={5} onValueChange={([v]) => set({ lockDelay: v })} />
      </div>
      <Row icon={KeyRound} title="Re-auth before export" description="Confirm identity before any data leaves the app.">
        <Switch checked={s.reauthForExports} onCheckedChange={(v) => set({ reauthForExports: v })} />
      </Row>
      <Row icon={Eye} title="Hide content in app switcher" description="Blur previews when multitasking.">
        <Switch checked={s.hideSensitiveInSwitcher} onCheckedChange={(v) => set({ hideSensitiveInSwitcher: v })} />
      </Row>
      <Row icon={Trash2} title="Wipe local data after failures" description="Clear cached data after repeated wrong PINs.">
        <Switch checked={s.failedAttemptWipe} onCheckedChange={(v) => set({ failedAttemptWipe: v })} />
      </Row>
      {s.failedAttemptWipe && (
        <div className="rounded-xl border border-border/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm">Max failed attempts</Label>
            <span className="text-xs font-medium">{s.maxAttempts}</span>
          </div>
          <Slider value={[s.maxAttempts]} min={3} max={20} step={1} onValueChange={([v]) => set({ maxAttempts: v })} />
        </div>
      )}
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("fitfusion-security-rules-updated"));
          toast({ title: "Lock rules saved" });
        }}
      >
        Save lock rules
      </Button>
    </Panel>
  );
}

/* ------------------------------- Display -------------------------------- */

export function DisplayQuantumExtras() {
  const [s, set] = usePersisted("fitfusion-display-quantum", {
    cardDensity: "comfortable",
    accentGlow: true,
    dimAfterDark: false,
    chartStyle: "smooth",
    listAnimation: true,
    cornerRadius: 16,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--radius", `${s.cornerRadius}px`);
    root.dataset.density = String(s.cardDensity);
    root.classList.toggle("no-list-animation", !s.listAnimation);
  }, [s.cornerRadius, s.cardDensity, s.listAnimation]);

  return (
    <Panel icon={Layers} title="Interface Fine-Tuning" description="Density, corner radius and chart rendering preferences.">
      <Row icon={Baseline} title="Card density">
        <Select value={s.cardDensity} onValueChange={(v) => set({ cardDensity: v })}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Corner radius</Label>
          <span className="text-xs font-medium">{s.cornerRadius}px</span>
        </div>
        <Slider value={[s.cornerRadius]} min={0} max={28} step={2} onValueChange={([v]) => set({ cornerRadius: v })} />
      </div>
      <Row icon={Sparkles} title="Accent glow" description="Liquid-glass halo behind primary elements.">
        <Switch checked={s.accentGlow} onCheckedChange={(v) => set({ accentGlow: v })} />
      </Row>
      <Row icon={Moon} title="Auto dim after dark" description="Reduce brightness of surfaces in the evening.">
        <Switch checked={s.dimAfterDark} onCheckedChange={(v) => set({ dimAfterDark: v })} />
      </Row>
      <Row icon={Activity} title="Chart style">
        <Select value={s.chartStyle} onValueChange={(v) => set({ chartStyle: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="smooth">Smooth</SelectItem>
            <SelectItem value="stepped">Stepped</SelectItem>
            <SelectItem value="bars">Bars</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Wand2} title="List animations" description="Stagger cards as they enter the viewport.">
        <Switch checked={s.listAnimation} onCheckedChange={(v) => set({ listAnimation: v })} />
      </Row>
    </Panel>
  );
}

/* ------------------------------- Privacy -------------------------------- */

export function PrivacyQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-privacy-quantum", {
    stripMetadata: true,
    anonymiseLeaderboard: false,
    localOnlyHealth: false,
    autoPurgeDays: 0,
    blockThirdPartyMedia: false,
  });

  return (
    <Panel icon={Radar} title="Data Minimisation" description="Reduce what the app stores and shares about you.">
      <Row icon={Eye} title="Strip photo metadata" description="Remove EXIF and GPS before uploads.">
        <Switch checked={s.stripMetadata} onCheckedChange={(v) => set({ stripMetadata: v })} />
      </Row>
      <Row icon={Share2} title="Anonymous on leaderboards" description="Show a nickname instead of your profile.">
        <Switch checked={s.anonymiseLeaderboard} onCheckedChange={(v) => set({ anonymiseLeaderboard: v })} />
      </Row>
      <Row icon={HardDrive} title="Keep health data local" description="Never sync raw sensor data to the cloud.">
        <Switch checked={s.localOnlyHealth} onCheckedChange={(v) => set({ localOnlyHealth: v })} />
      </Row>
      <Row icon={Cloud} title="Block third-party media" description="Only load images and video from FitxFusion.">
        <Switch checked={s.blockThirdPartyMedia} onCheckedChange={(v) => set({ blockThirdPartyMedia: v })} />
      </Row>
      <Row icon={Trash2} title="Auto-purge local logs">
        <Select value={String(s.autoPurgeDays)} onValueChange={(v) => set({ autoPurgeDays: Number(v) })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Never</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          let removed = 0;
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("fitfusion-log-") || k.endsWith("-telemetry")) {
              localStorage.removeItem(k);
              removed++;
            }
          });
          toast({ title: "Local logs purged", description: `${removed} entries removed.` });
        }}
      >
        Purge diagnostic logs now
      </Button>
    </Panel>
  );
}

/* ---------------------------- Notifications ------------------------------ */

export function NotificationQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-notify-quantum", {
    smartTiming: true,
    workoutReminder: "18:00",
    hydrationEvery: 90,
    streakRescue: true,
    prCelebration: true,
    groupSimilar: true,
  });

  return (
    <Panel icon={BellDot} title="Smart Reminders" description="Reminder scheduling that adapts to your routine.">
      <Row icon={Sparkles} title="Smart timing" description="Send reminders when you usually train.">
        <Switch checked={s.smartTiming} onCheckedChange={(v) => set({ smartTiming: v })} />
      </Row>
      <Row icon={AlarmClock} title="Daily workout reminder">
        <Input type="time" className="w-32" value={s.workoutReminder} onChange={(e) => set({ workoutReminder: e.target.value })} />
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Hydration nudge interval</Label>
          <span className="text-xs font-medium">{s.hydrationEvery} min</span>
        </div>
        <Slider value={[s.hydrationEvery]} min={30} max={240} step={15} onValueChange={([v]) => set({ hydrationEvery: v })} />
      </div>
      <Row icon={LifeBuoy} title="Streak rescue alert" description="Ping me before a streak expires.">
        <Switch checked={s.streakRescue} onCheckedChange={(v) => set({ streakRescue: v })} />
      </Row>
      <Row icon={Sparkles} title="PR celebrations" description="Notify when a personal record is beaten.">
        <Switch checked={s.prCelebration} onCheckedChange={(v) => set({ prCelebration: v })} />
      </Row>
      <Row icon={Layers} title="Group similar alerts" description="Bundle notifications into one summary.">
        <Switch checked={s.groupSimilar} onCheckedChange={(v) => set({ groupSimilar: v })} />
      </Row>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => toast({ title: "Test reminder", description: "This is how your reminders will appear." })}
      >
        Send test reminder
      </Button>
    </Panel>
  );
}

/* -------------------------------- Units ---------------------------------- */

export function UnitsQuantumExtras() {
  const [s, set] = usePersisted("fitfusion-units-quantum", {
    plateUnit: "kg",
    barWeight: 20,
    paceUnit: "min/km",
    energyUnit: "kcal",
    roundingStep: 2.5,
    tempUnit: "celsius",
  });

  const plateMath = useMemo(() => {
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    let side = (100 - s.barWeight) / 2;
    const used: number[] = [];
    plates.forEach((p) => {
      while (side >= p - 0.001) {
        used.push(p);
        side = Number((side - p).toFixed(3));
      }
    });
    return used;
  }, [s.barWeight]);

  return (
    <Panel icon={Ruler} title="Training Units & Plate Math" description="Bar loading, pace and energy unit preferences.">
      <Row icon={Gauge} title="Plate unit">
        <Select value={s.plateUnit} onValueChange={(v) => set({ plateUnit: v })}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">kg</SelectItem>
            <SelectItem value="lb">lb</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Barbell weight</Label>
          <span className="text-xs font-medium">{s.barWeight} {s.plateUnit}</span>
        </div>
        <Slider value={[s.barWeight]} min={5} max={30} step={2.5} onValueChange={([v]) => set({ barWeight: v })} />
        <p className="mt-2 text-xs text-muted-foreground">
          100 {s.plateUnit} loading per side: {plateMath.join(" + ") || "—"}
        </p>
      </div>
      <Row icon={Activity} title="Pace unit">
        <Select value={s.paceUnit} onValueChange={(v) => set({ paceUnit: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="min/km">min/km</SelectItem>
            <SelectItem value="min/mi">min/mi</SelectItem>
            <SelectItem value="kmh">km/h</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Coffee} title="Energy unit">
        <Select value={s.energyUnit} onValueChange={(v) => set({ energyUnit: v })}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kcal">kcal</SelectItem>
            <SelectItem value="kj">kJ</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Baseline} title="Weight rounding">
        <Select value={String(s.roundingStep)} onValueChange={(v) => set({ roundingStep: Number(v) })}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2.5">2.5</SelectItem>
            <SelectItem value="5">5</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Moon} title="Temperature unit">
        <Select value={s.tempUnit} onValueChange={(v) => set({ tempUnit: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="celsius">Celsius</SelectItem>
            <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
          </SelectContent>
        </Select>
      </Row>
    </Panel>
  );
}

/* -------------------------------- Chat ----------------------------------- */

export function ChatQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-chat-quantum", {
    autoTranslate: false,
    smartReplies: true,
    readReceipts: true,
    retentionDays: 90,
    draftRecovery: true,
    typingIndicator: true,
  });

  return (
    <Panel icon={MessageSquareDashed} title="Conversation Controls" description="Retention, replies and messaging behaviour.">
      <Row icon={Bot} title="Smart replies" description="Suggest quick answers under messages.">
        <Switch checked={s.smartReplies} onCheckedChange={(v) => set({ smartReplies: v })} />
      </Row>
      <Row icon={Wand2} title="Auto-translate" description="Translate incoming messages to your language.">
        <Switch checked={s.autoTranslate} onCheckedChange={(v) => set({ autoTranslate: v })} />
      </Row>
      <Row icon={Eye} title="Read receipts">
        <Switch checked={s.readReceipts} onCheckedChange={(v) => set({ readReceipts: v })} />
      </Row>
      <Row icon={Activity} title="Typing indicator">
        <Switch checked={s.typingIndicator} onCheckedChange={(v) => set({ typingIndicator: v })} />
      </Row>
      <Row icon={HardDrive} title="Draft recovery" description="Restore unsent messages after a crash.">
        <Switch checked={s.draftRecovery} onCheckedChange={(v) => set({ draftRecovery: v })} />
      </Row>
      <Row icon={Clock3} title="Message retention">
        <Select value={String(s.retentionDays)} onValueChange={(v) => set({ retentionDays: Number(v) })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="0">Forever</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("fitfusion-chat-prefs-updated", { detail: s }));
          toast({ title: "Chat preferences applied" });
        }}
      >
        Apply chat preferences
      </Button>
    </Panel>
  );
}

/* -------------------------------- Data ----------------------------------- */

export function DataQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-data-quantum", {
    wifiOnlySync: false,
    backgroundSync: true,
    syncIntervalMin: 15,
    compressUploads: true,
    cacheBudgetMb: 120,
  });
  const [usage, setUsage] = useState<string>("—");

  const measure = useCallback(async () => {
    try {
      const est = await navigator.storage?.estimate?.();
      if (est?.usage != null) {
        setUsage(`${(est.usage / 1024 / 1024).toFixed(1)} MB used`);
        return;
      }
    } catch {
      /* ignore */
    }
    const bytes = Object.keys(localStorage).reduce((sum, k) => sum + (localStorage.getItem(k)?.length ?? 0), 0);
    setUsage(`${(bytes / 1024).toFixed(0)} KB local`);
  }, []);

  useEffect(() => {
    void measure();
  }, [measure]);

  return (
    <Panel icon={Database} title="Sync & Storage Engine" description="Control bandwidth use, sync cadence and cache size.">
      <Row icon={Wifi} title="Sync on Wi-Fi only" description="Pause cloud sync on mobile data.">
        <Switch checked={s.wifiOnlySync} onCheckedChange={(v) => set({ wifiOnlySync: v })} />
      </Row>
      <Row icon={Cloud} title="Background sync">
        <Switch checked={s.backgroundSync} onCheckedChange={(v) => set({ backgroundSync: v })} />
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Sync interval</Label>
          <span className="text-xs font-medium">{s.syncIntervalMin} min</span>
        </div>
        <Slider value={[s.syncIntervalMin]} min={5} max={120} step={5} onValueChange={([v]) => set({ syncIntervalMin: v })} />
      </div>
      <Row icon={Layers} title="Compress uploads" description="Shrink photos and media before syncing.">
        <Switch checked={s.compressUploads} onCheckedChange={(v) => set({ compressUploads: v })} />
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Cache budget</Label>
          <span className="text-xs font-medium">{s.cacheBudgetMb} MB</span>
        </div>
        <Slider value={[s.cacheBudgetMb]} min={20} max={500} step={20} onValueChange={([v]) => set({ cacheBudgetMb: v })} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
        <div>
          <Label className="text-sm">Storage usage</Label>
          <p className="text-xs text-muted-foreground">{usage}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            if ("caches" in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
            }
            await measure();
            toast({ title: "Cache cleared" });
          }}
        >
          Clear cache
        </Button>
      </div>
    </Panel>
  );
}

/* ------------------------------ Developer -------------------------------- */

export function DeveloperQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-dev-quantum", {
    verboseLogs: false,
    showRenderCounts: false,
    simulateOffline: false,
    latencyMs: 0,
    featureFlagOverrides: "",
  });

  return (
    <Panel icon={Smartphone} title="Diagnostics Sandbox" description="Simulate conditions and inspect runtime behaviour.">
      <Row icon={Activity} title="Verbose logging" description="Print detailed traces to the console.">
        <Switch
          checked={s.verboseLogs}
          onCheckedChange={(v) => {
            set({ verboseLogs: v });
            (window as unknown as Record<string, unknown>).__FITFUSION_VERBOSE__ = v;
          }}
        />
      </Row>
      <Row icon={Layers} title="Show render counts" description="Overlay component render statistics.">
        <Switch checked={s.showRenderCounts} onCheckedChange={(v) => set({ showRenderCounts: v })} />
      </Row>
      <Row icon={Wifi} title="Simulate offline" description="Force the app into offline handling paths.">
        <Switch
          checked={s.simulateOffline}
          onCheckedChange={(v) => {
            set({ simulateOffline: v });
            window.dispatchEvent(new Event(v ? "offline" : "online"));
          }}
        />
      </Row>
      <div className="rounded-xl border border-border/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm">Artificial latency</Label>
          <span className="text-xs font-medium">{s.latencyMs} ms</span>
        </div>
        <Slider value={[s.latencyMs]} min={0} max={2000} step={50} onValueChange={([v]) => set({ latencyMs: v })} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Feature flag overrides (comma separated)</Label>
        <Input
          value={s.featureFlagOverrides}
          placeholder="new-player, beta-coach"
          onChange={(e) => set({ featureFlagOverrides: e.target.value })}
        />
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          const snapshot = {
            ua: navigator.userAgent,
            online: navigator.onLine,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            dpr: window.devicePixelRatio,
            time: new Date().toISOString(),
          };
          navigator.clipboard
            ?.writeText(JSON.stringify(snapshot, null, 2))
            .then(() => toast({ title: "Diagnostics copied" }))
            .catch(() => toast({ title: "Copy failed", variant: "destructive" }));
        }}
      >
        Copy diagnostics snapshot
      </Button>
    </Panel>
  );
}

/* -------------------------------- About ---------------------------------- */

export function AboutQuantumExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-about-quantum", {
    betaChannel: false,
    shareAnonymousStats: true,
    showBuildBadge: true,
  });

  return (
    <Panel icon={LifeBuoy} title="Program & Support" description="Beta participation and support shortcuts.">
      <Row icon={Sparkles} title="Beta channel" description="Receive early builds before general release.">
        <Switch checked={s.betaChannel} onCheckedChange={(v) => set({ betaChannel: v })} />
      </Row>
      <Row icon={Activity} title="Share anonymous usage stats" description="Helps prioritise fixes. No personal data.">
        <Switch checked={s.shareAnonymousStats} onCheckedChange={(v) => set({ shareAnonymousStats: v })} />
      </Row>
      <Row icon={Baseline} title="Show build badge" description="Display the version chip in headers.">
        <Switch checked={s.showBuildBadge} onCheckedChange={(v) => set({ showBuildBadge: v })} />
      </Row>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          const report = `FitxFusion support report\nURL: ${window.location.href}\nUA: ${navigator.userAgent}\nTime: ${new Date().toISOString()}`;
          navigator.clipboard
            ?.writeText(report)
            .then(() => toast({ title: "Support report copied", description: "Paste it into your support message." }))
            .catch(() => toast({ title: "Copy failed", variant: "destructive" }));
        }}
      >
        Copy support report
      </Button>
    </Panel>
  );
}
