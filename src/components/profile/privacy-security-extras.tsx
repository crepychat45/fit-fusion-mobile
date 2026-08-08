import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Lock, EyeOff, Bell, UserX, Globe, Download, Trash2, KeyRound, ShieldQuestion,
  Timer, ScanFace, FileWarning, Plus, Fingerprint, Radar, Database, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LS_KEY = "fitfusion-privacy-security";
const LS_PIN = "fitfusion-applock-pin";

type Visibility = "public" | "followers" | "private";

export interface PrivacySecurityPrefs {
  // App lock
  appLockEnabled: boolean;
  autoLockMinutes: number;
  biometricUnlock: boolean;
  lockOnBackground: boolean;
  hideContentInSwitcher: boolean;
  // Privacy screen
  privacyScreen: boolean;
  maskSensitiveStats: boolean;
  hideNotificationContent: boolean;
  incognitoWorkouts: boolean;
  // Alerts
  newDeviceAlerts: boolean;
  failedAttemptAlerts: boolean;
  weeklySecurityDigest: boolean;
  breachMonitoring: boolean;
  sessionTimeoutMinutes: number;
  // Privacy controls
  profileVisibility: Visibility;
  searchableByEmail: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  readReceipts: boolean;
  shareWorkoutData: boolean;
  shareHealthMetrics: boolean;
  personalizedAi: boolean;
  analyticsCollection: boolean;
  crashReports: boolean;
  locationPrecision: "exact" | "approximate" | "off";
  // Data
  autoDeleteChatDays: number;
  blockedUsers: string[];
}

const DEFAULTS: PrivacySecurityPrefs = {
  appLockEnabled: false,
  autoLockMinutes: 5,
  biometricUnlock: false,
  lockOnBackground: true,
  hideContentInSwitcher: true,
  privacyScreen: false,
  maskSensitiveStats: false,
  hideNotificationContent: false,
  incognitoWorkouts: false,
  newDeviceAlerts: true,
  failedAttemptAlerts: true,
  weeklySecurityDigest: false,
  breachMonitoring: true,
  sessionTimeoutMinutes: 60,
  profileVisibility: "followers",
  searchableByEmail: false,
  showOnlineStatus: true,
  showLastSeen: false,
  readReceipts: true,
  shareWorkoutData: true,
  shareHealthMetrics: false,
  personalizedAi: true,
  analyticsCollection: true,
  crashReports: true,
  locationPrecision: "approximate",
  autoDeleteChatDays: 0,
  blockedUsers: [],
};

function loadPrefs(): PrivacySecurityPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<PrivacySecurityPrefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function scorePassword(pw: string) {
  let score = 0;
  const checks = [
    { ok: pw.length >= 12, label: "12+ characters" },
    { ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw), label: "Upper & lowercase" },
    { ok: /\d/.test(pw), label: "A number" },
    { ok: /[^A-Za-z0-9]/.test(pw), label: "A symbol" },
    { ok: pw.length > 0 && !/(password|12345|qwerty|fitness|admin)/i.test(pw), label: "No common words" },
  ];
  checks.forEach((c) => c.ok && (score += 20));
  return { score, checks };
}

function Row({
  icon: Icon, title, desc, children,
}: { icon: React.ElementType; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/20 bg-muted/20 p-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground">{title}</div>
          <div className="text-[10px] text-muted-foreground leading-snug">{desc}</div>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function PrivacySecurityExtras({ userEmail }: { userEmail?: string }) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<PrivacySecurityPrefs>(() => loadPrefs());
  const [userId, setUserId] = useState<string | null>(null);
  const [pinSet, setPinSet] = useState(() => !!localStorage.getItem(LS_PIN));
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pwTest, setPwTest] = useState("");
  const [blockInput, setBlockInput] = useState("");
  const mounted = useRef(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth?.user?.id ?? null;
        if (!active) return;
        setUserId(uid);
        if (!uid) return;
        const { data } = await supabase
          .from("user_settings")
          .select("privacy_settings")
          .eq("user_id", uid)
          .maybeSingle();
        const remote = (data?.privacy_settings as Record<string, unknown> | null)?.advanced as
          | Partial<PrivacySecurityPrefs>
          | undefined;
        if (active && remote && typeof remote === "object") {
          setPrefs((prev) => ({ ...prev, ...remote }));
        }
      } catch {
        /* offline — local prefs still apply */
      }
    })();
    const onHydrated = () => setPrefs(loadPrefs());
    window.addEventListener("fitfusion-settings-hydrated", onHydrated);
    return () => {
      active = false;
      window.removeEventListener("fitfusion-settings-hydrated", onHydrated);
    };
  }, []);

  // Persist locally immediately, push to cloud debounced.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      if (!userId) return;
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("privacy_settings")
          .eq("user_id", userId)
          .maybeSingle();
        const current = (data?.privacy_settings as Record<string, unknown>) || {};
        await supabase.from("user_settings").upsert(
          { user_id: userId, privacy_settings: { ...current, advanced: prefs } as unknown as never },
          { onConflict: "user_id" },
        );
      } catch {
        /* retried on next change */
      }
    }, 700);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [prefs, userId]);

  const set = useCallback(<K extends keyof PrivacySecurityPrefs>(key: K, value: PrivacySecurityPrefs[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Privacy screen: blur the app when it loses focus.
  useEffect(() => {
    if (!prefs.privacyScreen) return;
    const root = document.documentElement;
    const blur = () => root.classList.add("ff-privacy-blur");
    const clear = () => root.classList.remove("ff-privacy-blur");
    window.addEventListener("blur", blur);
    window.addEventListener("focus", clear);
    document.addEventListener("visibilitychange", () => (document.hidden ? blur() : clear()));
    return () => {
      clear();
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", clear);
    };
  }, [prefs.privacyScreen]);

  const pwStrength = useMemo(() => scorePassword(pwTest), [pwTest]);

  const savePin = () => {
    if (!/^\d{4,8}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "Use 4–8 digits.", variant: "destructive" });
      return;
    }
    if (pin !== pinConfirm) {
      toast({ title: "PINs do not match", variant: "destructive" });
      return;
    }
    // Stored as a hashed digest, never plaintext.
    void savePinHash(pin, userEmail ?? "local").then(() => {
      setPinSet(true);
      setPin("");
      setPinConfirm("");
      set("appLockEnabled", true);
      notifyLockPrefsChanged();
      toast({ title: "App lock enabled 🔒", description: "Your PIN is stored hashed on this device." });
    });
  };

  const testPin = () => {
    if (!/^\d{4,8}$/.test(pin)) {
      toast({ title: "Enter your PIN above to test", variant: "destructive" });
      return;
    }
    void verifyPin(pin).then((ok) => {
      setPin("");
      toast(
        ok
          ? { title: "PIN correct ✓" }
          : { title: "PIN incorrect", variant: "destructive" as const },
      );
    });
  };

  const removePin = () => {
    clearPin();
    setPinSet(false);
    set("appLockEnabled", false);
    notifyLockPrefsChanged();
    toast({ title: "App lock removed" });
  };

  const lockNow = () => {
    if (!pinSet || !prefs.appLockEnabled) {
      toast({ title: "Set a PIN and enable app lock first", variant: "destructive" });
      return;
    }
    requestLock();
  };

  const toggleBiometricUnlock = async (v: boolean) => {
    if (!v) {
      set("biometricUnlock", false);
      notifyLockPrefsChanged();
      return;
    }
    if (!(await biometricAvailable())) {
      toast({
        title: "Biometrics unavailable",
        description: "Set up Face ID / fingerprint / Windows Hello on this device first.",
        variant: "destructive",
      });
      return;
    }
    const ok = await promptBiometric(
      (await listPasskeys().catch(() => []))?.map((p) => p.id) ?? [],
    );
    if (!ok) {
      toast({
        title: "Could not verify",
        description: "Add a passkey in the Passkey Manager above, then try again.",
        variant: "destructive",
      });
      return;
    }
    set("biometricUnlock", true);
    notifyLockPrefsChanged();
    toast({ title: "Biometric unlock enabled" });
  };


  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      account: userEmail ?? "unknown",
      appLock: { enabled: prefs.appLockEnabled, pinConfigured: pinSet, autoLockMinutes: prefs.autoLockMinutes },
      privacy: prefs,
      device: { userAgent: navigator.userAgent, language: navigator.language, platform: navigator.platform },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-security-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Security report downloaded" });
  };

  const clearLocalData = () => {
    const keep = ["fitfusion-privacy-security", LS_PIN];
    Object.keys(localStorage)
      .filter((k) => k.startsWith("fitfusion") && !keep.includes(k))
      .forEach((k) => localStorage.removeItem(k));
    toast({ title: "Local cache cleared", description: "Cloud-synced data is untouched." });
  };

  const addBlocked = () => {
    const name = blockInput.trim().slice(0, 60);
    if (!name) return;
    if (prefs.blockedUsers.includes(name)) {
      toast({ title: "Already blocked" });
      return;
    }
    set("blockedUsers", [...prefs.blockedUsers, name]);
    setBlockInput("");
    toast({ title: `Blocked ${name}` });
  };

  return (
    <div className="space-y-3">
      {/* App lock */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" /> App Lock & PIN
          </CardTitle>
          <CardDescription>Require a PIN or biometrics before FitFusion opens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!pinSet ? (
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  inputMode="numeric" type="password" maxLength={8} placeholder="New PIN"
                  aria-label="New PIN" value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="h-9"
                />
                <Input
                  inputMode="numeric" type="password" maxLength={8} placeholder="Confirm PIN"
                  aria-label="Confirm PIN" value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))} className="h-9"
                />
              </div>
              <Button size="sm" className="w-full" onClick={savePin}>Set PIN & enable lock</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="text-xs">
                <div className="font-semibold">PIN configured</div>
                <div className="text-[10px] text-muted-foreground">Stored hashed on this device only</div>
              </div>
              <Button size="sm" variant="outline" onClick={removePin}>Remove</Button>
            </div>
          )}

          <Row icon={Lock} title="App lock" desc="Ask for the PIN when the app starts">
            <Switch
              aria-label="App lock" checked={prefs.appLockEnabled} disabled={!pinSet}
              onCheckedChange={(v) => set("appLockEnabled", v)}
            />
          </Row>
          <Row icon={ScanFace} title="Biometric unlock" desc="Use fingerprint / face instead of the PIN">
            <Switch aria-label="Biometric unlock" checked={prefs.biometricUnlock} onCheckedChange={(v) => set("biometricUnlock", v)} />
          </Row>
          <Row icon={Timer} title="Auto-lock" desc="Lock after a period of inactivity">
            <Select value={String(prefs.autoLockMinutes)} onValueChange={(v) => set("autoLockMinutes", Number(v))}>
              <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Auto-lock delay"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 5, 15, 30, 60].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Row icon={EyeOff} title="Lock on background" desc="Lock instantly when you switch apps">
            <Switch aria-label="Lock on background" checked={prefs.lockOnBackground} onCheckedChange={(v) => set("lockOnBackground", v)} />
          </Row>
        </CardContent>
      </Card>

      {/* Privacy screen */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <EyeOff className="h-4 w-4 text-primary" /> Privacy Screen
          </CardTitle>
          <CardDescription>Keep your data hidden from over-the-shoulder eyes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row icon={EyeOff} title="Blur when inactive" desc="Blur the app when it loses focus">
            <Switch aria-label="Blur when inactive" checked={prefs.privacyScreen} onCheckedChange={(v) => set("privacyScreen", v)} />
          </Row>
          <Row icon={Database} title="Mask sensitive stats" desc="Hide weight and body metrics until tapped">
            <Switch aria-label="Mask sensitive stats" checked={prefs.maskSensitiveStats} onCheckedChange={(v) => set("maskSensitiveStats", v)} />
          </Row>
          <Row icon={Bell} title="Hide notification content" desc="Show “New message” instead of the text">
            <Switch aria-label="Hide notification content" checked={prefs.hideNotificationContent} onCheckedChange={(v) => set("hideNotificationContent", v)} />
          </Row>
          <Row icon={Radar} title="Incognito workouts" desc="Log sessions without posting to the community feed">
            <Switch aria-label="Incognito workouts" checked={prefs.incognitoWorkouts} onCheckedChange={(v) => set("incognitoWorkouts", v)} />
          </Row>
          <Row icon={EyeOff} title="Hide preview in app switcher" desc="Cover the screenshot the OS keeps">
            <Switch aria-label="Hide preview in app switcher" checked={prefs.hideContentInSwitcher} onCheckedChange={(v) => set("hideContentInSwitcher", v)} />
          </Row>
        </CardContent>
      </Card>

      {/* Alerts & sessions */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Security Alerts
          </CardTitle>
          <CardDescription>Get told the moment something looks off.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row icon={Fingerprint} title="New device sign-in alerts" desc="Notify me when a new device logs in">
            <Switch aria-label="New device alerts" checked={prefs.newDeviceAlerts} onCheckedChange={(v) => set("newDeviceAlerts", v)} />
          </Row>
          <Row icon={FileWarning} title="Failed attempt alerts" desc="Warn after repeated wrong passwords">
            <Switch aria-label="Failed attempt alerts" checked={prefs.failedAttemptAlerts} onCheckedChange={(v) => set("failedAttemptAlerts", v)} />
          </Row>
          <Row icon={ShieldQuestion} title="Breach monitoring" desc="Check your email against known breaches">
            <Switch aria-label="Breach monitoring" checked={prefs.breachMonitoring} onCheckedChange={(v) => set("breachMonitoring", v)} />
          </Row>
          <Row icon={Bell} title="Weekly security digest" desc="A short email summary every Monday">
            <Switch aria-label="Weekly security digest" checked={prefs.weeklySecurityDigest} onCheckedChange={(v) => set("weeklySecurityDigest", v)} />
          </Row>
          <Row icon={Timer} title="Session timeout" desc="Sign out automatically after inactivity">
            <Select value={String(prefs.sessionTimeoutMinutes)} onValueChange={(v) => set("sessionTimeoutMinutes", Number(v))}>
              <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Session timeout"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[15, 30, 60, 240, 1440].map((m) => (
                  <SelectItem key={m} value={String(m)}>{m >= 60 ? `${m / 60} h` : `${m} min`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </CardContent>
      </Card>

      {/* Privacy controls */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" /> Privacy Controls
          </CardTitle>
          <CardDescription>Decide exactly what others and our AI can see.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row icon={Users} title="Profile visibility" desc="Who can open your full profile">
            <Select value={prefs.profileVisibility} onValueChange={(v) => set("profileVisibility", v as Visibility)}>
              <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Profile visibility"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Everyone</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="private">Only me</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row icon={Globe} title="Location precision" desc="Accuracy shared with route and weather features">
            <Select value={prefs.locationPrecision} onValueChange={(v) => set("locationPrecision", v as PrivacySecurityPrefs["locationPrecision"])}>
              <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Location precision"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exact</SelectItem>
                <SelectItem value="approximate">City only</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          {([
            ["searchableByEmail", "Searchable by email", "Let people find you with your email address"],
            ["showOnlineStatus", "Show online status", "Display a green dot when you're active"],
            ["showLastSeen", "Show last seen", "Share when you were last online"],
            ["readReceipts", "Read receipts", "Let people see when you read a message"],
            ["shareWorkoutData", "Share workout data", "Include your sessions in the community feed"],
            ["shareHealthMetrics", "Share health metrics", "Heart rate, SpO₂ and sleep in shared cards"],
            ["personalizedAi", "Personalised AI coaching", "Use my history to tailor AI suggestions"],
            ["analyticsCollection", "Product analytics", "Anonymous usage stats to improve FitFusion"],
            ["crashReports", "Crash reports", "Send diagnostics when something breaks"],
          ] as const).map(([key, title, desc]) => (
            <Row key={key} icon={Globe} title={title} desc={desc}>
              <Switch
                aria-label={title}
                checked={prefs[key] as boolean}
                onCheckedChange={(v) => set(key, v as never)}
              />
            </Row>
          ))}
        </CardContent>
      </Card>

      {/* Password strength tool */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" /> Password Strength Checker
          </CardTitle>
          <CardDescription>Tested entirely on your device — nothing is sent anywhere.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            type="password" placeholder="Try a password" aria-label="Password to test"
            value={pwTest} onChange={(e) => setPwTest(e.target.value.slice(0, 128))} className="h-9"
          />
          <Progress value={pwStrength.score} className="h-1.5" />
          <div className="grid grid-cols-2 gap-1.5">
            {pwStrength.checks.map((c) => (
              <div key={c.label} className={`text-[10px] ${c.ok ? "text-emerald-500" : "text-muted-foreground"}`}>
                {c.ok ? "✓" : "•"} {c.label}
              </div>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Strength: <span className="font-semibold text-foreground">
              {pwStrength.score >= 80 ? "Strong" : pwStrength.score >= 60 ? "Good" : pwStrength.score >= 40 ? "Weak" : "Very weak"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Blocked users */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserX className="h-4 w-4 text-primary" /> Blocked Members
          </CardTitle>
          <CardDescription>Blocked people can't message you or see your posts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Username to block" aria-label="Username to block" value={blockInput}
              onChange={(e) => setBlockInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBlocked()} className="h-9"
            />
            <Button size="sm" onClick={addBlocked} className="h-9"><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          {prefs.blockedUsers.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-2">No blocked members.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {prefs.blockedUsers.map((u) => (
                <Badge key={u} variant="outline" className="gap-1">
                  {u}
                  <button
                    aria-label={`Unblock ${u}`}
                    onClick={() => set("blockedUsers", prefs.blockedUsers.filter((b) => b !== u))}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >×</button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data rights */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-primary" /> Data & Your Rights
          </CardTitle>
          <CardDescription>Export, retention and cleanup controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row icon={Timer} title="Auto-delete chats" desc="Remove messages older than this">
            <Select value={String(prefs.autoDeleteChatDays)} onValueChange={(v) => set("autoDeleteChatDays", Number(v))}>
              <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Auto-delete chats"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Never</SelectItem>
                {[7, 30, 90, 365].map((d) => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Separator />
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={downloadReport}>
            <Download className="h-3.5 w-3.5 mr-2" />Download security & privacy report
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={clearLocalData}>
            <Trash2 className="h-3.5 w-3.5 mr-2" />Clear cached data on this device
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PrivacySecurityExtras;
