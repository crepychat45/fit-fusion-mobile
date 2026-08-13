/**
 * Network-adaptive download + latency engine.
 *
 * - Detects slow / saver networks via navigator.connection.
 * - Actively measures real round-trip latency (RTT) and jitter with
 *   lightweight same-origin probes, so the app can adapt when the
 *   browser's own estimate is stale or missing.
 * - Exposes a global `data-saver`, `data-net` and `data-latency` flag on
 *   <html> consumed by heavy widgets and CSS.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type NavConn = {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener?: (t: string, cb: () => void) => void;
  removeEventListener?: (t: string, cb: () => void) => void;
};

export interface NetworkStatus {
  effectiveType: string;
  saveData: boolean;
  downlink: number;
  rtt: number;
  isSlow: boolean;
  dataSaverActive: boolean;
  online: boolean;
}

export interface LatencySample {
  at: number;
  ms: number;
}

export interface LatencyReport {
  /** Smoothed (EMA) latency in ms. 0 when unknown. */
  latency: number;
  /** Last raw measurement. */
  last: number;
  /** Variation between consecutive probes. */
  jitter: number;
  /** Failed probes ratio 0..1 */
  loss: number;
  grade: "excellent" | "good" | "fair" | "poor" | "offline";
  samples: LatencySample[];
}

const LS_MANUAL_SAVER = "fitfusion_data_saver";
const LS_TURBO = "fitfusion_net_turbo";
const LS_BUDGET = "fitfusion_net_budget";

function getConn(): NavConn | null {
  return (
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    null
  );
}

export function getNetworkStatus(): NetworkStatus {
  const c = getConn();
  const effectiveType = c?.effectiveType ?? "4g";
  const saveData = Boolean(c?.saveData);
  const isSlow =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";
  let manual = false;
  try {
    manual = localStorage.getItem(LS_MANUAL_SAVER) === "true";
  } catch {
    /* storage blocked */
  }
  const dataSaverActive = manual || saveData || isSlow;
  applyDataSaver(dataSaverActive);
  try {
    document.documentElement.dataset.net = effectiveType;
  } catch {
    /* noop */
  }
  return {
    effectiveType,
    saveData,
    downlink: c?.downlink ?? 0,
    rtt: c?.rtt ?? 0,
    isSlow,
    dataSaverActive,
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
  };
}

export function applyDataSaver(on: boolean) {
  document.documentElement.dataset.dataSaver = on ? "true" : "false";
}

export function setManualDataSaver(on: boolean) {
  try {
    localStorage.setItem(LS_MANUAL_SAVER, on ? "true" : "false");
  } catch {
    /* noop */
  }
  applyDataSaver(on || getNetworkStatus().dataSaverActive);
}

/* ------------------------------------------------------------------ */
/* Latency measurement                                                 */
/* ------------------------------------------------------------------ */

export function gradeLatency(ms: number, online = true): LatencyReport["grade"] {
  if (!online) return "offline";
  if (ms <= 0) return "good";
  if (ms < 90) return "excellent";
  if (ms < 200) return "good";
  if (ms < 450) return "fair";
  return "poor";
}

/**
 * One lightweight probe against a same-origin asset. Cache-busted so the
 * measurement reflects the real network, not the HTTP cache.
 */
export async function probeLatency(timeoutMs = 4000): Promise<number> {
  const url = `${window.location.origin}/favicon.ico?ping=${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = performance.now();
  try {
    await fetch(url, {
      method: "GET",
      cache: "no-store",
      mode: "same-origin",
      signal: ctrl.signal,
    });
    return Math.round(performance.now() - started);
  } catch {
    return -1;
  } finally {
    clearTimeout(timer);
  }
}

/** Run `count` sequential probes and summarise them. */
export async function measureLatency(count = 4): Promise<LatencyReport> {
  const samples: LatencySample[] = [];
  let failures = 0;
  for (let i = 0; i < count; i++) {
    const ms = await probeLatency();
    if (ms < 0) failures++;
    else samples.push({ at: Date.now(), ms });
    await new Promise((r) => setTimeout(r, 120));
  }
  return summarise(samples, failures / Math.max(1, count));
}

function summarise(samples: LatencySample[], loss: number): LatencyReport {
  if (!samples.length) {
    return {
      latency: 0,
      last: 0,
      jitter: 0,
      loss,
      grade: navigator.onLine ? "poor" : "offline",
      samples,
    };
  }
  // EMA smoothing keeps the value stable but responsive.
  let ema = samples[0].ms;
  let jitterAcc = 0;
  for (let i = 1; i < samples.length; i++) {
    ema = ema * 0.6 + samples[i].ms * 0.4;
    jitterAcc += Math.abs(samples[i].ms - samples[i - 1].ms);
  }
  const jitter = samples.length > 1 ? jitterAcc / (samples.length - 1) : 0;
  const latency = Math.round(ema);
  return {
    latency,
    last: samples[samples.length - 1].ms,
    jitter: Math.round(jitter),
    loss,
    grade: gradeLatency(latency, navigator.onLine),
    samples,
  };
}

/**
 * Turbo mode: warms DNS/TLS to the API + CDN origins so the first real
 * request does not pay the handshake cost. This is the single biggest
 * win for perceived latency on mobile networks.
 */
const warmed = new Set<string>();
export function warmConnection(origin: string) {
  if (!origin || warmed.has(origin)) return;
  warmed.add(origin);
  (["dns-prefetch", "preconnect"] as const).forEach((rel) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = origin;
    if (rel === "preconnect") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

export function warmCriticalOrigins() {
  const origins = [
    import.meta.env.VITE_SUPABASE_URL as string | undefined,
    "https://images.unsplash.com",
    "https://commondatastorage.googleapis.com",
    "https://fonts.gstatic.com",
  ].filter(Boolean) as string[];
  origins.forEach((o) => {
    try {
      warmConnection(new URL(o).origin);
    } catch {
      /* invalid url */
    }
  });
}

export function isTurboEnabled() {
  try {
    return localStorage.getItem(LS_TURBO) !== "false";
  } catch {
    return true;
  }
}

export function setTurboEnabled(on: boolean) {
  try {
    localStorage.setItem(LS_TURBO, String(on));
  } catch {
    /* noop */
  }
  if (on) warmCriticalOrigins();
}

export function getLatencyBudget(): number {
  try {
    const v = Number(localStorage.getItem(LS_BUDGET));
    return Number.isFinite(v) && v > 0 ? v : 350;
  } catch {
    return 350;
  }
}

export function setLatencyBudget(ms: number) {
  try {
    localStorage.setItem(LS_BUDGET, String(Math.round(ms)));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => getNetworkStatus());
  useEffect(() => {
    const c = getConn();
    const update = () => setStatus(getNetworkStatus());
    c?.addEventListener?.("change", update);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      c?.removeEventListener?.("change", update);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return status;
}

/**
 * Continuously (and cheaply) tracks real latency. Probes pause while the
 * tab is hidden so we never waste battery or bandwidth in the background.
 */
export function useLatencyMonitor(intervalMs = 20000, autoStart = true) {
  const [report, setReport] = useState<LatencyReport>({
    latency: 0,
    last: 0,
    jitter: 0,
    loss: 0,
    grade: "good",
    samples: [],
  });
  const [running, setRunning] = useState(false);
  const history = useRef<LatencySample[]>([]);
  const mounted = useRef(true);

  const runOnce = useCallback(async (count = 3) => {
    setRunning(true);
    const r = await measureLatency(count);
    history.current = [...history.current, ...r.samples].slice(-40);
    const merged = summarise(history.current, r.loss);
    if (mounted.current) {
      setReport(merged);
      try {
        document.documentElement.dataset.latency = merged.grade;
      } catch {
        /* noop */
      }
      // Auto-enable data saver when the link is genuinely bad.
      if (merged.grade === "poor") applyDataSaver(true);
      setRunning(false);
    }
    return merged;
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!autoStart) return () => { mounted.current = false; };
    let timer: number | undefined;
    const tick = () => {
      if (!document.hidden && navigator.onLine) void runOnce(2);
    };
    tick();
    timer = window.setInterval(tick, Math.max(5000, intervalMs));
    document.addEventListener("visibilitychange", tick);
    return () => {
      mounted.current = false;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [autoStart, intervalMs, runOnce]);

  return { report, running, runOnce };
}

/* ------------------------------------------------------------------ */
/* Throughput measurement + connection classification                  */
/* ------------------------------------------------------------------ */

export interface SpeedReport {
  /** Measured download throughput in Mbps (0 when unknown). */
  mbps: number;
  /** Bytes transferred during the active test. */
  bytes: number;
  /** Round-trip latency used for classification. */
  rtt: number;
  /** Human label: 5G, 4G+, 4G, 3G, 2G, Offline. */
  label: string;
  /** Machine class used for adaptive decisions. */
  tier: "offline" | "2g" | "3g" | "4g" | "4g+" | "5g";
  /** Where the numbers came from. */
  source: "measured" | "estimated";
}

/** Picks the heaviest same-origin asset already loaded — the best probe payload. */
function pickProbeAsset(): { url: string; size: number } | null {
  try {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    let best: { url: string; size: number } | null = null;
    for (const e of entries) {
      if (!e.name.startsWith(window.location.origin)) continue;
      if (!/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)(\?|$)/.test(e.name)) continue;
      const size = e.decodedBodySize || e.transferSize || 0;
      if (size > (best?.size ?? 0)) best = { url: e.name.split("?")[0], size };
    }
    return best && best.size > 8000 ? best : null;
  } catch {
    return null;
  }
}

/** Passive estimate from the resource-timing buffer (free, no extra traffic). */
export function estimateThroughput(): number {
  try {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const recent = entries.slice(-60).filter((e) => (e.transferSize || 0) > 4000 && e.duration > 4);
    if (!recent.length) return 0;
    const rates = recent
      .map((e) => ((e.transferSize || 0) * 8) / (e.duration / 1000) / 1_000_000)
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);
    if (!rates.length) return 0;
    // 75th percentile approximates the achievable link rate better than the mean.
    return Math.round(rates[Math.floor(rates.length * 0.75)] * 10) / 10;
  } catch {
    return 0;
  }
}

export function classifySpeed(mbps: number, rtt: number, online = true): Pick<SpeedReport, "label" | "tier"> {
  if (!online) return { label: "Offline", tier: "offline" };
  if (mbps <= 0) {
    const c = getConn();
    const et = c?.effectiveType ?? "4g";
    const map: Record<string, Pick<SpeedReport, "label" | "tier">> = {
      "slow-2g": { label: "2G", tier: "2g" },
      "2g": { label: "2G", tier: "2g" },
      "3g": { label: "3G", tier: "3g" },
      "4g": { label: "4G", tier: "4g" },
    };
    return map[et] ?? { label: "4G", tier: "4g" };
  }
  if (mbps >= 50 && rtt > 0 && rtt < 70) return { label: "5G / Fiber", tier: "5g" };
  if (mbps >= 50) return { label: "5G", tier: "5g" };
  if (mbps >= 12) return { label: "4G+ / LTE-A", tier: "4g+" };
  if (mbps >= 3) return { label: "4G", tier: "4g" };
  if (mbps >= 0.6) return { label: "3G", tier: "3g" };
  return { label: "2G", tier: "2g" };
}

/**
 * Active download test. Re-fetches a real (cache-busted) app asset and
 * measures wall-clock throughput. Falls back to parallel micro-probes when
 * no large asset is available, and finally to the passive estimate.
 */
export async function measureThroughput(timeoutMs = 8000): Promise<SpeedReport> {
  const online = navigator.onLine;
  const rtt = await probeLatency(3000);
  if (!online) {
    return { mbps: 0, bytes: 0, rtt: 0, ...classifySpeed(0, 0, false), source: "measured" };
  }

  const asset = pickProbeAsset();
  let bytes = 0;
  let seconds = 0;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const started = performance.now();
    if (asset) {
      const res = await fetch(`${asset.url}?spd=${Date.now()}`, {
        cache: "no-store",
        signal: ctrl.signal,
      });
      const buf = await res.arrayBuffer();
      bytes = buf.byteLength;
    } else {
      const results = await Promise.all(
        Array.from({ length: 6 }, (_, i) =>
          fetch(`${window.location.origin}/placeholder.svg?spd=${Date.now()}-${i}`, {
            cache: "no-store",
            signal: ctrl.signal,
          })
            .then((r) => r.arrayBuffer())
            .then((b) => b.byteLength)
            .catch(() => 0),
        ),
      );
      bytes = results.reduce((a, b) => a + b, 0);
    }
    seconds = (performance.now() - started) / 1000;
    clearTimeout(timer);
  } catch {
    bytes = 0;
  }

  // Subtract one RTT: the handshake is latency, not bandwidth.
  const transferSeconds = Math.max(0.02, seconds - Math.max(0, rtt) / 1000);
  let mbps = bytes > 0 ? (bytes * 8) / transferSeconds / 1_000_000 : 0;
  let source: SpeedReport["source"] = "measured";

  if (mbps <= 0 || !Number.isFinite(mbps)) {
    mbps = estimateThroughput();
    source = "estimated";
  }
  if (mbps <= 0) {
    const c = getConn();
    mbps = c?.downlink ?? 0;
    source = "estimated";
  }

  mbps = Math.round(mbps * 10) / 10;
  const cls = classifySpeed(mbps, rtt, online);
  try {
    document.documentElement.dataset.netTier = cls.tier;
  } catch {
    /* noop */
  }
  return { mbps, bytes, rtt: Math.max(0, rtt), ...cls, source };
}
