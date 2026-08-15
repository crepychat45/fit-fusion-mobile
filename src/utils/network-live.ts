/**
 * Real-time network telemetry.
 *
 * Combines the Capacitor Network plugin (native connection type: wifi /
 * cellular / none) with the browser Network Information API and the
 * network-adaptive engine's live RTT + throughput probes.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { isNative } from "@/lib/native-bridge";
import {
  classifySpeed,
  estimateThroughput,
  measureThroughput,
  probeLatency,
  type SpeedReport,
} from "@/utils/network-adaptive";

export type ConnectionKind = "wifi" | "cellular" | "ethernet" | "none" | "unknown";

export interface LiveNetwork {
  online: boolean;
  /** wifi / cellular / none — native accurate, best-effort on web. */
  kind: ConnectionKind;
  /** 5G, 4G+, 4G, 3G, 2G, Wi-Fi, Offline. */
  label: string;
  tier: SpeedReport["tier"];
  /** Live download estimate in Mbps. */
  mbps: number;
  /** Uplink estimate in Mbps (browser hint only, 0 when unknown). */
  upMbps: number;
  rtt: number;
  jitter: number;
  saveData: boolean;
  effectiveType: string;
  source: "measured" | "estimated";
  /** Native only: raw connection type reported by the OS. */
  nativeKind?: string;
  updatedAt: number;
}

function conn(): any {
  if (typeof navigator === "undefined") return null;
  return (
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    null
  );
}

/** Best-effort connection kind without native plugins. */
export function webConnectionKind(): ConnectionKind {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "none";
  const c = conn();
  const t = (c?.type as string) || "";
  if (t === "wifi") return "wifi";
  if (t === "cellular") return "cellular";
  if (t === "ethernet") return "ethernet";
  return "unknown";
}

export async function readNativeConnection(): Promise<{ kind: ConnectionKind; raw?: string } | null> {
  if (!isNative()) return null;
  try {
    const { Network } = await import("@capacitor/network");
    const s = await Network.getStatus();
    const raw = s.connectionType;
    const kind: ConnectionKind =
      raw === "wifi" ? "wifi" : raw === "cellular" ? "cellular" : s.connected ? "unknown" : "none";
    return { kind, raw };
  } catch {
    return null;
  }
}

function labelFor(kind: ConnectionKind, tier: SpeedReport["tier"], speedLabel: string): string {
  if (kind === "none") return "Offline";
  if (kind === "wifi") return tier === "5g" ? "Wi-Fi (Fast)" : tier === "4g+" ? "Wi-Fi" : `Wi-Fi (${speedLabel})`;
  if (kind === "ethernet") return "Ethernet";
  return speedLabel;
}

const EMPTY: LiveNetwork = {
  online: true,
  kind: "unknown",
  label: "—",
  tier: "4g",
  mbps: 0,
  upMbps: 0,
  rtt: 0,
  jitter: 0,
  saveData: false,
  effectiveType: "4g",
  source: "estimated",
  updatedAt: 0,
};

/** One-shot snapshot: passive estimate + a single latency probe. */
export async function sampleNetwork(deep = false): Promise<LiveNetwork> {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const native = await readNativeConnection();
  const kind = native?.kind ?? webConnectionKind();
  const c = conn();

  let mbps = 0;
  let rtt = 0;
  let source: LiveNetwork["source"] = "estimated";

  if (!online) {
    return { ...EMPTY, online: false, kind: "none", label: "Offline", tier: "offline", updatedAt: Date.now() };
  }

  if (deep) {
    const r = await measureThroughput(6000);
    mbps = r.mbps;
    rtt = r.rtt;
    source = r.source;
  } else {
    rtt = await probeLatency(2500);
    mbps = estimateThroughput() || c?.downlink || 0;
  }

  const cls = classifySpeed(mbps, rtt, online);
  return {
    online,
    kind,
    label: labelFor(kind, cls.tier, cls.label),
    tier: cls.tier,
    mbps: Math.round(mbps * 10) / 10,
    upMbps: Math.round(((c?.uplink ?? 0) as number) * 10) / 10,
    rtt: Math.max(0, Math.round(rtt)),
    jitter: 0,
    saveData: !!c?.saveData,
    effectiveType: c?.effectiveType ?? "4g",
    source,
    nativeKind: native?.raw,
    updatedAt: Date.now(),
  };
}

/**
 * Live network hook — refreshes on an interval, on online/offline events and
 * on native connection changes. Pauses while the tab is hidden.
 */
export function useLiveNetwork(intervalMs = 6000) {
  const [net, setNet] = useState<LiveNetwork>(EMPTY);
  const [history, setHistory] = useState<{ at: number; mbps: number; rtt: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const lastRtt = useRef(0);

  const refresh = useCallback(async (deep = false) => {
    if (deep) setBusy(true);
    try {
      const s = await sampleNetwork(deep);
      if (!alive.current) return s;
      const jitter = lastRtt.current ? Math.abs(s.rtt - lastRtt.current) : 0;
      lastRtt.current = s.rtt || lastRtt.current;
      const next = { ...s, jitter };
      setNet(next);
      setHistory((h) => [...h, { at: next.updatedAt, mbps: next.mbps, rtt: next.rtt }].slice(-30));
      return next;
    } finally {
      if (alive.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void refresh(false);

    const tick = () => {
      if (!document.hidden) void refresh(false);
    };
    const timer = window.setInterval(tick, Math.max(3000, intervalMs));
    window.addEventListener("online", tick);
    window.addEventListener("offline", tick);
    document.addEventListener("visibilitychange", tick);
    const c = conn();
    c?.addEventListener?.("change", tick);

    let removeNative: (() => void) | undefined;
    if (isNative()) {
      import("@capacitor/network")
        .then(async ({ Network }) => {
          const h = await Network.addListener("networkStatusChange", () => tick());
          removeNative = () => void h.remove();
        })
        .catch(() => undefined);
    }

    return () => {
      alive.current = false;
      window.clearInterval(timer);
      window.removeEventListener("online", tick);
      window.removeEventListener("offline", tick);
      document.removeEventListener("visibilitychange", tick);
      c?.removeEventListener?.("change", tick);
      removeNative?.();
    };
  }, [intervalMs, refresh]);

  return { net, history, busy, refresh };
}
