import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Apple, Droplet, Beef, Wheat, Salad, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LS_KEY = "ff.nutrition.today";

interface Meal { id: string; name: string; kcal: number; }
interface Log { date: string; kcal: number; protein: number; carbs: number; fat: number; water: number; meals: Meal[]; }

const emptyLog = (): Log => ({ date: new Date().toISOString().slice(0, 10), kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, meals: [] });

export function NutritionSummary({ targetKcal = 2200 }: { targetKcal?: number }) {
  const { toast } = useToast();
  const [log, setLog] = useState<Log>(emptyLog);
  const [mealName, setMealName] = useState("");
  const [mealKcal, setMealKcal] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Log;
        if (parsed.date === new Date().toISOString().slice(0, 10)) setLog(parsed);
      }
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(log)); } catch {} }, [log]);

  const addMeal = () => {
    const kcal = Number(mealKcal);
    if (!mealName.trim() || !Number.isFinite(kcal) || kcal <= 0) {
      toast({ title: "Add a name & calories", variant: "destructive" }); return;
    }
    setLog((l) => ({
      ...l, kcal: l.kcal + kcal,
      protein: l.protein + Math.round(kcal * 0.075),
      carbs: l.carbs + Math.round(kcal * 0.11),
      fat: l.fat + Math.round(kcal * 0.03),
      meals: [{ id: crypto.randomUUID(), name: mealName.trim(), kcal }, ...l.meals].slice(0, 12),
    }));
    setMealName(""); setMealKcal("");
  };
  const addWater = (ml: number) => setLog((l) => ({ ...l, water: Math.max(0, l.water + ml) }));

  const macros = [
    { icon: Beef, label: "Protein", value: log.protein, target: 140, tone: "bg-rose-500" },
    { icon: Wheat, label: "Carbs", value: log.carbs, target: 260, tone: "bg-amber-500" },
    { icon: Salad, label: "Fat", value: log.fat, target: 70, tone: "bg-emerald-500" },
  ];

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Apple className="h-4 w-4 text-primary" />Nutrition Today</CardTitle>
        <CardDescription>Track meals, macros and hydration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-2xl font-black">{log.kcal}<span className="text-xs font-medium text-muted-foreground"> / {targetKcal} kcal</span></div>
            <div className="text-[11px] text-muted-foreground">{Math.max(0, targetKcal - log.kcal)} kcal left</div>
          </div>
          <Progress value={Math.min(100, (log.kcal / targetKcal) * 100)} className="h-1.5" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-[10px] mb-1"><span className="flex items-center gap-1 text-muted-foreground"><m.icon className="h-3 w-3" />{m.label}</span><span className="font-semibold">{m.value}g</span></div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden"><div className={m.tone} style={{ width: `${Math.min(100, (m.value / m.target) * 100)}%`, height: "100%" }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/20 bg-muted/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium"><Droplet className="h-4 w-4 text-cyan-500" />Hydration</div>
            <div className="text-xs text-muted-foreground">{(log.water / 1000).toFixed(1)} / 2.5 L</div>
          </div>
          <Progress value={Math.min(100, (log.water / 2500) * 100)} className="h-1.5 mb-2" />
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 250, 500, 750].map((ml) => (
              <Button key={ml} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => addWater(ml)}>+{ml}ml</Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Log a meal</Label>
          <div className="flex gap-1.5">
            <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="e.g. Chicken bowl" className="h-9 text-sm" />
            <Input value={mealKcal} onChange={(e) => setMealKcal(e.target.value.replace(/\D/g, ""))} placeholder="kcal" className="h-9 w-20 text-sm" inputMode="numeric" />
            <Button size="sm" onClick={addMeal} className="h-9"><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          {log.meals.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-auto pr-1">
              {log.meals.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs rounded-lg border border-border/20 bg-muted/20 px-2.5 py-1.5">
                  <span className="truncate">{m.name}</span>
                  <span className="font-semibold">{m.kcal} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default NutritionSummary;
