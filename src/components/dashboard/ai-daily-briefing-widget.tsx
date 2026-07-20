import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Cloud, Wind, Coffee, Dumbbell, Battery, TrendingUp, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Energy = 1 | 2 | 3 | 4 | 5;

const STORAGE_ENERGY = "fitfusion-daily-energy";
const STORAGE_FOCUS = "fitfusion-focus-sessions";

function getPartOfDay() {
  const h = new Date().getHours();
  if (h < 5) return { label: "Late Night", icon: Moon, tone: "from-indigo-500/20 to-purple-500/20" };
  if (h < 12) return { label: "Morning", icon: Sun, tone: "from-amber-400/20 to-orange-400/20" };
  if (h < 17) return { label: "Afternoon", icon: Cloud, tone: "from-sky-400/20 to-cyan-400/20" };
  if (h < 21) return { label: "Evening", icon: Wind, tone: "from-rose-400/20 to-fuchsia-500/20" };
  return { label: "Night", icon: Moon, tone: "from-indigo-500/20 to-slate-600/20" };
}

function briefingFor(part: string, energy: Energy) {
  const map: Record<string, string[]> = {
    Morning: [
      "Kick off with a light mobility flow and hydrate — 500ml water within 30 min.",
      "Perfect window for cardio. Aim for a 20-min zone-2 session before breakfast.",
      "High-energy morning detected. Push a strength block — target 3 compound lifts.",
    ],
    Afternoon: [
      "Break up sitting: 8-min mobility reset every 90 minutes.",
      "Solid midday energy — ideal for a 30-min HIIT or strength split.",
      "Peak performance window. Log a PR attempt or intense circuit.",
    ],
    Evening: [
      "Wind-down mobility + 10-min stretch to prime recovery.",
      "Balanced strength or moderate cardio works well now.",
      "Save intensity for tomorrow — try yoga or a mindful walk.",
    ],
    Night: [
      "Prioritize sleep. A 4-min breathing session lowers HR variability.",
      "Light stretch + magnesium. Avoid caffeine past this hour.",
      "Prep gear for tomorrow's session, then wind down.",
    ],
    "Late Night": [
      "Rest is training. Aim for 7-9 hours of sleep tonight.",
      "Screen dim + slow breathing will drop cortisol fast.",
      "Skip the workout — a 3-min body scan is enough.",
    ],
  };
  const bucket = map[part] || map.Afternoon;
  const idx = energy <= 2 ? 0 : energy === 3 ? 1 : 2;
  return bucket[idx];
}

export const AiDailyBriefingWidget: React.FC = () => {
  const part = useMemo(getPartOfDay, []);
  const [energy, setEnergy] = useState<Energy>(3);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusRemaining, setFocusRemaining] = useState(25 * 60);
  const [sessionsToday, setSessionsToday] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ENERGY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const today = new Date().toDateString();
        if (parsed.date === today) setEnergy(parsed.value as Energy);
      }
      const focusRaw = localStorage.getItem(STORAGE_FOCUS);
      if (focusRaw) {
        const parsed = JSON.parse(focusRaw);
        if (parsed.date === new Date().toDateString()) setSessionsToday(parsed.count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!focusRunning) return;
    const id = setInterval(() => {
      setFocusRemaining((r) => {
        if (r <= 1) {
          setFocusRunning(false);
          const nextCount = sessionsToday + 1;
          setSessionsToday(nextCount);
          localStorage.setItem(STORAGE_FOCUS, JSON.stringify({ date: new Date().toDateString(), count: nextCount }));
          toast.success("Focus session complete", { description: "Great work — take a 5-minute reset." });
          return 25 * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [focusRunning, sessionsToday]);

  const setEnergyValue = (v: Energy) => {
    setEnergy(v);
    localStorage.setItem(STORAGE_ENERGY, JSON.stringify({ date: new Date().toDateString(), value: v }));
  };

  const briefing = briefingFor(part.label, energy);
  const PartIcon = part.icon;
  const mm = String(Math.floor(focusRemaining / 60)).padStart(2, "0");
  const ss = String(focusRemaining % 60).padStart(2, "0");
  const focusPct = ((25 * 60 - focusRemaining) / (25 * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border/20 bg-gradient-to-br ${part.tone} backdrop-blur-xl shadow-lg overflow-hidden`}
    >
      <div className="bg-card/60 backdrop-blur-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/15 rounded-xl">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              AI Daily Briefing
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">BETA</Badge>
            </h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <PartIcon className="h-3 w-3" /> {part.label} • {new Date().toLocaleDateString(undefined, { weekday: "long" })}
            </p>
          </div>
        </div>

        {/* Briefing text */}
        <div className="rounded-xl bg-background/40 border border-border/20 p-3">
          <p className="text-xs leading-relaxed text-foreground">{briefing}</p>
        </div>

        {/* Energy selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Battery className="h-3.5 w-3.5 text-accent-foreground" /> Energy Level
            </div>
            <span className="text-[10px] text-muted-foreground">{energy}/5</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as Energy[]).map((v) => (
              <button
                key={v}
                onClick={() => setEnergyValue(v)}
                className={`h-8 rounded-lg text-[11px] font-semibold transition-all border ${
                  energy === v
                    ? "bg-primary text-primary-foreground border-primary shadow"
                    : "bg-background/40 border-border/20 text-muted-foreground hover:bg-background/60"
                }`}
                aria-label={`Energy ${v}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Focus timer */}
        <div className="rounded-xl bg-background/40 border border-border/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Coffee className="h-3.5 w-3.5 text-primary" /> Focus Timer
            </div>
            <Badge variant="outline" className="text-[9px]">
              <TrendingUp className="h-2.5 w-2.5 mr-1" /> {sessionsToday} today
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold tabular-nums text-foreground">{mm}:{ss}</div>
            <div className="flex-1">
              <Progress value={focusPct} className="h-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setFocusRunning((v) => !v)}
              className="flex-1 h-8 rounded-lg text-xs"
            >
              {focusRunning ? <><Pause className="h-3 w-3 mr-1" /> Pause</> : <><Play className="h-3 w-3 mr-1" /> Start 25min</>}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setFocusRunning(false); setFocusRemaining(25 * 60); }}
              className="h-8 rounded-lg text-xs"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick action */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Suggested workout applied", { description: briefing })}
          className="w-full h-8 rounded-lg text-xs"
        >
          <Dumbbell className="h-3 w-3 mr-1" /> Apply Suggestion
        </Button>
      </div>
    </motion.div>
  );
};

export default AiDailyBriefingWidget;
