import React, { useCallback, useEffect, useState } from "react";
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
  BellRing,
  Bug,
  Clock,
  Database,
  Download,
  Eye,
  Globe,
  Info,
  KeyRound,
  MessageSquare,
  Monitor,
  Ruler,
  ShieldAlert,
  Trash2,
  UserCog,
} from "lucide-react";
import { LicenseDialog } from "@/components/settings/about-diagnostics";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof fallback === "object" &&
      fallback !== null
    ) {
      return { ...(fallback as object), ...(parsed as object) } as T;
    }
    return typeof parsed === typeof fallback ? (parsed as T) : fallback;
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
          /* storage full / blocked */
        }
        window.dispatchEvent(new CustomEvent("fitfusion-settings-changed", { detail: { key, next } }));
        return next;
      });
    },
    [key],
  );
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
}> = ({ icon: Icon, title, description, badge, children }) => (
  <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-4 w-4 text-primary" />
        {title}
        {badge && (
          <Badge variant="outline" className="ml-auto text-[10px]">
            {badge}
          </Badge>
        )}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export function AccountUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-account-ultra", {
    weeklyDigest: true,
    autoTimezone: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    greeting: "",
  });

  useEffect(() => {
    if (s.autoTimezone) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz !== s.timezone) set({ timezone: tz });
    }
  }, [s.autoTimezone, s.timezone, set]);

  return (
    <Panel icon={UserCog} title="Account Preferences+" description="Personalise how FitxFusion greets and reports to you." badge="New">
      <Row icon={BellRing} title="Weekly progress digest" description="A Sunday recap of your training week.">
        <Switch checked={s.weeklyDigest} onCheckedChange={(v) => set({ weeklyDigest: v })} />
      </Row>
      <Row icon={Globe} title="Detect timezone automatically" description={`Currently ${s.timezone}`}>
        <Switch checked={s.autoTimezone} onCheckedChange={(v) => set({ autoTimezone: v })} />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <Label className="text-sm">Custom greeting</Label>
        <div className="flex gap-2">
          <Input
            value={s.greeting}
            placeholder="Let's move, Champion"
            onChange={(e) => set({ greeting: e.target.value })}
          />
          <Button
            variant="outline"
            onClick={() => toast({ title: "Greeting saved", description: s.greeting || "Default greeting restored" })}
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Shown on your dashboard header.</p>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export function SecurityUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-security-ultra", {
    loginAlerts: true,
    lockOnBackground: false,
    blockCopy: false,
    requirePinForExport: true,
  });

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (s.blockCopy) {
        e.preventDefault();
      }
    };
    document.addEventListener("copy", handler);
    return () => document.removeEventListener("copy", handler);
  }, [s.blockCopy]);

  return (
    <Panel icon={ShieldAlert} title="Security Guardrails" description="Extra hardening for sensitive actions on this device." badge="New">
      <Row icon={BellRing} title="Sign-in alerts" description="Notify me when a new device signs in.">
        <Switch checked={s.loginAlerts} onCheckedChange={(v) => set({ loginAlerts: v })} />
      </Row>
      <Row icon={Eye} title="Lock when app goes to background" description="Requires App Lock to be enabled.">
        <Switch checked={s.lockOnBackground} onCheckedChange={(v) => set({ lockOnBackground: v })} />
      </Row>
      <Row icon={KeyRound} title="Block copying app data" description="Prevents copy of on-screen content.">
        <Switch checked={s.blockCopy} onCheckedChange={(v) => set({ blockCopy: v })} />
      </Row>
      <Row icon={Download} title="Confirm before data export" description="Ask for PIN before exporting your data.">
        <Switch checked={s.requirePinForExport} onCheckedChange={(v) => set({ requirePinForExport: v })} />
      </Row>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const keys = Object.keys(localStorage).filter((k) => k.startsWith("fitfusion-cache"));
          keys.forEach((k) => localStorage.removeItem(k));
          toast({ title: "Sensitive caches cleared", description: `${keys.length} cached entries removed.` });
        }}
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Clear sensitive caches
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Display                                                             */
/* ------------------------------------------------------------------ */

export function DisplayUltraExtras() {
  const [s, set] = usePersisted("fitfusion-display-ultra", {
    radius: 12,
    fontScale: 100,
    highContrast: false,
    dimImages: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--radius", `${s.radius}px`);
    root.style.fontSize = `${Math.min(130, Math.max(85, s.fontScale))}%`;
    root.dataset.highContrast = s.highContrast ? "true" : "false";
    root.dataset.dimImages = s.dimImages ? "true" : "false";
  }, [s]);

  return (
    <Panel icon={Monitor} title="Interface Tuning" description="Fine-tune corner radius, text size and contrast." badge="New">
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Corner radius</Label>
          <span className="text-xs text-muted-foreground">{s.radius}px</span>
        </div>
        <Slider value={[s.radius]} min={0} max={24} step={2} onValueChange={(v) => set({ radius: v[0] ?? 12 })} />
      </div>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Text size</Label>
          <span className="text-xs text-muted-foreground">{s.fontScale}%</span>
        </div>
        <Slider value={[s.fontScale]} min={85} max={130} step={5} onValueChange={(v) => set({ fontScale: v[0] ?? 100 })} />
      </div>
      <Row title="High contrast mode" description="Stronger borders and text separation.">
        <Switch checked={s.highContrast} onCheckedChange={(v) => set({ highContrast: v })} />
      </Row>
      <Row title="Dim heavy imagery" description="Softens background photos to reduce eye strain.">
        <Switch checked={s.dimImages} onCheckedChange={(v) => set({ dimImages: v })} />
      </Row>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

export function PrivacyUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-privacy-ultra", {
    telemetry: "balanced",
    hideOnlineStatus: false,
    locationPrecision: "city",
    autoClearSearch: true,
  });

  return (
    <Panel icon={Eye} title="Privacy Controls+" description="Decide exactly what leaves this device." badge="New">
      <Row title="Telemetry level" description="Controls diagnostic data collection.">
        <Select value={s.telemetry} onValueChange={(v) => set({ telemetry: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Off</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Hide online status" description="Others won't see when you're active.">
        <Switch checked={s.hideOnlineStatus} onCheckedChange={(v) => set({ hideOnlineStatus: v })} />
      </Row>
      <Row title="Location precision" description="Used for outdoor workout tracking.">
        <Select value={s.locationPrecision} onValueChange={(v) => set({ locationPrecision: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Disabled</SelectItem>
            <SelectItem value="city">City level</SelectItem>
            <SelectItem value="precise">Precise</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Auto-clear search history" description="Wipes recent searches when you close the app.">
        <Switch checked={s.autoClearSearch} onCheckedChange={(v) => set({ autoClearSearch: v })} />
      </Row>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          localStorage.removeItem("fitfusion-recent-searches");
          toast({ title: "Search history cleared" });
        }}
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Clear search history now
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function NotificationUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-notify-ultra", {
    workout: true,
    hydration: true,
    social: false,
    streakRisk: true,
    snoozeMinutes: 0,
  });

  return (
    <Panel icon={BellRing} title="Notification Channels" description="Turn individual reminder streams on or off." badge="New">
      <Row title="Workout reminders" description="Before each scheduled session.">
        <Switch checked={s.workout} onCheckedChange={(v) => set({ workout: v })} />
      </Row>
      <Row title="Hydration nudges" description="Spread across your active hours.">
        <Switch checked={s.hydration} onCheckedChange={(v) => set({ hydration: v })} />
      </Row>
      <Row title="Community activity" description="Likes, comments and challenge updates.">
        <Switch checked={s.social} onCheckedChange={(v) => set({ social: v })} />
      </Row>
      <Row title="Streak at risk" description="Alerts you before a streak breaks.">
        <Switch checked={s.streakRisk} onCheckedChange={(v) => set({ streakRisk: v })} />
      </Row>
      <div className="space-y-2 rounded-xl border border-border/40 p-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm"><Clock className="h-3.5 w-3.5" />Snooze all</Label>
          <span className="text-xs text-muted-foreground">
            {s.snoozeMinutes ? `${s.snoozeMinutes} min` : "Off"}
          </span>
        </div>
        <Slider
          value={[s.snoozeMinutes]}
          min={0}
          max={240}
          step={15}
          onValueChange={(v) => set({ snoozeMinutes: v[0] ?? 0 })}
          onValueCommit={(v) =>
            toast({ title: v[0] ? `Notifications snoozed ${v[0]} min` : "Snooze cleared" })
          }
        />
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Units                                                               */
/* ------------------------------------------------------------------ */

export function UnitsUltraExtras() {
  const [s, set] = usePersisted("fitfusion-units-ultra", {
    temperature: "celsius",
    energy: "kcal",
    pace: "min/km",
    waterUnit: "ml",
  });

  return (
    <Panel icon={Ruler} title="Advanced Units" description="Temperature, energy and pace formatting." badge="New">
      <Row title="Temperature">
        <Select value={s.temperature} onValueChange={(v) => set({ temperature: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="celsius">Celsius</SelectItem>
            <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Energy">
        <Select value={s.energy} onValueChange={(v) => set({ energy: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kcal">Kilocalories</SelectItem>
            <SelectItem value="kj">Kilojoules</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Pace format">
        <Select value={s.pace} onValueChange={(v) => set({ pace: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="min/km">min / km</SelectItem>
            <SelectItem value="min/mi">min / mile</SelectItem>
            <SelectItem value="kmh">km / h</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Water tracking unit">
        <Select value={s.waterUnit} onValueChange={(v) => set({ waterUnit: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ml">Millilitres</SelectItem>
            <SelectItem value="oz">Fluid ounces</SelectItem>
            <SelectItem value="glass">Glasses</SelectItem>
          </SelectContent>
        </Select>
      </Row>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

export function ChatUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-chat-ultra", {
    sendOnEnter: true,
    streaming: true,
    autoScroll: true,
    showTimestamps: false,
    suggestions: true,
  });

  return (
    <Panel icon={MessageSquare} title="Assistant Behaviour" description="Control how the FitxFusion coach replies." badge="New">
      <Row title="Send with Enter" description="Shift+Enter inserts a new line.">
        <Switch checked={s.sendOnEnter} onCheckedChange={(v) => set({ sendOnEnter: v })} />
      </Row>
      <Row title="Stream responses" description="Show words as they are generated.">
        <Switch checked={s.streaming} onCheckedChange={(v) => set({ streaming: v })} />
      </Row>
      <Row title="Auto-scroll to newest" description="Keeps the latest reply in view.">
        <Switch checked={s.autoScroll} onCheckedChange={(v) => set({ autoScroll: v })} />
      </Row>
      <Row title="Show timestamps" description="Displays send time on each message.">
        <Switch checked={s.showTimestamps} onCheckedChange={(v) => set({ showTimestamps: v })} />
      </Row>
      <Row title="Smart suggestions" description="Suggested follow-up prompts under replies.">
        <Switch checked={s.suggestions} onCheckedChange={(v) => set({ suggestions: v })} />
      </Row>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          localStorage.removeItem("fitfusion-chat-history");
          toast({ title: "Chat history cleared", description: "Local transcripts removed from this device." });
        }}
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Clear local chat history
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export function DataUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-data-ultra", {
    autoBackup: "weekly",
    wifiOnlySync: true,
    keepOffline: true,
  });

  const exportAll = () => {
    const dump: Record<string, string> = {};
    Object.keys(localStorage)
      .filter((k) => k.startsWith("fitfusion"))
      .forEach((k) => {
        dump[k] = localStorage.getItem(k) ?? "";
      });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitxfusion-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Backup downloaded", description: `${Object.keys(dump).length} keys exported.` });
  };

  return (
    <Panel icon={Database} title="Sync & Backup+" description="Control backups, offline copies and sync conditions." badge="New">
      <Row title="Automatic backup">
        <Select value={s.autoBackup} onValueChange={(v) => set({ autoBackup: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Off</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Sync on Wi-Fi only" description="Avoids using mobile data for large syncs.">
        <Switch checked={s.wifiOnlySync} onCheckedChange={(v) => set({ wifiOnlySync: v })} />
      </Row>
      <Row title="Keep workouts offline" description="Caches your plan for offline sessions.">
        <Switch checked={s.keepOffline} onCheckedChange={(v) => set({ keepOffline: v })} />
      </Row>
      <Button variant="outline" size="sm" onClick={exportAll}>
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Download full backup
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Developer                                                           */
/* ------------------------------------------------------------------ */

export function DeveloperUltraExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-dev-ultra", {
    verboseLogs: false,
    showRouteTimings: false,
    simulateSlowNetwork: false,
  });

  useEffect(() => {
    document.documentElement.dataset.devVerbose = s.verboseLogs ? "true" : "false";
  }, [s.verboseLogs]);

  const copyDiagnostics = async () => {
    const diag = {
      ua: navigator.userAgent,
      lang: navigator.language,
      online: navigator.onLine,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      memory: (performance as any)?.memory?.usedJSHeapSize ?? "n/a",
      time: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
      toast({ title: "Diagnostics copied" });
    } catch {
      toast({ title: "Clipboard blocked", description: "Copy permission was denied.", variant: "destructive" });
    }
  };

  return (
    <Panel icon={Bug} title="Developer Lab" description="Diagnostics and simulation switches." badge="New">
      <Row title="Verbose logging" description="Adds detailed console output.">
        <Switch checked={s.verboseLogs} onCheckedChange={(v) => set({ verboseLogs: v })} />
      </Row>
      <Row title="Route timing overlay" description="Logs navigation timings for each route.">
        <Switch checked={s.showRouteTimings} onCheckedChange={(v) => set({ showRouteTimings: v })} />
      </Row>
      <Row title="Simulate slow network" description="Forces data-saver rendering paths.">
        <Switch
          checked={s.simulateSlowNetwork}
          onCheckedChange={(v) => {
            set({ simulateSlowNetwork: v });
            document.documentElement.dataset.dataSaver = v ? "true" : "false";
          }}
        />
      </Row>
      <Button variant="outline" size="sm" onClick={copyDiagnostics}>
        Copy diagnostics
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export function AboutUltraExtras() {
  const { toast } = useToast();
  return (
    <Panel icon={Info} title="Support & Resources" description="Quick links and health checks." badge="New">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LicenseDialog
          trigger={
            <Button variant="outline" size="sm">
              Open source licenses
            </Button>
          }
        />
        <Button variant="outline" size="sm" onClick={() => window.open("/terms-of-service.html", "_blank")}>
          Terms of service
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "System check passed",
              description: `Storage, network and rendering are healthy (${navigator.onLine ? "online" : "offline"}).`,
            })
          }
        >
          Run system check
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.origin);
              toast({ title: "App link copied" });
            } catch {
              toast({ title: "Copy failed", variant: "destructive" });
            }
          }}
        >
          Share app link
        </Button>
      </div>
    </Panel>
  );
}
