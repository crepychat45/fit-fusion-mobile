/**
 * Real-time hardware, storage and network diagnostics for Settings → About.
 */
import { APP_VERSION, APP_RELEASE_DATE } from "@/lib/app-version";
import { getConsoleEntries } from "@/utils/console-buffer";

export interface StorageInfo {
  usageBytes: number;
  quotaBytes: number;
  percent: number;
  supported: boolean;
}

export interface NetworkInfo {
  online: boolean;
  effectiveType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean;
}

export interface SystemSpecs {
  appVersion: string;
  buildCommit: string;
  buildDate: string;
  buildNumber: string;
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  cpuCores: number | null;
  deviceMemoryGb: number | null;
  screen: string;
  pixelRatio: number;
  standalone: boolean;
  serviceWorker: boolean;
}

/** Short build commit hash: from the build env when available, else derived. */
export function getBuildCommit(): string {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
  const raw = env.VITE_BUILD_COMMIT || env.VITE_COMMIT_SHA || "";
  if (raw) return raw.slice(0, 7);
  // Deterministic fallback derived from version + release date.
  const seed = `${APP_VERSION}@${APP_RELEASE_DATE}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

export function getBuildNumber(): string {
  return `${APP_RELEASE_DATE.replace(/-/g, "")}.${getBuildCommit().slice(0, 3)}`;
}

export function getSystemSpecs(): SystemSpecs {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    appVersion: APP_VERSION,
    buildCommit: getBuildCommit(),
    buildDate: APP_RELEASE_DATE,
    buildNumber: getBuildNumber(),
    platform: nav.platform || "unknown",
    userAgent: nav.userAgent,
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cpuCores: nav.hardwareConcurrency ?? null,
    deviceMemoryGb: nav.deviceMemory ?? null,
    screen: `${window.screen.width}×${window.screen.height}`,
    pixelRatio: window.devicePixelRatio,
    standalone: window.matchMedia("(display-mode: standalone)").matches,
    serviceWorker: "serviceWorker" in navigator,
  };
}

export function getNetworkInfo(): NetworkInfo {
  const c = (navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
  }).connection;
  return {
    online: navigator.onLine,
    effectiveType: c?.effectiveType ?? "unknown",
    downlinkMbps: typeof c?.downlink === "number" ? c.downlink : null,
    rttMs: typeof c?.rtt === "number" ? c.rtt : null,
    saveData: Boolean(c?.saveData),
  };
}

export async function getStorageInfo(): Promise<StorageInfo> {
  if (!navigator.storage?.estimate) {
    return { usageBytes: 0, quotaBytes: 0, percent: 0, supported: false };
  }
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usageBytes: usage,
      quotaBytes: quota,
      percent: quota ? Math.min(100, (usage / quota) * 100) : 0,
      supported: true,
    };
  } catch {
    return { usageBytes: 0, quotaBytes: 0, percent: 0, supported: false };
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Non-sensitive snapshot of client preferences (keys only for unknown data). */
function collectClientState() {
  const safePrefixes = ["fitfusion-", "theme"];
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !safePrefixes.some((p) => key.startsWith(p))) continue;
      if (/token|secret|pin|passkey|password|session/i.test(key)) {
        out[key] = "[redacted]";
        continue;
      }
      out[key] = (localStorage.getItem(key) || "").slice(0, 300);
    }
  } catch {
    /* storage unavailable */
  }
  return out;
}

export interface DiagnosticReport {
  generatedAt: string;
  specs: SystemSpecs;
  network: NetworkInfo;
  storage: StorageInfo;
  clientState: Record<string, string>;
  consoleLogs: ReturnType<typeof getConsoleEntries>;
}

export async function buildDiagnosticReport(): Promise<DiagnosticReport> {
  return {
    generatedAt: new Date().toISOString(),
    specs: getSystemSpecs(),
    network: getNetworkInfo(),
    storage: await getStorageInfo(),
    clientState: collectClientState(),
    consoleLogs: getConsoleEntries(100),
  };
}

export interface EncryptedReport {
  format: "fitfusion-diagnostic-v1";
  algorithm: "AES-GCM-256";
  kdf: "PBKDF2-SHA256-150000";
  salt: string;
  iv: string;
  ciphertext: string;
  passphrase: string;
}

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)));

/** Encrypt a report with a freshly generated passphrase (returned to the user). */
export async function encryptReport(report: DiagnosticReport): Promise<EncryptedReport> {
  const passBytes = crypto.getRandomValues(new Uint8Array(12));
  const passphrase = b64(passBytes).replace(/[^A-Za-z0-9]/g, "").slice(0, 16);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(report)),
  );
  return {
    format: "fitfusion-diagnostic-v1",
    algorithm: "AES-GCM-256",
    kdf: "PBKDF2-SHA256-150000",
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ciphertext),
    passphrase,
  };
}
