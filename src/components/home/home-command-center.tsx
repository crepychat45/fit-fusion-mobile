import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets, Footprints, Flame, Moon, Play, Pause, RotateCcw, Smile, Meh, Frown,
  BatteryCharging, CalendarCheck, Minus, Plus, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const LS_KEY = "fitfusion-command-center";

type Mood = "great" | "ok" | "low";

interface CommandState {
  date: string;
  water: number;      // glasses
  steps: number;
  calories: number;
  sleep: number;      // hours x10
  mood: Mood | null;
  energy: number;     // 1-5
  focusSeconds: number;
  plannedDays: number[];
}

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULTS: CommandState = {
  date: today(),
  water: 0,
  steps: 0,
  calories: 0,
  sleep: 70,
  mood: null,
  energy: 3,
  focusSeconds: 0,
  plannedDays: [1, 3, 5],
};

const GOALS = { water: 8, steps: 10000, calories: 600, sleep: 80 };

function load(): CommandState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<CommandState>) };
    // Daily counters reset at midnight, preferences persist.
    if (parsed.date !== today()) {
      return { ...parsed, date: today(), water: 0, steps: 0, calories: 0, mood: null, focusSeconds: 0 };
    }
    return parsed;
  } catch {
    return DEFAULTS;
  }
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function HomeCommandCenter() {
  const { toast } = useToast();
  const [state, setState] = useState<CommandState>(() => load());
  const [focusRunning, setFocusRunning] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const onHydrated = () => setState(load());
    window.addEventListener("fitfusion-settings-hydrated", onHydrated);
    return () => window.removeEventListener("fitfusion-settings-hydrated", onHydrated);
  }, []);

  // Focus timer
  useEffect(() => {
    if (!focusRunning) return;
    const id = window.setInterval(() => {
      setState((prev) => ({ ...prev, focusSeconds: prev.focusSeconds + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusRunning]);

  const bump = useCallback((key: "water" | "steps" | "calories", delta: number) => {
    setState((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  }, []);

  const bodyBattery = useMemo(() => {
    const sleepScore = Math.min(state.sleep / 80, 1) * 40;
    const hydration = Math.min(state.water / GOALS.water, 1) * 20;
    const moodScore = state.mood === "great" ? 20 : state.mood === "ok" ? 12 : state.mood === "low" ? 5 : 10;
    const energyScore = (state.energy / 5) * 20;
    return Math.round(sleepScore + hydration + moodScore + energyScore);
  }, [state.sleep, state.water, state.mood, state.energy]);

  const focusLabel = `${String(Math.floor(state.focusSeconds / 60)).padStart(2, "0")}:${String(state.focusSeconds % 60).padStart(2, "0")}`;

  const setMood = (mood: Mood) => {
    setState((prev) => ({ ...prev, mood }));
    toast({
      title: "Check-in saved",
      description: mood === "great" ? "Great day — push a little harder today." : mood === "ok" ? "Steady wins. Keep the streak alive." : "Take it easy — try a mobility session.",
    });
  };

  const toggleDay = (day: number) => {
    setState((prev) => ({
      ...prev,
      plannedDays: prev.plannedDays.includes(day)
        ? prev.plannedDays.filter((d) => d !== day)
        : [...prev.plannedDays, day].sort(),
    }));
  };

  const rings: { key: keyof typeof GOALS; label: string; icon: React.ElementType; value: number; unit: string }[] = [
    { key: "water", label: "Water", icon: Droplets, value: state.water, unit: "glasses" },
    { key: "steps", label: "Steps", icon: Footprints, value: state.steps, unit: "steps" },
    { key: "calories", label: "Burn", icon: Flame, value: state.calories, unit: "kcal" },
    { key: "sleep", label: "Sleep", icon: Moon, value: state.sleep / 10, unit: "h" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Daily command center"
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/15">
            <CalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Daily Command Center</h2>
            <p className="text-[10px] text-muted-foreground">Log, check in and focus — all in one place</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          <BatteryCharging className="h-3 w-3 mr-1" />{bodyBattery}% battery
        </Badge>
      </div>

      {/* Quick log tiles */}
      <div className="grid grid-cols-2 gap-2">
        {rings.map((r) => {
          const goal = r.key === "sleep" ? GOALS.sleep / 10 : GOALS[r.key];
          const pct = Math.min((r.value / goal) * 100, 100);
          const step = r.key === "steps" ? 500 : r.key === "calories" ? 50 : 1;
          return (
            <div key={r.key} className="rounded-xl border border-border/20 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <r.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold">{r.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {r.key === "sleep" ? r.value.toFixed(1) : Math.round(r.value)} {r.unit}
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
              {r.key !== "sleep" ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <Button
                    size="icon" variant="outline" className="h-7 w-7"
                    aria-label={`Decrease ${r.label}`}
                    onClick={() => bump(r.key as "water" | "steps" | "calories", -step)}
                  ><Minus className="h-3 w-3" /></Button>
                  <Button
                    size="icon" variant="outline" className="h-7 w-7"
                    aria-label={`Increase ${r.label}`}
                    onClick={() => bump(r.key as "water" | "steps" | "calories", step)}
                  ><Plus className="h-3 w-3" /></Button>
                  <span className="ml-auto text-[9px] text-muted-foreground">goal {goal}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <Button
                    size="icon" variant="outline" className="h-7 w-7" aria-label="Decrease sleep"
                    onClick={() => setState((p) => ({ ...p, sleep: Math.max(0, p.sleep - 5) }))}
                  ><Minus className="h-3 w-3" /></Button>
                  <Button
                    size="icon" variant="outline" className="h-7 w-7" aria-label="Increase sleep"
                    onClick={() => setState((p) => ({ ...p, sleep: Math.min(140, p.sleep + 5) }))}
                  ><Plus className="h-3 w-3" /></Button>
                  <span className="ml-auto text-[9px] text-muted-foreground">goal 8h</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mood + energy check-in */}
      <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
        <div className="text-[11px] font-semibold mb-2">How do you feel today?</div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "great" as Mood, icon: Smile, label: "Great" },
            { key: "ok" as Mood, icon: Meh, label: "Okay" },
            { key: "low" as Mood, icon: Frown, label: "Low" },
          ]).map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={state.mood === m.key ? "default" : "outline"}
              className="h-9 text-[11px]"
              onClick={() => setMood(m.key)}
            >
              <m.icon className="h-3.5 w-3.5 mr-1" />{m.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground">Energy</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              aria-label={`Energy level ${n}`}
              onClick={() => setState((p) => ({ ...p, energy: n }))}
              className={`h-2.5 flex-1 rounded-full transition-colors ${n <= state.energy ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Focus timer */}
      <div className="rounded-xl border border-border/20 bg-muted/20 p-3 flex items-center gap-3">
        <Timer className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold">Focus session</div>
          <div className="text-xl font-mono font-bold tabular-nums">{focusLabel}</div>
        </div>
        <div className="ml-auto flex gap-1.5">
          <Button
            size="icon" variant="outline" className="h-8 w-8"
            aria-label={focusRunning ? "Pause focus timer" : "Start focus timer"}
            onClick={() => setFocusRunning((v) => !v)}
          >
            {focusRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon" variant="outline" className="h-8 w-8" aria-label="Reset focus timer"
            onClick={() => { setFocusRunning(false); setState((p) => ({ ...p, focusSeconds: 0 })); }}
          ><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {/* Weekly planner */}
      <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
        <div className="text-[11px] font-semibold mb-2">Training days this week</div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_LABELS.map((d, i) => {
            const active = state.plannedDays.includes(i);
            return (
              <button
                key={`${d}-${i}`}
                aria-label={`Toggle training on day ${i + 1}`}
                aria-pressed={active}
                onClick={() => toggleDay(i)}
                className={`h-9 rounded-lg text-[11px] font-semibold border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/40 text-muted-foreground border-border/30"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">
          {state.plannedDays.length} sessions planned · {Math.max(0, 5 - state.plannedDays.length)} to hit the weekly target
        </div>
      </div>
    </motion.section>
  );
}

export default HomeCommandCenter;
