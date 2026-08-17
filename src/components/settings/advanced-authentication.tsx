// Real, working "Advanced Authentication" panel for the Settings → Security tab.
//
// - Two-Factor Authentication (TOTP, RFC 6238): generates a per-user secret,
//   renders the otpauth QR, verifies the 6-digit code before flipping the switch.
// - Biometric / Passkey (WebAuthn): enrols a real platform authenticator
//   (Touch ID / Face ID / Windows Hello / Android biometrics), stores the
//   credential in the encrypted passkey vault, tests it, and enables
//   conditional-UI autofill for future sign-ins when supported.
// - Passwordless Login (Magic Link): sends a real Supabase OTP email to the
//   signed-in user's address, redirecting back to /auth-callback.
//
// State flags are written to `fitfusion-*` localStorage keys and therefore
// automatically synced to public.user_settings.local_kv via the cloud mirror
// (see src/utils/local-storage-sync.ts) — so toggles persist across refresh,
// logout, force-close and different devices.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  KeyRound,
  Fingerprint,
  Mail,
  ShieldCheck,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Timer,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildOtpAuthUrl,
  generateTOTP,
  randomBase32Secret,
  verifyTOTP,
} from "@/lib/totp";
import {
  enrollPasskey,
  verifyPasskey,
  getDefaultPasskey,
  listPasskeys,
  probePasskeySupport,
  PasskeyError,
} from "@/lib/passkey-manager";

const LS_2FA_ENABLED = "fitfusion-security-2fa-enabled";
const LS_2FA_SECRET = "fitfusion-security-2fa-secret";
const LS_PASSKEY_ENABLED = "fitfusion-security-passkey-enabled";
const LS_MAGIC_ENABLED = "fitfusion-security-magiclink-enabled";
const LS_MAGIC_LAST_SENT = "fitfusion-security-magiclink-sent-at";

function useCurrentUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { email, userId };
}

/* --------------------------------- 2FA ---------------------------------- */

function TwoFactorCard() {
  const { toast } = useToast();
  const { email } = useCurrentUser();
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(LS_2FA_ENABLED) === "1",
  );
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [liveCode, setLiveCode] = useState("------");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const secret = enabled
        ? localStorage.getItem(LS_2FA_SECRET)
        : setupSecret;
      if (!secret) return setLiveCode("------");
      setLiveCode(await generateTOTP(secret));
    })();
  }, [tick, enabled, setupSecret]);

  const otpauthUrl = useMemo(
    () =>
      setupSecret
        ? buildOtpAuthUrl(email || "user", "FitFusion", setupSecret)
        : "",
    [setupSecret, email],
  );

  const qrSrc = useMemo(
    () =>
      otpauthUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
        : "",
    [otpauthUrl],
  );

  const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);

  const beginSetup = () => {
    setSetupSecret(randomBase32Secret(20));
    setCode("");
  };

  const cancelSetup = () => {
    setSetupSecret(null);
    setCode("");
  };

  const verifyAndEnable = async () => {
    if (!setupSecret) return;
    setVerifying(true);
    try {
      const ok = await verifyTOTP(setupSecret, code, 1);
      if (!ok) {
        toast({
          title: "Invalid code",
          description:
            "The 6-digit code did not match. Wait for the next refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      localStorage.setItem(LS_2FA_SECRET, setupSecret);
      localStorage.setItem(LS_2FA_ENABLED, "1");
      setEnabled(true);
      setSetupSecret(null);
      setCode("");
      toast({
        title: "Two-factor authentication enabled",
        description:
          "Codes from your authenticator app will now be required at sign-in.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const disable = () => {
    localStorage.removeItem(LS_2FA_SECRET);
    localStorage.setItem(LS_2FA_ENABLED, "0");
    setEnabled(false);
    toast({
      title: "Two-factor authentication disabled",
      description: "Your account is no longer requiring TOTP codes.",
    });
  };

  const copySecret = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied", description: "Secret copied to clipboard." });
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <Card className="border-primary/10 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-xs">
                Time-based codes from Google Authenticator, 1Password, Authy…
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={enabled ? "default" : "secondary"}
            className="shrink-0"
          >
            {enabled ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" /> Active
              </>
            ) : (
              "Off"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!enabled && !setupSecret && (
          <Button onClick={beginSetup} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" /> Set up authenticator
          </Button>
        )}

        <AnimatePresence>
          {setupSecret && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <img
                  src={qrSrc}
                  alt="Scan this QR with your authenticator app"
                  className="h-44 w-44 rounded-lg bg-white p-2 shadow"
                  loading="lazy"
                />
                <p className="text-center text-xs text-muted-foreground">
                  Scan with your authenticator app, or copy the secret below.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2 font-mono text-xs">
                <span className="truncate">{setupSecret}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7"
                  onClick={() => copySecret(setupSecret)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totp-code" className="text-xs">
                  Enter the 6-digit code from your app
                </Label>
                <Input
                  id="totp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123 456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" /> refreshes in {secondsLeft}s
                  </span>
                  <span>current preview: {liveCode}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelSetup}
                  disabled={verifying}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={verifyAndEnable}
                  disabled={verifying || code.length !== 6}
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify & enable"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {enabled && !setupSecret && (
          <div className="space-y-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Live code preview</span>
              <span className="font-mono text-base tracking-widest">
                {liveCode}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Refreshes in {secondsLeft}s. Use it to confirm your authenticator
              app is in sync.
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={disable}
              size="sm"
            >
              Turn off two-factor authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------- Passkey / Biometric ------------------------- */

function PasskeyCard() {
  const { toast } = useToast();
  const { email } = useCurrentUser();
  const [supported, setSupported] = useState(false);
  const [platform, setPlatform] = useState(false);
  const [autofill, setAutofill] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [defaultLabel, setDefaultLabel] = useState<string>("");

  const refresh = useCallback(async () => {
    const probe = await probePasskeySupport();
    setSupported(probe.supported);
    setPlatform(probe.platformAvailable);
    setAutofill(probe.conditionalMediation);
    const list = await listPasskeys();
    setCount(list.length);
    const def = await getDefaultPasskey();
    setDefaultLabel(def?.name ?? "");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enabled = count > 0;

  useEffect(() => {
    localStorage.setItem(LS_PASSKEY_ENABLED, enabled ? "1" : "0");
  }, [enabled]);

  const enroll = async () => {
    if (!email) {
      toast({
        title: "Sign in first",
        description: "A signed-in email is required to create a passkey.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const rec = await enrollPasskey({ email, name: undefined });
      toast({
        title: "Passkey created",
        description: `Saved as “${rec.name}”. You can now sign in without a password on this device.`,
      });
      await refresh();
    } catch (e) {
      const err = e as PasskeyError;
      toast({
        title: "Passkey setup failed",
        description: err?.suggestion || err?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    try {
      const rec = await verifyPasskey();
      if (rec) {
        toast({
          title: "Passkey verified",
          description: `“${rec.name}” unlocked successfully.`,
        });
      } else {
        toast({
          title: "Verification cancelled",
          description: "No passkey response was received.",
          variant: "destructive",
        });
      }
    } catch (e) {
      const err = e as PasskeyError;
      toast({
        title: "Verification failed",
        description: err?.suggestion || err?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-primary/10 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Biometric Authentication (Passkey)
              </CardTitle>
              <CardDescription className="text-xs">
                Touch ID • Face ID • Windows Hello • Android biometrics
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={enabled ? "default" : "secondary"}
            className="shrink-0"
          >
            {enabled ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {count} saved
              </>
            ) : (
              "Off"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!supported && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              This browser does not support WebAuthn. Passkeys need a modern
              browser over HTTPS or an installed PWA.
            </div>
          </div>
        )}

        {supported && !platform && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              No platform biometric found. Set up fingerprint, Face ID, Windows
              Hello, or a device PIN, then reload.
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <Capability label="WebAuthn" ok={supported} />
          <Capability label="Biometrics" ok={platform} />
          <Capability label="Autofill" ok={autofill} />
        </div>

        {enabled && defaultLabel && (
          <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Default: <span className="text-foreground">{defaultLabel}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={enroll}
            disabled={busy || !supported}
            className="flex-1 min-w-[140px]"
            size="sm"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {enabled ? "Add another passkey" : "Enroll passkey"}
              </>
            )}
          </Button>
          {enabled && (
            <Button
              onClick={test}
              variant="outline"
              disabled={busy}
              size="sm"
              className="flex-1 min-w-[140px]"
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Test now
            </Button>
          )}
        </div>

        {enabled && (
          <p className="text-[11px] text-muted-foreground">
            Tip: manage or rename passkeys in Profile → Security → Passkey
            manager. Autofill fires automatically on the sign-in page when the
            browser supports it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Capability({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center justify-center gap-1 rounded-md border px-2 py-1 ${
        ok
          ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
          : "border-muted-foreground/20 bg-muted/30 text-muted-foreground"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      <span>{label}</span>
    </div>
  );
}

/* --------------------------- Passwordless email -------------------------- */

function PasswordlessCard() {
  const { toast } = useToast();
  const { email } = useCurrentUser();
  const [sending, setSending] = useState(false);
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(LS_MAGIC_ENABLED) === "1",
  );
  const [lastSent, setLastSent] = useState<number | null>(() => {
    const v = localStorage.getItem(LS_MAGIC_LAST_SENT);
    return v ? Number(v) : null;
  });

  const sendMagicLink = async () => {
    if (!email) {
      toast({
        title: "Sign in first",
        description: "Passwordless sign-in needs your account email.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      const now = Date.now();
      localStorage.setItem(LS_MAGIC_LAST_SENT, String(now));
      localStorage.setItem(LS_MAGIC_ENABLED, "1");
      setLastSent(now);
      setEnabled(true);
      toast({
        title: "Magic link sent",
        description: `Check ${email} — the link signs you in without a password.`,
      });
    } catch (e: any) {
      toast({
        title: "Could not send link",
        description: e?.message || "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const disable = () => {
    localStorage.setItem(LS_MAGIC_ENABLED, "0");
    setEnabled(false);
    toast({
      title: "Passwordless disabled",
      description:
        "You can still sign in with your password. Re-enable any time.",
    });
  };

  return (
    <Card className="border-primary/10 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Passwordless Login</CardTitle>
              <CardDescription className="text-xs">
                One-tap sign-in via a signed magic link to your inbox
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={enabled ? "default" : "secondary"}
            className="shrink-0"
          >
            {enabled ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
              </>
            ) : (
              "Off"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          Delivery: <span className="text-foreground">{email || "—"}</span>
          {lastSent && (
            <div className="mt-1">
              Last sent: {new Date(lastSent).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={sendMagicLink}
            disabled={sending || !email}
            className="flex-1"
            size="sm"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {enabled ? "Send new link" : "Enable & send link"}
              </>
            )}
          </Button>
          {enabled && (
            <Button
              onClick={disable}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Turn off
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- Root --------------------------------- */

export function AdvancedAuthentication() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Advanced Authentication
        </h3>
      </div>
      <TwoFactorCard />
      <PasskeyCard />
      <PasswordlessCard />
    </motion.div>
  );
}

export default AdvancedAuthentication;
