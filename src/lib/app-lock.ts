// Shared App Lock logic used by the Profile → Security tab and the global
// AppLockGate overlay. PINs are only ever stored as a SHA-256 digest.

export const LS_PREFS = "fitfusion-privacy-security";
export const LS_PIN = "fitfusion-applock-pin";
export const LS_PIN_ID = "fitfusion-applock-id";
export const LS_UNLOCKED_AT = "fitfusion-applock-unlocked-at";
export const LS_FAILS = "fitfusion-applock-fails";

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
  localStorage.setItem(LS_PIN_ID, identity);
  localStorage.setItem(LS_PIN, await digestPin(pin, identity));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(LS_PIN);
  if (!stored) return false;
  return (await digestPin(pin)) === stored;
}

export function clearPin() {
  localStorage.removeItem(LS_PIN);
  localStorage.removeItem(LS_PIN_ID);
  localStorage.removeItem(LS_FAILS);
}

export function markUnlocked() {
  localStorage.setItem(LS_UNLOCKED_AT, String(Date.now()));
  localStorage.setItem(LS_FAILS, "0");
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

/* ------------- Platform biometric (WebAuthn) helpers ------------- */

export async function biometricAvailable(): Promise<boolean> {
  const PKC = (window as unknown as { PublicKeyCredential?: any }).PublicKeyCredential;
  if (!PKC) return false;
  try {
    return !!(await PKC.isUserVerifyingPlatformAuthenticatorAvailable?.());
  } catch {
    return false;
  }
}

function b64urlToBytes(v: string): Uint8Array {
  const s = v.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

/**
 * Prompt the platform authenticator (Face ID / Touch ID / Windows Hello).
 * Falls back to a discoverable-credential prompt if no credential ids exist.
 */
export async function promptBiometric(credentialIds: string[] = []): Promise<boolean> {
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
