import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Droplets, Flame, Timer, Trophy, Minus, Plus, Radio } from "lucide-react";
import { useLiveHealth } from "@/hooks/use-live-health";
import { Link } from "react-router-dom";

/** Health panel built only from recorded data, user logs and a connected watch. */
export function HealthMetricsPanel() {
  const h = useLiveHealth();
  const weekPct = Math.min(100, Math.round((h.weekSessions / Math.max(1, h.weeklyGoal)) * 100));
  const waterPct = Math.min(100, Math.round((h.waterMl / h.waterGoalMl) * 100));

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Health Metrics</h2>
        <Badge variant="outline" className="text-xs">
          <Radio className="h-3 w-3 mr-1" />
          {h.signedIn ? "Live" : "Sign in to sync"}
        </Badge>
      </div>

      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2 rounded-full">
                <Heart className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">Heart Rate</p>
                <p className="text-xs text-muted-foreground">
                  {h.reading.hr != null ? "From your watch" : h.watchConnected ? "Watch doesn't share heart rate" : "Connect a watch to see this"}
                </p>
              </div>
            </div>
            {h.reading.hr != null ? (
              <p className="text-lg font-bold">{h.reading.hr} <span className="text-xs text-muted-foreground">BPM</span></p>
            ) : (
              <Button asChild size="sm" variant="outline"><Link to="/smartwatch-settings">Connect</Link></Button>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Water today</span></div>
              <p className="text-lg font-bold">{(h.waterMl / 1000).toFixed(2)} L</p>
              <Progress value={waterPct} className="h-2" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-9" aria-label="Remove 250 ml" onClick={() => h.addWater(-250)}><Minus className="h-3 w-3" /></Button>
                <Button size="sm" className="flex-1 h-9" aria-label="Add 250 ml" onClick={() => h.addWater(250)}><Plus className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2"><Timer className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Today</span></div>
              <p className="text-lg font-bold">{h.todayMinutes} min</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" />{h.todayCalories} kcal · {h.todaySessions} session{h.todaySessions === 1 ? "" : "s"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Weekly goal</span></div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Lower goal" onClick={() => h.setWeeklyGoal(Math.max(1, h.weeklyGoal - 1))}><Minus className="h-3 w-3" /></Button>
                <span className="text-sm font-mono w-14 text-center">{h.weekSessions}/{h.weeklyGoal}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Raise goal" onClick={() => h.setWeeklyGoal(Math.min(14, h.weeklyGoal + 1))}><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
            <Progress value={weekPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {h.streakDays > 0 ? `${h.streakDays}-day streak. Updates instantly when you finish a workout.` : "Finish a workout to start a streak."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
