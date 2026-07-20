import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Star, Crown, Zap, Award, Diamond } from "lucide-react";

interface Props { workouts?: number; streak?: number; calories?: number; }

export function BadgesCollection({ workouts = 0, streak = 0, calories = 0 }: Props) {
  const badges = [
    { icon: Star, name: "First Rep", rarity: "Common", earned: workouts >= 1, color: "from-slate-400 to-slate-200" },
    { icon: Zap, name: "Speed Demon", rarity: "Rare", earned: streak >= 3, color: "from-blue-400 to-cyan-300" },
    { icon: Award, name: "Iron Will", rarity: "Epic", earned: workouts >= 20, color: "from-purple-500 to-pink-400" },
    { icon: Crown, name: "Champion", rarity: "Legendary", earned: workouts >= 50, color: "from-yellow-500 to-amber-300" },
    { icon: Diamond, name: "Diamond Elite", rarity: "Mythic", earned: workouts >= 100, color: "from-fuchsia-500 to-indigo-500" },
    { icon: Sparkles, name: "Calorie King", rarity: "Rare", earned: calories >= 3000, color: "from-orange-500 to-red-400" },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />Badge Collection</CardTitle>
        <CardDescription>{earnedCount}/{badges.length} unlocked · rarity tiers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={(earnedCount / badges.length) * 100} className="h-1.5" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {badges.map((b) => (
            <div key={b.name} className={`text-center rounded-xl border border-border/20 p-2 ${b.earned ? "bg-muted/30" : "opacity-40 grayscale bg-muted/10"}`}>
              <div className={`mx-auto w-11 h-11 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center shadow-md mb-1`}>
                <b.icon className="h-5 w-5 text-white drop-shadow" />
              </div>
              <div className="text-[10px] font-semibold truncate">{b.name}</div>
              <Badge variant="outline" className="text-[8px] mt-0.5 h-3.5 px-1">{b.rarity}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default BadgesCollection;
