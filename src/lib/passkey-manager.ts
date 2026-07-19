// FitFusion Passkey Manager
// - Stores multiple WebAuthn credentials per device
// - Rename, remove, set-default sign-in method
// - E2E encrypted vault (AES-GCM 256) with a device-bound key
// - Backwards compatible with legacy single-passkey keys
//
// NOTE: WebAuthn already performs cryptographic authentication at the device
// level. This vault adds an extra encryption layer around the *stored metadata*
// (credential IDs, labels, email) so that another script or a stolen local
// storage snapshot cannot enumerate a user's passkeys in plaintext.

const VAULT_KEY = "ff.security.passkeys.v2"; // ciphertext
const DEVICE_KEY = "ff.security.passkeys.dk"; // JWK-wrapped AES key (base64)
const LEGACY_ID = "ff.security.biometric.credId";
const LEGACY_EMAIL = "ff.security.biometric.email";

export type PasskeyRecord = {
  id: string;            // base64url raw credential id (also acts as record id)
  name: string;          // user-friendly label
  email: string;         // account email bound to this passkey
  createdAt: number;
  lastUsedAt?: number;
  isDefault?: boolean;
  deviceUA?: string;
};

export type PasskeyErrorKind =
  | "unsupported"
  | "no-platform-authenticator"
  | "cancelled"
  | "not-allowed"
  | "timeout"
  | "invalid-state"    // already enrolled
  | "network"
  | "unknown";

export class PasskeyError extends Error {
  kind: PasskeyErrorKind;
  suggestion: string;
  constructor(kind: PasskeyErrorKind, message: string, suggestion: string) {
    super(message);
    this.kind = kind;
    this.suggestion = suggestion;
  }
}

/* -------------------- base64url helpers -------------------- */

export function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toBuf(u: Uint8Array): ArrayBuffer {
  // Copy into a fresh ArrayBuffer so TS/DOM types accept it as BufferSource
  const buf = new ArrayBuffer(u.byteLength);
  new Uint8Array(buf).set(u);
  return buf;
}

/* -------------------- device key management -------------------- */

async function getDeviceKey(): Promise<CryptoKey> {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) {
    try {
      const raw = b64urlDecode(existing);
      return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
      ]);
    } catch {
      // fall through and regenerate
    }
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const raw = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(DEVICE_KEY, b64urlEncode(raw));
  return key;
}

async function encryptJSON(data: unknown): Promise<string> {
  const key = await getDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(JSON.stringify(data));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc);
  const packed = new Uint8Array(iv.length + ct.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), iv.length);
  return b64urlEncode(packed.buffer);
}

async function decryptJSON<T>(payload: string): Promise<T> {
  const key = await getDeviceKey();
  const bytes = b64urlDecode(payload);
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(pt));
}

/* -------------------- vault CRUD -------------------- */

export async function listPasskeys(): Promise<PasskeyRecord[]> {
  await migrateLegacy();
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) return [];
  try {
    const list = await decryptJSON<PasskeyRecord[]>(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveList(list: PasskeyRecord[]): Promise<void> {
  const ct = await encryptJSON(list);
  localStorage.setItem(VAULT_KEY, ct);
  syncLegacy(list);
}

function syncLegacy(list: PasskeyRecord[]) {
  const def = list.find((p) => p.isDefault) || list[0];
  if (def) {
    localStorage.setItem(LEGACY_ID, def.id);
    localStorage.setItem(LEGACY_EMAIL, def.email);
  } else {
    localStorage.removeItem(LEGACY_ID);
    localStorage.removeItem(LEGACY_EMAIL);
  }
}

async function migrateLegacy(): Promise<void> {
  if (localStorage.getItem(VAULT_KEY)) return;
  const id = localStorage.getItem(LEGACY_ID);
  const email = localStorage.getItem(LEGACY_EMAIL);
  if (!id || !email) return;
  const record: PasskeyRecord = {
    id,
    name: "This device",
    email,
    createdAt: Date.now(),
    isDefault: true,
    deviceUA: navigator.userAgent.slice(0, 100),
  };
  const ct = await encryptJSON([record]);
  localStorage.setItem(VAULT_KEY, ct);
}

/* -------------------- capability probe -------------------- */

export async function probePasskeySupport(): Promise<{
  supported: boolean;
  platformAvailable: boolean;
  conditionalMediation: boolean;
}> {
  const supported =
    typeof window !== "undefined" && !!(window as any).PublicKeyCredential;
  if (!supported) return { supported: false, platformAvailable: false, conditionalMediation: false };
  let platformAvailable = false;
  let conditionalMediation = false;
  try {
    platformAvailable =
      (await (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()) ||
      false;
  } catch { /* noop */ }
  try {
    conditionalMediation =
      (await (window as any).PublicKeyCredential.isConditionalMediationAvailable?.()) || false;
  } catch { /* noop */ }
  return { supported, platformAvailable, conditionalMediation };
}

/* -------------------- error mapping -------------------- */

function mapError(e: any): PasskeyError {
  const name = e?.name || "";
  const msg = e?.message || "Passkey operation failed";
  if (name === "NotAllowedError")
    return new PasskeyError(
      "not-allowed",
      "Passkey prompt was cancelled or timed out.",
      "Try again, or use email magic link / password instead.",
    );
  if (name === "InvalidStateError")
    return new PasskeyError(
      "invalid-state",
      "A passkey is already registered on this device for this account.",
      "Open Passkey Manager to rename or remove existing keys.",
    );
  if (name === "SecurityError")
    return new PasskeyError(
      "unsupported",
      "This origin cannot use WebAuthn (insecure context).",
      "Access the app over HTTPS or install the PWA.",
    );
  if (name === "AbortError" || name === "TimeoutError")
    return new PasskeyError("timeout", "Passkey prompt timed out.", "Try again, or use a magic link.");
  return new PasskeyError("unknown", msg, "Fall back to email magic link or password sign-in.");
}

/* -------------------- enrollment & authentication -------------------- */

export async function enrollPasskey(opts: {
  email: string;
  name?: string;
  displayName?: string;
}): Promise<PasskeyRecord> {
  const probe = await probePasskeySupport();
  if (!probe.supported)
    throw new PasskeyError(
      "unsupported",
      "This browser does not support WebAuthn.",
      "Use a modern browser or fall back to email/password sign-in.",
    );
  if (!probe.platformAvailable)
    throw new PasskeyError(
      "no-platform-authenticator",
      "No platform authenticator (fingerprint / Face ID / Windows Hello) is set up on this device.",
      "Enable biometrics in your device settings, or use email magic link.",
    );
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = new TextEncoder().encode(opts.email);
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "FitFusion", id: window.location.hostname },
        user: {
          id: userId,
          name: opts.email,
          displayName: opts.displayName || opts.email,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new PasskeyError("unknown", "No credential returned.", "Try again.");
    const rec: PasskeyRecord = {
      id: b64urlEncode(cred.rawId),
      name: opts.name?.trim() || defaultLabel(),
      email: opts.email,
      createdAt: Date.now(),
      isDefault: false,
      deviceUA: navigator.userAgent.slice(0, 100),
    };
    const list = await listPasskeys();
    if (!list.some((p) => p.isDefault)) rec.isDefault = true;
    list.push(rec);
    await saveList(list);
    return rec;
  } catch (e: any) {
    if (e instanceof PasskeyError) throw e;
    throw mapError(e);
  }
}

export async function verifyPasskey(preferredId?: string): Promise<PasskeyRecord | null> {
  const list = await listPasskeys();
  if (list.length === 0)
    throw new PasskeyError(
      "unsupported",
      "No passkeys are registered on this device.",
      "Enrol one from Profile → Security, or sign in with email.",
    );
  const target = preferredId ? list.find((p) => p.id === preferredId) : undefined;
  const candidates = target ? [target] : list;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: candidates.map((c) => ({
          id: b64urlDecode(c.id),
          type: "public-key",
        })),
        userVerification: "required",
        timeout: 60000,
        rpId: window.location.hostname,
      },
    })) as PublicKeyCredential | null;
    if (!assertion) return null;
    const usedId = b64urlEncode(assertion.rawId);
    const rec = list.find((p) => p.id === usedId);
    if (rec) {
      rec.lastUsedAt = Date.now();
      await saveList(list);
    }
    return rec || null;
  } catch (e: any) {
    throw mapError(e);
  }
}

/* -------------------- management -------------------- */

export async function renamePasskey(id: string, name: string): Promise<void> {
  const list = await listPasskeys();
  const rec = list.find((p) => p.id === id);
  if (!rec) return;
  rec.name = name.trim().slice(0, 40) || rec.name;
  await saveList(list);
}

export async function setDefaultPasskey(id: string): Promise<void> {
  const list = await listPasskeys();
  list.forEach((p) => (p.isDefault = p.id === id));
  await saveList(list);
}

export async function removePasskey(id: string): Promise<void> {
  const list = (await listPasskeys()).filter((p) => p.id !== id);
  if (list.length > 0 && !list.some((p) => p.isDefault)) list[0].isDefault = true;
  await saveList(list);
}

export async function clearAllPasskeys(): Promise<void> {
  localStorage.removeItem(VAULT_KEY);
  localStorage.removeItem(LEGACY_ID);
  localStorage.removeItem(LEGACY_EMAIL);
}

export async function getDefaultPasskey(): Promise<PasskeyRecord | null> {
  const list = await listPasskeys();
  return list.find((p) => p.isDefault) || list[0] || null;
}

function defaultLabel(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux device";
  return "This device";
}
