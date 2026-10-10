import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Wind, UserPlus } from "lucide-react";
import { readJson } from "@/lib/safe-storage";
import { useToast } from "@/hooks/use-toast";

const today = () => new Date().toISOString().slice(0, 10);
const HABITS_KEY = "fitx-habits-v1";
type Habits = { list: string[]; done: Record<string, string[]> };

/** Daily habit checklist with a real streak computed from the days you ticked everything. */
export function HabitTracker() {
  const [h, setH] = useState<Habits>(() => readJson<Habits>(HABITS_KEY, { list: ["Drink 2L water", "Stretch 5 min", "Sleep 7h+"], done: {} }));
  const [draft, setDraft] = useState("");
  useEffect(() => { try { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); } catch { /* full */ } }, [h]);
  const d = h.done[today()] ?? [];
  const toggle = (x: string) => setH((p) => {
    const cur = p.done[today()] ?? [];
    return { ...p, done: { ...p.done, [today()]: cur.includes(x) ? cur.filter((y) => y !== x) : [...cur, x] } };
  });
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const got = h.done[day] ?? [];
    if (h.list.length && h.list.every((x) => got.includes(x))) streak++;
    else if (i > 0 || got.length) break;
  }
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" />Daily habits <span className="ml-auto text-xs text-muted-foreground">{d.length}/{h.list.length} · {streak}-day streak</span></CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {h.list.map((x) => (
          <label key={x} className="flex items-center gap-2 text-sm">
            <Checkbox checked={d.includes(x)} onCheckedChange={() => toggle(x)} />
            <span className={d.includes(x) ? "line-through text-muted-foreground" : ""}>{x}</span>
            <button className="ml-auto text-xs text-muted-foreground" aria-label={`Remove ${x}`} onClick={() => setH((p) => ({ ...p, list: p.list.filter((y) => y !== x) }))}>×</button>
          </label>
        ))}
        <div className="flex gap-2 pt-1">
          <Input value={draft} maxLength={40} placeholder="Add a habit" onChange={(e) => setDraft(e.target.value)} />
          <Button size="sm" disabled={!draft.trim() || h.list.length >= 10} onClick={() => { setH((p) => ({ ...p, list: [...p.list, draft.trim()] })); setDraft(""); }}>Add</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Box-breathing guide (4-4-4-4) for recovery between sets. */
export function BreathingCoach() {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const phases = ["Breathe in", "Hold", "Breathe out", "Hold"];
  const phase = phases[Math.floor(t / 4) % 4];
  const scale = phase === "Breathe in" ? 1 + (t % 4) / 8 : phase === "Breathe out" ? 1.5 - (t % 4) / 8 : phase === "Hold" && Math.floor(t / 4) % 4 === 1 ? 1.5 : 1;
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wind className="h-4 w-4 text-primary" />Breathing coach</CardTitle></CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="h-24 w-24 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs transition-transform duration-1000" style={{ transform: `scale(${running ? scale : 1})` }}>
          {running ? `${phase} ${4 - (t % 4)}` : "Ready"}
        </div>
        <div className="text-xs text-muted-foreground">{running ? `${Math.floor(t / 16)} rounds done` : "Box breathing, 4 seconds each"}</div>
        <Button size="sm" onClick={() => { setRunning((r) => !r); if (running) setT(0); }}>{running ? "Stop" : "Start"}</Button>
      </CardContent>
    </Card>
  );
}

/** Invite friends with a real share sheet (or copy link). */
export function InviteFriendsCard() {
  const { toast } = useToast();
  const url = `${window.location.origin}/?ref=invite`;
  const share = async () => {
    try {
      const { copyText } = await import("@/components/settings/settings-max-extras");
      if (navigator.share) await navigator.share({ title: "FitxFusion", text: "Join me on FitxFusion!", url });
      else { await copyText(url); toast({ title: "Invite link copied" }); }
    } catch { /* cancelled */ }
  };
  return (
    <Card className="glass-card">
      <CardContent className="flex items-center gap-3 py-4">
        <UserPlus className="h-5 w-5 text-primary" />
        <div className="flex-1 text-sm"><div className="font-medium">Train together</div><div className="text-muted-foreground text-xs">Invite friends to join your challenges.</div></div>
        <Button size="sm" onClick={share}>Invite</Button>
      </CardContent>
    </Card>
  );
}
