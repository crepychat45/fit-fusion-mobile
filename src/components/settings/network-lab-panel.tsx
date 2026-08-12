import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Gauge,
  Radio,
  RefreshCw,
  Rocket,
  Signal,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  getLatencyBudget,
  isTurboEnabled,
  setLatencyBudget,
  setManualDataSaver,
  setTurboEnabled,
  useLatencyMonitor,
  useNetworkStatus,
  warmCriticalOrigins,
} from "@/utils/network-adaptive";

const GRADE_STYLES: Record<string, string> = {
  excellent: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  good: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  fair: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  poor: "bg-destructive/15 text-destructive border-destructive/30",
  offline: "bg-muted text-muted-foreground border-border",
};

/**
 * Network Lab — live latency diagnostics and tuning for the
 * network-adaptive engine.
 */
export function NetworkLabPanel() {
  const { toast } = useToast();
  const net = useNetworkStatus();
  const { report, running, runOnce } = useLatencyMonitor(20000, true);
  const [turbo, setTurbo] = useState(() => isTurboEnabled());
  const [budget, setBudget] = useState(() => getLatencyBudget());
  const [saver, setSaver] = useState(net.dataSaverActive);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (turbo) warmCriticalOrigins();
  }, [turbo]);

  const spark = useMemo(() => report.samples.slice(-24), [report.samples]);
  const max = Math.max(120, ...spark.map((s) => s.ms));
  const overBudget = report.latency > budget && report.latency > 0;

  const runFullTest = async () => {
    setTesting(true);
    const r = await runOnce(6);
    setTesting(false);
    toast({
      title: `Latency: ${r.latency} ms (${r.grade})`,
      description: `Jitter ${r.jitter} ms · packet loss ${Math.round(r.loss * 100)}%`,
    });
  };

  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-4 w-4 text-primary" />
          Network Lab
          <Badge variant="outline" className={`ml-auto text-[10px] capitalize ${GRADE_STYLES[report.grade]}`}>
            {report.grade}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real round-trip measurements, jitter tracking and adaptive tuning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Live metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: Gauge, label: "Latency", value: report.latency ? `${report.latency} ms` : "—" },
            { icon: Activity, label: "Jitter", value: report.jitter ? `${report.jitter} ms` : "—" },
            { icon: Signal, label: "Network", value: net.effectiveType.toUpperCase() },
            {
              icon: net.online ? Wifi : WifiOff,
              label: "Downlink",
              value: net.downlink ? `${net.downlink} Mb/s` : net.online ? "—" : "Offline",
            },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
              <m.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-semibold leading-tight">{m.value}</div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Round-trip history</span>
            <span>{spark.length} samples</span>
          </div>
          <div className="flex h-16 items-end gap-[3px] rounded-xl border border-border/40 bg-muted/20 p-2">
            {spark.length === 0 && (
              <span className="m-auto text-xs text-muted-foreground">Measuring…</span>
            )}
            {spark.map((s, i) => (
              <div
                key={`${s.at}-${i}`}
                className={`flex-1 rounded-sm ${s.ms > budget ? "bg-destructive/70" : "bg-primary/70"}`}
                style={{ height: `${Math.max(6, (s.ms / max) * 100)}%` }}
                title={`${s.ms} ms`}
              />
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Latency budget</Label>
            <span className="text-xs text-muted-foreground">{budget} ms</span>
          </div>
          <Slider
            value={[budget]}
            min={100}
            max={1000}
            step={25}
            onValueChange={(v) => setBudget(v[0] ?? 350)}
            onValueCommit={(v) => {
              setLatencyBudget(v[0] ?? 350);
              toast({ title: "Latency budget saved", description: `${v[0]} ms threshold` });
            }}
          />
          <Progress
            value={Math.min(100, report.latency ? (report.latency / budget) * 100 : 0)}
            className="h-1.5"
          />
          {overBudget && (
            <p className="text-xs text-destructive">
              Above budget — enable Turbo or Data Saver to reduce load.
            </p>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-start gap-3">
              <Rocket className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <Label className="text-sm">Turbo connect</Label>
                <p className="text-xs text-muted-foreground">
                  Pre-warms DNS + TLS to the API and media CDNs.
                </p>
              </div>
            </div>
            <Switch
              checked={turbo}
              onCheckedChange={(v) => {
                setTurbo(v);
                setTurboEnabled(v);
                toast({ title: v ? "Turbo connect on" : "Turbo connect off" });
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <Label className="text-sm">Data saver</Label>
                <p className="text-xs text-muted-foreground">
                  Lowers image quality and disables heavy animations.
                </p>
              </div>
            </div>
            <Switch
              checked={saver}
              onCheckedChange={(v) => {
                setSaver(v);
                setManualDataSaver(v);
                toast({ title: v ? "Data saver enabled" : "Data saver disabled" });
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={runFullTest} disabled={testing || running}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${testing || running ? "animate-spin" : ""}`} />
            Run speed test
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              warmCriticalOrigins();
              toast({ title: "Connections warmed", description: "DNS and TLS handshakes pre-opened." });
            }}
          >
            Warm connections
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
