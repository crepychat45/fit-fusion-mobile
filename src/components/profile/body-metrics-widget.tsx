import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Ruler, Percent, TrendingDown, TrendingUp, Target, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Metric {
  key: string;
  label: string;
  value: string;
  unit: string;
  delta: number; // negative is improvement for weight/body fat
  goal: string;
  progress: number; // 0-100 toward goal
  icon: React.ComponentType<{ className?: string }>;
  invertDelta?: boolean; // true => negative delta shown as good (green)
}

const METRICS: Metric[] = [
  { key: "weight", label: "Weight", value: "74.2", unit: "kg", delta: -1.3, goal: "72 kg", progress: 78, icon: Scale, invertDelta: true },
  { key: "bodyFat", label: "Body Fat", value: "18.4", unit: "%", delta: -0.9, goal: "15%", progress: 64, icon: Percent, invertDelta: true },
  { key: "muscle", label: "Lean Mass", value: "58.1", unit: "kg", delta: 0.6, goal: "60 kg", progress: 71, icon: TrendingUp },
  { key: "waist", label: "Waist", value: "82", unit: "cm", delta: -1.2, goal: "78 cm", progress: 55, icon: Ruler, invertDelta: true },
];

export function BodyMetricsWidget() {
  const [active, setActive] = useState<Metric>(METRICS[0]);

  const overall = useMemo(() => {
    return Math.round(METRICS.reduce((s, m) => s + m.progress, 0) / METRICS.length);
  }, []);

  const isPositive = (m: Metric) => (m.invertDelta ? m.delta < 0 : m.delta > 0);

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Body Metrics & Goals</h3>
              <p className="text-[11px] text-muted-foreground">Tracked weekly · last sync today</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]">
            {overall}% to goal
          </Badge>
        </div>

        {/* Featured metric */}
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-xl border border-white/10 bg-gradient-to-br from-primary/15 to-accent/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground/80">{active.label}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isPositive(active)
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-orange-500/10 text-orange-500 border-orange-500/30"
              }`}
            >
              {isPositive(active) ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
              {active.delta > 0 ? "+" : ""}
              {active.delta} {active.unit}
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-foreground">{active.value}</span>
            <span className="text-sm text-muted-foreground">{active.unit}</span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              Goal <span className="font-semibold text-foreground">{active.goal}</span>
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-background/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${active.progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <div className="mt-1 text-right text-[10px] text-muted-foreground font-mono">
            {active.progress}% progress
          </div>
        </motion.div>

        {/* Selector chips */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActive(m)}
              className={`text-left p-2.5 rounded-xl border transition-all ${
                active.key === m.key
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/20 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <m.icon className="h-3 w-3" />
                  <span>{m.label}</span>
                </div>
                <span className={`text-[9px] font-mono ${isPositive(m) ? "text-emerald-500" : "text-orange-500"}`}>
                  {m.delta > 0 ? "+" : ""}
                  {m.delta}
                </span>
              </div>
              <div className="mt-0.5 text-sm font-bold text-foreground">
                {m.value}
                <span className="text-[10px] text-muted-foreground ml-0.5">{m.unit}</span>
              </div>
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl h-9 text-xs">
          <Edit3 className="h-3.5 w-3.5 mr-1.5" />
          Log new measurement
        </Button>
      </CardContent>
    </Card>
  );
}
