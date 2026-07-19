import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Flame, Heart, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  workouts: number;
  streak: number;
  calories: number;
}

/**
 * Liquid-glass "AI Insights" card — a lightweight, deterministic summariser
 * that surfaces motivational insights derived from user stats. No network.
 */
export const ProfileInsightsWidget: React.FC<Props> = ({ workouts, streak, calories }) => {
  const insights = useMemo(() => {
    const items: { icon: React.ElementType; label: string; value: string; tone: string }[] = [];
    items.push({
      icon: TrendingUp,
      label: "Momentum",
      value: workouts > 50 ? "Elite" : workouts > 20 ? "Strong" : workouts > 5 ? "Rising" : "Starter",
      tone: "text-emerald-500",
    });
    items.push({
      icon: Flame,
      label: "Streak Tier",
      value: streak >= 30 ? "🔥 Legendary" : streak >= 14 ? "Blazing" : streak >= 7 ? "On Fire" : "Warming Up",
      tone: "text-orange-500",
    });
    items.push({
      icon: Heart,
      label: "Vitality",
      value: calories > 50000 ? "Peak" : calories > 10000 ? "Healthy" : "Building",
      tone: "text-rose-500",
    });
    items.push({
      icon: Award,
      label: "Next Goal",
      value: workouts < 10 ? "10 Workouts" : workouts < 50 ? "50 Workouts" : workouts < 100 ? "Century Club" : "200 Club",
      tone: "text-primary",
    });
    return items;
  }, [workouts, streak, calories]);

  const tip = useMemo(() => {
    if (streak === 0) return "Kick off a fresh streak today — even 10 minutes counts.";
    if (streak < 7) return `You're ${7 - streak} day${7 - streak === 1 ? "" : "s"} away from unlocking the On Fire badge.`;
    if (workouts < 50) return `Just ${50 - workouts} workouts until your 50-Workout milestone.`;
    return "You're crushing it. Try a new plan to keep the challenge fresh.";
  }, [streak, workouts]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-accent/5 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
          <Badge variant="outline" className="text-[10px] h-5 ml-auto">Live</Badge>
        </CardTitle>
        <CardDescription className="text-xs">Personalised takeaways from your activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {insights.map((it) => (
            <div key={it.label} className="p-3 rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <it.icon className={`h-3.5 w-3.5 ${it.tone}`} />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</span>
              </div>
              <div className="text-sm font-bold text-foreground">{it.value}</div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-foreground/80 leading-relaxed">💡 {tip}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInsightsWidget;
