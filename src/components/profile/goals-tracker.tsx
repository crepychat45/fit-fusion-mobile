import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal { id: string; title: string; target: number; current: number; unit: string; deadline?: string; }
const LS = "ff.goals.list";

const seed = (): Goal[] => [
  { id: crypto.randomUUID(), title: "Workouts this month", target: 20, current: 8, unit: "sessions" },
  { id: crypto.randomUUID(), title: "Drink water daily", target: 2500, current: 1400, unit: "ml" },
  { id: crypto.randomUUID(), title: "Run distance", target: 40, current: 12, unit: "km" },
];

export function GoalsTracker() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS);
      setGoals(raw ? JSON.parse(raw) : seed());
    } catch { setGoals(seed()); }
  }, []);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(goals)); } catch {} }, [goals]);

  const add = () => {
    const t = Number(target);
    if (!title.trim() || !Number.isFinite(t) || t <= 0) return toast({ title: "Add a title & target", variant: "destructive" });
    setGoals((g) => [{ id: crypto.randomUUID(), title: title.trim(), target: t, current: 0, unit: unit.trim() || "units" }, ...g]);
    setTitle(""); setTarget(""); setUnit("");
  };
  const bump = (id: string, delta: number) => setGoals((g) => g.map((x) => x.id === id ? { ...x, current: Math.max(0, Math.min(x.target, x.current + delta)) } : x));
  const del = (id: string) => setGoals((g) => g.filter((x) => x.id !== id));

  const completed = goals.filter((g) => g.current >= g.target).length;

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" />Goals & Milestones</CardTitle>
        <CardDescription>{completed}/{goals.length} completed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1.5">
          <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-sm" />
          <Input placeholder="Target" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} className="h-9 w-20 text-sm" inputMode="numeric" />
          <Input placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 w-24 text-sm" />
          <Button size="sm" onClick={add} className="h-9"><Plus className="h-3.5 w-3.5" /></Button>
        </div>

        <div className="space-y-2">
          {goals.map((g) => {
            const pct = Math.min(100, (g.current / g.target) * 100);
            const done = g.current >= g.target;
            return (
              <div key={g.id} className={`rounded-xl border p-3 ${done ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/20 bg-muted/20"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-sm font-medium truncate">{g.title}</div>
                    {done && <Badge className="h-4 text-[9px] bg-emerald-500/20 text-emerald-600 border-0">DONE</Badge>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => del(g.id)} aria-label="Delete goal"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="text-[11px] text-muted-foreground mb-1.5">{g.current} / {g.target} {g.unit}</div>
                <Progress value={pct} className="h-1.5" />
                <div className="flex gap-1.5 mt-2">
                  {[1, 5, 25].map((n) => (
                    <Button key={n} size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => bump(g.id, n)}>+{n}</Button>
                  ))}
                  <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => bump(g.id, -1)}>-1</Button>
                  {done && <CheckCircle2 className="h-4 w-4 text-emerald-500 self-center" />}
                </div>
              </div>
            );
          })}
          {goals.length === 0 && <div className="text-center text-xs text-muted-foreground py-6">No goals yet — add your first one above.</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default GoalsTracker;
