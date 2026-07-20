import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Signal, Zap, Gauge, Image as ImageIcon, Video, Wifi, WifiOff, Rocket, RefreshCw, Activity } from "lucide-react";
import { useNetworkStatus, setManualDataSaver } from "@/utils/network-adaptive";

/**
 * Persist to `fitfusion-*` so the cloud mirror (local-storage-sync) writes
 * these to public.user_settings.local_kv and restores on sign-in / new device.
 */
function usePersisted<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    // Apply to global data attributes so downstream widgets can react in CSS.
    document.documentElement.dataset[key.replace(/^fitfusion-/, "").replace(/-/g, "_")] = String(value);
  }, [key, value]);
  useEffect(() => {
    const onHydrate = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) setValue(JSON.parse(raw) as T);
      } catch { /* ignore */ }
    };
    window.addEventListener("fitfusion-settings-hydrated", onHydrate);
    return () => window.removeEventListener("fitfusion-settings-hydrated", onHydrate);
  }, [key]);
  return [value, setValue];
}

export function NetworkAdaptiveBanner() {
  const s = useNetworkStatus();
  const { toast } = useToast();
  const [forced, setForced] = useState<boolean>(() => localStorage.getItem("fitfusion_data_saver") === "true");

  // New realtime engine settings — all synced to the cloud.
  const [imageQuality, setImageQuality] = usePersisted<"auto" | "high" | "balanced" | "low">("fitfusion-net-image-quality", "auto");
  const [videoAutoplay, setVideoAutoplay] = usePersisted<boolean>("fitfusion-net-video-autoplay", true);
  const [prefetchRoutes, setPrefetchRoutes] = usePersisted<boolean>("fitfusion-net-prefetch", true);
  const [animationsHeavy, setAnimationsHeavy] = usePersisted<boolean>("fitfusion-net-animations-heavy", true);
  const [backgroundSync, setBackgroundSync] = usePersisted<boolean>("fitfusion-net-bg-sync", true);

  // Live downlink history for a mini sparkline (last 20 samples).
  const [history, setHistory] = useState<number[]>([]);
  const lastPushRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastPushRef.current < 900) return;
    lastPushRef.current = now;
    setHistory((h) => [...h.slice(-19), Math.max(0, s.downlink || 0)]);
  }, [s.downlink, s.effectiveType, s.rtt]);

  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const [onlineNow, setOnlineNow] = useState(online);
  useEffect(() => {
    const on = () => setOnlineNow(true);
    const off = () => setOnlineNow(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const quality = useMemo(() => {
    const dl = s.downlink || 0;
    if (dl >= 10) return { label: "Excellent", pct: 100, tone: "text-emerald-500" };
    if (dl >= 5) return { label: "Good", pct: 80, tone: "text-emerald-400" };
    if (dl >= 2) return { label: "Fair", pct: 55, tone: "text-amber-500" };
    if (dl >= 0.5) return { label: "Weak", pct: 30, tone: "text-orange-500" };
    return { label: "Very poor", pct: 10, tone: "text-rose-500" };
  }, [s.downlink]);

  const effectiveImageQuality = imageQuality === "auto"
    ? s.dataSaverActive
      ? "low"
      : s.effectiveType === "4g"
        ? "high"
        : "balanced"
    : imageQuality;

  const toggleManual = (on: boolean) => {
    setForced(on);
    setManualDataSaver(on);
    toast({
      title: on ? "Data Saver on" : "Data Saver off",
      description: on
        ? "HD assets deferred, animations reduced, autoplay paused on slow links."
        : "Full-quality assets and prefetch restored.",
    });
  };

  return (
    <Card className="liquid-glass border-white/10 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <motion.div
            animate={{ scale: onlineNow ? [1, 1.15, 1] : 1 }}
            transition={{ repeat: onlineNow ? Infinity : 0, duration: 2 }}
            className={`p-1.5 rounded-lg ${onlineNow ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-500"}`}
          >
            {onlineNow ? <Signal className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </motion.div>
          Network-Adaptive Engine
          <Badge variant="secondary" className="ml-auto text-[10px] uppercase">
            {onlineNow ? s.effectiveType : "offline"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          {s.dataSaverActive
            ? "Data Saver active — HD assets deferred."
            : "Full-quality assets enabled."}
          {s.rtt ? ` · ${s.rtt}ms RTT` : ""}
          {s.downlink ? ` · ${s.downlink} Mbps` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live throughput sparkline */}
        <div className="rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3 w-3" /> Downlink · live
            </span>
            <span className={`font-semibold ${quality.tone}`}>{quality.label}</span>
          </div>
          <Progress value={quality.pct} className="h-1.5" />
          <div className="mt-2 flex items-end gap-[3px] h-8">
            {history.length === 0 ? (
              <div className="text-[10px] text-muted-foreground">Sampling…</div>
            ) : (
              history.map((v, i) => {
                const max = Math.max(1, ...history);
                const h = Math.max(2, (v / max) * 100);
                return (
                  <div
                    key={i}
                    className="w-1.5 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                    style={{ height: `${h}%` }}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Manual data saver override */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center gap-3">
            <Zap className={`h-4 w-4 ${forced || s.dataSaverActive ? "text-amber-500" : "text-muted-foreground"}`} />
            <div>
              <div className="text-sm font-medium">Force Data Saver</div>
              <div className="text-xs text-muted-foreground">
                Overrides carrier hints & throttles heavy assets.
              </div>
            </div>
          </div>
          <Switch checked={forced} onCheckedChange={toggleManual} />
        </div>

        {/* Image quality */}
        <div className="rounded-lg border border-white/10 bg-background/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4 text-primary" />
              Image quality
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {imageQuality === "auto" ? `Auto · ${effectiveImageQuality}` : effectiveImageQuality}
            </Badge>
          </div>
          <Select value={imageQuality} onValueChange={(v) => setImageQuality(v as any)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (recommended)</SelectItem>
              <SelectItem value="high">High — original resolution</SelectItem>
              <SelectItem value="balanced">Balanced — moderate compression</SelectItem>
              <SelectItem value="low">Low — data-saver only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video autoplay */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center gap-3">
            <Video className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Autoplay workout videos</div>
              <div className="text-xs text-muted-foreground">
                Auto-pauses on cellular when Data Saver is active.
              </div>
            </div>
          </div>
          <Switch checked={videoAutoplay} onCheckedChange={setVideoAutoplay} />
        </div>

        {/* Route prefetch */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center gap-3">
            <Rocket className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Prefetch upcoming routes</div>
              <div className="text-xs text-muted-foreground">
                Preloads chunks in idle time for instant navigation.
              </div>
            </div>
          </div>
          <Switch checked={prefetchRoutes} onCheckedChange={setPrefetchRoutes} />
        </div>

        {/* Heavy animations */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center gap-3">
            <Gauge className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">High-fidelity animations</div>
              <div className="text-xs text-muted-foreground">
                Backdrop blur, aurora ribbons and Liquid Glass motion.
              </div>
            </div>
          </div>
          <Switch checked={animationsHeavy} onCheckedChange={setAnimationsHeavy} />
        </div>

        {/* Background sync */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3">
          <div className="flex items-center gap-3">
            <Wifi className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Background sync</div>
              <div className="text-xs text-muted-foreground">
                Flush queued workouts & settings when a network returns.
              </div>
            </div>
          </div>
          <Switch checked={backgroundSync} onCheckedChange={setBackgroundSync} />
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              setHistory([]);
              lastPushRef.current = 0;
              toast({ title: "Network engine re-sampled", description: "Live metrics reset." });
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset live metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
