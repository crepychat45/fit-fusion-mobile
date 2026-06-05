import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Sparkles, Battery, Moon, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MuscleStatus {
  name: string;
  recovery: number; // 0-100
  tone: "emerald" | "orange" | "rose" | "primary";
}

const toneClass: Record<MuscleStatus["tone"], string> = {
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  primary: "bg-primary",
};

const MUSCLES: MuscleStatus[] = [
  { name: "Chest", recovery: 92, tone: "emerald" },
  { name: "Back", recovery: 78, tone: "emerald" },
  { name: "Legs", recovery: 41, tone: "orange" },
  { name: "Arms", recovery: 88, tone: "emerald" },
  { name: "Core", recovery: 64, tone: "primary" },
  { name: "Shoulders", recovery: 35, tone: "rose" },
];

export function RecoveryFocusWidget({ onStart }: { onStart?: () => void }) {
  const { focus, avgRecovery, readiness } = useMemo(() => {
    const ready = [...MUSCLES].sort((a, b) => b.recovery - a.recovery)[0];
    const avg = Math.round(MUSCLES.reduce((s, m) => s + m.recovery, 0) / MUSCLES.length);
    let label: "Peak" | "Ready" | "Moderate" | "Recover" = "Recover";
    if (avg >= 85) label = "Peak";
    else if (avg >= 70) label = "Ready";
    else if (avg >= 50) label = "Moderate";
    return { focus: ready, avgRecovery: avg, readiness: label };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden"
    >
      <div className="relative p-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Recovery & Focus</h3>
              <p className="text-[11px] text-muted-foreground">AI suggested target for today</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]">
            {readiness}
          </Badge>
        </div>

        {/* Readiness ring */}
        <div className="relative mt-4 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted/40" strokeWidth="3" />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(avgRecovery / 100) * 94.25} 94.25`}
                initial={{ strokeDasharray: "0 94.25" }}
                animate={{ strokeDasharray: `${(avgRecovery / 100) * 94.25} 94.25` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-foreground leading-none">{avgRecovery}%</span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">Recovery</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Today's focus
              </div>
              <div className="text-sm font-semibold text-foreground mt-0.5">
                {focus.name} · fully recovered
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/30 p-2 flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="text-[9px] uppercase text-muted-foreground leading-tight">Sleep</div>
                  <div className="text-xs font-semibold">7h 42m</div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 flex items-center gap-1.5">
                <Battery className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <div className="text-[9px] uppercase text-muted-foreground leading-tight">Energy</div>
                  <div className="text-xs font-semibold">High</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Muscle recovery bars */}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {MUSCLES.map((m) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-14 truncate">{m.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.recovery}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full ${toneClass[m.tone]}`}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">{m.recovery}%</span>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          onClick={onStart}
          className="mt-4 w-full rounded-xl h-9 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <Flame className="h-3.5 w-3.5 mr-1.5" />
          Start {focus.name} session
        </Button>
      </div>
    </motion.div>
  );
}
