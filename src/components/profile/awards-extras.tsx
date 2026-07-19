import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Medal, Sparkles, Target, Timer, Trophy } from "lucide-react";

const QUESTS = [
  { title: "Weekly Warrior", desc: "Complete 5 workouts this week", progress: 60, reward: "+150 XP", icon: Flame },
  { title: "Early Bird", desc: "Work out before 8 AM 3 times", progress: 33, reward: "+80 XP", icon: Timer },
  { title: "Strength Seeker", desc: "Hit 3 personal records", progress: 66, reward: "+200 XP", icon: Target },
];

const TIERS = [
  { name: "Bronze", from: 0, color: "from-amber-700 to-amber-500" },
  { name: "Silver", from: 500, color: "from-slate-400 to-slate-200" },
  { name: "Gold", from: 1500, color: "from-yellow-500 to-yellow-300" },
  { name: "Platinum", from: 3000, color: "from-cyan-400 to-blue-400" },
  { name: "Diamond", from: 6000, color: "from-fuchsia-500 to-indigo-500" },
];

export function AwardsExtras({ xp = 1240 }: { xp?: number }) {
  const currentIdx = TIERS.reduce((i, t, idx) => (xp >= t.from ? idx : i), 0);
  return (
    <div className="space-y-3">
      <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />Active Quests</CardTitle>
          <CardDescription>Complete for bonus XP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUESTS.map((q) => (
            <div key={q.title} className="rounded-xl border border-border/20 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <q.icon className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">{q.title}</div>
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
                <div className={`mx-auto w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center mb-1 shadow-md`}>
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
