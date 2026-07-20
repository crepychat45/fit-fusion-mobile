import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Database, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { clearAppCache } from "@/utils/version-api";
import { useToast } from "@/hooks/use-toast";

interface Metrics {
  latency: number | null;
  quotaPct: number;
  queueSize: number;
  storageOk: boolean;
}

export function SystemHealthPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [m, setM] = useState<Metrics>({ latency: null, quotaPct: 0, queueSize: 0, storageOk: true });
  const [busy, setBusy] = useState(false);

  const measure = async () => {
    const start = performance.now();
    try { await supabase.auth.getSession(); } catch { /* ignore */ }
    const latency = Math.round(performance.now() - start);

    let quotaPct = 0;
    try {
      const est = await navigator.storage?.estimate?.();
      if (est?.quota) quotaPct = ((est.usage ?? 0) / est.quota) * 100;
    } catch { /* ignore */ }

    const queueSize = qc.getQueryCache().getAll().filter((q) => q.state.fetchStatus === "fetching").length;

    let storageOk = true;
    try {
      const k = "__fitfusion_health__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
    } catch { storageOk = false; }

    setM({ latency, quotaPct, queueSize, storageOk });
  };

  useEffect(() => { measure(); const t = setInterval(measure, 15000); return () => clearInterval(t); }, []);

  const heal = async () => {
    setBusy(true);
    try {
      await clearAppCache();
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      qc.clear();
      toast({ title: "App reset complete", description: "Cache and caches cleared. Reloading…" });
      setTimeout(() => window.location.reload(), 700);
    } finally { setBusy(false); }
  };

  const latencyOk = m.latency !== null && m.latency < 800;

  return (
    <Card className="liquid-glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> System Health & Diagnostics
        </CardTitle>
        <CardDescription>Self-healing diagnostics for the client runtime.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Metric icon={<Zap className="h-4 w-4" />} label="API latency" value={m.latency === null ? "…" : `${m.latency} ms`} ok={latencyOk} />
          <Metric icon={<Database className="h-4 w-4" />} label="Storage usage" value={`${m.quotaPct.toFixed(1)}%`} ok={m.quotaPct < 80} progress={m.quotaPct} />
          <Metric icon={<Activity className="h-4 w-4" />} label="Sync queue" value={`${m.queueSize} active`} ok={m.queueSize < 10} />
        </div>

        <div className="rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-medium">LocalStorage</div>
            <p className="text-xs text-muted-foreground">Persistence subsystem status</p>
          </div>
          <Badge className={m.storageOk ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" : "bg-destructive/15 text-destructive border border-destructive/30"}>
            {m.storageOk ? "Healthy" : "Unavailable"}
          </Badge>
        </div>

        <Button onClick={heal} disabled={busy} className="rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <Wrench className="h-4 w-4 mr-2" /> Fix app errors
        </Button>
      </CardContent>
    </Card>
  );
}

function Metric({ icon, label, value, ok, progress }: { icon: React.ReactNode; label: string; value: string; ok: boolean; progress?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">{icon}{label}</div>
        <Badge className={ok ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" : "bg-amber-500/15 text-amber-600 border border-amber-500/30"}>
          {ok ? "OK" : "Watch"}
        </Badge>
      </div>
      <div className="text-lg font-semibold">{value}</div>
      {typeof progress === "number" && <Progress value={progress} className="h-1.5" />}
    </div>
  );
}
