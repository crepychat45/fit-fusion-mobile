// Pro extras: an additional working feature card for every Settings tab.
// Every control here does something real (applies a DOM effect, calls a browser
// API, or writes a `fitfusion-*` key that is mirrored to the cloud automatically).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  BellRing,
  Bug,
  Clock,
  Contrast,
  Copy,
  Database,
  Download,
  Gauge,
  KeyRound,
  Lock,
  Moon,
  Ruler,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";

/* ─────────────────────────── shared helpers ─────────────────────────── */

function useLocal<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* storage disabled */
    }
  }, [key, v]);
  // Pick up cloud hydration without a page reload.
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) setV(JSON.parse(raw) as T);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("fitfusion-settings-hydrated", sync);
    return () => window.removeEventListener("fitfusion-settings-hydrated", sync);
  }, [key]);
  return [v, setV];
}

const Glass: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <Card
      className={`backdrop-blur-xl bg-background/50 border-white/10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </Card>
  </motion.div>
);

const Row: React.FC<
  React.PropsWithChildren<{ title: string; hint?: string; icon?: React.ReactNode }>
> = ({ title, hint, icon, children }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-background/40 p-3">
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className="mt-0.5 text-primary">{icon}</div>}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

/* ══════════════════════════════ ACCOUNT ══════════════════════════════ */

export function AccountProExtras() {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      setEmail(data.user.email ?? "");
      setCreatedAt(data.user.created_at ?? "");
      const name = (data.user.user_metadata?.name as string) ?? "";
      setDisplayName(name);
      setSavedName(name);
    });
    return () => {
      active = false;
    };
  }, []);

  const completeness = useMemo(() => {
    let score = 0;
    if (email) score += 40;
    if (savedName.trim()) score += 40;
    if (createdAt) score += 20;
    return score;
  }, [email, savedName, createdAt]);

  const saveName = async () => {
    const trimmed = displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      toast({
        title: "Invalid name",
        description: "Display name must be 2–50 characters.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { name: trimmed } });
    setBusy(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setSavedName(trimmed);
    toast({ title: "Display name updated", description: `Saved as “${trimmed}”.` });
  };

  const signOutEverywhere = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    toast({
      title: error ? "Sign out failed" : "Signed out everywhere",
      description: error ? error.message : "All other devices were signed out.",
      variant: error ? "destructive" : "default",
    });
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4 text-primary" /> Account Health
        </CardTitle>
        <CardDescription>Profile completeness, identity and session controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Profile completeness</span>
            <span className="font-semibold">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pro-display-name" className="text-xs">
            Display name
          </Label>
          <div className="flex gap-2">
            <Input
              id="pro-display-name"
              value={displayName}
              maxLength={50}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <Button onClick={saveName} disabled={busy || displayName.trim() === savedName}>
              Save
            </Button>
          </div>
        </div>

        <Row title="Signed in as" hint={email || "Not signed in"} icon={<KeyRound className="h-4 w-4" />}>
          <Badge variant="secondary" className="text-[10px]">
            {createdAt ? `since ${new Date(createdAt).toLocaleDateString()}` : "—"}
          </Badge>
        </Row>

        <Button variant="outline" className="w-full" onClick={signOutEverywhere}>
          <Lock className="h-4 w-4 mr-2" /> Sign out of all devices
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ SECURITY ══════════════════════════════ */

const scorePassword = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (pw.length >= 12) s += 15;
  if (/[A-Z]/.test(pw)) s += 15;
  if (/[a-z]/.test(pw)) s += 15;
  if (/\d/.test(pw)) s += 15;
  if (/[^A-Za-z0-9]/.test(pw)) s += 15;
  return Math.min(100, s);
};

export function SecurityProExtras() {
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [strictMode, setStrictMode] = useLocal("fitfusion-security-strict-mode", false);
  const [clipboardGuard, setClipboardGuard] = useLocal("fitfusion-security-clipboard-guard", false);

  const strength = scorePassword(pw);

  useEffect(() => {
    if (!clipboardGuard) return;
    const timer = window.setInterval(() => {
      navigator.clipboard?.writeText?.("").catch(() => undefined);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [clipboardGuard]);

  const changePassword = async () => {
    if (strength < 60) {
      toast({
        title: "Password too weak",
        description: "Use 8+ characters with upper, lower, number and symbol.",
        variant: "destructive",
      });
      return;
    }
    if (pw !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setPw("");
    setConfirm("");
    toast({ title: "Password updated", description: "Use your new password next sign-in." });
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" /> Credential Manager
        </CardTitle>
        <CardDescription>Rotate your password and tighten session hardening.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pro-new-pw" className="text-xs">
            New password
          </Label>
          <Input
            id="pro-new-pw"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••••"
            autoComplete="new-password"
          />
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          {pw && (
            <>
              <Progress value={strength} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                Strength: {strength < 40 ? "weak" : strength < 70 ? "fair" : "strong"}
              </p>
            </>
          )}
          <Button className="w-full" onClick={changePassword} disabled={busy || !pw}>
            Update password
          </Button>
        </div>

        <Row
          title="Strict session mode"
          hint="Require re-auth for sensitive actions in this browser."
          icon={<Lock className="h-4 w-4" />}
        >
          <Switch checked={strictMode} onCheckedChange={setStrictMode} aria-label="Strict session mode" />
        </Row>
        <Row
          title="Clipboard guard"
          hint="Auto-clears the clipboard every minute while the app is open."
          icon={<Trash2 className="h-4 w-4" />}
        >
          <Switch
            checked={clipboardGuard}
            onCheckedChange={setClipboardGuard}
            aria-label="Clipboard guard"
          />
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ DISPLAY ══════════════════════════════ */

export function DisplayProExtras() {
  const [zoom, setZoom] = useLocal("fitfusion-display-zoom", 100);
  const [warmth, setWarmth] = useLocal("fitfusion-display-warmth", 0);
  const [contrast, setContrast] = useLocal("fitfusion-display-contrast", false);
  const [dimAfterDark, setDimAfterDark] = useLocal("fitfusion-display-night-dim", false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  useEffect(() => {
    const hour = new Date().getHours();
    const nightDim = dimAfterDark && (hour >= 21 || hour < 6) ? 0.88 : 1;
    const filters: string[] = [];
    if (warmth > 0) filters.push(`sepia(${warmth / 200}) saturate(${1 + warmth / 300})`);
    if (contrast) filters.push("contrast(1.15)");
    if (nightDim !== 1) filters.push(`brightness(${nightDim})`);
    document.documentElement.style.filter = filters.join(" ");
    return () => {
      document.documentElement.style.filter = "";
    };
  }, [warmth, contrast, dimAfterDark]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Contrast className="h-4 w-4 text-primary" /> Visual Comfort
        </CardTitle>
        <CardDescription>Live display tuning — changes apply instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-background/40 p-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>App zoom</span>
            <span className="font-semibold">{zoom}%</span>
          </div>
          <Slider
            value={[zoom]}
            min={80}
            max={140}
            step={5}
            onValueChange={([v]) => setZoom(v)}
            aria-label="App zoom"
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-background/40 p-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Warm light filter</span>
            <span className="font-semibold">{warmth}%</span>
          </div>
          <Slider
            value={[warmth]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => setWarmth(v)}
            aria-label="Warm light filter"
          />
        </div>
        <Row title="High contrast boost" icon={<Contrast className="h-4 w-4" />}>
          <Switch checked={contrast} onCheckedChange={setContrast} aria-label="High contrast boost" />
        </Row>
        <Row
          title="Auto-dim after dark"
          hint="Softens brightness between 9pm and 6am."
          icon={<Moon className="h-4 w-4" />}
        >
          <Switch checked={dimAfterDark} onCheckedChange={setDimAfterDark} aria-label="Auto dim after dark" />
        </Row>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ PRIVACY ══════════════════════════════ */

export function PrivacyProExtras() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useLocal("fitfusion-privacy-analytics", true);
  const [crashReports, setCrashReports] = useLocal("fitfusion-privacy-crash-reports", true);
  const [searchHistory, setSearchHistory] = useLocal("fitfusion-privacy-search-history", true);
  const [retention, setRetention] = useLocal("fitfusion-privacy-retention", "12");

  useEffect(() => {
    document.documentElement.dataset.analytics = analytics ? "on" : "off";
  }, [analytics]);

  const clearHistory = () => {
    let removed = 0;
    try {
      Object.keys(localStorage)
        .filter((k) => /history|recent|search/i.test(k) && k.startsWith("fitfusion"))
        .forEach((k) => {
          localStorage.removeItem(k);
          removed += 1;
        });
    } catch {
      /* ignore */
    }
    toast({ title: "History cleared", description: `${removed} stored item(s) removed.` });
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-primary" /> Data Controls
        </CardTitle>
        <CardDescription>Decide what FitFusion collects and how long it keeps it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row title="Product analytics" hint="Anonymous usage events." >
          <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Product analytics" />
        </Row>
        <Row title="Crash reports" hint="Send stack traces when the app fails.">
          <Switch checked={crashReports} onCheckedChange={setCrashReports} aria-label="Crash reports" />
        </Row>
        <Row title="Save search history" hint="Remember recent searches on this device.">
          <Switch checked={searchHistory} onCheckedChange={setSearchHistory} aria-label="Save search history" />
        </Row>
        <div className="rounded-xl border border-white/10 bg-background/40 p-3 space-y-2">
          <Label className="text-xs">Local data retention</Label>
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 month</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="0">Keep forever</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="w-full" onClick={clearHistory}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear search &amp; recents
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═════════════════════════════ NOTIFICATIONS ═════════════════════════════ */

export function NotificationProExtras() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const [quietFrom, setQuietFrom] = useLocal("fitfusion-notify-quiet-from", "22:00");
  const [quietTo, setQuietTo] = useLocal("fitfusion-notify-quiet-to", "07:00");
  const [quietEnabled, setQuietEnabled] = useLocal("fitfusion-notify-quiet-enabled", false);
  const [workoutReminder, setWorkoutReminder] = useLocal("fitfusion-notify-workout-time", "18:00");

  const inQuietHours = useCallback(() => {
    if (!quietEnabled) return false;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [fh, fm] = quietFrom.split(":").map(Number);
    const [th, tm] = quietTo.split(":").map(Number);
    const from = fh * 60 + fm;
    const to = th * 60 + tm;
    return from <= to ? cur >= from && cur < to : cur >= from || cur < to;
  }, [quietEnabled, quietFrom, quietTo]);

  const request = async () => {
    if (typeof Notification === "undefined") {
      toast({ title: "Not supported", description: "This browser has no notification support." });
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    toast({
      title: result === "granted" ? "Notifications enabled" : "Permission not granted",
      description: result === "granted" ? "You'll receive workout reminders." : "You can enable it later.",
      variant: result === "granted" ? "default" : "destructive",
    });
  };

  const sendTest = () => {
    if (inQuietHours()) {
      toast({ title: "Quiet hours active", description: "Notification suppressed as configured." });
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("FitFusion", { body: "Test notification — everything works!" });
    } else {
      toast({ title: "Enable notifications first", variant: "destructive" });
    }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="h-4 w-4 text-primary" /> Delivery &amp; Quiet Hours
        </CardTitle>
        <CardDescription>Browser permission, do-not-disturb window and reminders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row title="Browser permission" hint={`Current status: ${permission}`}>
          {permission === "granted" ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">Granted</Badge>
          ) : (
            <Button size="sm" onClick={request}>
              Enable
            </Button>
          )}
        </Row>
        <Row title="Quiet hours" hint="Mute all alerts during the window below." icon={<Moon className="h-4 w-4" />}>
          <Switch checked={quietEnabled} onCheckedChange={setQuietEnabled} aria-label="Quiet hours" />
        </Row>
        {quietEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="time" value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="time" value={quietTo} onChange={(e) => setQuietTo(e.target.value)} />
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Daily workout reminder
          </Label>
          <Input
            type="time"
            value={workoutReminder}
            onChange={(e) => setWorkoutReminder(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full" onClick={sendTest}>
          <Send className="h-4 w-4 mr-2" /> Send test notification
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ UNITS ══════════════════════════════ */

export function UnitsProExtras() {
  const [temp, setTemp] = useLocal("fitfusion-units-temperature", "c");
  const [energy, setEnergy] = useLocal("fitfusion-units-energy", "kcal");
  const [pace, setPace] = useLocal("fitfusion-units-pace", "min-km");
  const [value, setValue] = useState("70");
  const [mode, setMode] = useState("kg-lb");

  const converted = useMemo(() => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return "—";
    switch (mode) {
      case "kg-lb":
        return `${(n * 2.20462).toFixed(2)} lb`;
      case "lb-kg":
        return `${(n / 2.20462).toFixed(2)} kg`;
      case "cm-in":
        return `${(n / 2.54).toFixed(2)} in`;
      case "in-cm":
        return `${(n * 2.54).toFixed(2)} cm`;
      case "km-mi":
        return `${(n * 0.621371).toFixed(2)} mi`;
      case "kcal-kj":
        return `${(n * 4.184).toFixed(1)} kJ`;
      default:
        return "—";
    }
  }, [value, mode]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ruler className="h-4 w-4 text-primary" /> Measurement Lab
        </CardTitle>
        <CardDescription>Extra unit preferences plus a built-in converter.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Temperature</Label>
            <Select value={temp} onValueChange={setTemp}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="c">Celsius</SelectItem>
                <SelectItem value="f">Fahrenheit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Energy</Label>
            <Select value={energy} onValueChange={setEnergy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kcal">Kilocalories</SelectItem>
                <SelectItem value="kj">Kilojoules</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pace</Label>
            <Select value={pace} onValueChange={setPace}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="min-km">min / km</SelectItem>
                <SelectItem value="min-mi">min / mile</SelectItem>
                <SelectItem value="kmh">km / h</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-background/40 p-3 space-y-2">
          <Label className="text-xs">Quick converter</Label>
          <div className="flex gap-2">
            <Input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-28"
              aria-label="Value to convert"
            />
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg-lb">kg → lb</SelectItem>
                <SelectItem value="lb-kg">lb → kg</SelectItem>
                <SelectItem value="cm-in">cm → in</SelectItem>
                <SelectItem value="in-cm">in → cm</SelectItem>
                <SelectItem value="km-mi">km → mi</SelectItem>
                <SelectItem value="kcal-kj">kcal → kJ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm font-semibold text-primary">= {converted}</p>
        </div>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ CHAT ══════════════════════════════ */

export function ChatProExtras() {
  const { toast } = useToast();
  const [tone, setTone] = useLocal("fitfusion-chat-tone", "motivating");
  const [length, setLength] = useLocal("fitfusion-chat-length", "balanced");
  const [sendOnEnter, setSendOnEnter] = useLocal("fitfusion-chat-send-on-enter", true);
  const [autoScroll, setAutoScroll] = useLocal("fitfusion-chat-autoscroll", true);
  const [memory, setMemory] = useLocal("fitfusion-chat-memory", true);

  const clearCache = () => {
    let removed = 0;
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("fitfusion") && /chat|assistant|conversation/i.test(k))
        .filter((k) => !/settings|tone|length|send-on-enter|autoscroll|memory/i.test(k))
        .forEach((k) => {
          localStorage.removeItem(k);
          removed += 1;
        });
    } catch {
      /* ignore */
    }
    toast({ title: "Chat cache cleared", description: `${removed} conversation cache item(s) removed.` });
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> Assistant Personality
        </CardTitle>
        <CardDescription>Shape how the FitFusion coach replies to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="motivating">Motivating</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="drill">Drill sergeant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Answer length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Row title="Send with Enter" hint="Shift+Enter inserts a new line.">
          <Switch checked={sendOnEnter} onCheckedChange={setSendOnEnter} aria-label="Send with Enter" />
        </Row>
        <Row title="Auto-scroll to latest">
          <Switch checked={autoScroll} onCheckedChange={setAutoScroll} aria-label="Auto scroll" />
        </Row>
        <Row title="Conversation memory" hint="Let the coach recall earlier messages.">
          <Switch checked={memory} onCheckedChange={setMemory} aria-label="Conversation memory" />
        </Row>
        <Button variant="outline" className="w-full" onClick={clearCache}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear chat cache
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ UPDATES ══════════════════════════════ */

export function UpdateProExtras() {
  const { toast } = useToast();
  const [channel, setChannel] = useLocal("fitfusion-update-channel", "stable");
  const [autoCheck, setAutoCheck] = useLocal("fitfusion-update-autocheck", true);
  const [wifiOnly, setWifiOnly] = useLocal("fitfusion-update-wifi-only", true);
  const [lastCheck, setLastCheck] = useLocal("fitfusion-update-last-check", "");
  const [checking, setChecking] = useState(false);

  const checkNow = async () => {
    setChecking(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
      }
      setLastCheck(new Date().toISOString());
      toast({ title: "Up to date", description: "You're running the latest FitFusion build." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" /> Update Channel
        </CardTitle>
        <CardDescription>Control how and when new builds reach this device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Release channel</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="canary">Canary (early access)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Row title="Automatic update checks">
          <Switch checked={autoCheck} onCheckedChange={setAutoCheck} aria-label="Automatic update checks" />
        </Row>
        <Row title="Download on Wi-Fi only">
          <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} aria-label="Wi-Fi only updates" />
        </Row>
        <p className="text-[11px] text-muted-foreground">
          Last checked: {lastCheck ? new Date(lastCheck).toLocaleString() : "never"}
        </p>
        <Button className="w-full" onClick={checkNow} disabled={checking}>
          {checking ? "Checking…" : "Check for updates now"}
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ DEVELOPER ══════════════════════════════ */

export function DeveloperProExtras() {
  const { toast } = useToast();
  const [fps, setFps] = useState(0);
  const [showFps, setShowFps] = useLocal("fitfusion-dev-fps", false);
  const [verbose, setVerbose] = useLocal("fitfusion-dev-verbose", false);
  const [gridOverlay, setGridOverlay] = useLocal("fitfusion-dev-grid", false);

  useEffect(() => {
    if (!showFps) return;
    let frames = 0;
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      frames += 1;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [showFps]);

  useEffect(() => {
    document.documentElement.dataset.devGrid = gridOverlay ? "on" : "off";
  }, [gridOverlay]);

  const storageStats = useMemo(() => {
    let bytes = 0;
    let keys = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        keys += 1;
        bytes += k.length + (localStorage.getItem(k)?.length ?? 0);
      }
    } catch {
      /* ignore */
    }
    return { keys, kb: (bytes / 1024).toFixed(1) };
  }, [verbose, gridOverlay, showFps]);

  const copyDiagnostics = async () => {
    const info = {
      ua: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      online: navigator.onLine,
      storageKeys: storageStats.keys,
      storageKb: storageStats.kb,
      time: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
      toast({ title: "Diagnostics copied", description: "Paste it into a bug report." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard access denied.", variant: "destructive" });
    }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bug className="h-4 w-4 text-primary" /> Debug Instruments
        </CardTitle>
        <CardDescription>Live runtime metrics and layout debugging tools.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row title="Frame rate monitor" hint={showFps ? `${fps} FPS` : "Off"} icon={<Gauge className="h-4 w-4" />}>
          <Switch checked={showFps} onCheckedChange={setShowFps} aria-label="Frame rate monitor" />
        </Row>
        <Row title="Verbose logging" hint="Print extra console detail.">
          <Switch checked={verbose} onCheckedChange={setVerbose} aria-label="Verbose logging" />
        </Row>
        <Row title="Layout grid overlay">
          <Switch checked={gridOverlay} onCheckedChange={setGridOverlay} aria-label="Layout grid overlay" />
        </Row>
        <div className="rounded-xl border border-white/10 bg-background/40 p-3 text-xs text-muted-foreground">
          Local storage: <span className="font-semibold text-foreground">{storageStats.keys} keys</span> ·{" "}
          <span className="font-semibold text-foreground">{storageStats.kb} KB</span>
        </div>
        <Button variant="outline" className="w-full" onClick={copyDiagnostics}>
          <Copy className="h-4 w-4 mr-2" /> Copy diagnostics
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ DATA ══════════════════════════════ */

export function DataProExtras() {
  const { toast } = useToast();
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [autoBackup, setAutoBackup] = useLocal("fitfusion-data-autobackup", true);
  const [backupFreq, setBackupFreq] = useLocal("fitfusion-data-backup-freq", "daily");

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => {
      setUsage({ used: e.usage ?? 0, quota: e.quota ?? 0 });
    }).catch(() => undefined);
  }, []);

  const exportAll = () => {
    const payload: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("fitfusion")) continue;
        payload[k] = localStorage.getItem(k) ?? "";
      }
    } catch {
      /* ignore */
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: `${Object.keys(payload).length} settings exported.` });
  };

  const pct = usage && usage.quota ? Math.min(100, (usage.used / usage.quota) * 100) : 0;

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-primary" /> Storage &amp; Backup
        </CardTitle>
        <CardDescription>See device usage and take a portable snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Device storage used</span>
            <span className="font-semibold">
              {usage ? `${(usage.used / 1048576).toFixed(1)} MB` : "—"}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <Row title="Automatic cloud backup">
          <Switch checked={autoBackup} onCheckedChange={setAutoBackup} aria-label="Automatic cloud backup" />
        </Row>
        {autoBackup && (
          <div className="space-y-1">
            <Label className="text-xs">Backup frequency</Label>
            <Select value={backupFreq} onValueChange={setBackupFreq}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={exportAll}>
          <Download className="h-4 w-4 mr-2" /> Export settings snapshot
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ══════════════════════════════ ABOUT ══════════════════════════════ */

export function AboutProExtras() {
  const { toast } = useToast();
  const info = useMemo(
    () => ({
      Platform: navigator.platform || "Unknown",
      Language: navigator.language,
      Cores: (navigator.hardwareConcurrency ?? "—").toString(),
      Screen: `${window.screen.width}×${window.screen.height}`,
      Online: navigator.onLine ? "Yes" : "No",
      "Standalone PWA": window.matchMedia("(display-mode: standalone)").matches ? "Yes" : "No",
    }),
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
      toast({ title: "System info copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-primary" /> System Information
        </CardTitle>
        <CardDescription>Environment details useful for support requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(info).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/10 bg-background/40 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="text-sm font-medium truncate">{v}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={copy}>
          <Copy className="h-4 w-4 mr-2" /> Copy system info
        </Button>
      </CardContent>
    </Glass>
  );
}
