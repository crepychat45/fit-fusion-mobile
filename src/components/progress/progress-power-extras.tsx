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
  Activity, CalendarDays, Download, Droplets, Flame, Moon, Plus, Scale, Target, Trophy,
} from "lucide-react";

const KEY = "fitfusion-progress-power";

interface WeightEntry { date: string; kg: number }
interface ProgressPower {
  weights: WeightEntry[];
  targetKg: number;
  waterGoal: number;
  waterToday: number;
  waterDate: string;
  sleepGoal: number;
  calorieGoal: number;
  weeklyTarget: number;
  reminders: boolean;
}

const DEFAULTS: ProgressPower = {
  weights: [],
  targetKg: 70,
  waterGoal: 8,
  waterToday: 0,
  waterDate: new Date().toDateString(),
  sleepGoal: 8,
  calorieGoal: 2200,
  weeklyTarget: 4,
  reminders: true,
};

function read(): ProgressPower {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    if (!Array.isArray(parsed.weights)) parsed.weights = [];
    if (parsed.waterDate !== new Date().toDateString()) {
      parsed.waterToday = 0;
      parsed.waterDate = new Date().toDateString();
    }
    return parsed;
  } catch {
    return DEFAULTS;
  }
}

/**
 * Progress power tools — weight trend logging, hydration, recovery targets
 * and a one-tap CSV export. Everything persists locally and survives reloads.
 */
export function ProgressPowerExtras() {
  const { toast } = useToast();
  const [s, setS] = useState<ProgressPower>(read);
  const [weightInput, setWeightInput] = useState("");

  const set = useCallback((patch: Partial<ProgressPower>) => {
    setS((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setS(read());
    window.addEventListener("fitfusion-settings-hydrated", sync);
    return () => window.removeEventListener("fitfusion-settings-hydrated", sync);
  }, []);

  const sorted = useMemo(
    () => [...s.weights].sort((a, b) => a.date.localeCompare(b.date)),
    [s.weights],
  );
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const delta = latest && first ? Math.round((latest.kg - first.kg) * 10) / 10 : 0;
  const toGoal = latest ? Math.round((latest.kg - s.targetKg) * 10) / 10 : 0;

  const chartMax = Math.max(1, ...sorted.map((w) => w.kg));
  const chartMin = Math.min(chartMax, ...sorted.map((w) => w.kg));
  const span = Math.max(1, chartMax - chartMin);

  const logWeight = () => {
    const kg = Number(weightInput);
    if (!Number.isFinite(kg) || kg <= 0 || kg > 400) {
      toast({ title: "Enter a valid weight", variant: "destructive" });
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    const weights = [...s.weights.filter((w) => w.date !== date), { date, kg }].slice(-60);
    set({ weights });
    setWeightInput("");
    toast({ title: "Weight logged", description: `${kg} kg on ${date}` });
  };

  const exportCsv = () => {
    const rows = [
      "date,weight_kg",
      ...sorted.map((w) => `${w.date},${w.kg}`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitxfusion-progress.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: `${sorted.length} entries exported.` });
  };

  return (
    <div className="space-y-4">
      {/* Weight trend */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" />
            Weight Trend
            <Badge variant="outline" className="ml-auto text-[10px]">
              {sorted.length} entries
            </Badge>
          </CardTitle>
          <CardDescription>Log your weight and watch the trend against your target.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              inputMode="decimal"
              placeholder="Today's weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
            <Button onClick={logWeight}><Plus className="mr-1 h-4 w-4" /> Log</Button>
          </div>

          <div className="flex h-24 items-end gap-[3px] rounded-xl border border-border/40 bg-muted/20 p-2">
            {sorted.length === 0 && (
              <span className="m-auto text-xs text-muted-foreground">No entries yet — log your first weight.</span>
            )}
            {sorted.map((w) => (
              <div
                key={w.date}
                className="flex-1 rounded-sm bg-primary/70"
                style={{ height: `${Math.max(8, ((w.kg - chartMin) / span) * 100)}%` }}
                title={`${w.date}: ${w.kg} kg`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Latest", value: latest ? `${latest.kg} kg` : "—" },
              { label: "Change", value: `${delta > 0 ? "+" : ""}${delta} kg` },
              { label: "To target", value: latest ? `${toGoal > 0 ? "-" : "+"}${Math.abs(toGoal)} kg` : "—" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
                <div className="text-sm font-semibold">{m.value}</div>
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Target weight</Label>
              <span className="text-muted-foreground">{s.targetKg} kg</span>
            </div>
            <Slider value={[s.targetKg]} min={40} max={150} step={1} onValueChange={(v) => set({ targetKg: v[0] ?? 70 })} />
          </div>

          <Button variant="outline" className="w-full" onClick={exportCsv} disabled={!sorted.length}>
            <Download className="mr-2 h-4 w-4" /> Export progress CSV
          </Button>
        </CardContent>
      </Card>

      {/* Daily targets */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" /> Daily Targets
          </CardTitle>
          <CardDescription>Hydration, recovery and energy goals that reset every day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-sky-500" /> Water
              </Label>
              <span className="text-xs text-muted-foreground">{s.waterToday}/{s.waterGoal} glasses</span>
            </div>
            <Progress value={Math.min(100, (s.waterToday / Math.max(1, s.waterGoal)) * 100)} className="mb-3 h-2" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => set({ waterToday: Math.min(30, s.waterToday + 1), waterDate: new Date().toDateString() })}>
                +1 glass
              </Button>
              <Button size="sm" variant="outline" onClick={() => set({ waterToday: Math.max(0, s.waterToday - 1) })}>
                Undo
              </Button>
              <Button size="sm" variant="ghost" onClick={() => set({ waterToday: 0 })}>Reset</Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label className="flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep goal</Label>
              <span className="text-muted-foreground">{s.sleepGoal} h</span>
            </div>
            <Slider value={[s.sleepGoal]} min={4} max={12} step={0.5} onValueChange={(v) => set({ sleepGoal: v[0] ?? 8 })} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label className="flex items-center gap-2"><Flame className="h-4 w-4" /> Calorie goal</Label>
              <span className="text-muted-foreground">{s.calorieGoal} kcal</span>
            </div>
            <Slider value={[s.calorieGoal]} min={1200} max={4500} step={50} onValueChange={(v) => set({ calorieGoal: v[0] ?? 2200 })} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Weekly sessions</Label>
              <span className="text-muted-foreground">{s.weeklyTarget}</span>
            </div>
            <Slider value={[s.weeklyTarget]} min={1} max={14} step={1} onValueChange={(v) => set({ weeklyTarget: v[0] ?? 4 })} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Goal reminders</Label>
                <p className="text-xs text-muted-foreground">Nudge me inside the notification centre.</p>
              </div>
            </div>
            <Switch checked={s.reminders} onCheckedChange={(v) => set({ reminders: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" /> Milestones
          </CardTitle>
          <CardDescription>Automatic checkpoints unlocked by your logged data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "First log", done: sorted.length >= 1 },
            { label: "7 entries", done: sorted.length >= 7 },
            { label: "Hydrated day", done: s.waterToday >= s.waterGoal },
            { label: "Target hit", done: !!latest && latest.kg <= s.targetKg },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-xl border p-3 text-center text-xs ${
                m.done ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "border-border/40 bg-muted/20 text-muted-foreground"
              }`}
            >
              <Trophy className="mx-auto mb-1 h-4 w-4" />
              {m.label}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressPowerExtras;
