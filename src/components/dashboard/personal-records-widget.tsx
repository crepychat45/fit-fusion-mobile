import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Dumbbell, Timer, Flame, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PR {
  id: string;
  exercise: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  date: string;
  tone: "primary" | "accent" | "emerald" | "orange";
}

const tones: Record<PR["tone"], string> = {
  primary: "from-primary/30 to-primary/10 text-primary",
  accent: "from-accent/30 to-accent/10 text-accent-foreground",
  emerald: "from-emerald-500/30 to-emerald-500/5 text-emerald-500",
  orange: "from-orange-500/30 to-orange-500/5 text-orange-500",
};

const RECORDS: PR[] = [
  { id: "1", exercise: "Bench Press", value: "92.5 kg", delta: "+2.5 kg", icon: Dumbbell, date: "2 days ago", tone: "primary" },
  { id: "2", exercise: "5K Run", value: "23:14", delta: "−0:42", icon: Timer, date: "Last week", tone: "emerald" },
  { id: "3", exercise: "Calories / Session", value: "612", delta: "+58", icon: Flame, date: "Yesterday", tone: "orange" },
  { id: "4", exercise: "Deadlift", value: "140 kg", delta: "+5 kg", icon: TrendingUp, date: "3 days ago", tone: "accent" },
];

export function PersonalRecordsWidget() {
  const [active, setActive] = useState(0);
  const total = RECORDS.length;
  const current = RECORDS[active];

  const summary = useMemo(
    () => ({
      newThisMonth: 4,
      totalPRs: 28,
      streak: 6,
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden"
    >
      <div className="p-4 pb-3 flex items-center gap-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
          <Trophy className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">Personal Records</h3>
          <p className="text-[11px] text-muted-foreground">
            {summary.newThisMonth} new this month · {summary.totalPRs} all-time
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]">
          🔥 {summary.streak}-week PR streak
        </Badge>
      </div>

      {/* Featured PR */}
      <div className="px-4">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${tones[current.tone]} p-4`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <current.icon className="h-4 w-4" />
                <span className="text-xs font-medium text-foreground/80 truncate">
                  {current.exercise}
                </span>
              </div>
              <div className="mt-1 text-2xl font-extrabold text-foreground tracking-tight">
                {current.value}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {current.date}
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-background/70 text-foreground border-border/40 text-[10px]">
                {current.delta}
              </Badge>
              <div className="mt-1 text-[10px] text-muted-foreground">
                vs previous
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {RECORDS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActive(i)}
              aria-label={`Show ${r.exercise} PR`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Compact list */}
      <div className="px-4 pt-3 pb-4 grid grid-cols-2 gap-2">
        {RECORDS.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setActive(i)}
            className={`text-left p-2.5 rounded-xl border transition-all ${
              i === active
                ? "border-primary/40 bg-primary/5"
                : "border-border/20 bg-muted/20 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <r.icon className="h-3 w-3" />
              <span className="truncate">{r.exercise}</span>
            </div>
            <div className="text-sm font-bold text-foreground">{r.value}</div>
            <div className="text-[10px] text-emerald-500">{r.delta}</div>
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" asChild>
          <a href="/progress">
            View full PR board
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
