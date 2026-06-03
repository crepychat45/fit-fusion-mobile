import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Droplets, Footprints, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const STORAGE_KEY = "fitfusion.todays-goals";

const defaultGoals: Goal[] = [
  { id: "water", label: "Water", icon: Droplets, current: 4, target: 8, unit: "glasses", color: "from-sky-400 to-blue-500" },
  { id: "steps", label: "Steps", icon: Footprints, current: 6200, target: 10000, unit: "steps", color: "from-emerald-400 to-teal-500" },
  { id: "calories", label: "Calories", icon: Flame, current: 380, target: 600, unit: "kcal", color: "from-orange-400 to-rose-500" },
];

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGoals;
    const parsed = JSON.parse(raw) as Array<Pick<Goal, "id" | "current">>;
    return defaultGoals.map((g) => {
      const saved = parsed.find((p) => p.id === g.id);
      return saved ? { ...g, current: saved.current } : g;
    });
  } catch {
    return defaultGoals;
  }
}

function persist(goals: Goal[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(goals.map((g) => ({ id: g.id, current: g.current })))
    );
  } catch {
    /* ignore */
  }
}

export const TodaysGoalsWidget: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());

  useEffect(() => {
    persist(goals);
  }, [goals]);

  const increment = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const step = g.id === "steps" ? 500 : g.id === "calories" ? 50 : 1;
        return { ...g, current: Math.min(g.target, g.current + step) };
      })
    );
  };

  const completed = goals.filter((g) => g.current >= g.target).length;

  return (
    <div
      className="relative rounded-2xl border border-white/15 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, hsl(var(--card) / 0.6), hsl(var(--card) / 0.3))",
      }}
    >
      {/* subtle inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-primary/15 ring-1 ring-primary/20">
            <Target className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <h3 className="text-sm font-bold text-foreground">Today's Goals</h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            {completed}/{goals.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const done = g.current >= g.target;
            const Icon = g.icon;
            return (
              <motion.button
                key={g.id}
                type="button"
                onClick={() => increment(g.id)}
                disabled={done}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full text-left rounded-xl border border-border/30 bg-background/40 backdrop-blur-md p-3",
                  "hover:bg-background/60 hover:border-border/50 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  done && "opacity-90"
                )}
                aria-label={`Add progress to ${g.label}. ${g.current} of ${g.target} ${g.unit}.`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg bg-gradient-to-br text-white shadow-sm shrink-0",
                      g.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {g.label}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {g.current.toLocaleString()}/{g.target.toLocaleString()} {g.unit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", g.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground text-center">
          Tap a goal to log progress
        </p>
      </div>
    </div>
  );
};

export default TodaysGoalsWidget;
