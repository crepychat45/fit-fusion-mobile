import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Shield, Fingerprint, KeyRound, Smartphone, Wifi, Compass, Activity,
  Camera, Mic, MapPin, Lock, ShieldCheck, ShieldAlert, RefreshCw, Copy, LogOut, CheckCircle2, XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { randomBase32Secret, buildOtpAuthUrl, verifyTOTP, generateTOTP } from "@/lib/totp";
import { PasskeyManagementPanel } from "./passkey-management-panel";

const LS_2FA_ENABLED = "ff.security.2fa.enabled";
const LS_2FA_SECRET = "ff.security.2fa.secret";
const LS_BIOMETRIC_CRED = "ff.security.biometric.credId";
const LS_TRUSTED_DEVICES = "ff.security.trustedDevices";

type SensorStatus = { name: string; icon: React.ElementType; ok: boolean; note: string };

async function detectSensors(): Promise<SensorStatus[]> {
  const list: SensorStatus[] = [];
  // Motion / Orientation
  list.push({
    name: "Motion Sensor",
    icon: Activity,
    ok: typeof (window as any).DeviceMotionEvent !== "undefined",
    note: typeof (window as any).DeviceMotionEvent !== "undefined" ? "Available" : "Not available",
  });
  list.push({
    name: "Orientation",
    icon: Compass,
    ok: typeof (window as any).DeviceOrientationEvent !== "undefined",
    note: typeof (window as any).DeviceOrientationEvent !== "undefined" ? "Available" : "Not available",
  });
  // Network
  const conn = (navigator as any).connection;
  list.push({
    name: "Network",
    icon: Wifi,
    ok: !!navigator.onLine,
    note: conn?.effectiveType ? `${conn.effectiveType} • online` : navigator.onLine ? "Online" : "Offline",
  });
  // Camera
  let cam = false, mic = false;
  try {
    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    cam = !!devices?.some((d) => d.kind === "videoinput");
    mic = !!devices?.some((d) => d.kind === "audioinput");
  } catch { /* denied */ }
  list.push({ name: "Camera", icon: Camera, ok: cam, note: cam ? "Detected" : "Unavailable" });
  list.push({ name: "Microphone", icon: Mic, ok: mic, note: mic ? "Detected" : "Unavailable" });
  // Geolocation
  list.push({
    name: "Geolocation",
    icon: MapPin,
    ok: "geolocation" in navigator,
    note: "geolocation" in navigator ? "Supported" : "Unsupported",
  });
  return list;
}

function b64urlEncode(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type SecurityEvent = { id: string; type: string; label: string; at: string };

async function pushSecurityEvent(userId: string | null, event: Omit<SecurityEvent, "id" | "at">) {
  if (!userId) return;
  try {
    const { data } = await supabase
      .from("user_settings")
      .select("security_settings")
      .eq("user_id", userId)
      .maybeSingle();
    const current = (data?.security_settings as any) || {};
    const events: SecurityEvent[] = Array.isArray(current.events) ? current.events : [];
    const next = [
      { id: crypto.randomUUID(), at: new Date().toISOString(), ...event },
      ...events,
    ].slice(0, 20);
    await supabase
      .from("user_settings")
      .upsert(
        { user_id: userId, security_settings: { ...current, events: next } },
        { onConflict: "user_id" },
      );
  } catch { /* non-fatal */ }
}

export function SecurityPanel({ userEmail }: { userEmail?: string }) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformAuth, setPlatformAuth] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(() => !!localStorage.getItem(LS_BIOMETRIC_CRED));
  const [twoFAEnabled, setTwoFAEnabled] = useState(() => localStorage.getItem(LS_2FA_ENABLED) === "1");
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [liveCode, setLiveCode] = useState<string>("------");
  const [tick, setTick] = useState(0);
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    detectSensors().then(setSensors);
    (async () => {
      const supported = typeof window !== "undefined" && !!(window as any).PublicKeyCredential;
      setWebAuthnSupported(supported);
      if (supported) {
        try {
          const avail = await (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
          setPlatformAuth(!!avail);
        } catch { setPlatformAuth(false); }
      }
      // Hydrate from backend
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth?.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          const { data } = await supabase
            .from("user_settings")
            .select("security_settings")
            .eq("user_id", uid)
            .maybeSingle();
          const s: any = data?.security_settings ?? {};
          if (typeof s.twoFAEnabled === "boolean") {
            setTwoFAEnabled(s.twoFAEnabled);
            localStorage.setItem(LS_2FA_ENABLED, s.twoFAEnabled ? "1" : "0");
          }
          if (typeof s.biometricEnabled === "boolean") {
            setBiometricEnabled(s.biometricEnabled && !!localStorage.getItem(LS_BIOMETRIC_CRED));
          }
          if (Array.isArray(s.events)) setEvents(s.events);
        }
      } catch { /* offline */ }
    })();
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const persistFlag = async (patch: Record<string, unknown>) => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("user_settings")
        .select("security_settings")
        .eq("user_id", userId)
        .maybeSingle();
      const current = (data?.security_settings as any) || {};
      await supabase
        .from("user_settings")
        .upsert(
          { user_id: userId, security_settings: { ...current, ...patch } },
          { onConflict: "user_id" },
        );
    } catch { /* offline */ }
  };

  const logEvent = async (type: string, label: string) => {
    const ev = { id: crypto.randomUUID(), type, label, at: new Date().toISOString() };
    setEvents((prev) => [ev, ...prev].slice(0, 20));
    await pushSecurityEvent(userId, { type, label });
  };

  useEffect(() => {
    (async () => {
      const secret = twoFAEnabled ? localStorage.getItem(LS_2FA_SECRET) : setupSecret;
      if (!secret) return setLiveCode("------");
      setLiveCode(await generateTOTP(secret));
    })();
  }, [tick, twoFAEnabled, setupSecret]);

  const otpauthUrl = useMemo(
    () => (setupSecret ? buildOtpAuthUrl(userEmail || "user", "FitFusion", setupSecret) : ""),
    [setupSecret, userEmail],
  );
  const qrSrc = useMemo(
    () => (otpauthUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUrl)}` : ""),
    [otpauthUrl],
  );

  const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);

  // ---- Biometric (WebAuthn) ----
  async function enrollBiometric() {
    if (!webAuthnSupported) {
      toast({ title: "Unsupported", description: "This device does not support WebAuthn.", variant: "destructive" });
      return;
    }
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userHandle = new TextEncoder().encode(userEmail || "fitfusion-user");
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "FitFusion", id: window.location.hostname },
          user: { id: userHandle, name: userEmail || "user", displayName: userEmail || "FitFusion User" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
          timeout: 60000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("No credential returned");
      localStorage.setItem(LS_BIOMETRIC_CRED, b64urlEncode(cred.rawId));
      if (userEmail) localStorage.setItem("ff.security.biometric.email", userEmail);
      setBiometricEnabled(true);
      await persistFlag({ biometricEnabled: true });
      await logEvent("biometric.enrolled", "Biometric authentication enrolled on this device");
      toast({ title: "Biometric enabled", description: "You can now sign in with your fingerprint or face on this device." });
    } catch (e: any) {
      toast({ title: "Setup failed", description: e?.message || "Biometric enrollment cancelled.", variant: "destructive" });
    }
  }

  async function testBiometric() {
    const credId = localStorage.getItem(LS_BIOMETRIC_CRED);
    if (!credId) return;
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const idBytes = Uint8Array.from(atob(credId.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: idBytes, type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
          rpId: window.location.hostname,
        },
      });
      toast({ title: "Verified ✓", description: "Biometric authentication works on this device." });
    } catch (e: any) {
      toast({ title: "Verification failed", description: e?.message || "Cancelled", variant: "destructive" });
    }
  }

  async function removeBiometric() {
    localStorage.removeItem(LS_BIOMETRIC_CRED);
    setBiometricEnabled(false);
    await persistFlag({ biometricEnabled: false });
    await logEvent("biometric.removed", "Biometric authentication removed");
    toast({ title: "Biometric removed" });
  }

  // ---- 2FA ----
  function begin2FA() {
    setSetupSecret(randomBase32Secret(20));
    setCode("");
  }
  async function confirm2FA() {
    if (!setupSecret) return;
    setVerifying(true);
    try {
      const ok = await verifyTOTP(setupSecret, code, 1);
      if (!ok) return toast({ title: "Invalid code", description: "Try the current 6-digit code.", variant: "destructive" });
      localStorage.setItem(LS_2FA_SECRET, setupSecret);
      localStorage.setItem(LS_2FA_ENABLED, "1");
      setTwoFAEnabled(true);
      setSetupSecret(null);
      setCode("");
      await persistFlag({ twoFAEnabled: true, twoFAEnrolledAt: new Date().toISOString() });
      await logEvent("2fa.enabled", "Two-factor authentication enabled");
      toast({ title: "Two-factor enabled 🔐", description: "Codes will be required at sign-in." });
    } finally { setVerifying(false); }
  }
  async function disable2FA() {
    localStorage.removeItem(LS_2FA_ENABLED);
    localStorage.removeItem(LS_2FA_SECRET);
    setTwoFAEnabled(false);
    await persistFlag({ twoFAEnabled: false });
    await logEvent("2fa.disabled", "Two-factor authentication disabled");
    toast({ title: "Two-factor disabled" });
  }

  const trustedDevices: { id: string; label: string; lastSeen: string }[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(LS_TRUSTED_DEVICES) || "[]"); } catch { return []; }
  }, []);

  async function sendPasswordReset() {
    if (!userEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    await logEvent("password.reset_sent", `Password reset email sent to ${userEmail}`);
    toast({ title: "Reset link sent", description: `Check ${userEmail}` });
  }

  async function signOutAll() {
    await logEvent("session.signout_all", "Signed out of all devices");
    await supabase.auth.signOut({ scope: "global" as any });
    toast({ title: "Signed out of all devices" });
  }

  const secureScore = (biometricEnabled ? 40 : 0) + (twoFAEnabled ? 40 : 0) + (userEmail ? 20 : 0);

  return (
    <div className="space-y-3">
      {/* Security score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/5 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security Score
          </CardTitle>
          <CardDescription>Strength of your account protection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" className="stroke-muted/30" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" className="stroke-primary" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(secureScore / 100) * 175.9} 175.9`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-black">{secureScore}</div>
            </div>
            <div className="text-xs space-y-1 flex-1">
              <div className="flex items-center gap-2">{biometricEnabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />} Biometric login</div>
              <div className="flex items-center gap-2">{twoFAEnabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />} Two-factor auth</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verified email</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passkeys */}
      <PasskeyManagementPanel userEmail={userEmail} />

      {/* Biometric device credential */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Fingerprint className="h-4 w-4 text-primary" /> Biometric & Face Unlock
          </CardTitle>
          <CardDescription>Fingerprint, Face ID or Windows Hello for this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className={`rounded-lg border px-2 py-1 text-center ${webAuthnSupported ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-border/30 bg-muted/20 text-muted-foreground"}`}>
              {webAuthnSupported ? "✓" : "×"} WebAuthn supported
            </div>
            <div className={`rounded-lg border px-2 py-1 text-center ${platformAuth ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-border/30 bg-muted/20 text-muted-foreground"}`}>
              {platformAuth ? "✓" : "×"} Platform sensor
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/20 p-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold">Device credential</div>
              <div className="text-[10px] text-muted-foreground">
                {biometricEnabled ? "Enrolled on this device" : "Not enrolled yet"}
              </div>
            </div>
            <Badge variant={biometricEnabled ? "default" : "outline"}>{biometricEnabled ? "Active" : "Off"}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {!biometricEnabled ? (
              <Button size="sm" onClick={enrollBiometric} disabled={!webAuthnSupported || !platformAuth}>
                <Fingerprint className="h-3.5 w-3.5 mr-1.5" /> Enable biometric unlock
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={testBiometric}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Test unlock
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={removeBiometric}>
                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Remove
                </Button>
              </>
            )}
          </div>
          {!platformAuth && webAuthnSupported && (
            <p className="text-[10px] text-amber-500">
              No platform authenticator detected. Set up Face ID / fingerprint / Windows Hello in your device settings first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> App Permissions
          </CardTitle>
          <CardDescription>Grant or review the access FitFusion uses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {PERMISSIONS.map((p) => (
            <div key={p.key} className="flex items-center justify-between gap-3 rounded-xl border border-border/20 bg-muted/20 p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <p.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{p.label}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {permissions[p.key] ?? "unknown"}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={permissions[p.key] === "granted" ? "outline" : "default"}
                className="h-7 text-[11px] shrink-0"
                onClick={() => requestPermission(p.key)}
                disabled={permissions[p.key] === "granted"}
              >
                {permissions[p.key] === "granted" ? "Granted" : "Allow"}
              </Button>
            </div>
          ))}
          <Button size="sm" variant="ghost" className="w-full" onClick={refreshPermissions}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-check permissions
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4 text-primary" /> Two-Factor Authentication</CardTitle>
          <CardDescription>Time-based codes (TOTP) via any authenticator app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">Status</div>
            <div className="flex items-center gap-2">
              <Badge variant={twoFAEnabled ? "default" : "outline"}>{twoFAEnabled ? "Enabled" : "Disabled"}</Badge>
              <Switch checked={twoFAEnabled} onCheckedChange={(v) => (v ? begin2FA() : disable2FA())} />
            </div>
          </div>

          {twoFAEnabled && (
            <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground">Current code</div>
              <div className="text-2xl font-mono tracking-widest font-bold">{liveCode}</div>
              <div className="text-[10px] text-muted-foreground">Refreshes in {secondsLeft}s</div>
            </div>
          )}

          {setupSecret && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
              <div className="text-xs font-medium">Scan with Google Authenticator, 1Password, Authy…</div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {qrSrc && <img src={qrSrc} alt="TOTP QR" className="w-40 h-40 bg-white p-1 rounded-lg" loading="lazy" />}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <Input readOnly value={setupSecret} className="font-mono text-xs h-8" />
                    <Button size="icon" variant="outline" className="h-8 w-8"
                      onClick={() => { navigator.clipboard.writeText(setupSecret); toast({ title: "Copied" }); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Preview: <span className="font-mono">{liveCode}</span></div>
                  <Input placeholder="Enter 6-digit code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="h-9" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={confirm2FA} disabled={code.length !== 6 || verifying}>Verify & Enable</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSetupSecret(null); setCode(""); }}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password & sessions */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4 text-primary" /> Password & Sessions</CardTitle>
          <CardDescription>Change password or sign out everywhere.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" variant="outline" className="w-full justify-between" onClick={sendPasswordReset}>
            <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5" />Send password reset email</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[45%]">{userEmail}</span>
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={signOutAll}>
            <LogOut className="h-3.5 w-3.5 mr-2" />Sign out of all devices
          </Button>
        </CardContent>
      </Card>

      {/* Device sensors */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" /> Device Sensors</CardTitle>
          <CardDescription>Capabilities available for secure features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {sensors.map((s) => (
              <div key={s.name} className="flex items-center gap-2 rounded-xl border border-border/20 bg-muted/20 p-2.5">
                <s.icon className={`h-4 w-4 ${s.ok ? "text-emerald-500" : "text-muted-foreground"}`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trusted devices */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" /> Trusted Devices</CardTitle>
          <CardDescription>Devices you've logged in from.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">This device</div>
                <div className="text-[10px] text-muted-foreground truncate max-w-[240px]">{navigator.userAgent.split(") ")[0].slice(0, 70)}…</div>
              </div>
              <Badge>Current</Badge>
            </div>
            {trustedDevices.length > 0 && <Separator className="my-2" />}
            {trustedDevices.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-1.5">
                <div className="text-xs">{d.label}</div>
                <div className="text-[10px] text-muted-foreground">{d.lastSeen}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent security activity */}
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-primary" /> Recent Security Activity
          </CardTitle>
          <CardDescription>Synced to your account · last 20 events</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              No security events yet. Enable 2FA or biometrics to start logging activity.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-auto">
              {events.map((e) => (
                <div key={e.id} className="flex items-start gap-2 rounded-lg border border-border/20 bg-muted/20 p-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{e.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(e.at).toLocaleString()} · {e.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityPanel;
