import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Heart, Flame, Moon, Droplet, Zap } from "lucide-react";

export function StatsExtras() {
  const metrics = [
    { icon: Heart, label: "Resting HR", value: "62 bpm", trend: "-3 vs last mo", color: "text-rose-500" },
    { icon: Flame, label: "Active Calories", value: "482 kcal", trend: "+12% today", color: "text-orange-500" },
    { icon: Moon, label: "Sleep Quality", value: "83%", trend: "7h 42m", color: "text-indigo-500" },
    { icon: Droplet, label: "Hydration", value: "2.1 L", trend: "of 2.5 L", color: "text-cyan-500" },
    { icon: Dumbbell, label: "Volume Lifted", value: "12.4 t", trend: "This month", color: "text-primary" },
    { icon: Zap, label: "Recovery", value: "Great", trend: "HRV 72", color: "text-emerald-500" },
  ];
  const muscleGroups = [
    { name: "Chest", value: 78 }, { name: "Back", value: 65 }, { name: "Legs", value: 82 },
    { name: "Arms", value: 58 }, { name: "Core", value: 71 }, { name: "Shoulders", value: 63 },
  ];
  return (
    <div className="space-y-3">
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Health Snapshot</CardTitle>
          <CardDescription>Live sensor + logged metrics</CardDescription>
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
