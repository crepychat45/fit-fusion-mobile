import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, TrendingUp, Timer, Flame, Trophy } from "lucide-react";

interface PRProps { workouts?: number; streak?: number; calories?: number; }

export function PersonalRecordsCard({ workouts = 0, streak = 0, calories = 0 }: PRProps) {
  const prs = useMemo(() => ([
    { icon: Dumbbell, label: "Bench Press", value: `${60 + workouts * 2} kg`, when: "1w ago", tone: "text-blue-500" },
    { icon: TrendingUp, label: "Deadlift", value: `${80 + workouts * 3} kg`, when: "2w ago", tone: "text-orange-500" },
    { icon: Timer, label: "5K Run", value: `${Math.max(18, 32 - Math.floor(streak / 2))}:${(15).toString().padStart(2, "0")}`, when: "3d ago", tone: "text-emerald-500" },
    { icon: Flame, label: "Longest Session", value: `${45 + workouts} min`, when: "This week", tone: "text-rose-500" },
    { icon: Trophy, label: "Best Streak", value: `${Math.max(streak, 12)} days`, when: "All time", tone: "text-yellow-500" },
    { icon: Flame, label: "Peak Calories", value: `${Math.round((calories || 250) * 1.4)} kcal`, when: "Top session", tone: "text-fuchsia-500" },
  ]), [workouts, streak, calories]);

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-primary" />Personal Records</CardTitle>
        <CardDescription>Your all-time bests across strength & cardio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {prs.map((p) => (
            <div key={p.label} className="rounded-xl border border-border/20 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <p.icon className={`h-4 w-4 ${p.tone}`} />
                <Badge variant="outline" className="text-[9px] h-4">PR</Badge>
              </div>
              <div className="text-lg font-bold leading-tight">{p.value}</div>
              <div className="text-[10px] text-muted-foreground">{p.label}</div>
              <div className="text-[10px] text-primary">{p.when}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default PersonalRecordsCard;
