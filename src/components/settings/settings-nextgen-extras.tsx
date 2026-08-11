import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Download,
  RefreshCw,
  History,
  Search,
  ShieldCheck,
  Gauge,
  Clock,
  Rocket,
  KeyRound,
  Wifi,
  HardDrive,
  Bell,
  Ruler,
  Bot,
  Palette,
  Trash2,
} from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";
import { getVersionInfo, setStoredVersion } from "@/config/version";
import { applyUpdate, checkForUpdate, clearAppCache, UpdateProgress } from "@/utils/version-api";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (Array.isArray(parsed) !== Array.isArray(fallback)) return fallback;
    if (typeof parsed !== typeof fallback) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

/** localStorage-backed state that is shape-safe and cloud-mirror friendly. */
export function usePref<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => readJSON(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota */
    }
  }, [key, value]);
  useEffect(() => {
    const rehydrate = () => setValue(readJSON(key, initial));
    window.addEventListener("fitfusion-settings-hydrated", rehydrate);
    return () => window.removeEventListener("fitfusion-settings-hydrated", rehydrate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, setValue];
}

const Glass: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="border-white/10 bg-white/5 backdrop-blur-xl">{children}</Card>
);

const Row: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({
  title,
  desc,
  children,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-background/40 p-3">
    <div className="min-w-0">
      <p className="text-sm font-medium">{title}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* UPDATES — full Update Center                                        */
/* ------------------------------------------------------------------ */

type HistoryEntry = { version: string; at: string; channel: string };

export function UpdateCenter() {
  const [info, setInfo] = useState(getVersionInfo());
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [channel, setChannel] = usePref<string>("fitfusion-update-channel", "stable");
  const [autoUpdate, setAutoUpdate] = usePref<boolean>("fitfusion-auto-update", true);
  const [wifiOnly, setWifiOnly] = usePref<boolean>("fitfusion-update-wifi-only", true);
  const [notifyOnUpdate, setNotifyOnUpdate] = usePref<boolean>("fitfusion-update-notify", true);
  const [history, setHistory] = usePref<HistoryEntry[]>("fitfusion-update-history", []);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onUpdated = () => setInfo(getVersionInfo());
    window.addEventListener("versionUpdated", onUpdated);
    return () => window.removeEventListener("versionUpdated", onUpdated);
  }, []);

  const handleCheck = useCallback(async () => {
    setBusy(true);
    try {
      const swUpdate = await checkForUpdate();
      const fresh = getVersionInfo();
      setInfo(fresh);
      if (fresh.hasUpdate || swUpdate) {
        toast.success(`FitXFusion v${APP_VERSION} is available`, {
          description: "Tap Download & Install to apply the update.",
        });
      } else {
        toast.info("You're up to date", { description: `Running v${fresh.current}.` });
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    setBusy(true);
    try {
      await applyUpdate((p) => setProgress(p));
      setHistory([
        { version: APP_VERSION, at: new Date().toISOString(), channel },
        ...history,
      ].slice(0, 20));
      if (notifyOnUpdate) toast.success(`Installed v${APP_VERSION}`);
    } catch {
      toast.error("Update failed", { description: "Please try again." });
    } finally {
      setBusy(false);
    }
  }, [channel, history, notifyOnUpdate, setHistory]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RELEASE_NOTES;
    return RELEASE_NOTES.map((n) => ({
      ...n,
      sections: n.sections
        .map((s) => ({ ...s, items: s.items.filter((i) => i.toLowerCase().includes(q)) }))
        .filter((s) => s.items.length > 0),
    })).filter((n) => n.sections.length > 0 || n.version.includes(q));
  }, [query]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-4 w-4 text-primary" /> Update Center
        </CardTitle>
        <CardDescription>
          Download, verify and install updates — with full version history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-background/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Installed version</p>
              <p className="text-2xl font-bold">v{info.current}</p>
              <p className="text-xs text-muted-foreground">Released {APP_RELEASE_DATE}</p>
            </div>
            <Badge variant={info.hasUpdate ? "default" : "secondary"} className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {info.hasUpdate ? `v${info.latest} available` : "Up to date"}
            </Badge>
          </div>

          {progress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize">{progress.message}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} />
            </div>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={handleCheck} disabled={busy} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Check for updates
            </Button>
            <Button onClick={handleInstall} disabled={busy} className="gap-2">
              <Download className="h-4 w-4" />
              Download &amp; Install
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Row title="Automatic updates" desc="Install new versions in the background.">
            <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} aria-label="Automatic updates" />
          </Row>
          <Row title="Wi-Fi only downloads" desc="Skip metered connections.">
            <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} aria-label="Wi-Fi only downloads" />
          </Row>
          <Row title="Notify when an update installs">
            <Switch checked={notifyOnUpdate} onCheckedChange={setNotifyOnUpdate} aria-label="Update notifications" />
          </Row>
          <Row title="Release channel" desc="Beta receives features earlier.">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-32" aria-label="Release channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" /> Search changelog
          </Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. passkey, cache, slider…"
            aria-label="Search changelog"
          />
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {filteredNotes.map((note) => (
              <div key={note.version} className="rounded-xl border border-white/10 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">v{note.version}</p>
                  <Badge variant="outline" className="text-[10px]">{note.date}</Badge>
                </div>
                {note.sections.map((s) => (
                  <div key={s.title} className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground">{s.title}</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                      {s.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <p className="text-sm text-muted-foreground">No changelog entries match “{query}”.</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" /> Update history
            </p>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setHistory([])} className="gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No updates installed from this device yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {history.map((h, i) => (
                <li
                  key={`${h.version}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 px-3 py-2"
                >
                  <span className="font-medium">v{h.version}</span>
                  <span className="text-muted-foreground">
                    {new Date(h.at).toLocaleString()} · {h.channel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              await clearAppCache();
              toast.success("App cache cleared");
            }}
          >
            <HardDrive className="h-4 w-4" /> Clear app cache
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setStoredVersion(APP_VERSION);
              setInfo(getVersionInfo());
              toast.success(`Version pinned to v${APP_VERSION}`);
            }}
          >
            <ShieldCheck className="h-4 w-4" /> Repair version state
          </Button>
        </div>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* ACCOUNT                                                             */
/* ------------------------------------------------------------------ */

export function AccountNextExtras() {
  const [startPage, setStartPage] = usePref<string>("fitfusion-start-page", "/");
  const [weekStart, setWeekStart] = usePref<string>("fitfusion-week-start", "monday");
  const [autoSignOut, setAutoSignOut] = usePref<boolean>("fitfusion-auto-signout", false);
  const [storage, setStorage] = useState<string>("—");

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => {
      const used = (e.usage ?? 0) / 1024 / 1024;
      setStorage(`${used.toFixed(1)} MB used`);
    });
  }, []);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-primary" /> Account Preferences
        </CardTitle>
        <CardDescription>Personalize how the app opens and behaves for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Default start page" desc="Where the app opens after launch.">
          <Select value={startPage} onValueChange={setStartPage}>
            <SelectTrigger className="w-40" aria-label="Default start page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/">Home</SelectItem>
              <SelectItem value="/workouts">Workouts</SelectItem>
              <SelectItem value="/progress">Progress</SelectItem>
              <SelectItem value="/profile">Profile</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Week starts on">
          <Select value={weekStart} onValueChange={setWeekStart}>
            <SelectTrigger className="w-32" aria-label="Week starts on">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Sign out on app close" desc="Extra safety on shared devices.">
          <Switch checked={autoSignOut} onCheckedChange={setAutoSignOut} aria-label="Sign out on app close" />
        </Row>
        <Row title="Local storage used">
          <Badge variant="secondary">{storage}</Badge>
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* DISPLAY                                                             */
/* ------------------------------------------------------------------ */

export function DisplayNextExtras() {
  const [reduceMotion, setReduceMotion] = usePref<boolean>("fitfusion-reduce-motion", false);
  const [density, setDensity] = usePref<string>("fitfusion-density", "comfortable");
  const [font, setFont] = usePref<string>("fitfusion-font-family", "");

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
  useEffect(() => {
    document.documentElement.classList.toggle("ff-reduce-motion", reduceMotion);
  }, [reduceMotion]);
  useEffect(() => {
    if (font) document.documentElement.style.setProperty("--font-family", font);
  }, [font]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" /> Layout &amp; Motion
        </CardTitle>
        <CardDescription>Applies instantly across the whole app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Reduce motion" desc="Minimises animations and transitions.">
          <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} aria-label="Reduce motion" />
        </Row>
        <Row title="Interface density">
          <Select value={density} onValueChange={setDensity}>
            <SelectTrigger className="w-36" aria-label="Interface density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Font family">
          <Select value={font || "default"} onValueChange={(v) => setFont(v === "default" ? "" : v)}>
            <SelectTrigger className="w-40" aria-label="Font family">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">System default</SelectItem>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="'Space Grotesk', sans-serif">Space Grotesk</SelectItem>
              <SelectItem value="ui-monospace, monospace">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* NOTIFICATIONS                                                       */
/* ------------------------------------------------------------------ */

export function NotificationNextExtras() {
  const [workoutReminder, setWorkoutReminder] = usePref<boolean>("fitfusion-notif-workout", true);
  const [reminderTime, setReminderTime] = usePref<string>("fitfusion-notif-time", "18:00");
  const [waterNudge, setWaterNudge] = usePref<boolean>("fitfusion-notif-water", false);
  const [weeklyDigest, setWeeklyDigest] = usePref<boolean>("fitfusion-notif-digest", true);
  const [permission, setPermission] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" /> Smart Reminders
        </CardTitle>
        <CardDescription>Reminders honour your quiet hours automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Browser permission" desc={`Current: ${permission}`}>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (typeof Notification === "undefined") return;
              const p = await Notification.requestPermission();
              setPermission(p);
              toast.info(`Notifications ${p}`);
            }}
          >
            Request
          </Button>
        </Row>
        <Row title="Daily workout reminder">
          <Switch checked={workoutReminder} onCheckedChange={setWorkoutReminder} aria-label="Daily workout reminder" />
        </Row>
        <Row title="Reminder time">
          <Input
            type="time"
            className="w-32"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            aria-label="Reminder time"
          />
        </Row>
        <Row title="Hydration nudges" desc="Gentle water reminders through the day.">
          <Switch checked={waterNudge} onCheckedChange={setWaterNudge} aria-label="Hydration nudges" />
        </Row>
        <Row title="Weekly progress digest">
          <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} aria-label="Weekly progress digest" />
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* UNITS                                                               */
/* ------------------------------------------------------------------ */

export function UnitsNextExtras() {
  const [energy, setEnergy] = usePref<string>("fitfusion-unit-energy", "kcal");
  const [distance, setDistance] = usePref<string>("fitfusion-unit-distance", "km");
  const [clock, setClock] = usePref<string>("fitfusion-unit-clock", "24h");
  const [water, setWater] = usePref<string>("fitfusion-unit-water", "ml");

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ruler className="h-4 w-4 text-primary" /> Measurement Formats
        </CardTitle>
        <CardDescription>Used across workouts, nutrition and progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {[
          { label: "Energy", value: energy, set: setEnergy, opts: ["kcal", "kJ"] },
          { label: "Distance", value: distance, set: setDistance, opts: ["km", "mi"] },
          { label: "Clock", value: clock, set: setClock, opts: ["24h", "12h"] },
          { label: "Water", value: water, set: setWater, opts: ["ml", "fl oz"] },
        ].map((row) => (
          <Row key={row.label} title={row.label}>
            <Select value={row.value} onValueChange={row.set}>
              <SelectTrigger className="w-28" aria-label={row.label}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {row.opts.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        ))}
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* CHAT                                                                */
/* ------------------------------------------------------------------ */

export function ChatNextExtras() {
  const [enterToSend, setEnterToSend] = usePref<boolean>("fitfusion-chat-enter-send", true);
  const [bubbleSize, setBubbleSize] = usePref<string>("fitfusion-chat-bubble", "medium");
  const [autoScroll, setAutoScroll] = usePref<boolean>("fitfusion-chat-autoscroll", true);
  const [saveDrafts, setSaveDrafts] = usePref<boolean>("fitfusion-chat-drafts", true);
  const [retention, setRetention] = usePref<string>("fitfusion-chat-retention", "forever");

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-primary" /> Chat Experience
        </CardTitle>
        <CardDescription>Composer, bubbles and message retention.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Press Enter to send" desc="Shift+Enter adds a new line.">
          <Switch checked={enterToSend} onCheckedChange={setEnterToSend} aria-label="Press Enter to send" />
        </Row>
        <Row title="Auto-scroll to newest message">
          <Switch checked={autoScroll} onCheckedChange={setAutoScroll} aria-label="Auto-scroll" />
        </Row>
        <Row title="Save unsent drafts">
          <Switch checked={saveDrafts} onCheckedChange={setSaveDrafts} aria-label="Save drafts" />
        </Row>
        <Row title="Bubble size">
          <Select value={bubbleSize} onValueChange={setBubbleSize}>
            <SelectTrigger className="w-32" aria-label="Bubble size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Message retention">
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger className="w-36" aria-label="Message retention">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
              <SelectItem value="forever">Keep forever</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* DATA / PERFORMANCE                                                  */
/* ------------------------------------------------------------------ */

export function DataNextExtras() {
  const [saveData, setSaveData] = usePref<boolean>("fitfusion-data-saver", false);
  const [prefetch, setPrefetch] = usePref<boolean>("fitfusion-route-prefetch", true);
  const [offline, setOffline] = usePref<boolean>("fitfusion-offline-workouts", true);
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  const refresh = useCallback(() => {
    navigator.storage?.estimate?.().then((e) =>
      setQuota({ used: (e.usage ?? 0) / 1048576, total: (e.quota ?? 0) / 1048576 }),
    );
  }, []);
  useEffect(refresh, [refresh]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-primary" /> Data &amp; Performance
        </CardTitle>
        <CardDescription>Control bandwidth, caching and offline access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Data saver" desc="Lower image quality on slow networks.">
          <Switch checked={saveData} onCheckedChange={setSaveData} aria-label="Data saver" />
        </Row>
        <Row title="Prefetch next screens" desc="Faster navigation, slightly more data.">
          <Switch checked={prefetch} onCheckedChange={setPrefetch} aria-label="Prefetch next screens" />
        </Row>
        <Row title="Keep workouts available offline">
          <Switch checked={offline} onCheckedChange={setOffline} aria-label="Offline workouts" />
        </Row>
        {quota && (
          <div className="rounded-xl border border-white/10 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5" /> Storage
              </span>
              <span>
                {quota.used.toFixed(1)} MB / {quota.total.toFixed(0)} MB
              </span>
            </div>
            <Progress value={quota.total ? (quota.used / quota.total) * 100 : 0} />
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="gap-2" onClick={refresh}>
            <RefreshCw className="h-4 w-4" /> Recalculate usage
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              await clearAppCache();
              refresh();
              toast.success("Caches cleared");
            }}
          >
            <Trash2 className="h-4 w-4" /> Free up space
          </Button>
        </div>
        <Row title="Connection">
          <Badge variant="secondary" className="gap-1">
            <Wifi className="h-3 w-3" />
            {navigator.onLine ? "Online" : "Offline"}
          </Badge>
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* SECURITY                                                            */
/* ------------------------------------------------------------------ */

export function SecurityNextExtras() {
  const [hideNotifPreview, setHideNotifPreview] = usePref<boolean>("fitfusion-sec-hide-preview", false);
  const [confirmDestructive, setConfirmDestructive] = usePref<boolean>("fitfusion-sec-confirm", true);
  const [sessionTimeout, setSessionTimeout] = usePref<string>("fitfusion-sec-session-timeout", "never");

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" /> Session Safeguards
        </CardTitle>
        <CardDescription>Extra protection for your account on this device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row title="Hide notification content" desc="Show only 'New message' on the lock screen.">
          <Switch
            checked={hideNotifPreview}
            onCheckedChange={setHideNotifPreview}
            aria-label="Hide notification content"
          />
        </Row>
        <Row title="Confirm destructive actions" desc="Ask before deleting data or signing out.">
          <Switch
            checked={confirmDestructive}
            onCheckedChange={setConfirmDestructive}
            aria-label="Confirm destructive actions"
          />
        </Row>
        <Row title="Idle session timeout">
          <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
            <SelectTrigger className="w-32" aria-label="Idle session timeout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Last activity">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleTimeString()}
          </Badge>
        </Row>
      </CardContent>
    </Glass>
  );
}
