import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  BrainCircuit, CalendarCheck, Copy, Dumbbell, Gauge, HeartPulse, Ruler, Timer,
  TrendingUp, Trophy, Zap,
} from "lucide-react";

const KEY = "fitfusion-progress-insight";

interface PR { id: string; lift: string; kg: number; reps: number; date: string }
interface Measure { chest: number; waist: number; hips: number; arms: number; thighs: number }

interface InsightState {
  prs: PR[];
  measures: Measure;
  restingHr: number;
  bodyFat: number;
  rpeLog: number[];
  deloadAlerts: boolean;
  weeklyVolumeGoal: number;
  heatmap: string[]; // ISO dates of trained days
}

const DEFAULTS: InsightState = {
  prs: [],
  measures: { chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0 },
  restingHr: 60,
  bodyFat: 18,
  rpeLog: [],
  deloadAlerts: true,
  weeklyVolumeGoal: 12000,
  heatmap: [],
};

function read(): InsightState {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    if (!Array.isArray(parsed.prs)) parsed.prs = [];
    if (!Array.isArray(parsed.rpeLog)) parsed.rpeLog = [];
    if (!Array.isArray(parsed.heatmap)) parsed.heatmap = [];
    parsed.measures = { ...DEFAULTS.measures, ...(parsed.measures || {}) };
    return parsed;
  } catch {
    return DEFAULTS;
  }
}

const epley = (kg: number, reps: number) => Math.round(kg * (1 + reps / 30));

/**
 * Advanced progress analytics — 1RM estimates, PR board, body measurements,
 * recovery readiness scoring, training heatmap and shareable summaries.
 */
export const ProgressInsightLab: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState<InsightState>(read);
  const [lift, setLift] = useState("Bench Press");
  const [kg, setKg] = useState("");
  const [reps, setReps] = useState("5");

  const save = useCallback((patch: Partial<InsightState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener("fitfusion-settings-hydrated", sync);
    return () => window.removeEventListener("fitfusion-settings-hydrated", sync);
  }, []);

  const addPR = () => {
    const weight = Number(kg);
    const r = Number(reps);
    if (!lift.trim() || !weight || !r) {
      toast({ title: "Enter lift, weight and reps", variant: "destructive" });
      return;
    }
    const pr: PR = {
      id: `${Date.now()}`,
      lift: lift.trim(),
      kg: weight,
      reps: r,
      date: new Date().toISOString(),
    };
    save({ prs: [pr, ...state.prs].slice(0, 40) });
    setKg("");
    toast({ title: "PR saved", description: `${pr.lift} · est. 1RM ${epley(weight, r)} kg` });
  };

  const markTrainedToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.heatmap.includes(today)) {
      save({ heatmap: state.heatmap.filter((d) => d !== today) });
      toast({ title: "Today unmarked" });
    } else {
      save({ heatmap: [...state.heatmap, today].slice(-400) });
      toast({ title: "Training day logged 🔥" });
    }
  };

  const logRpe = (v: number) => {
    save({ rpeLog: [...state.rpeLog, v].slice(-14) });
    toast({ title: `RPE ${v} logged` });
  };

  const readiness = useMemo(() => {
    const avgRpe = state.rpeLog.length
      ? state.rpeLog.reduce((a, b) => a + b, 0) / state.rpeLog.length
      : 5;
    const hrPenalty = Math.max(0, state.restingHr - 55) * 1.2;
    const score = Math.max(5, Math.min(100, Math.round(100 - (avgRpe - 5) * 9 - hrPenalty)));
    return score;
  }, [state.rpeLog, state.restingHr]);

  const streak = useMemo(() => {
    const set = new Set(state.heatmap);
    let count = 0;
    const cursor = new Date();
    for (let i = 0; i < 400; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      if (set.has(iso)) count++;
      else if (i > 0) break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [state.heatmap]);

  const last30 = useMemo(() => {
    const days: { iso: string; on: boolean }[] = [];
    const cursor = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ iso, on: state.heatmap.includes(iso) });
    }
    return days;
  }, [state.heatmap]);

  const bestLifts = useMemo(() => {
    const map = new Map<string, PR>();
    state.prs.forEach((p) => {
      const cur = map.get(p.lift);
      if (!cur || epley(p.kg, p.reps) > epley(cur.kg, cur.reps)) map.set(p.lift, p);
    });
    return [...map.values()].sort((a, b) => epley(b.kg, b.reps) - epley(a.kg, a.reps));
  }, [state.prs]);

  const copySummary = async () => {
    const text = [
      `FitxFusion progress summary`,
      `Readiness: ${readiness}/100 · Streak: ${streak} days`,
      `Resting HR: ${state.restingHr} bpm · Body fat: ${state.bodyFat}%`,
      ...bestLifts.slice(0, 5).map((p) => `${p.lift}: ${p.kg}kg x${p.reps} (1RM ~${epley(p.kg, p.reps)}kg)`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Summary copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Readiness */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Recovery Readiness
            <Badge variant="outline" className="ml-auto text-[10px]">{readiness}/100</Badge>
          </CardTitle>
          <CardDescription>Calculated from your recent RPE logs and resting heart rate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={readiness} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {readiness > 75
              ? "Green light — push intensity today."
              : readiness > 45
                ? "Moderate — keep volume steady."
                : "Fatigued — prioritise mobility and sleep."}
          </p>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm"><HeartPulse className="h-4 w-4" /> Resting heart rate</Label>
              <span className="text-xs font-medium">{state.restingHr} bpm</span>
            </div>
            <Slider value={[state.restingHr]} min={38} max={100} step={1} onValueChange={([v]) => save({ restingHr: v })} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4" /> Body fat estimate</Label>
              <span className="text-xs font-medium">{state.bodyFat}%</span>
            </div>
            <Slider value={[state.bodyFat]} min={4} max={45} step={0.5} onValueChange={([v]) => save({ bodyFat: v })} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Timer className="h-4 w-4" /> Log session RPE</Label>
            <div className="flex flex-wrap gap-1.5">
              {[4, 5, 6, 7, 8, 9, 10].map((v) => (
                <Button key={v} size="sm" variant="outline" className="h-8 w-9 p-0" onClick={() => logRpe(v)}>
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
              <div>
                <Label className="text-sm">Deload alerts</Label>
                <p className="text-xs text-muted-foreground">Warn me when readiness drops under 45.</p>
              </div>
              <Switch checked={state.deloadAlerts} onCheckedChange={(v) => save({ deloadAlerts: v })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PR board */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" />
            Personal Record Board
            <Badge variant="outline" className="ml-auto text-[10px]">{bestLifts.length} lifts</Badge>
          </CardTitle>
          <CardDescription>Track lifts and get automatic Epley 1RM estimates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Input className="sm:col-span-2" value={lift} onChange={(e) => setLift(e.target.value)} placeholder="Exercise" />
            <Input type="number" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="kg" />
            <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="reps" />
          </div>
          <Button size="sm" className="gap-2" onClick={addPR}>
            <Dumbbell className="h-4 w-4" /> Save record
          </Button>

          <div className="space-y-2">
            {bestLifts.length === 0 && <p className="text-xs text-muted-foreground">No records yet — log your first lift.</p>}
            {bestLifts.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/40 p-3">
                <div>
                  <p className="text-sm font-medium">{p.lift}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.kg} kg × {p.reps} · {new Date(p.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="gap-1"><TrendingUp className="h-3 w-3" /> {epley(p.kg, p.reps)} kg</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4 text-primary" />
            Body Measurements
          </CardTitle>
          <CardDescription>Centimetre tracking for chest, waist, hips, arms and thighs.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.keys(state.measures) as (keyof Measure)[]).map((k) => (
            <div key={k}>
              <Label className="text-xs capitalize text-muted-foreground">{k} (cm)</Label>
              <Input
                type="number"
                value={state.measures[k] || ""}
                onChange={(e) => save({ measures: { ...state.measures, [k]: Number(e.target.value) || 0 } })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-primary" />
            30-Day Training Heatmap
            <Badge variant="outline" className="ml-auto text-[10px]">{streak} day streak</Badge>
          </CardTitle>
          <CardDescription>Tap a day to toggle it. Streaks update instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((d) => (
              <button
                key={d.iso}
                aria-label={d.iso}
                onClick={() =>
                  save({
                    heatmap: d.on ? state.heatmap.filter((x) => x !== d.iso) : [...state.heatmap, d.iso],
                  })
                }
                className={`aspect-square rounded-md border transition-colors ${
                  d.on ? "border-primary bg-primary" : "border-border/40 bg-muted/40"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={markTrainedToday}>
              <Zap className="h-4 w-4" /> Toggle today
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={copySummary}>
              <Copy className="h-4 w-4" /> Copy summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressInsightLab;
