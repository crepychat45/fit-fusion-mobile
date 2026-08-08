import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Delete, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import {
  biometricAvailable, failureCount, hasPin, markUnlocked, promptBiometric,
  readLockPrefs, recordFailure, verifyPin, type AppLockPrefs,
} from "@/lib/app-lock";
import { listPasskeys } from "@/lib/passkey-manager";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AppLockPrefs>(() => readLockPrefs());
  const [locked, setLocked] = useState(() => readLockPrefs().appLockEnabled && hasPin());
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bioReady, setBioReady] = useState(false);
  const [shake, setShake] = useState(false);
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
    if (next.length >= 4) void submit(next);
  };

  if (!active || !locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 px-6 backdrop-blur-2xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-lg font-black tracking-tight">FitFusion is locked</h1>
        <p className="text-xs text-muted-foreground">Enter your PIN to continue</p>
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

      <div className="grid w-full max-w-[260px] grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              aria-label={k === "del" ? "Delete" : `Digit ${k}`}
              onClick={() => press(k)}
              className="flex h-16 items-center justify-center rounded-2xl border border-border/30 bg-card/60 text-xl font-semibold backdrop-blur-md transition-transform active:scale-95"
            >
              {k === "del" ? <Delete className="h-5 w-5" /> : k}
            </button>
          ),
        )}
      </div>

      {prefs.biometricUnlock && bioReady && (
        <Button variant="outline" onClick={() => void tryBiometric()} className="gap-2">
          <Fingerprint className="h-4 w-4" /> Unlock with biometrics
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground">
        Failed attempts on this device: {failureCount()}
      </p>
    </div>
  );
}

export default AppLockGate;
