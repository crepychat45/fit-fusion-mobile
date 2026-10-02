import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart, Activity, Droplets, Flame, Battery, Wifi, WifiOff } from "lucide-react";
import { useLiveHealth } from "@/hooks/use-live-health";

type Metric = { label: string; value: string; unit: string; icon: React.ElementType; color: string; percentage: number };

/** HUD showing only real values; missing readings render as "--". */
export function BiometricHUD() {
  const h = useLiveHealth();
  const hr = h.reading.hr;
  const metrics: Metric[] = [
    { label: "Heart Rate", value: hr != null ? String(hr) : "--", unit: "bpm", icon: Heart, color: "text-destructive", percentage: hr ? Math.round((hr / 200) * 100) : 0 },
    { label: "SpO2", value: h.reading.spo2 != null ? String(h.reading.spo2) : "--", unit: "%", icon: Activity, color: "text-primary", percentage: h.reading.spo2 ?? 0 },
    { label: "Water", value: (h.waterMl / 1000).toFixed(1), unit: "L", icon: Droplets, color: "text-primary", percentage: Math.min(100, Math.round((h.waterMl / h.waterGoalMl) * 100)) },
    { label: "Burned", value: String(h.todayCalories), unit: "kcal", icon: Flame, color: "text-accent", percentage: Math.min(100, Math.round(h.todayCalories / 5)) },
    { label: "Battery", value: h.watchBattery != null ? String(h.watchBattery) : "--", unit: "%", icon: Battery, color: "text-primary", percentage: h.watchBattery ?? 0 },
  ];

  return (
    <Card className="overflow-hidden border-border/50 liquid-glass-strong relative">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${h.watchConnected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-xs font-mono uppercase tracking-wider">Biometric HUD</span>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {h.watchConnected ? <><Wifi className="h-3 w-3 mr-1" />WATCH</> : <><WifiOff className="h-3 w-3 mr-1" />NO WATCH</>}
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3 max-[400px]:grid-cols-2">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="text-center p-2 rounded-lg liquid-glass-subtle">
              <div className="relative w-10 h-10 mx-auto mb-1">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="2" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className={m.color} pathLength={100} strokeDasharray={`${m.percentage} ${100 - m.percentage}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><m.icon className={`h-3 w-3 ${m.color}`} /></div>
              </div>
              <p className="text-sm font-bold font-mono">{m.value}<span className="text-[10px] text-muted-foreground ml-0.5">{m.unit}</span></p>
              <p className="text-[9px] text-muted-foreground font-mono uppercase">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
