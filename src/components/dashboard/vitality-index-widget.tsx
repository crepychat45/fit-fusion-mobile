import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Moon, Flame, Sparkles } from "lucide-react";

interface Vital {
  key: string;
  label: string;
  value: number; // 0..100
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const STORAGE_KEY = "fitfusion-vitality-index-v1";

function loadVitals(): Vital[] {
  const base: Vital[] = [
    { key: "recovery", label: "Recovery", value: 82, icon: Moon, color: "hsl(var(--primary))" },
    { key: "energy", label: "Energy", value: 74, icon: Flame, color: "hsl(var(--accent))" },
    { key: "cardio", label: "Cardio", value: 68, icon: Heart, color: "hsl(var(--primary))" },
    { key: "mobility", label: "Mobility", value: 71, icon: Activity, color: "hsl(var(--accent))" },
  ];
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Vital[];
    return base.map((b) => ({ ...b, value: parsed.find((p) => p.key === b.key)?.value ?? b.value }));
  } catch {
    return base;
  }
}

export function VitalityIndexWidget() {
  const [vitals, setVitals] = useState<Vital[]>(() => loadVitals());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vitals));
    } catch {}
  }, [vitals]);

  const score = useMemo(
    () => Math.round(vitals.reduce((a, v) => a + v.value, 0) / vitals.length),
    [vitals]
  );

  const status = score >= 85 ? "Peak" : score >= 70 ? "Strong" : score >= 55 ? "Steady" : "Recover";
  const statusColor =
    score >= 85 ? "bg-primary/20 text-primary border-primary/30"
      : score >= 70 ? "bg-accent/20 text-accent-foreground border-accent/30"
      : "bg-muted/50 text-muted-foreground border-border/30";

  const dash = (score / 100) * 220;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-accent/5 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Vitality Index</h3>
              <p className="text-[10px] text-muted-foreground">Live readiness signal</p>
            </div>
          </div>
          <Badge className={`text-[10px] ${statusColor}`}>{status}</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from 0deg, hsl(var(--primary)/0.35), hsl(var(--accent)/0.35), hsl(var(--primary)/0.35))" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-1 rounded-full bg-card/80 backdrop-blur-xl" />
            <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="35" fill="none" className="stroke-muted/30" strokeWidth="6" />
              <motion.circle
                cx="48" cy="48" r="35" fill="none"
                className="stroke-primary"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${dash} 220`}
                initial={{ strokeDasharray: "0 220" }}
                animate={{ strokeDasharray: `${dash} 220` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground leading-none">{score}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            {vitals.map((v) => (
              <div key={v.key} className="p-2 rounded-lg bg-card/50 border border-border/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <v.icon className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{v.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${v.value}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-6 text-right">{v.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/20 rounded-lg px-2.5 py-1.5">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span>
            {score >= 85
              ? "You're peaking. Push a high-intensity session today."
              : score >= 70
                ? "Solid readiness. A steady effort works best."
                : score >= 55
                  ? "Moderate zone. Focus on technique, not intensity."
                  : "Prioritize sleep, hydration, and mobility today."}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
