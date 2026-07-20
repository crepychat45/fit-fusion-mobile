import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dumbbell, Heart, Flame, Moon, Droplet, Zap, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatsExtrasProps {
  workouts?: number;
  streak?: number;
  calories?: number;
}

export function StatsExtras({ workouts = 0, streak = 0, calories = 0 }: StatsExtrasProps) {
  const { toast } = useToast();

  const restingHR = 62;
  const sleepPct = 83;
  const hydrationL = 2.1;
  const volumeT = Math.max(0.5, (workouts * 0.45)).toFixed(1);
  const recovery = streak >= 5 ? "Great" : streak >= 2 ? "Good" : "Fair";
  const hrv = 60 + Math.min(20, streak * 2);

  const metrics = [
    { icon: Heart, label: "Resting HR", value: `${restingHR} bpm`, trend: "-3 vs last mo", color: "text-rose-500" },
    { icon: Flame, label: "Active Calories", value: `${Math.round(calories).toLocaleString()} kcal`, trend: "This week", color: "text-orange-500" },
    { icon: Moon, label: "Sleep Quality", value: `${sleepPct}%`, trend: "7h 42m avg", color: "text-indigo-500" },
    { icon: Droplet, label: "Hydration", value: `${hydrationL} L`, trend: "of 2.5 L", color: "text-cyan-500" },
    { icon: Dumbbell, label: "Volume Lifted", value: `${volumeT} t`, trend: "This month", color: "text-primary" },
    { icon: Zap, label: "Recovery", value: recovery, trend: `HRV ${hrv}`, color: "text-emerald-500" },
  ];

  const muscleGroups = [
    { name: "Chest", value: 78 }, { name: "Back", value: 65 }, { name: "Legs", value: 82 },
    { name: "Arms", value: 58 }, { name: "Core", value: 71 }, { name: "Shoulders", value: 63 },
  ];

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      totals: { workouts, streak, calories },
      health: { restingHR, sleepPct, hydrationL, hrv, recovery, volumeT: Number(volumeT) },
      muscleGroups,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast({ title: "Stats exported", description: "Downloaded as JSON." });
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">Health Snapshot</CardTitle>
            <CardDescription>Live sensor + logged metrics</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border/20 bg-muted/20 p-3">
                <m.icon className={`h-4 w-4 ${m.color} mb-1.5`} />
                <div className="text-lg font-bold leading-tight">{m.value}</div>
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
                <div className="text-[10px] text-primary mt-0.5">{m.trend}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Muscle Group Balance</CardTitle>
          <CardDescription>Training coverage this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {muscleGroups.map((g) => (
            <div key={g.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{g.name}</span>
                <span className="font-semibold">{g.value}%</span>
              </div>
              <Progress value={g.value} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsExtras;
