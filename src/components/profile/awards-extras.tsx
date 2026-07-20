import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Medal, Sparkles, Target, Timer, Trophy, Award } from "lucide-react";

const TIERS = [
  { name: "Bronze", from: 0, color: "from-amber-700 to-amber-500" },
  { name: "Silver", from: 500, color: "from-slate-400 to-slate-200" },
  { name: "Gold", from: 1500, color: "from-yellow-500 to-yellow-300" },
  { name: "Platinum", from: 3000, color: "from-cyan-400 to-blue-400" },
  { name: "Diamond", from: 6000, color: "from-fuchsia-500 to-indigo-500" },
];

interface AwardsExtrasProps {
  xp?: number;
  workouts?: number;
  streak?: number;
  calories?: number;
}

export function AwardsExtras({ xp = 0, workouts = 0, streak = 0, calories = 0 }: AwardsExtrasProps) {
  const currentIdx = TIERS.reduce((i, t, idx) => (xp >= t.from ? idx : i), 0);
  const nextTier = TIERS[currentIdx + 1];
  const tierProgress = nextTier
    ? Math.min(100, ((xp - TIERS[currentIdx].from) / (nextTier.from - TIERS[currentIdx].from)) * 100)
    : 100;

  const QUESTS = [
    {
      title: "Weekly Warrior",
      desc: `${Math.min(workouts, 5)}/5 workouts this week`,
      progress: Math.min(100, (workouts / 5) * 100),
      reward: "+150 XP",
      icon: Flame,
      done: workouts >= 5,
    },
    {
      title: "Streak Master",
      desc: `${streak}/7 day streak`,
      progress: Math.min(100, (streak / 7) * 100),
      reward: "+200 XP",
      icon: Timer,
      done: streak >= 7,
    },
    {
      title: "Calorie Crusher",
      desc: `${Math.round(calories).toLocaleString()} / 5,000 kcal`,
      progress: Math.min(100, (calories / 5000) * 100),
      reward: "+250 XP",
      icon: Target,
      done: calories >= 5000,
    },
  ];

  const completedQuests = QUESTS.filter((q) => q.done).length;

  return (
    <div className="space-y-3">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/5 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-primary" /> Season Progress
          </CardTitle>
          <CardDescription>
            {nextTier ? `${nextTier.from - xp} XP to ${nextTier.name}` : "Max tier reached ✨"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${TIERS[currentIdx].color} flex items-center justify-center shadow-lg`}>
              <Trophy className="h-5 w-5 text-white drop-shadow" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{TIERS[currentIdx].name} Tier</div>
              <div className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP total</div>
              <Progress value={tierProgress} className="h-1.5 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />Active Quests
          </CardTitle>
          <CardDescription>{completedQuests}/{QUESTS.length} completed · Live progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUESTS.map((q) => (
            <div
              key={q.title}
              className={`rounded-xl border p-3 transition-colors ${
                q.done ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/20 bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <q.icon className={`h-4 w-4 ${q.done ? "text-emerald-500" : "text-primary"}`} />
                  <div className="text-sm font-medium">{q.title}</div>
                  {q.done && <Badge className="h-4 text-[9px] bg-emerald-500/20 text-emerald-600 border-0">DONE</Badge>}
                </div>
                <Badge variant="outline" className="text-[10px]">{q.reward}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mb-1.5">{q.desc}</div>
              <Progress value={q.progress} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Medal className="h-4 w-4 text-primary" />Rank Tiers</CardTitle>
          <CardDescription>Season 1 progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {TIERS.map((t, i) => (
              <div key={t.name} className={`text-center ${i > currentIdx ? "opacity-40" : ""}`}>
                <div className={`mx-auto w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center mb-1 shadow-md ${i === currentIdx ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-background" : ""}`}>
                  <Trophy className="h-4 w-4 text-white drop-shadow" />
                </div>
                <div className="text-[10px] font-semibold">{t.name}</div>
                <div className="text-[9px] text-muted-foreground">{t.from} XP</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AwardsExtras;
