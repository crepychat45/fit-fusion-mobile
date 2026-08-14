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
  Accessibility, BellRing, Braces, Clock, Cpu, Fingerprint, Gauge, Globe2, Keyboard,
  Languages, MessageCircle, Palette, ScanLine, ShieldHalf, Sparkles, Timer, Volume2, Wifi,
} from "lucide-react";

/* ---------------------------- shared helpers ---------------------------- */

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
}> = ({ icon: Icon, title, description, badge = "v7.5", children }) => (
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

export function AccountHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-account-hyper", {
    startPage: "/",
    weekStart: "monday",
    autoSignOutMinutes: 0,
    quickActions: true,
  });

  return (
    <Panel icon={Sparkles} title="Workspace Defaults" description="Control how FitxFusion opens and behaves for your account.">
      <Row icon={Globe2} title="Default start page" description="Where the app lands after sign-in.">
        <Select value={s.startPage} onValueChange={(v) => set({ startPage: v })}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="/">Home</SelectItem>
            <SelectItem value="/workouts">Workouts</SelectItem>
            <SelectItem value="/progress">Progress</SelectItem>
            <SelectItem value="/community">Community</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Clock} title="Week starts on" description="Affects streaks and weekly summaries.">
        <Select value={s.weekStart} onValueChange={(v) => set({ weekStart: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monday">Monday</SelectItem>
            <SelectItem value="sunday">Sunday</SelectItem>
            <SelectItem value="saturday">Saturday</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex justify-between text-sm">
          <Label>Auto sign-out after inactivity</Label>
          <span className="text-muted-foreground">{s.autoSignOutMinutes === 0 ? "Off" : `${s.autoSignOutMinutes} min`}</span>
        </div>
        <Slider
          value={[s.autoSignOutMinutes]}
          min={0}
          max={120}
          step={5}
          onValueChange={(v) => set({ autoSignOutMinutes: v[0] ?? 0 })}
          onValueCommit={() => toast({ title: "Auto sign-out updated" })}
        />
      </div>
      <Row icon={Keyboard} title="Quick action shortcuts" description="Show the floating quick-start button.">
        <Switch checked={s.quickActions} onCheckedChange={(v) => set({ quickActions: v })} />
      </Row>
    </Panel>
  );
}

/* ------------------------------- Security ------------------------------- */

export function SecurityHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-security-hyper", {
    clipboardClear: true,
    screenshotWarning: false,
    strictOrigin: true,
    sessionPinPrompt: 30,
  });

  useEffect(() => {
    if (!s.clipboardClear) return;
    const onCopy = () => {
      window.setTimeout(() => {
        navigator.clipboard?.writeText("").catch(() => undefined);
      }, 45000);
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, [s.clipboardClear]);

  return (
    <Panel icon={ShieldHalf} title="Hardening Controls" description="Extra protection layers applied on this device.">
      <Row icon={ScanLine} title="Auto-clear clipboard" description="Wipes copied data after 45 seconds.">
        <Switch checked={s.clipboardClear} onCheckedChange={(v) => set({ clipboardClear: v })} />
      </Row>
      <Row icon={Fingerprint} title="Warn on screen capture" description="Shows a privacy notice when capture APIs are used.">
        <Switch checked={s.screenshotWarning} onCheckedChange={(v) => set({ screenshotWarning: v })} />
      </Row>
      <Row icon={Globe2} title="Strict origin checks" description="Blocks embedding this app in unknown frames.">
        <Switch
          checked={s.strictOrigin}
          onCheckedChange={(v) => {
            set({ strictOrigin: v });
            toast({ title: v ? "Strict origin enabled" : "Strict origin disabled" });
          }}
        />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex justify-between text-sm">
          <Label>Re-ask for PIN after</Label>
          <span className="text-muted-foreground">{s.sessionPinPrompt} min</span>
        </div>
        <Slider value={[s.sessionPinPrompt]} min={1} max={120} step={1} onValueChange={(v) => set({ sessionPinPrompt: v[0] ?? 30 })} />
      </div>
    </Panel>
  );
}

/* -------------------------------- Display ------------------------------- */

export function DisplayHyperExtras() {
  const [s, set] = usePersisted("fitfusion-display-hyper", {
    compactMode: false,
    largeText: false,
    dyslexiaSpacing: false,
    animationSpeed: 100,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("ff-compact", s.compactMode);
    root.classList.toggle("ff-large-text", s.largeText);
    root.style.setProperty("--ff-letter-spacing", s.dyslexiaSpacing ? "0.06em" : "0em");
    root.style.setProperty("--ff-anim-scale", String(Math.max(20, s.animationSpeed) / 100));
  }, [s]);

  return (
    <Panel icon={Palette} title="Layout & Motion" description="Density, readability and animation pacing.">
      <Row icon={Accessibility} title="Compact density" description="Tighter spacing to fit more on screen.">
        <Switch checked={s.compactMode} onCheckedChange={(v) => set({ compactMode: v })} />
      </Row>
      <Row icon={Languages} title="Large text" description="Increase base font size across the app.">
        <Switch checked={s.largeText} onCheckedChange={(v) => set({ largeText: v })} />
      </Row>
      <Row icon={Braces} title="Extra letter spacing" description="Easier reading for dyslexia.">
        <Switch checked={s.dyslexiaSpacing} onCheckedChange={(v) => set({ dyslexiaSpacing: v })} />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex justify-between text-sm">
          <Label>Animation speed</Label>
          <span className="text-muted-foreground">{s.animationSpeed}%</span>
        </div>
        <Slider value={[s.animationSpeed]} min={20} max={200} step={10} onValueChange={(v) => set({ animationSpeed: v[0] ?? 100 })} />
      </div>
    </Panel>
  );
}

/* -------------------------------- Privacy ------------------------------- */

export function PrivacyHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-privacy-hyper", {
    blockThirdPartyMedia: false,
    hideLastSeen: false,
    anonymiseLeaderboard: false,
    autoPurgeDays: 0,
  });

  return (
    <Panel icon={ShieldHalf} title="Privacy Shield+" description="Fine-grained visibility and retention controls.">
      <Row title="Block third-party media" description="Only load images and video from FitxFusion origins.">
        <Switch checked={s.blockThirdPartyMedia} onCheckedChange={(v) => set({ blockThirdPartyMedia: v })} />
      </Row>
      <Row title="Hide last seen" description="Others won't see when you were last active.">
        <Switch checked={s.hideLastSeen} onCheckedChange={(v) => set({ hideLastSeen: v })} />
      </Row>
      <Row title="Anonymous on leaderboards" description="Show as 'Athlete' instead of your name.">
        <Switch checked={s.anonymiseLeaderboard} onCheckedChange={(v) => set({ anonymiseLeaderboard: v })} />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex justify-between text-sm">
          <Label>Auto-purge local activity</Label>
          <span className="text-muted-foreground">{s.autoPurgeDays === 0 ? "Never" : `${s.autoPurgeDays} days`}</span>
        </div>
        <Slider
          value={[s.autoPurgeDays]}
          min={0}
          max={365}
          step={30}
          onValueChange={(v) => set({ autoPurgeDays: v[0] ?? 0 })}
          onValueCommit={() => toast({ title: "Retention policy saved" })}
        />
      </div>
    </Panel>
  );
}

/* ----------------------------- Notifications ---------------------------- */

export function NotificationHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-notify-hyper", {
    quietFrom: "22:00",
    quietTo: "07:00",
    quietEnabled: false,
    grouping: true,
    sound: "chime",
  });

  return (
    <Panel icon={BellRing} title="Delivery Rules" description="Quiet hours, grouping and alert tones.">
      <Row icon={Timer} title="Quiet hours" description="Silence non-critical alerts overnight.">
        <Switch checked={s.quietEnabled} onCheckedChange={(v) => set({ quietEnabled: v })} />
      </Row>
      {s.quietEnabled && (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/40 p-3">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="time" value={s.quietFrom} onChange={(e) => set({ quietFrom: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="time" value={s.quietTo} onChange={(e) => set({ quietTo: e.target.value })} />
          </div>
        </div>
      )}
      <Row title="Group similar alerts" description="Bundle likes, comments and reminders.">
        <Switch checked={s.grouping} onCheckedChange={(v) => set({ grouping: v })} />
      </Row>
      <Row icon={Volume2} title="Alert tone" description="Used inside the notification centre.">
        <Select
          value={s.sound}
          onValueChange={(v) => {
            set({ sound: v });
            toast({ title: `Tone set to ${v}` });
          }}
        >
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="chime">Chime</SelectItem>
            <SelectItem value="pulse">Pulse</SelectItem>
            <SelectItem value="ping">Ping</SelectItem>
            <SelectItem value="silent">Silent</SelectItem>
          </SelectContent>
        </Select>
      </Row>
    </Panel>
  );
}

/* --------------------------------- Units -------------------------------- */

export function UnitsHyperExtras() {
  const [s, set] = usePersisted("fitfusion-units-hyper", {
    pace: "min_km",
    energy: "kcal",
    water: "glass",
    temperature: "c",
  });

  const preview = useMemo(() => {
    const pace = s.pace === "min_km" ? "5:30 /km" : "8:51 /mi";
    const energy = s.energy === "kcal" ? "420 kcal" : "1757 kJ";
    return `${pace} · ${energy}`;
  }, [s.pace, s.energy]);

  return (
    <Panel icon={Gauge} title="Measurement Preferences+" description="Pace, energy, hydration and temperature units.">
      <Row title="Pace unit">
        <Select value={s.pace} onValueChange={(v) => set({ pace: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="min_km">min / km</SelectItem>
            <SelectItem value="min_mi">min / mile</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Energy unit">
        <Select value={s.energy} onValueChange={(v) => set({ energy: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kcal">kcal</SelectItem>
            <SelectItem value="kj">kilojoules</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Hydration unit">
        <Select value={s.water} onValueChange={(v) => set({ water: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="glass">Glasses</SelectItem>
            <SelectItem value="ml">Millilitres</SelectItem>
            <SelectItem value="oz">Fluid ounces</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Temperature">
        <Select value={s.temperature} onValueChange={(v) => set({ temperature: v })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="c">Celsius</SelectItem>
            <SelectItem value="f">Fahrenheit</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <p className="text-xs text-muted-foreground">Preview: {preview}</p>
    </Panel>
  );
}

/* --------------------------------- Chat --------------------------------- */

export function ChatHyperExtras() {
  const [s, set] = usePersisted("fitfusion-chat-hyper", {
    enterToSend: true,
    showTyping: true,
    autoScroll: true,
    historyLimit: 200,
  });

  return (
    <Panel icon={MessageCircle} title="Conversation Controls" description="Input behaviour and history limits for the AI coach.">
      <Row icon={Keyboard} title="Enter sends message" description="Shift + Enter inserts a new line.">
        <Switch checked={s.enterToSend} onCheckedChange={(v) => set({ enterToSend: v })} />
      </Row>
      <Row title="Show typing indicator">
        <Switch checked={s.showTyping} onCheckedChange={(v) => set({ showTyping: v })} />
      </Row>
      <Row title="Auto-scroll to newest">
        <Switch checked={s.autoScroll} onCheckedChange={(v) => set({ autoScroll: v })} />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex justify-between text-sm">
          <Label>Messages kept per thread</Label>
          <span className="text-muted-foreground">{s.historyLimit}</span>
        </div>
        <Slider value={[s.historyLimit]} min={50} max={1000} step={50} onValueChange={(v) => set({ historyLimit: v[0] ?? 200 })} />
      </div>
    </Panel>
  );
}

/* -------------------------------- Data ---------------------------------- */

export function DataHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-data-hyper", {
    wifiOnlySync: false,
    prefetchRoutes: true,
    imageQuality: "auto",
    backgroundSync: true,
  });

  return (
    <Panel icon={Wifi} title="Sync & Bandwidth" description="How FitxFusion uses your connection.">
      <Row title="Sync on Wi-Fi only" description="Defer heavy uploads on mobile data.">
        <Switch checked={s.wifiOnlySync} onCheckedChange={(v) => set({ wifiOnlySync: v })} />
      </Row>
      <Row title="Prefetch likely routes" description="Loads the next screen before you tap.">
        <Switch checked={s.prefetchRoutes} onCheckedChange={(v) => set({ prefetchRoutes: v })} />
      </Row>
      <Row title="Background sync" description="Retry failed writes when the app regains focus.">
        <Switch checked={s.backgroundSync} onCheckedChange={(v) => set({ backgroundSync: v })} />
      </Row>
      <Row icon={Cpu} title="Image quality">
        <Select
          value={s.imageQuality}
          onValueChange={(v) => {
            set({ imageQuality: v });
            toast({ title: `Image quality: ${v}` });
          }}
        >
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (network)</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="saver">Data saver</SelectItem>
          </SelectContent>
        </Select>
      </Row>
    </Panel>
  );
}

/* ------------------------------ Developer ------------------------------- */

export function DeveloperHyperExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-dev-hyper", {
    verboseLogs: false,
    showRenderCount: false,
    mockSlowNetwork: false,
  });

  const dumpDiagnostics = () => {
    const info = {
      ua: navigator.userAgent,
      lang: navigator.language,
      online: navigator.onLine,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      storageKeys: Object.keys(localStorage).length,
    };
    navigator.clipboard
      ?.writeText(JSON.stringify(info, null, 2))
      .then(() => toast({ title: "Diagnostics copied" }))
      .catch(() => toast({ title: "Clipboard unavailable", variant: "destructive" }));
  };

  return (
    <Panel icon={Braces} title="Debug Toolkit" description="Developer-only switches and diagnostics.">
      <Row title="Verbose console logs">
        <Switch checked={s.verboseLogs} onCheckedChange={(v) => set({ verboseLogs: v })} />
      </Row>
      <Row title="Show render counters">
        <Switch checked={s.showRenderCount} onCheckedChange={(v) => set({ showRenderCount: v })} />
      </Row>
      <Row title="Simulate slow network">
        <Switch checked={s.mockSlowNetwork} onCheckedChange={(v) => set({ mockSlowNetwork: v })} />
      </Row>
      <Button variant="outline" className="w-full" onClick={dumpDiagnostics}>
        Copy environment diagnostics
      </Button>
    </Panel>
  );
}
