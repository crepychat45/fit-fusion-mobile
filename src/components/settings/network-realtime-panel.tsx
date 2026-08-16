import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLiveNetwork } from "@/utils/network-live";
import { isNative } from "@/lib/native-bridge";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Gauge,
  RefreshCw,
  Signal,
  SignalHigh,
  Smartphone,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react";

const TIER_STYLES: Record<string, string> = {
  "5g": "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "4g+": "bg-sky-500/15 text-sky-600 border-sky-500/30",
  "4g": "bg-sky-500/15 text-sky-600 border-sky-500/30",
  "3g": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "2g": "bg-destructive/15 text-destructive border-destructive/30",
  offline: "bg-muted text-muted-foreground border-border",
};

/**
 * Real-time network monitor — live connection type (Wi-Fi vs mobile data),
 * generation label (5G / 4G+ / 4G / 3G), throughput, latency and jitter.
 */
export function NetworkRealtimePanel() {
  const { toast } = useToast();
  const { net, history, busy, refresh } = useLiveNetwork(6000);
  const [deep, setDeep] = useState(false);

  const spark = useMemo(() => history.slice(-24), [history]);
  const maxMbps = Math.max(1, ...spark.map((s) => s.mbps));

  const runDeep = async () => {
    setDeep(true);
    try {
      const r = await refresh(true);
      toast({
        title: `${r.label} · ${r.mbps} Mbps`,
        description: `Latency ${r.rtt} ms · ${r.kind === "wifi" ? "Wi-Fi" : r.kind === "cellular" ? "Mobile data" : "Unknown link"}`,
      });
    } finally {
      setDeep(false);
    }
  };

  const KindIcon = !net.online ? WifiOff : net.kind === "wifi" ? Wifi : net.kind === "cellular" ? Signal : SignalHigh;

  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <SignalHigh className="h-4 w-4 text-primary" />
          Real-time Network
          <Badge variant="outline" className={`ml-auto text-[10px] ${TIER_STYLES[net.tier] ?? ""}`}>
            {net.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {net.source === "measured" ? "measured" : "live estimate"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Live Wi-Fi / mobile-data detection with real speed, latency and jitter.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: KindIcon, label: "Connection", value: net.kind === "cellular" ? "Mobile data" : net.kind === "wifi" ? "Wi-Fi" : net.online ? "Unknown" : "Offline" },
            { icon: ArrowDownToLine, label: "Download", value: net.mbps ? `${net.mbps} Mb/s` : "—" },
            { icon: Timer, label: "Latency", value: net.rtt ? `${net.rtt} ms` : "—" },
            { icon: Gauge, label: "Jitter", value: net.jitter ? `${net.jitter} ms` : "—" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
              <m.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-semibold leading-tight">{m.value}</div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Throughput history */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Throughput history</span>
            <span>{spark.length} samples</span>
          </div>
          <div className="flex h-16 items-end gap-[3px] rounded-xl border border-border/40 bg-muted/20 p-2">
            {spark.length === 0 && <span className="m-auto text-xs text-muted-foreground">Sampling…</span>}
            {spark.map((s, i) => (
              <div
                key={`${s.at}-${i}`}
                className="flex-1 rounded-sm bg-primary/70"
                style={{ height: `${Math.max(6, (s.mbps / maxMbps) * 100)}%` }}
                title={`${s.mbps} Mb/s · ${s.rtt} ms`}
              />
            ))}
          </div>
        </div>

        {/* Signal quality */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Link quality</span>
            <span className="font-medium capitalize">{net.tier}</span>
          </div>
          <Progress
            value={Math.min(100, net.mbps ? (net.mbps / 60) * 100 : 0)}
            className="h-1.5"
          />
        </div>

        <div className="grid gap-1 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Reported type</span>
            <span className="font-medium text-foreground">
              {net.nativeKind ?? net.effectiveType.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Uplink hint</span>
            <span className="font-medium text-foreground">{net.upMbps ? `${net.upMbps} Mb/s` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Data saver</span>
            <span className="font-medium text-foreground">{net.saveData ? "On" : "Off"}</span>
          </div>
          <div className="flex justify-between">
            <span>Source</span>
            <span className="font-medium text-foreground">
              {isNative() ? "Native OS radio" : "Browser network API"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void runDeep()} disabled={deep || busy}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${deep || busy ? "animate-spin" : ""}`} />
            {deep ? "Testing speed…" : "Run real speed test"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void refresh(false)} disabled={busy}>
            <ArrowUpFromLine className="mr-1.5 h-3.5 w-3.5" />
            Refresh now
          </Button>
          {isNative() && (
            <Badge variant="secondary" className="self-center text-[10px]">
              <Smartphone className="mr-1 h-3 w-3" /> Native telemetry
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
