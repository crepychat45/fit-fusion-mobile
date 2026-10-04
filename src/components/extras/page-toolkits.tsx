import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { APP_VERSION } from "@/lib/app-version";
import { Timer, Calculator, Scale, Trophy, Target, Link2, Download, Upload, Bug, Trash2, Play, Pause, RotateCcw } from "lucide-react";

/* ---------- Synced key/value: device first, then user_settings.local_kv ---------- */
function useSyncedKV<T>(key: string, initial: T) {
  const lsKey = `fitfusion.kv.${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      if (!alive || !uid) return;
      setUserId(uid);
      const { data: row } = await supabase.from("user_settings").select("local_kv").eq("user_id", uid).maybeSingle();
      const remote = (row?.local_kv as Record<string, unknown> | null)?.[key];
      if (alive && remote !== undefined) {
        setValue(remote as T);
        localStorage.setItem(lsKey, JSON.stringify(remote));
      }
    });
    return () => {
      alive = false;
    };
  }, [key, lsKey]);

  const save = async (next: T) => {
    setValue(next);
    localStorage.setItem(lsKey, JSON.stringify(next));
    if (!userId) return;
    const { data: row } = await supabase.from("user_settings").select("local_kv").eq("user_id", userId).maybeSingle();
    const merged = { ...((row?.local_kv as Record<string, unknown>) ?? {}), [key]: next };
    await supabase.from("user_settings").upsert({ user_id: userId, local_kv: merged as any }, { onConflict: "user_id" });
  };
  return [value, save] as const;
}

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="liquid-glass">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

/* ===================== WORKOUTS ===================== */
function IntervalTimer() {
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(8);
  const [state, setState] = useState({ round: 1, phase: "work" as "work" | "rest" | "done", left: 40, running: false });
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (!state.running) return;
    tick.current = window.setInterval(() => {
      setState((s) => {
        if (s.left > 1) return { ...s, left: s.left - 1 };
        navigator.vibrate?.(200);
        if (s.phase === "work") return rest > 0 ? { ...s, phase: "rest", left: rest } : s.round >= rounds ? { ...s, phase: "done", left: 0, running: false } : { ...s, round: s.round + 1, left: work };
        if (s.round >= rounds) return { ...s, phase: "done", left: 0, running: false };
        return { ...s, round: s.round + 1, phase: "work", left: work };
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [state.running, work, rest, rounds]);

  const reset = () => setState({ round: 1, phase: "work", left: work, running: false });
  return (
    <Section icon={Timer} title="Interval timer">
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[["Work (s)", work, setWork], ["Rest (s)", rest, setRest], ["Rounds", rounds, setRounds]].map(([l, v, set]: any) => (
          <label key={l} className="space-y-1">
            <span className="text-muted-foreground">{l}</span>
            <Input type="number" min={0} max={600} value={v} disabled={state.running} onChange={(e) => set(Math.max(0, Math.min(600, Number(e.target.value) || 0)))} />
          </label>
        ))}
      </div>
      <div className="text-center">
        <Badge variant={state.phase === "work" ? "default" : "secondary"} className="capitalize">{state.phase} · round {state.round}/{rounds}</Badge>
        <div className="text-5xl font-bold tabular-nums my-2" aria-live="polite">{state.left}s</div>
      </div>
      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={() => setState((s) => ({ ...(s.phase === "done" ? { round: 1, phase: "work", left: work } : s), running: !s.running }))}>
          {state.running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {state.running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-1" />Reset</Button>
      </div>
    </Section>
  );
}

function StrengthCalc() {
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(5);
  const [target, setTarget] = useState(100);
  const [bar, setBar] = useState(20);
  const oneRm = reps <= 1 ? weight : Math.round(weight * (1 + reps / 30));
  const plates = useMemo(() => {
    let side = (target - bar) / 2;
    const out: number[] = [];
    for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (side >= p - 1e-9) { out.push(p); side -= p; }
    return { out, left: Math.round(side * 100) / 100 };
  }, [target, bar]);
  return (
    <Section icon={Calculator} title="1-rep max & plate calculator">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label>Weight lifted (kg)<Input type="number" value={weight} onChange={(e) => setWeight(Math.max(0, Number(e.target.value) || 0))} /></label>
        <label>Reps<Input type="number" value={reps} onChange={(e) => setReps(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} /></label>
      </div>
      <p className="text-sm">Estimated 1RM: <b>{oneRm} kg</b> · 80%: {Math.round(oneRm * 0.8)} kg · 60%: {Math.round(oneRm * 0.6)} kg</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label>Target total (kg)<Input type="number" value={target} onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))} /></label>
        <label>Bar (kg)<Input type="number" value={bar} onChange={(e) => setBar(Math.max(0, Number(e.target.value) || 0))} /></label>
      </div>
      <p className="text-sm">Each side: {target <= bar ? "empty bar" : plates.out.join(" + ") + " kg"}{plates.left > 0 && ` (${plates.left} kg can't be matched)`}</p>
    </Section>
  );
}

export function WorkoutsToolkit() {
  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-semibold">Training tools</h2>
      <IntervalTimer />
      <StrengthCalc />
    </div>
  );
}

/* ===================== PROGRESS ===================== */
type WeightEntry = { date: string; kg: number };
type PR = { id: string; exercise: string; value: number; unit: string; date: string };

export function ProgressToolkit() {
  const { toast } = useToast();
  const [weights, setWeights] = useSyncedKV<WeightEntry[]>("weightLog", []);
  const [prs, setPrs] = useSyncedKV<PR[]>("personalRecords", []);
  const [kg, setKg] = useState("");
  const [height, setHeight] = useSyncedKV<number>("heightCm", 170);
  const [pr, setPr] = useState({ exercise: "", value: "", unit: "kg" });

  const latest = weights[weights.length - 1]?.kg;
  const bmi = latest && height ? latest / (height / 100) ** 2 : null;
  const change = weights.length > 1 ? latest! - weights[0].kg : null;

  const addWeight = () => {
    const n = Number(kg);
    if (!(n > 20 && n < 400)) return toast({ title: "Enter a weight between 20 and 400 kg", variant: "destructive" });
    const today = new Date().toISOString().slice(0, 10);
    setWeights([...weights.filter((w) => w.date !== today), { date: today, kg: n }].sort((a, b) => a.date.localeCompare(b.date)).slice(-365));
    setKg("");
    toast({ title: "Weight saved" });
  };
  const addPr = () => {
    const name = pr.exercise.trim().slice(0, 60);
    const v = Number(pr.value);
    if (!name || !(v > 0)) return toast({ title: "Add an exercise and a value", variant: "destructive" });
    setPrs([{ id: crypto.randomUUID(), exercise: name, value: v, unit: pr.unit, date: new Date().toISOString().slice(0, 10) }, ...prs].slice(0, 100));
    setPr({ exercise: "", value: "", unit: pr.unit });
  };
  const max = Math.max(...weights.map((w) => w.kg), 1), min = Math.min(...weights.map((w) => w.kg), max);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-semibold">Body & records</h2>
      <Section icon={Scale} title="Weight log & BMI">
        <div className="flex gap-2">
          <Input type="number" placeholder="Today's weight (kg)" value={kg} onChange={(e) => setKg(e.target.value)} />
          <Button onClick={addWeight}>Save</Button>
        </div>
        <label className="text-xs flex items-center gap-2">Height (cm)<Input className="w-24 h-8" type="number" value={height} onChange={(e) => setHeight(Math.max(100, Math.min(250, Number(e.target.value) || 170)))} /></label>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">Latest: {latest ? `${latest} kg` : "--"}</Badge>
          <Badge variant="secondary">BMI: {bmi ? bmi.toFixed(1) : "--"}</Badge>
          {change !== null && <Badge variant="secondary">Change: {change > 0 ? "+" : ""}{change.toFixed(1)} kg</Badge>}
        </div>
        {weights.length > 1 && (
          <div className="flex items-end gap-1 h-20" aria-label="Weight history chart">
            {weights.slice(-30).map((w) => (
              <div key={w.date} title={`${w.date}: ${w.kg} kg`} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${20 + ((w.kg - min) / (max - min || 1)) * 80}%` }} />
            ))}
          </div>
        )}
        {weights.length === 0 && <p className="text-xs text-muted-foreground">No entries yet. Log your weight to see your trend.</p>}
      </Section>
      <Section icon={Trophy} title="Personal records">
        <div className="flex gap-2">
          <Input placeholder="Exercise" maxLength={60} value={pr.exercise} onChange={(e) => setPr({ ...pr, exercise: e.target.value })} />
          <Input className="w-20" type="number" placeholder="Value" value={pr.value} onChange={(e) => setPr({ ...pr, value: e.target.value })} />
          <select className="rounded-md border bg-background px-2 text-sm" value={pr.unit} onChange={(e) => setPr({ ...pr, unit: e.target.value })}>
            <option>kg</option><option>reps</option><option>min</option><option>km</option>
          </select>
          <Button onClick={addPr}>Add</Button>
        </div>
        {prs.length === 0 ? <p className="text-xs text-muted-foreground">No records yet.</p> : (
          <ul className="space-y-1">
            {prs.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm rounded-lg bg-muted/40 px-3 py-1.5">
                <span><b>{p.exercise}</b> — {p.value} {p.unit} <span className="text-xs text-muted-foreground">{p.date}</span></span>
                <Button size="icon" variant="ghost" aria-label={`Delete ${p.exercise}`} onClick={() => setPrs(prs.filter((x) => x.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ===================== PROFILE ===================== */
type Goal = { id: string; text: string; done: boolean };
export function ProfileToolkit() {
  const { toast } = useToast();
  const [goals, setGoals] = useSyncedKV<Goal[]>("profileGoals", []);
  const [text, setText] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);
  const done = goals.filter((g) => g.done).length;

  const copyLink = async () => {
    if (!uid) return toast({ title: "Sign in to share your profile", variant: "destructive" });
    const url = `${window.location.origin}/card/${uid}`;
    try {
      if (navigator.share) await navigator.share({ title: "My FitFusion card", url });
      else { await navigator.clipboard.writeText(url); toast({ title: "Profile link copied" }); }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <Section icon={Target} title={`My goals (${done}/${goals.length})`}>
        <div className="flex gap-2">
          <Input placeholder="e.g. Run 5 km without stopping" maxLength={100} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.form, null)} />
          <Button onClick={() => { const t = text.trim(); if (!t) return; setGoals([...goals, { id: crypto.randomUUID(), text: t, done: false }].slice(0, 50)); setText(""); }}>Add</Button>
        </div>
        {goals.length === 0 && <p className="text-xs text-muted-foreground">Add goals to track them here. They sync across your devices.</p>}
        {goals.map((g) => (
          <div key={g.id} className="flex items-center gap-2">
            <Checkbox checked={g.done} onCheckedChange={(c) => setGoals(goals.map((x) => (x.id === g.id ? { ...x, done: Boolean(c) } : x)))} aria-label={g.text} />
            <span className={`flex-1 text-sm ${g.done ? "line-through text-muted-foreground" : ""}`}>{g.text}</span>
            <Button size="icon" variant="ghost" aria-label="Delete goal" onClick={() => setGoals(goals.filter((x) => x.id !== g.id))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </Section>
      <Section icon={Link2} title="Share my fitness card">
        <p className="text-xs text-muted-foreground">Share a public link to your fitness card.</p>
        <Button variant="outline" onClick={copyLink}><Link2 className="h-4 w-4 mr-2" />Share link</Button>
      </Section>
    </div>
  );
}

/* ===================== SETTINGS ===================== */
export function SettingsTransferPanel() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const exportAll = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if ((k.startsWith("fitfusion") || k === "theme") && !/token|pin|passkey|lock|secret|totp/i.test(k)) data[k] = localStorage.getItem(k)!;
    }
    const blob = new Blob([JSON.stringify({ app: "FitFusion", version: APP_VERSION, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fitfusion-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: `Exported ${Object.keys(data).length} settings` });
  };
  const importFile = async (f: File) => {
    try {
      if (f.size > 1_000_000) throw new Error("File too large");
      const parsed = z.object({ app: z.literal("FitFusion"), data: z.record(z.string()) }).parse(JSON.parse(await f.text()));
      let n = 0;
      for (const [k, v] of Object.entries(parsed.data)) {
        if ((k.startsWith("fitfusion") || k === "theme") && !/token|pin|passkey|lock|secret|totp/i.test(k) && v.length < 200_000) { localStorage.setItem(k, v); n++; }
      }
      toast({ title: `Imported ${n} settings`, description: "Reloading to apply…" });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast({ title: "That isn't a valid FitFusion settings file", variant: "destructive" });
    }
  };
  return (
    <Section icon={Download} title="Move settings to another device">
      <p className="text-xs text-muted-foreground">Exports your preferences as a file. PINs, passkeys and sign-in data are never included.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportAll}><Download className="h-4 w-4 mr-2" />Export</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Import</Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
      </div>
    </Section>
  );
}

/* ===================== ABOUT ===================== */
const reportSchema = z.object({
  topic: z.enum(["Bug", "Idea", "Question"]),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000, "Keep it under 1000 characters"),
});
export function AboutReportPanel() {
  const { toast } = useToast();
  const [topic, setTopic] = useState<"Bug" | "Idea" | "Question">("Bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async () => {
    const r = reportSchema.safeParse({ topic, message });
    if (!r.success) return toast({ title: r.error.issues[0].message, variant: "destructive" });
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("analytics_events").insert({
      user_id: data.user?.id ?? null,
      event_name: "feedback_submitted",
      event_data: { topic, message: r.data.message, version: APP_VERSION, ua: navigator.userAgent.slice(0, 200) },
    });
    if (error) return toast({ title: "Couldn't send. Please try again.", variant: "destructive" });
    setSent(true);
    setMessage("");
    toast({ title: "Thanks! Your feedback was sent." });
  };
  return (
    <Section icon={Bug} title="Send feedback">
      <div className="flex gap-2">
        {(["Bug", "Idea", "Question"] as const).map((t) => (
          <Button key={t} size="sm" variant={topic === t ? "default" : "outline"} onClick={() => setTopic(t)}>{t}</Button>
        ))}
      </div>
      <Textarea maxLength={1000} placeholder="Tell us what happened or what you'd like to see…" value={message} onChange={(e) => { setMessage(e.target.value); setSent(false); }} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{message.length}/1000 · v{APP_VERSION} attached</span>
        <Button size="sm" onClick={submit}>{sent ? "Sent ✓" : "Send"}</Button>
      </div>
    </Section>
  );
}
