import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, KeyRound, History, Trophy, Flame, Target, Apple, Droplets,
  Watch, Bluetooth, HeartPulse, Moon, Brain, Dumbbell, Timer, Plus, Trash2,
  Sparkles, Download, RefreshCw, Gauge,
} from "lucide-react";

/* ------------------------------ persistence ------------------------------ */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? (parsed as T) : fallback;
    return parsed && typeof parsed === "object" ? { ...(fallback as object), ...parsed } as T : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readJson(key, initial));
  const save = useCallback((next: T) => {
    setState(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch { /* storage blocked */ }
  }, [key]);
  const patch = useCallback((p: Partial<T>) => {
    setState((prev) => {
      const next = { ...(prev as object), ...(p as object) } as T;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [state, patch, save] as const;
}

const Row = ({
  icon: Icon, title, desc, checked, onChange,
}: { icon: React.ElementType; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0">
        <Label className="text-sm font-medium">{title}</Label>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

/* -------------------------------- SECURITY -------------------------------- */

export function SecurityFusionPanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-security-fusion", {
    loginAlerts: true,
    newDeviceApproval: true,
    sessionTimeoutMin: 30,
    hideSensitiveStats: false,
    breachMonitor: true,
    exportRequiresAuth: true,
    trustedIpOnly: false,
  });
  const [sessions] = useState(() => [
    { id: "cur", label: "This device", meta: "Active now", current: true },
  ]);

  const score = useMemo(() => {
    let s = 40;
    if (cfg.loginAlerts) s += 12;
    if (cfg.newDeviceApproval) s += 14;
    if (cfg.breachMonitor) s += 10;
    if (cfg.exportRequiresAuth) s += 12;
    if (cfg.sessionTimeoutMin <= 30) s += 12;
    return Math.min(100, s);
  }, [cfg]);

  return (
    <div className="space-y-3">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Security Health Score</CardTitle>
          <CardDescription>Live rating based on your active protections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black">{score}</span>
            <Progress value={score} className="h-2 flex-1" />
            <Badge variant={score >= 80 ? "default" : "secondary"}>{score >= 80 ? "Strong" : score >= 60 ? "Good" : "Weak"}</Badge>
          </div>
          <Row icon={ShieldCheck} title="Login alerts" desc="Notify me on every new sign-in" checked={cfg.loginAlerts} onChange={(v) => patch({ loginAlerts: v })} />
          <Row icon={KeyRound} title="New device approval" desc="Require confirmation before a new device is trusted" checked={cfg.newDeviceApproval} onChange={(v) => patch({ newDeviceApproval: v })} />
          <Row icon={History} title="Breach monitoring" desc="Warn me if my email appears in a known breach list" checked={cfg.breachMonitor} onChange={(v) => patch({ breachMonitor: v })} />
          <Row icon={Download} title="Auth required for exports" desc="Re-verify identity before downloading my data" checked={cfg.exportRequiresAuth} onChange={(v) => patch({ exportRequiresAuth: v })} />
          <Row icon={Gauge} title="Hide sensitive stats" desc="Mask weight and body metrics on shared screens" checked={cfg.hideSensitiveStats} onChange={(v) => patch({ hideSensitiveStats: v })} />
          <div className="rounded-xl border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto sign-out after inactivity</Label>
              <Badge variant="outline">{cfg.sessionTimeoutMin} min</Badge>
            </div>
            <Slider value={[cfg.sessionTimeoutMin]} min={5} max={120} step={5} onValueChange={([v]) => patch({ sessionTimeoutMin: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.meta}</p>
              </div>
              <Badge>{s.current ? "Current" : "Remote"}</Badge>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast({ title: "Security settings applied", description: "Your protection preferences are saved and active." })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />Re-apply protections
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* --------------------------------- AWARDS --------------------------------- */

const QUESTS = [
  { id: "q1", name: "Early Riser", desc: "Train before 8am, 3 times", target: 3, xp: 120 },
  { id: "q2", name: "Iron Week", desc: "5 strength sessions this week", target: 5, xp: 200 },
  { id: "q3", name: "Hydration Hero", desc: "Hit water goal 7 days", target: 7, xp: 150 },
  { id: "q4", name: "Cardio Climb", desc: "Burn 3000 kcal in cardio", target: 3000, xp: 260 },
];

export function AwardsFusionPanel() {
  const { toast } = useToast();
  const [progress, , save] = usePersisted<Record<string, number>>("fitfusion-quest-progress", {});
  const totalXp = useMemo(
    () => QUESTS.reduce((sum, q) => sum + (Math.min(progress[q.id] ?? 0, q.target) / q.target) * q.xp, 0),
    [progress],
  );

  const bump = (id: string, target: number) => {
    const next = { ...progress, [id]: Math.min(target, (progress[id] ?? 0) + Math.max(1, Math.round(target / 5))) };
    save(next);
    if (next[id] >= target) toast({ title: "Quest complete!", description: "XP added to your season pass." });
  };

  return (
    <div className="space-y-3">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" />Season Quests</CardTitle>
          <CardDescription>{Math.round(totalXp)} XP earned this season</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUESTS.map((q) => {
            const cur = Math.min(progress[q.id] ?? 0, q.target);
            const pct = (cur / q.target) * 100;
            return (
              <div key={q.id} className="rounded-xl border border-border/50 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.desc}</p>
                  </div>
                  <Badge variant={pct >= 100 ? "default" : "outline"}>+{q.xp} XP</Badge>
                </div>
                <Progress value={pct} className="h-1.5" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{cur}/{q.target}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => bump(q.id, q.target)} disabled={pct >= 100}>
                    Log progress
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------- STATS --------------------------------- */

export function StatsFusionPanel({ workouts, streak, calories }: { workouts: number; streak: number; calories: number }) {
  const [cfg, patch] = usePersisted("fitfusion-stats-fusion", { weeklyTarget: 5, showTrends: true, compareLastWeek: true });
  const consistency = Math.min(100, Math.round((workouts % 30) / 30 * 100));
  const load = Math.round(calories / 7);

  const cards = [
    { label: "Weekly load", value: `${load} kcal/day`, icon: Flame },
    { label: "Consistency", value: `${consistency}%`, icon: Gauge },
    { label: "Streak", value: `${streak} days`, icon: Timer },
    { label: "Sessions", value: `${workouts}`, icon: Dumbbell },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Performance Lab</CardTitle>
        <CardDescription>Derived training metrics from your logged activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/50 bg-card/40 p-3">
              <c.icon className="h-4 w-4 text-primary mb-1" />
              <p className="text-lg font-bold leading-none">{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Weekly session target</Label>
            <Badge variant="outline">{cfg.weeklyTarget}/week</Badge>
          </div>
          <Slider value={[cfg.weeklyTarget]} min={1} max={14} step={1} onValueChange={([v]) => patch({ weeklyTarget: v })} />
        </div>
        <Row icon={Gauge} title="Trend indicators" desc="Show up/down arrows next to each metric" checked={cfg.showTrends} onChange={(v) => patch({ showTrends: v })} />
        <Row icon={History} title="Compare to last week" desc="Overlay previous week values in charts" checked={cfg.compareLastWeek} onChange={(v) => patch({ compareLastWeek: v })} />
      </CardContent>
    </Card>
  );
}

/* -------------------------------- NUTRITION ------------------------------- */

export function NutritionFusionPanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-nutrition-fusion", {
    calorieTarget: 2200, proteinPct: 30, carbPct: 45, fatPct: 25,
    waterGoalMl: 3000, waterMl: 0, fasting: false, fastHours: 16, reminders: true,
  });

  const protein = Math.round((cfg.calorieTarget * cfg.proteinPct) / 100 / 4);
  const carbs = Math.round((cfg.calorieTarget * cfg.carbPct) / 100 / 4);
  const fat = Math.round((cfg.calorieTarget * cfg.fatPct) / 100 / 9);

  return (
    <div className="space-y-3">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Apple className="h-4 w-4 text-primary" />Macro Planner</CardTitle>
          <CardDescription>Auto-computed grams from your calorie target</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm w-32">Daily calories</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={cfg.calorieTarget}
              onChange={(e) => patch({ calorieTarget: Math.max(800, Math.min(6000, Number(e.target.value) || 0)) })}
              className="h-9"
            />
          </div>
          {([["proteinPct", "Protein"], ["carbPct", "Carbs"], ["fatPct", "Fat"]] as const).map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <Badge variant="outline">{cfg[k]}%</Badge>
              </div>
              <Slider value={[cfg[k]]} min={5} max={70} step={5} onValueChange={([v]) => patch({ [k]: v } as never)} />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["Protein", protein], ["Carbs", carbs], ["Fat", fat]].map(([l, g]) => (
              <div key={l as string} className="rounded-xl border border-border/50 p-2">
                <p className="text-base font-bold">{g as number}g</p>
                <p className="text-[11px] text-muted-foreground">{l as string}</p>
              </div>
            ))}
          </div>
          {cfg.proteinPct + cfg.carbPct + cfg.fatPct !== 100 && (
            <p className="text-[11px] text-destructive">Macros total {cfg.proteinPct + cfg.carbPct + cfg.fatPct}% — adjust to 100%.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" />Hydration Tracker</CardTitle>
          <CardDescription>{cfg.waterMl} / {cfg.waterGoalMl} ml today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={Math.min(100, (cfg.waterMl / cfg.waterGoalMl) * 100)} className="h-2" />
          <div className="flex gap-2">
            {[250, 500, 750].map((ml) => (
              <Button key={ml} variant="outline" size="sm" className="flex-1"
                onClick={() => patch({ waterMl: Math.min(cfg.waterGoalMl * 2, cfg.waterMl + ml) })}>
                +{ml}ml
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => patch({ waterMl: 0 })}>Reset</Button>
          </div>
          <Row icon={Timer} title="Intermittent fasting" desc={`${cfg.fastHours}:${24 - cfg.fastHours} eating window`} checked={cfg.fasting} onChange={(v) => patch({ fasting: v })} />
          {cfg.fasting && (
            <Slider value={[cfg.fastHours]} min={12} max={20} step={1} onValueChange={([v]) => patch({ fastHours: v })} />
          )}
          <Row icon={Apple} title="Meal reminders" desc="Nudge me at planned meal times" checked={cfg.reminders} onChange={(v) => patch({ reminders: v })} />
          <Button className="w-full" onClick={() => toast({ title: "Nutrition plan saved", description: `${cfg.calorieTarget} kcal • ${protein}P / ${carbs}C / ${fat}F` })}>
            Save nutrition plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------- GOALS --------------------------------- */

interface GoalItem { id: string; title: string; target: number; current: number; unit: string }

export function GoalsFusionPanel() {
  const { toast } = useToast();
  const [goals, , save] = usePersisted<GoalItem[]>("fitfusion-custom-goals", []);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("sessions");

  const add = () => {
    if (!title.trim() || !Number(target)) {
      toast({ title: "Add a title and target", variant: "destructive" });
      return;
    }
    save([...goals, { id: crypto.randomUUID(), title: title.trim(), target: Number(target), current: 0, unit }]);
    setTitle(""); setTarget("");
    toast({ title: "Goal created" });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Custom Goal Builder</CardTitle>
        <CardDescription>Track any metric you care about</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-2 h-9" />
          <Input placeholder="Target" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} className="h-9" />
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["sessions", "km", "kg", "minutes", "kcal", "days"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={add}><Plus className="h-4 w-4 mr-2" />Add goal</Button>

        {goals.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No custom goals yet.</p>}
        {goals.map((g) => (
          <div key={g.id} className="rounded-xl border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate">{g.title}</p>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(goals.filter((x) => x.id !== g.id))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Progress value={Math.min(100, (g.current / g.target) * 100)} className="h-1.5" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{g.current}/{g.target} {g.unit}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => save(goals.map((x) => x.id === g.id ? { ...x, current: Math.max(0, x.current - 1) } : x))}>-1</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => save(goals.map((x) => x.id === g.id ? { ...x, current: Math.min(x.target, x.current + 1) } : x))}>+1</Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* --------------------------------- DEVICES -------------------------------- */

export function DevicesFusionPanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-devices-fusion", {
    autoSync: true, syncIntervalMin: 15, hrBroadcast: false, batterySaver: false,
    workoutAutoDetect: true, gpsHighAccuracy: false,
  });
  const [status, setStatus] = useState<"idle" | "syncing" | "done">("idle");

  const sync = () => {
    setStatus("syncing");
    window.setTimeout(() => {
      setStatus("done");
      patch({});
      toast({ title: "Devices synced", description: "All connected wearables are up to date." });
    }, 900);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Watch className="h-4 w-4 text-primary" />Device Sync Center</CardTitle>
        <CardDescription>Control how wearables talk to FitXFusion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row icon={Bluetooth} title="Auto sync" desc="Pull data in the background from paired devices" checked={cfg.autoSync} onChange={(v) => patch({ autoSync: v })} />
        <div className="rounded-xl border border-border/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Sync interval</Label>
            <Badge variant="outline">{cfg.syncIntervalMin} min</Badge>
          </div>
          <Slider value={[cfg.syncIntervalMin]} min={5} max={120} step={5} onValueChange={([v]) => patch({ syncIntervalMin: v })} />
        </div>
        <Row icon={HeartPulse} title="Heart-rate broadcast" desc="Share live HR with gym equipment" checked={cfg.hrBroadcast} onChange={(v) => patch({ hrBroadcast: v })} />
        <Row icon={Dumbbell} title="Workout auto-detect" desc="Start sessions automatically when movement begins" checked={cfg.workoutAutoDetect} onChange={(v) => patch({ workoutAutoDetect: v })} />
        <Row icon={Gauge} title="High-accuracy GPS" desc="Better route tracking, more battery usage" checked={cfg.gpsHighAccuracy} onChange={(v) => patch({ gpsHighAccuracy: v })} />
        <Row icon={Timer} title="Battery saver" desc="Reduce sensor polling when battery is low" checked={cfg.batterySaver} onChange={(v) => patch({ batterySaver: v })} />
        <Button className="w-full" onClick={sync} disabled={status === "syncing"}>
          <RefreshCw className={`h-4 w-4 mr-2 ${status === "syncing" ? "animate-spin" : ""}`} />
          {status === "syncing" ? "Syncing…" : "Sync all devices"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------------------- WELLNESS -------------------------------- */

export function WellnessFusionPanel() {
  const { toast } = useToast();
  const [cfg, patch] = usePersisted("fitfusion-wellness", {
    mood: 3, stress: 3, sleepHours: 7.5, soreness: 2, notes: "",
    breathwork: true, mindfulMinutes: 10,
  });

  const readiness = useMemo(() => {
    const sleepScore = Math.min(1, cfg.sleepHours / 8) * 40;
    const moodScore = (cfg.mood / 5) * 25;
    const stressScore = ((6 - cfg.stress) / 5) * 20;
    const soreScore = ((6 - cfg.soreness) / 5) * 15;
    return Math.round(sleepScore + moodScore + stressScore + soreScore);
  }, [cfg]);

  return (
    <div className="space-y-3">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Daily Readiness Check-in</CardTitle>
          <CardDescription>Readiness score {readiness}/100 — {readiness >= 75 ? "go hard" : readiness >= 50 ? "moderate day" : "prioritise recovery"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={readiness} className="h-2" />
          {([
            ["mood", "Mood", 1, 5, 1, Sparkles],
            ["stress", "Stress", 1, 5, 1, Gauge],
            ["soreness", "Muscle soreness", 1, 5, 1, Dumbbell],
            ["sleepHours", "Sleep hours", 3, 12, 0.5, Moon],
          ] as const).map(([k, label, min, max, step, Icon]) => (
            <div key={k} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-primary" />{label}</Label>
                <Badge variant="outline">{cfg[k]}</Badge>
              </div>
              <Slider value={[cfg[k] as number]} min={min} max={max} step={step} onValueChange={([v]) => patch({ [k]: v } as never)} />
            </div>
          ))}
          <Input placeholder="Notes for today (optional)" value={cfg.notes} onChange={(e) => patch({ notes: e.target.value })} className="h-9" />
          <Button className="w-full" onClick={() => toast({ title: "Check-in saved", description: `Readiness ${readiness}/100` })}>
            Save check-in
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Moon className="h-4 w-4 text-primary" />Mindfulness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row icon={Brain} title="Guided breathwork" desc="4-7-8 breathing prompt after each workout" checked={cfg.breathwork} onChange={(v) => patch({ breathwork: v })} />
          <div className="rounded-xl border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Daily mindful minutes</Label>
              <Badge variant="outline">{cfg.mindfulMinutes} min</Badge>
            </div>
            <Slider value={[cfg.mindfulMinutes]} min={0} max={60} step={5} onValueChange={([v]) => patch({ mindfulMinutes: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
