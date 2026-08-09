import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Delete, Fingerprint, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  biometricAvailable, failureCount, hasPin, markUnlocked, promptBiometric,
  readLockPrefs, recordFailure, verifyPin, type AppLockPrefs,
} from "@/lib/app-lock";
import { listPasskeys } from "@/lib/passkey-manager";
import { supabase } from "@/integrations/supabase/client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AppLockPrefs>(() => readLockPrefs());
  const [locked, setLocked] = useState(() => readLockPrefs().appLockEnabled && hasPin());
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bioReady, setBioReady] = useState(false);
  const [shake, setShake] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const idleTimer = useRef<number | null>(null);

  const active = prefs.appLockEnabled && hasPin();

  /* keep prefs in sync with the settings screen */
  useEffect(() => {
    const sync = () => {
      const next = readLockPrefs();
      setPrefs(next);
      if (!(next.appLockEnabled && hasPin())) setLocked(false);
    };
    window.addEventListener("fitfusion-app-lock-prefs", sync);
    window.addEventListener("fitfusion-settings-hydrated", sync);
    window.addEventListener("storage", sync);
    const onLock = () => readLockPrefs().appLockEnabled && hasPin() && setLocked(true);
    window.addEventListener("fitfusion-app-lock", onLock);
    return () => {
      window.removeEventListener("fitfusion-app-lock-prefs", sync);
      window.removeEventListener("fitfusion-settings-hydrated", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("fitfusion-app-lock", onLock);
    };
  }, []);

  useEffect(() => {
    biometricAvailable().then(setBioReady);
  }, [locked]);

  /* lock on background */
  useEffect(() => {
    if (!active || !prefs.lockOnBackground) return;
    const onHide = () => document.hidden && setLocked(true);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [active, prefs.lockOnBackground]);

  /* auto-lock after inactivity */
  useEffect(() => {
    if (!active || locked) return;
    const ms = Math.max(1, prefs.autoLockMinutes) * 60_000;
    const reset = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setLocked(true), ms);
    };
    const evts: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    evts.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      evts.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [active, locked, prefs.autoLockMinutes]);

  const unlock = useCallback(() => {
    markUnlocked();
    setLocked(false);
    setPin("");
    setError(null);
  }, []);

  const tryBiometric = useCallback(async () => {
    const ids = (await listPasskeys().catch(() => []))?.map((p) => p.id) ?? [];
    const legacy = localStorage.getItem("ff.security.biometric.credId");
    if (legacy && !ids.includes(legacy)) ids.push(legacy);
    const ok = await promptBiometric(ids);
    if (ok) unlock();
    else setError("Biometric check failed — enter your PIN.");
  }, [unlock]);

  /* auto-prompt biometrics when the lock screen appears */
  useEffect(() => {
    if (locked && prefs.biometricUnlock && bioReady) {
      const t = window.setTimeout(() => void tryBiometric(), 350);
      return () => window.clearTimeout(t);
    }
  }, [locked, prefs.biometricUnlock, bioReady, tryBiometric]);

  const submit = useCallback(
    async (value: string) => {
      if (await verifyPin(value)) return unlock();
      const n = recordFailure();
      setPin("");
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      setError(n >= 5 ? `Wrong PIN — ${n} failed attempts recorded.` : "Wrong PIN. Try again.");
    },
    [unlock],
  );

  const press = (k: string) => {
    setError(null);
    if (k === "del") return setPin((p) => p.slice(0, -1));
    if (!k) return;
    const next = (pin + k).slice(0, 8);
    setPin(next);
  };

  const recoverPin = async () => {
    setRecovering(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) {
        setError("Sign in with your account password to reset App Lock.");
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setError("Recovery email sent. After verifying your account, return to Security to create a new PIN.");
    } catch {
      setError("Recovery could not be started. Check your connection and try again.");
    } finally {
      setRecovering(false);
    }
  };

  if (!active || !locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-background/95 px-5 py-8 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/30 bg-primary/10 shadow-lg shadow-primary/10">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground"><Lock className="h-3.5 w-3.5" /></span>
        </div>
        <h1 className="text-xl font-black">FitFusion is locked</h1>
        <p className="text-sm text-muted-foreground">Enter your 4–8 digit PIN</p>
      </div>

      <div className={`flex gap-3 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < pin.length ? "bg-primary" : i < 4 ? "bg-muted-foreground/30" : "bg-muted-foreground/10"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <ShieldAlert className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <Button
              key={i}
              type="button"
              variant="outline"
              aria-label={k === "del" ? "Delete" : `Digit ${k}`}
              onClick={() => press(k)}
              className="h-16 rounded-2xl bg-card/60 text-xl font-semibold backdrop-blur-md active:scale-95"
            >
              {k === "del" ? <Delete className="h-5 w-5" /> : k}
            </Button>
          ),
        )}
      </div>

      <Button className="w-full max-w-[280px]" disabled={pin.length < 4} onClick={() => void submit(pin)}>
        <Lock className="mr-2 h-4 w-4" /> Unlock
      </Button>

      {prefs.biometricUnlock && bioReady && (
        <Button variant="outline" onClick={() => void tryBiometric()} className="gap-2">
          <Fingerprint className="h-4 w-4" /> Unlock with biometrics
        </Button>
      )}

      <Button variant="ghost" size="sm" disabled={recovering} onClick={() => void recoverPin()}>
        {recovering ? "Sending recovery…" : "Forgot PIN?"}
      </Button>

      <p className="text-[10px] text-muted-foreground">
        Failed attempts on this device: {failureCount()}
      </p>
      </div>
    </div>
  );
}

export default AppLockGate;
