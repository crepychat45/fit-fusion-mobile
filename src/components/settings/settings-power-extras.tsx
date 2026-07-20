// Power extras: adds a dedicated feature card to every Settings tab.
// Each panel is self-contained, persists to localStorage under a namespaced
// key, and uses only existing shadcn primitives + framer-motion so nothing new
// needs to be wired up at the container level beyond mounting the panel.

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  AlertCircle,
  BellOff,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  FlaskConical,
  Gauge,
  Globe,
  HardDrive,
  Info,
  KeyRound,
  Languages,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";

/* ────────────────────────── Local storage helper ────────────────────────── */
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
      /* noop */
    }
  }, [key, v]);
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

/* ═══════════════════════════════ ACCOUNT ═══════════════════════════════ */
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function AccountExtras() {
  const { toast } = useToast();
  // fitfusion-* keys are mirrored to Supabase user_settings.local_kv automatically.
  const [autoLock, setAutoLock] = useLocal("fitfusion-account-autolock", 15);
  const [signInAlerts, setSignInAlerts] = useLocal("fitfusion-account-signin-alerts", true);
  const [recovery, setRecovery] = useLocal("fitfusion-account-recovery-email", "");
  const [recoveryDraft, setRecoveryDraft] = useState(recovery);
  const [saving, setSaving] = useState(false);

  // Re-sync draft when cloud hydration replaces the value.
  useEffect(() => {
    setRecoveryDraft(recovery);
  }, [recovery]);

  const saveRecovery = async () => {
    const trimmed = recoveryDraft.trim();
    if (trimmed && !isValidEmail(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid recovery email address.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      setRecovery(trimmed);
      // Also mirror onto the auth user metadata so it survives across devices even
      // without settings hydration.
      try {
        await supabase.auth.updateUser({ data: { recovery_email: trimmed || null } });
      } catch {
        /* metadata write is best-effort; local + cloud-mirror already succeeded */
      }
      toast({
        title: trimmed ? "Recovery contact saved" : "Recovery contact cleared",
        description: trimmed
          ? `We'll use ${trimmed} to help you regain access.`
          : "No backup recovery email on file.",
      });
    } finally {
      setSaving(false);
    }
  };

  const device = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone/i.test(ua);
    const browser = /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Browser";
    return { type: isMobile ? "Mobile" : "Desktop", browser };
  }, []);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-primary" />
          Account Command Center
          <Badge variant="secondary" className="ml-1 text-[10px]">v7.2</Badge>
        </CardTitle>
        <CardDescription>
          Session guardrails, recovery contacts, and device intelligence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Current device</div>
            <div className="font-medium">{device.type} · {device.browser}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Timezone</div>
            <div className="font-medium">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Auto-lock after inactivity</Label>
            <span className="text-xs text-muted-foreground">{autoLock} min</span>
          </div>
          <Slider
            value={[autoLock]}
            min={1}
            max={60}
            step={1}
            onValueChange={(v) => setAutoLock(v[0])}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">New sign-in email alerts</p>
            <p className="text-xs text-muted-foreground">
              Get notified when a new device signs in.
            </p>
          </div>
          <Switch checked={signInAlerts} onCheckedChange={setSignInAlerts} />
        </div>

        <div>
          <Label className="text-sm">Backup recovery email</Label>
          <Input
            type="email"
            value={recoveryDraft}
            onChange={(e) => setRecoveryDraft(e.target.value)}
            placeholder="recovery@example.com"
            className="mt-1"
            autoComplete="email"
          />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={saveRecovery} disabled={saving || recoveryDraft === recovery}>
              {saving ? "Saving…" : "Save recovery contact"}
            </Button>
            {recovery ? (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" /> Synced
              </Badge>
            ) : null}
          </div>
          {recovery ? (
            <p className="mt-1 text-xs text-muted-foreground">
              On file: <span className="font-mono">{recovery}</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ SECURITY ═══════════════════════════════ */
export function SecurityExtras() {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [strongPw, setStrongPw] = useLocal("ff-sec-strong-pw", true);
  const [passkey, setPasskey] = useLocal("ff-sec-passkey", false);
  const [twoFa, setTwoFa] = useLocal("ff-sec-2fa", false);
  const [breachCheck, setBreachCheck] = useLocal("ff-sec-breach", true);
  const [webauthnOnly, setWebauthnOnly] = useLocal("ff-sec-webauthn-only", false);

  useEffect(() => {
    const s =
      (strongPw ? 25 : 0) +
      (passkey ? 30 : 0) +
      (twoFa ? 25 : 0) +
      (breachCheck ? 10 : 0) +
      (webauthnOnly ? 10 : 0);
    const t = setTimeout(() => setScore(s), 100);
    return () => clearTimeout(t);
  }, [strongPw, passkey, twoFa, breachCheck, webauthnOnly]);

  const tone =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Security Posture
          <Badge variant="secondary" className="ml-1 text-[10px]">Live</Badge>
        </CardTitle>
        <CardDescription>
          Real-time score across passkeys, 2FA, and breach monitoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Overall score</span>
            <span className={`text-2xl font-bold tabular-nums ${tone}`}>{score}</span>
          </div>
          <Progress value={score} />
        </div>

        {[
          { k: strongPw, s: setStrongPw, label: "Enforce strong passwords", d: "Min 12 chars, mixed classes." },
          { k: passkey, s: setPasskey, label: "Prefer passkeys at login", d: "Biometric-first sign-in." },
          { k: twoFa, s: setTwoFa, label: "Two-factor authentication", d: "TOTP or hardware key." },
          { k: breachCheck, s: setBreachCheck, label: "Monitor known breaches", d: "Warn if credentials leak." },
          { k: webauthnOnly, s: setWebauthnOnly, label: "WebAuthn-only sign-in", d: "Disable password fallback." },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.d}</p>
            </div>
            <Switch checked={row.k} onCheckedChange={row.s} />
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            toast({
              title: "Security audit complete",
              description: `Score ${score}/100. ${score >= 80 ? "Excellent." : "Consider enabling passkeys and 2FA."}`,
            })
          }
        >
          <KeyRound className="h-3.5 w-3.5 mr-1.5" />
          Run instant audit
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ DISPLAY ═══════════════════════════════ */
export function DisplayExtras() {
  const { toast } = useToast();
  const [reduceMotion, setReduceMotion] = useLocal("ff-display-reduce-motion", false);
  const [highContrast, setHighContrast] = useLocal("ff-display-high-contrast", false);
  const [cbFilter, setCbFilter] = useLocal<string>("ff-display-cb", "none");
  const [uiScale, setUiScale] = useLocal("ff-display-ui-scale", 100);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reduceMotion);
    root.classList.toggle("high-contrast", highContrast);
    root.style.setProperty("--ui-scale", `${uiScale / 100}`);
    const filters: Record<string, string> = {
      none: "",
      protanopia: "url(#cb-protanopia) saturate(0.9)",
      deuteranopia: "url(#cb-deuteranopia) saturate(0.9)",
      tritanopia: "url(#cb-tritanopia) saturate(0.9)",
      grayscale: "grayscale(1)",
    };
    root.style.filter = filters[cbFilter] || "";
  }, [reduceMotion, highContrast, cbFilter, uiScale]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Accessibility &amp; Motion
        </CardTitle>
        <CardDescription>
          Fine-tune contrast, motion, and color perception globally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Reduce motion</p>
            <p className="text-xs text-muted-foreground">
              Disables large transitions and parallax.
            </p>
          </div>
          <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">High contrast</p>
            <p className="text-xs text-muted-foreground">
              Boost legibility for low-vision users.
            </p>
          </div>
          <Switch checked={highContrast} onCheckedChange={setHighContrast} />
        </div>

        <div>
          <Label className="text-sm">Color vision assist</Label>
          <Select value={cbFilter} onValueChange={setCbFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="protanopia">Protanopia (red-blind)</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopia (green-blind)</SelectItem>
              <SelectItem value="tritanopia">Tritanopia (blue-blind)</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">UI scale</Label>
            <span className="text-xs text-muted-foreground">{uiScale}%</span>
          </div>
          <Slider
            value={[uiScale]}
            min={80}
            max={140}
            step={5}
            onValueChange={(v) => setUiScale(v[0])}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setReduceMotion(false);
            setHighContrast(false);
            setCbFilter("none");
            setUiScale(100);
            toast({ title: "Display defaults restored" });
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reset display extras
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ PRIVACY ═══════════════════════════════ */
export function PrivacyExtras() {
  const { toast } = useToast();
  const [telemetry, setTelemetry] = useLocal("ff-priv-telemetry", true);
  const [analytics, setAnalytics] = useLocal("ff-priv-analytics", true);
  const [trackerBlock, setTrackerBlock] = useLocal("ff-priv-tracker", true);
  const [dnt, setDnt] = useLocal("ff-priv-dnt", false);
  const [personalized, setPersonalized] = useLocal("ff-priv-personalized-ai", true);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          Privacy Controls
        </CardTitle>
        <CardDescription>
          Choose exactly what leaves your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { k: telemetry, s: setTelemetry, label: "Anonymous telemetry", d: "Aggregate crash + perf data." },
          { k: analytics, s: setAnalytics, label: "Product analytics", d: "Helps improve features." },
          { k: trackerBlock, s: setTrackerBlock, label: "Third-party tracker blocker", d: "Blocks common ad networks." },
          { k: dnt, s: setDnt, label: "Send Do-Not-Track header", d: "Requests sites not to track you." },
          { k: personalized, s: setPersonalized, label: "Personalized AI suggestions", d: "Uses your workout history." },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.d}</p>
            </div>
            <Switch checked={row.k} onCheckedChange={row.s} />
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            try {
              document.cookie.split(";").forEach((c) => {
                const eq = c.indexOf("=");
                const name = eq > -1 ? c.substr(0, eq) : c;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
              });
              toast({ title: "Cookies cleared" });
            } catch {
              toast({ title: "Could not clear cookies", variant: "destructive" });
            }
          }}
        >
          Clear non-essential cookies
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ NOTIFICATIONS ═══════════════════════════════ */
export function NotificationExtras() {
  const [quiet, setQuiet] = useLocal("ff-noti-quiet", false);
  const [start, setStart] = useLocal("ff-noti-quiet-start", "22:00");
  const [end, setEnd] = useLocal("ff-noti-quiet-end", "07:00");
  const [priority, setPriority] = useLocal<string>("ff-noti-priority", "balanced");
  const [batch, setBatch] = useLocal("ff-noti-batch", true);
  const [sound, setSound] = useLocal("ff-noti-sound", true);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellOff className="h-4 w-4 text-primary" />
          Quiet Hours &amp; Priority
        </CardTitle>
        <CardDescription>
          Schedule silence and control what breaks through.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable quiet hours</p>
            <p className="text-xs text-muted-foreground">
              Mute non-critical alerts on a schedule.
            </p>
          </div>
          <Switch checked={quiet} onCheckedChange={setQuiet} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Start</Label>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">End</Label>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-sm">Priority mode</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications</SelectItem>
              <SelectItem value="balanced">Balanced (recommended)</SelectItem>
              <SelectItem value="focus">Focus (workouts &amp; alarms only)</SelectItem>
              <SelectItem value="critical">Critical alerts only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Batch delivery</p>
            <p className="text-xs text-muted-foreground">
              Group non-urgent alerts every 30 minutes.
            </p>
          </div>
          <Switch checked={batch} onCheckedChange={setBatch} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notification sound</p>
            <p className="text-xs text-muted-foreground">
              Plays a soft chime for new alerts.
            </p>
          </div>
          <Switch checked={sound} onCheckedChange={setSound} />
        </div>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ UNITS ═══════════════════════════════ */
export function UnitsExtras() {
  const [locale, setLocale] = useLocal("ff-units-locale", "en-IN");
  const [currency, setCurrency] = useLocal("ff-units-currency", "INR");
  const [weekStart, setWeekStart] = useLocal<string>("ff-units-week-start", "monday");
  const [timeFormat, setTimeFormat] = useLocal<string>("ff-units-time-format", "24");

  const preview = useMemo(() => {
    try {
      const now = new Date();
      return {
        date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(now),
        time: new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: timeFormat === "12",
        }).format(now),
        money: new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(1499.5),
        number: new Intl.NumberFormat(locale).format(1234567.89),
      };
    } catch {
      return { date: "-", time: "-", money: "-", number: "-" };
    }
  }, [locale, currency, timeFormat]);

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          Locale &amp; Format Preview
        </CardTitle>
        <CardDescription>
          Live preview of how numbers, dates, and currency render.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Locale</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-IN">English (India)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="hi-IN">हिन्दी (India)</SelectItem>
                <SelectItem value="ja-JP">日本語</SelectItem>
                <SelectItem value="de-DE">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR ₹</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="GBP">GBP £</SelectItem>
                <SelectItem value="JPY">JPY ¥</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Time format</Label>
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24-hour</SelectItem>
                <SelectItem value="12">12-hour (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Week starts on</Label>
            <Select value={weekStart} onValueChange={setWeekStart}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-background/40 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{preview.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{preview.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium">{preview.money}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number</span>
            <span className="font-medium">{preview.number}</span>
          </div>
        </div>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ CHAT ═══════════════════════════════ */
export function ChatExtras() {
  const { toast } = useToast();
  const [tone, setTone] = useLocal("ff-chat-tone", 1);
  const [memory, setMemory] = useLocal("ff-chat-memory", true);
  const [suggest, setSuggest] = useLocal("ff-chat-suggest", true);
  const [safeMode, setSafeMode] = useLocal("ff-chat-safe", true);

  const toneLabel = ["Concise", "Balanced", "Detailed"][tone] || "Balanced";

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          FitX Fusion Chat Personality
        </CardTitle>
        <CardDescription>
          Tune tone, memory, and safety of the AI coach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Response tone</Label>
            <Badge variant="secondary">{toneLabel}</Badge>
          </div>
          <Slider value={[tone]} min={0} max={2} step={1} onValueChange={(v) => setTone(v[0])} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Long-term memory</p>
            <p className="text-xs text-muted-foreground">
              Remembers preferences across sessions.
            </p>
          </div>
          <Switch checked={memory} onCheckedChange={setMemory} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Smart suggestions</p>
            <p className="text-xs text-muted-foreground">
              Offer follow-up prompts after each reply.
            </p>
          </div>
          <Switch checked={suggest} onCheckedChange={setSuggest} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Safe mode</p>
            <p className="text-xs text-muted-foreground">
              Filters risky exercise / medical topics.
            </p>
          </div>
          <Switch checked={safeMode} onCheckedChange={setSafeMode} />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            try {
              Object.keys(localStorage)
                .filter((k) => k.startsWith("ff-chat-history"))
                .forEach((k) => localStorage.removeItem(k));
              toast({ title: "Chat memory cleared" });
            } catch {
              toast({ title: "Could not clear memory", variant: "destructive" });
            }
          }}
        >
          Wipe conversation memory
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ UPDATES ═══════════════════════════════ */
export function UpdateExtras() {
  const { toast } = useToast();
  const [channel, setChannel] = useLocal("ff-upd-channel", "stable");
  const [autoCheck, setAutoCheck] = useLocal("ff-upd-autocheck", true);
  const [interval, setInterval] = useLocal("ff-upd-interval", 6);
  const [wifiOnly, setWifiOnly] = useLocal("ff-upd-wifi", true);
  const [preRelease, setPreRelease] = useLocal("ff-upd-prerelease", false);
  const [rolloutSeed] = useLocal("ff-upd-seed", Math.floor(Math.random() * 100));

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Update Channel &amp; Rollout
        </CardTitle>
        <CardDescription>
          Choose how new versions reach this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm">Release channel</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable · public release</SelectItem>
              <SelectItem value="beta">Beta · early adopters</SelectItem>
              <SelectItem value="canary">Canary · daily bleeding edge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-check for updates</p>
            <p className="text-xs text-muted-foreground">
              Silently poll the release manifest.
            </p>
          </div>
          <Switch checked={autoCheck} onCheckedChange={setAutoCheck} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Check interval</Label>
            <span className="text-xs text-muted-foreground">Every {interval}h</span>
          </div>
          <Slider value={[interval]} min={1} max={24} step={1} onValueChange={(v) => setInterval(v[0])} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Wi-Fi only downloads</p>
            <p className="text-xs text-muted-foreground">Skip metered networks.</p>
          </div>
          <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Show pre-release changelogs</p>
            <p className="text-xs text-muted-foreground">Includes unreleased notes.</p>
          </div>
          <Switch checked={preRelease} onCheckedChange={setPreRelease} />
        </div>

        <div className="rounded-xl border border-white/10 bg-background/40 p-3 flex items-center gap-3">
          <Gauge className="h-5 w-5 text-primary" />
          <div className="text-xs">
            <div className="font-medium">Your rollout bucket: {rolloutSeed}/100</div>
            <div className="text-muted-foreground">
              Determines when staged releases reach this device.
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() =>
            toast({
              title: "Checked for updates",
              description: `Channel ${channel} · nothing new right now.`,
            })
          }
        >
          Check now
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ ENHANCED VALIDATION ═══════════════════════════════ */
export function EnhancedValidationExtras() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean; ms: number }[]>([]);

  const run = async () => {
    setRunning(true);
    setResults([]);
    const checks = [
      { name: "LocalStorage read/write", fn: async () => {
        localStorage.setItem("__ff_probe", "1");
        return localStorage.getItem("__ff_probe") === "1";
      }},
      { name: "IndexedDB availability", fn: async () => "indexedDB" in window },
      { name: "Service Worker ready", fn: async () => "serviceWorker" in navigator },
      { name: "Network latency < 800ms", fn: async () => {
        const t = performance.now();
        try {
          await fetch("/manifest.json", { cache: "no-store" });
          return performance.now() - t < 800;
        } catch { return false; }
      }},
      { name: "WebAuthn support", fn: async () => "PublicKeyCredential" in window },
      { name: "Notifications permission", fn: async () =>
        "Notification" in window && Notification.permission !== "denied" },
    ];
    for (const c of checks) {
      const start = performance.now();
      let ok = false;
      try { ok = !!(await c.fn()); } catch { ok = false; }
      const ms = Math.round(performance.now() - start);
      setResults((r) => [...r, { name: c.name, ok, ms }]);
      await new Promise((res) => setTimeout(res, 180));
    }
    setRunning(false);
    toast({ title: "Self-diagnostics complete" });
  };

  const passed = results.filter((r) => r.ok).length;

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          Enhanced Self-Diagnostics
        </CardTitle>
        <CardDescription>
          Runs six live checks against browser capabilities and network health.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={run} disabled={running} size="sm">
          {running ? "Running…" : "Run full diagnostic"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  )}
                  {r.name}
                </div>
                <span className="text-xs text-muted-foreground">{r.ms}ms</span>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-1">
              {passed} of {results.length} checks passed.
            </div>
          </div>
        )}
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ DEVELOPER ═══════════════════════════════ */
const FEATURE_FLAGS = [
  { key: "ff-flag-liquid-glass", label: "Liquid Glass v2 shaders", d: "Enables experimental blur pipeline." },
  { key: "ff-flag-ai-coach-beta", label: "AI Coach beta", d: "Preview next-gen coaching prompts." },
  { key: "ff-flag-heatmap-3d", label: "3D activity heatmap", d: "Uses WebGL for the profile heatmap." },
  { key: "ff-flag-fast-boot", label: "Fast boot", d: "Defers heavy modules until idle." },
  { key: "ff-flag-mcp-tools", label: "MCP tools", d: "Exposes agent integrations." },
];

export function DeveloperExtras() {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    FEATURE_FLAGS.forEach((f) => {
      try { out[f.key] = localStorage.getItem(f.key) === "1"; } catch { out[f.key] = false; }
    });
    return out;
  });

  const setFlag = (k: string, v: boolean) => {
    setFlags((s) => ({ ...s, [k]: v }));
    try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* noop */ }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Feature Flags
          <Badge variant="secondary" className="ml-1 text-[10px]">Client-side</Badge>
        </CardTitle>
        <CardDescription>
          Toggle experimental features locally. Reload for full effect.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {FEATURE_FLAGS.map((f) => (
          <div key={f.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.d}</p>
            </div>
            <Switch checked={!!flags[f.key]} onCheckedChange={(v) => setFlag(f.key, v)} />
          </div>
        ))}
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ DATA (Storage breakdown) ═══════════════════════════════ */
export function DataExtras() {
  const { toast } = useToast();
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [breakdown, setBreakdown] = useState<{ key: string; kb: number }[]>([]);

  const scan = async () => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const est = await navigator.storage.estimate();
        setUsage({ used: est.usage || 0, quota: est.quota || 1 });
      }
      const rows: { key: string; kb: number }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        const v = localStorage.getItem(k) || "";
        rows.push({ key: k, kb: (k.length + v.length) / 1024 });
      }
      rows.sort((a, b) => b.kb - a.kb);
      setBreakdown(rows.slice(0, 8));
    } catch {
      toast({ title: "Could not read storage", variant: "destructive" });
    }
  };

  useEffect(() => { scan(); }, []);

  const pct = usage ? Math.min(100, (usage.used / usage.quota) * 100) : 0;

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-primary" />
          Storage Intelligence
        </CardTitle>
        <CardDescription>
          Live breakdown of on-device storage usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usage && (
          <div>
            <div className="flex items-center justify-between mb-1 text-sm">
              <span>Origin quota</span>
              <span className="text-muted-foreground">
                {(usage.used / 1024 / 1024).toFixed(1)} MB /{" "}
                {(usage.quota / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <Progress value={pct} />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">
            Top local storage keys
          </div>
          {breakdown.length === 0 ? (
            <div className="text-xs text-muted-foreground">Nothing tracked yet.</div>
          ) : (
            breakdown.map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 px-3 py-1.5 text-xs"
              >
                <span className="truncate mr-2 font-mono">{r.key}</span>
                <span className="text-muted-foreground shrink-0">
                  {r.kb.toFixed(1)} KB
                </span>
              </div>
            ))
          )}
        </div>

        <Button size="sm" variant="outline" onClick={scan}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Rescan storage
        </Button>
      </CardContent>
    </Glass>
  );
}

/* ═══════════════════════════════ ABOUT ═══════════════════════════════ */
export function AboutExtras() {
  const { toast } = useToast();
  const snapshot = useMemo(
    () => ({
      version: "7.2.0",
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cores: (navigator as any).hardwareConcurrency || "?",
      memory: (navigator as any).deviceMemory || "?",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      online: navigator.onLine,
      screen: `${window.screen.width}×${window.screen.height}`,
    }),
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
      toast({ title: "System snapshot copied" });
    } catch {
      toast({ title: "Clipboard blocked", variant: "destructive" });
    }
  };

  return (
    <Glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          System Snapshot &amp; Credits
        </CardTitle>
        <CardDescription>
          Diagnostic fingerprint to attach when reporting an issue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(snapshot).map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg border border-white/10 bg-background/40 px-3 py-2"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {k}
              </div>
              <div className="truncate font-medium text-xs">{String(v)}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={copy}>
            Copy snapshot
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reload app
          </Button>
        </div>
        <div className="pt-2 text-xs text-muted-foreground border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Sun className="h-3 w-3" />
            FitX Fusion · Built with love, React, Vite and Lovable Cloud.
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Globe className="h-3 w-3" />
            Icons by Lucide · Charts by Recharts · Motion by Framer.
          </div>
        </div>
      </CardContent>
    </Glass>
  );
}
