import React, { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, ShieldCheck, Palette, EyeOff, BellRing, Ruler, MessageSquare,
  Database, Terminal, Info, Gauge, Timer, Zap, Cloud, Lock, Wand2,
} from "lucide-react";

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
  title, desc, icon: Icon, children,
}: { title: string; desc: string; icon: React.ElementType; children: React.ReactNode }) => (
  <Card className="border-primary/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
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

/* --------------------------------- ACCOUNT -------------------------------- */

export function AccountFusionExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-account-fusion", {
    displayHandle: "", weekStart: "monday", autoPause: true, restDay: "sunday", coachCheckins: true,
  });
  return (
    <Panel title="Account Personalisation" desc="Identity, weekly rhythm and coaching cadence" icon={Sparkles}>
      <div className="space-y-1.5">
        <Label className="text-sm">Public handle</Label>
        <Input value={cfg.displayHandle} placeholder="@yourhandle" className="h-9"
          onChange={(e) => patch({ displayHandle: e.target.value.replace(/\s/g, "") })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Week starts on</Label>
          <Select value={cfg.weekStart} onValueChange={(v) => patch({ weekStart: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{["monday", "sunday", "saturday"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Preferred rest day</Label>
          <Select value={cfg.restDay} onValueChange={(v) => patch({ restDay: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Toggle icon={Timer} title="Auto-pause sessions" desc="Pause the timer when no movement is detected" checked={cfg.autoPause} onChange={(v) => patch({ autoPause: v })} />
      <Toggle icon={Wand2} title="Weekly coach check-in" desc="Get a summary and plan adjustment every week" checked={cfg.coachCheckins} onChange={(v) => patch({ coachCheckins: v })} />
      <Button className="w-full" onClick={() => toast({ title: "Account preferences saved" })}>Save preferences</Button>
    </Panel>
  );
}

/* -------------------------------- SECURITY -------------------------------- */

export function SecurityFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-security-settings-fusion", {
    reauthMinutes: 15, clipboardClear: true, screenshotWarn: true, panicWipe: false, lockOnMinimize: true,
  });
  return (
    <Panel title="Advanced Session Security" desc="Extra hardening for this device" icon={ShieldCheck}>
      <SliderRow label="Re-auth for sensitive actions" value={cfg.reauthMinutes} min={0} max={60} step={5} suffix=" min" onChange={(v) => patch({ reauthMinutes: v })} />
      <Toggle icon={Lock} title="Lock when minimised" desc="Require unlock when returning to the app" checked={cfg.lockOnMinimize} onChange={(v) => patch({ lockOnMinimize: v })} />
      <Toggle icon={EyeOff} title="Auto-clear clipboard" desc="Wipe copied codes after 30 seconds" checked={cfg.clipboardClear} onChange={(v) => patch({ clipboardClear: v })} />
      <Toggle icon={ShieldCheck} title="Screenshot warning" desc="Warn me when capturing sensitive screens" checked={cfg.screenshotWarn} onChange={(v) => patch({ screenshotWarn: v })} />
      <Toggle icon={Zap} title="Panic wipe" desc="Clear local cache after 10 failed unlocks" checked={cfg.panicWipe} onChange={(v) => patch({ panicWipe: v })} />
    </Panel>
  );
}

/* --------------------------------- DISPLAY -------------------------------- */

export function DisplayFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-display-fusion", {
    fontScale: 100, reduceTransparency: false, boldText: false, highContrast: false, tapFeedback: true,
  });

  const apply = (p: Partial<typeof cfg>) => {
    patch(p);
    const root = document.documentElement;
    if (p.fontScale !== undefined) root.style.fontSize = `${Math.round(16 * (p.fontScale / 100))}px`;
    if (p.boldText !== undefined) root.classList.toggle("font-bold-ui", p.boldText);
    if (p.highContrast !== undefined) root.classList.toggle("high-contrast", p.highContrast);
    if (p.reduceTransparency !== undefined) root.classList.toggle("reduce-transparency", p.reduceTransparency);
  };

  return (
    <Panel title="Readability & Motion" desc="Live typography and visual comfort controls" icon={Palette}>
      <SliderRow label="Text size" value={cfg.fontScale} min={80} max={140} step={5} suffix="%" onChange={(v) => apply({ fontScale: v })} />
      <Toggle icon={Palette} title="Bold interface text" desc="Increase font weight across the app" checked={cfg.boldText} onChange={(v) => apply({ boldText: v })} />
      <Toggle icon={Gauge} title="High contrast" desc="Stronger separation between surfaces and text" checked={cfg.highContrast} onChange={(v) => apply({ highContrast: v })} />
      <Toggle icon={EyeOff} title="Reduce transparency" desc="Disable glass blur for a faster, clearer UI" checked={cfg.reduceTransparency} onChange={(v) => apply({ reduceTransparency: v })} />
      <Toggle icon={Zap} title="Tap feedback" desc="Subtle haptic pulse on primary actions" checked={cfg.tapFeedback} onChange={(v) => patch({ tapFeedback: v })} />
    </Panel>
  );
}

/* --------------------------------- PRIVACY -------------------------------- */

export function PrivacyFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-privacy-fusion", {
    hideOnlineStatus: false, blockDms: false, searchable: true, shareWorkoutMap: false, retentionDays: 365,
  });
  return (
    <Panel title="Visibility Controls" desc="Decide what other members can see" icon={EyeOff}>
      <Toggle icon={EyeOff} title="Hide online status" desc="Never show when I was last active" checked={cfg.hideOnlineStatus} onChange={(v) => patch({ hideOnlineStatus: v })} />
      <Toggle icon={MessageSquare} title="Block direct messages" desc="Only people I follow can message me" checked={cfg.blockDms} onChange={(v) => patch({ blockDms: v })} />
      <Toggle icon={Sparkles} title="Discoverable in search" desc="Allow others to find me by name or handle" checked={cfg.searchable} onChange={(v) => patch({ searchable: v })} />
      <Toggle icon={Cloud} title="Share workout routes" desc="Include GPS maps in shared activities" checked={cfg.shareWorkoutMap} onChange={(v) => patch({ shareWorkoutMap: v })} />
      <SliderRow label="Activity history retention" value={cfg.retentionDays} min={30} max={1095} step={30} suffix=" days" onChange={(v) => patch({ retentionDays: v })} />
    </Panel>
  );
}

/* ------------------------------ NOTIFICATIONS ----------------------------- */

export function NotificationFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-notification-fusion", {
    quietStart: "22:00", quietEnd: "07:00", groupSummary: true, criticalOnly: false, weeklyDigest: true, maxPerDay: 8,
  });
  return (
    <Panel title="Delivery Rules" desc="Fine-grained control over how alerts arrive" icon={BellRing}>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Quiet hours start</Label>
          <Input type="time" value={cfg.quietStart} className="h-9" onChange={(e) => patch({ quietStart: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Quiet hours end</Label>
          <Input type="time" value={cfg.quietEnd} className="h-9" onChange={(e) => patch({ quietEnd: e.target.value })} />
        </div>
      </div>
      <SliderRow label="Max notifications per day" value={cfg.maxPerDay} min={1} max={30} step={1} suffix="" onChange={(v) => patch({ maxPerDay: v })} />
      <Toggle icon={BellRing} title="Group into one summary" desc="Bundle similar alerts into a single notification" checked={cfg.groupSummary} onChange={(v) => patch({ groupSummary: v })} />
      <Toggle icon={Zap} title="Critical alerts only" desc="Mute everything except SOS and security alerts" checked={cfg.criticalOnly} onChange={(v) => patch({ criticalOnly: v })} />
      <Toggle icon={Sparkles} title="Weekly digest" desc="A single Sunday recap of the week" checked={cfg.weeklyDigest} onChange={(v) => patch({ weeklyDigest: v })} />
    </Panel>
  );
}

/* ---------------------------------- UNITS --------------------------------- */

export function UnitsFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-units-fusion", {
    temperature: "celsius", clock: "24h", firstDayNumeric: 1, roundWeights: true, plateUnit: "kg",
  });
  const [kg, setKg] = useState(60);
  const lbs = useMemo(() => (kg * 2.2046226).toFixed(1), [kg]);

  return (
    <Panel title="Regional & Conversion" desc="Units, clock format and quick converters" icon={Ruler}>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Temperature</Label>
          <Select value={cfg.temperature} onValueChange={(v) => patch({ temperature: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="celsius">Celsius</SelectItem><SelectItem value="fahrenheit">Fahrenheit</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Clock</Label>
          <Select value={cfg.clock} onValueChange={(v) => patch({ clock: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="24h">24-hour</SelectItem><SelectItem value="12h">12-hour</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <Toggle icon={Ruler} title="Round weights" desc="Snap logged weights to the nearest 0.5" checked={cfg.roundWeights} onChange={(v) => patch({ roundWeights: v })} />
      <div className="rounded-xl border border-border/50 p-3 space-y-2">
        <Label className="text-sm">Quick converter</Label>
        <div className="flex items-center gap-2">
          <Input type="number" value={kg} className="h-9" onChange={(e) => setKg(Number(e.target.value) || 0)} />
          <span className="text-xs text-muted-foreground">kg =</span>
          <Badge variant="outline" className="h-9 px-3 text-sm">{lbs} lbs</Badge>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- CHAT ---------------------------------- */

export function ChatFusionExtras() {
  const [cfg, patch] = usePersisted("fitfusion-chat-fusion", {
    enterToSend: true, readReceipts: true, autoTranslate: false, bubbleSize: 100, saveHistoryDays: 90,
  });
  return (
    <Panel title="Conversation Preferences" desc="How chat behaves and stores messages" icon={MessageSquare}>
      <Toggle icon={MessageSquare} title="Enter sends message" desc="Use Shift+Enter for a new line" checked={cfg.enterToSend} onChange={(v) => patch({ enterToSend: v })} />
      <Toggle icon={Sparkles} title="Read receipts" desc="Let others see when I've read a message" checked={cfg.readReceipts} onChange={(v) => patch({ readReceipts: v })} />
      <Toggle icon={Wand2} title="Auto-translate" desc="Translate incoming messages to my language" checked={cfg.autoTranslate} onChange={(v) => patch({ autoTranslate: v })} />
      <SliderRow label="Bubble text size" value={cfg.bubbleSize} min={80} max={140} step={5} suffix="%" onChange={(v) => patch({ bubbleSize: v })} />
      <SliderRow label="Keep history" value={cfg.saveHistoryDays} min={7} max={365} step={7} suffix=" days" onChange={(v) => patch({ saveHistoryDays: v })} />
    </Panel>
  );
}

/* ----------------------------------- DATA --------------------------------- */

export function DataFusionExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-data-fusion", {
    wifiOnlySync: false, autoBackupDaily: true, compressUploads: true, offlinePackDays: 7,
  });

  const exportAll = () => {
    try {
      const dump: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fitfusion-")) dump[k] = localStorage.getItem(k) ?? "";
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitxfusion-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Settings exported" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  return (
    <Panel title="Sync & Backup Rules" desc="Bandwidth, backups and offline packs" icon={Database}>
      <Toggle icon={Cloud} title="Sync on Wi-Fi only" desc="Avoid using mobile data for background sync" checked={cfg.wifiOnlySync} onChange={(v) => patch({ wifiOnlySync: v })} />
      <Toggle icon={Database} title="Daily auto-backup" desc="Back up settings and logs every night" checked={cfg.autoBackupDaily} onChange={(v) => patch({ autoBackupDaily: v })} />
      <Toggle icon={Zap} title="Compress uploads" desc="Shrink photos and videos before upload" checked={cfg.compressUploads} onChange={(v) => patch({ compressUploads: v })} />
      <SliderRow label="Offline workout pack" value={cfg.offlinePackDays} min={1} max={30} step={1} suffix=" days" onChange={(v) => patch({ offlinePackDays: v })} />
      <Button variant="outline" className="w-full" onClick={exportAll}>Export all local settings</Button>
    </Panel>
  );
}

/* -------------------------------- DEVELOPER ------------------------------- */

export function DeveloperFusionExtras() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-developer-fusion", {
    verboseLogs: false, showFps: false, mockOffline: false, disableAnimations: false,
  });

  const apply = (p: Partial<typeof cfg>) => {
    patch(p);
    if (p.disableAnimations !== undefined) {
      document.documentElement.classList.toggle("no-animations", p.disableAnimations);
    }
  };

  const runSelfTest = () => {
    const results = {
      storage: (() => { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch { return false; } })(),
      serviceWorker: "serviceWorker" in navigator,
      online: navigator.onLine,
      memory: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0,
    };
    toast({
      title: "Self-test complete",
      description: `Storage ${results.storage ? "OK" : "FAIL"} • SW ${results.serviceWorker ? "OK" : "n/a"} • ${results.online ? "Online" : "Offline"}`,
    });
  };

  return (
    <Panel title="Diagnostics Toolkit" desc="Developer switches and environment self-test" icon={Terminal}>
      <Toggle icon={Terminal} title="Verbose logging" desc="Print detailed traces to the console" checked={cfg.verboseLogs} onChange={(v) => patch({ verboseLogs: v })} />
      <Toggle icon={Gauge} title="Show FPS meter" desc="Overlay a frame-rate counter" checked={cfg.showFps} onChange={(v) => patch({ showFps: v })} />
      <Toggle icon={Cloud} title="Simulate offline" desc="Force offline behaviour for testing" checked={cfg.mockOffline} onChange={(v) => patch({ mockOffline: v })} />
      <Toggle icon={Zap} title="Disable animations" desc="Turn off all motion for maximum performance" checked={cfg.disableAnimations} onChange={(v) => apply({ disableAnimations: v })} />
      <Button variant="outline" className="w-full" onClick={runSelfTest}>Run environment self-test</Button>
    </Panel>
  );
}

/* ---------------------------------- ABOUT --------------------------------- */

export function AboutFusionExtras() {
  const { toast } = useToast();
  const info = useMemo(() => ({
    platform: navigator.platform || "web",
    language: navigator.language,
    cores: navigator.hardwareConcurrency ?? "n/a",
    online: navigator.onLine ? "online" : "offline",
  }), []);

  return (
    <Panel title="System Information" desc="Environment details useful for support" icon={Info}>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(info).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border/50 p-3">
            <p className="text-[11px] uppercase text-muted-foreground">{k}</p>
            <p className="text-sm font-semibold truncate">{String(v)}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={() => {
        navigator.clipboard?.writeText(JSON.stringify(info, null, 2));
        toast({ title: "Diagnostics copied" });
      }}>Copy diagnostics</Button>
    </Panel>
  );
}
