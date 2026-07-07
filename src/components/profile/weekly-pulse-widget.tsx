import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function seededSeries(seed = 7) {
  const arr: number[] = [];
  let x = seed;
  for (let i = 0; i < 7; i++) {
    x = (x * 9301 + 49297) % 233280;
    arr.push(40 + Math.round((x / 233280) * 60));
  }
  return arr;
}

export function WeeklyPulseWidget() {
  const values = useMemo(() => {
    try {
      const raw = localStorage.getItem("fitfusion-weekly-pulse-v1");
      if (raw) return JSON.parse(raw) as number[];
    } catch {}
    const s = seededSeries();
    try { localStorage.setItem("fitfusion-weekly-pulse-v1", JSON.stringify(s)); } catch {}
    return s;
  }, []);

  const max = Math.max(...values, 100);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const first = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const last = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const delta = Math.round(((last - first) / Math.max(first, 1)) * 100);
  const positive = delta >= 0;

  // build sparkline polyline points
  const w = 240;
  const h = 60;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Weekly Pulse
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] ${positive ? "bg-primary/10 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}
          >
            {positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {positive ? "+" : ""}{delta}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-foreground">{avg}</span>
          <span className="text-[10px] text-muted-foreground">avg effort / day</span>
        </div>

        <div className="relative w-full">
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-14">
            <defs>
              <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.polygon
              points={`0,${h} ${points} ${w},${h}`}
              fill="url(#pulse-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
            <motion.polyline
              points={points}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </svg>
        </div>

        <div className="grid grid-cols-7 mt-1 text-center">
          {DAYS.map((d, i) => (
            <div key={i} className="text-[10px] text-muted-foreground">{d}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
