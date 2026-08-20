// Shared App Lock logic used by the Profile → Security tab and the global
// AppLockGate overlay. PINs are only ever stored as a SHA-256 digest.

export const LS_PREFS = "fitfusion-privacy-security";
export const LS_PIN = "fitfusion-applock-pin";
export const LS_PIN_ID = "fitfusion-applock-id";
export const LS_UNLOCKED_AT = "fitfusion-applock-unlocked-at";
export const LS_FAILS = "fitfusion-applock-fails";
export const APP_LOCK_EVENT = "fitfusion-app-lock-state";

export type AppLockPrefs = {
  appLockEnabled: boolean;
  autoLockMinutes: number;
  biometricUnlock: boolean;
  lockOnBackground: boolean;
  hideContentInSwitcher: boolean;
  maskSensitiveStats: boolean;
  privacyScreen: boolean;
  failedAttemptAlerts: boolean;
};

export function readLockPrefs(): AppLockPrefs {
  const defaults: AppLockPrefs = {
    appLockEnabled: false,
    autoLockMinutes: 5,
    biometricUnlock: false,
    lockOnBackground: true,
    hideContentInSwitcher: true,
    maskSensitiveStats: false,
    privacyScreen: false,
    failedAttemptAlerts: true,
  };
  try {
    const raw = localStorage.getItem(LS_PREFS);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function hasPin(): boolean {
  try {
    return !!localStorage.getItem(LS_PIN);
  } catch {
    return false;
  }
}

export async function digestPin(pin: string, identity?: string): Promise<string> {
  const id = identity ?? localStorage.getItem(LS_PIN_ID) ?? "local";
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`fitfusion:${id}:${pin}`),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function savePinHash(pin: string, identity: string) {
  const hash = await digestPin(pin, identity);
  localStorage.setItem(LS_PIN_ID, identity);
  localStorage.setItem(LS_PIN, hash);
  // Mirror into the device keychain on native builds so the PIN survives
  // web-view storage clears.
  try {
    const { nativeSecureSet } = await import("@/lib/native-bridge");
    await nativeSecureSet("applock", `${identity}::${hash}`);
  } catch {
    /* noop */
  }
}

/** Restore the PIN hash from the device keychain if local storage was wiped. */
export async function restorePinFromKeychain(): Promise<boolean> {
  try {
    if (localStorage.getItem(LS_PIN)) return true;
    const { nativeSecureGet } = await import("@/lib/native-bridge");
    const raw = await nativeSecureGet("applock");
    if (!raw?.includes("::")) return false;
    const [identity, hash] = raw.split("::");
    if (!hash) return false;
    localStorage.setItem(LS_PIN_ID, identity);
    localStorage.setItem(LS_PIN, hash);
    return true;
  } catch {
    return false;
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  let stored = localStorage.getItem(LS_PIN);
  if (!stored) {
    await restorePinFromKeychain();
    stored = localStorage.getItem(LS_PIN);
  }
  if (!stored) return false;
  return (await digestPin(pin)) === stored;
}

export function clearPin() {
  localStorage.removeItem(LS_PIN);
  localStorage.removeItem(LS_PIN_ID);
  localStorage.removeItem(LS_FAILS);
  localStorage.removeItem(LS_UNLOCKED_AT);
  void import("@/lib/native-bridge")
    .then(({ nativeSecureDelete }) => nativeSecureDelete("applock"))
    .catch(() => undefined);
  window.dispatchEvent(new CustomEvent(APP_LOCK_EVENT, { detail: { enabled: false } }));
}

export function markUnlocked() {
  localStorage.setItem(LS_UNLOCKED_AT, String(Date.now()));
  localStorage.setItem(LS_FAILS, "0");
  window.dispatchEvent(new CustomEvent(APP_LOCK_EVENT, { detail: { locked: false } }));
}

export function recordFailure(): number {
  const n = Number(localStorage.getItem(LS_FAILS) || "0") + 1;
  localStorage.setItem(LS_FAILS, String(n));
  return n;
}

export function failureCount(): number {
  return Number(localStorage.getItem(LS_FAILS) || "0");
}

/** Ask the gate to lock immediately (used by "Lock now" buttons). */
export function requestLock() {
  window.dispatchEvent(new Event("fitfusion-app-lock"));
}

/** Ask the gate to re-read preferences after settings change. */
export function notifyLockPrefsChanged() {
  window.dispatchEvent(new Event("fitfusion-app-lock-prefs"));
}

/* ------------- Platform biometric (native + WebAuthn) helpers ------------- */

import { checkBiometry, isNative, nativeBiometricVerify } from "@/lib/native-bridge";

export async function biometricAvailable(): Promise<boolean> {
  try {
    const info = await checkBiometry();
    return info.available;
  } catch {
    return false;
  }
}

/** Human label for the available biometry ("Face ID", "Fingerprint", …). */
export async function biometricLabel(): Promise<string> {
  try {
    const info = await checkBiometry();
    switch (info.kind) {
      case "face":
        return "Face unlock";
      case "fingerprint":
        return "Fingerprint";
      case "iris":
        return "Iris scan";
      case "device-credential":
        return "Device credential";
      case "platform":
        return "Biometrics";
      default:
        return "Biometrics";
    }
  } catch {
    return "Biometrics";
  }
}

function b64urlToBytes(v: string): ArrayBuffer {
  const s = v.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  return bytes.buffer.slice(0) as ArrayBuffer;
}

/**
 * Prompt the platform authenticator.
 * On Capacitor builds this uses the OS biometric prompt (Face ID / Touch ID /
 * BiometricPrompt); on the web it falls back to WebAuthn.
 */
export async function promptBiometric(credentialIds: string[] = []): Promise<boolean> {
  if (isNative()) {
    // Android/iOS WebViews have no usable WebAuthn platform authenticator,
    // so the OS prompt is the only (and correct) path here.
    return await nativeBiometricVerify("Unlock FitXFusion");
  }
  if (!(await biometricAvailable())) return false;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  try {
    const res = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
        ...(credentialIds.length
          ? {
              allowCredentials: credentialIds.map((id) => ({
                id: b64urlToBytes(id),
                type: "public-key" as const,
              })),
            }
          : {}),
      },
    });
    return !!res;
  } catch {
    return false;
  }
}

/* ---------------- Recovery questions (PIN reset without email) ---------------- */

export const LS_RECOVERY = "fitfusion-applock-recovery";

export const RECOVERY_QUESTIONS = [
  "What was the name of your first pet?",
  "In which city were you born?",
  "What is your mother's maiden name?",
  "What was the model of your first phone?",
  "What is your favourite sport or exercise?",
  "What was the name of your primary school?",
  "What is your favourite food?",
  "Who was your childhood best friend?",
] as const;

export interface RecoveryPair {
  question: string;
  /** SHA-256 of the normalised answer. Never the plain answer. */
  hash: string;
}

function normaliseAnswer(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function hashAnswer(question: string, answer: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`fitfusion-recovery:${question}:${normaliseAnswer(answer)}`),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function readRecovery(): RecoveryPair[] {
  try {
    const raw = localStorage.getItem(LS_RECOVERY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((p) => p && typeof p.question === "string" && typeof p.hash === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasRecovery(): boolean {
  return readRecovery().length >= 2;
}

export async function saveRecovery(pairs: { question: string; answer: string }[]) {
  const stored: RecoveryPair[] = [];
  for (const p of pairs) {
    if (!p.question || !p.answer.trim()) continue;
    stored.push({ question: p.question, hash: await hashAnswer(p.question, p.answer) });
  }
  localStorage.setItem(LS_RECOVERY, JSON.stringify(stored));
  window.dispatchEvent(new Event("fitfusion-app-lock-prefs"));
  return stored.length;
}

export function clearRecovery() {
  localStorage.removeItem(LS_RECOVERY);
  window.dispatchEvent(new Event("fitfusion-app-lock-prefs"));
}

/** Verify every stored question was answered correctly. */
export async function verifyRecovery(answers: Record<string, string>): Promise<boolean> {
  const pairs = readRecovery();
  if (!pairs.length) return false;
  for (const p of pairs) {
    const given = answers[p.question];
    if (!given || (await hashAnswer(p.question, given)) !== p.hash) return false;
  }
  return true;
}

/** Replace the PIN after successful recovery verification. */
export async function resetPinWithRecovery(
  answers: Record<string, string>,
  newPin: string,
): Promise<boolean> {
  if (!/^\d{4,8}$/.test(newPin)) return false;
  if (!(await verifyRecovery(answers))) return false;
  const identity = localStorage.getItem(LS_PIN_ID) || "local";
  await savePinHash(newPin, identity);
  localStorage.setItem(LS_FAILS, "0");
  markUnlocked();
  return true;
}
