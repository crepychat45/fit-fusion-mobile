import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Award, Flame, HeartPulse, Ruler, Share2, Target, Timer, TrendingUp, UserRound,
} from "lucide-react";

const KEY = "fitfusion-profile-power";

interface ProfilePower {
  heightCm: number;
  weightKg: number;
  restingHr: number;
  weeklyGoal: number;
  bio: string;
  publicCard: boolean;
  showStreak: boolean;
  motivation: string;
}

const DEFAULTS: ProfilePower = {
  heightCm: 175,
  weightKg: 72,
  restingHr: 62,
  weeklyGoal: 4,
  bio: "",
  publicCard: false,
  showStreak: true,
  motivation: "Consistency beats intensity.",
};

function read(): ProfilePower {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Profile power tools: body metrics, live BMI/BMR, goals and sharing. */
export function ProfilePowerExtras() {
  const { toast } = useToast();
  const [s, setS] = useState<ProfilePower>(read);

  const set = useCallback((patch: Partial<ProfilePower>) => {
    setS((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setS(read());
    window.addEventListener("fitfusion-settings-hydrated", sync);
    return () => window.removeEventListener("fitfusion-settings-hydrated", sync);
  }, []);

  const bmi = useMemo(() => {
    const m = s.heightCm / 100;
    return m > 0 ? Math.round((s.weightKg / (m * m)) * 10) / 10 : 0;
  }, [s.heightCm, s.weightKg]);

  const bmiLabel =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "High";

  // Mifflin-St Jeor (neutral baseline, age 30)
  const bmr = Math.round(10 * s.weightKg + 6.25 * s.heightCm - 5 * 30 + 5);
  const maxHr = 190;
  const zone2 = `${Math.round((maxHr - s.restingHr) * 0.6 + s.restingHr)}–${Math.round((maxHr - s.restingHr) * 0.7 + s.restingHr)}`;

  const share = async () => {
    const text = `My FitxFusion profile — BMI ${bmi} (${bmiLabel}), goal ${s.weeklyGoal} workouts/week. ${s.motivation}`;
    try {
      if (navigator.share) await navigator.share({ title: "FitxFusion", text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4 text-primary" />
            Body Metrics Studio
            <Badge variant="outline" className="ml-auto text-[10px]">Live</Badge>
          </CardTitle>
          <CardDescription>Height, weight and resting heart rate drive every calculation below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Height</Label>
              <span className="text-muted-foreground">{s.heightCm} cm</span>
            </div>
            <Slider value={[s.heightCm]} min={120} max={220} step={1} onValueChange={(v) => set({ heightCm: v[0] ?? 175 })} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Weight</Label>
              <span className="text-muted-foreground">{s.weightKg} kg</span>
            </div>
            <Slider value={[s.weightKg]} min={35} max={180} step={1} onValueChange={(v) => set({ weightKg: v[0] ?? 72 })} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Resting heart rate</Label>
              <span className="text-muted-foreground">{s.restingHr} bpm</span>
            </div>
            <Slider value={[s.restingHr]} min={38} max={100} step={1} onValueChange={(v) => set({ restingHr: v[0] ?? 62 })} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: TrendingUp, label: "BMI", value: `${bmi}`, sub: bmiLabel },
              { icon: Flame, label: "BMR", value: `${bmr}`, sub: "kcal/day" },
              { icon: HeartPulse, label: "Zone 2", value: zone2, sub: "bpm" },
              { icon: Timer, label: "Weekly goal", value: `${s.weeklyGoal}×`, sub: "sessions" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
                <m.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-semibold">{m.value}</div>
                <div className="text-[10px] text-muted-foreground">{m.label} · {m.sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" /> Goals & Identity
          </CardTitle>
          <CardDescription>Set your weekly target and how your profile appears to others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Workouts per week</Label>
              <span className="text-muted-foreground">{s.weeklyGoal}</span>
            </div>
            <Slider value={[s.weeklyGoal]} min={1} max={14} step={1} onValueChange={(v) => set({ weeklyGoal: v[0] ?? 4 })} />
            <Progress value={(s.weeklyGoal / 14) * 100} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Short bio</Label>
            <Textarea
              value={s.bio}
              maxLength={240}
              placeholder="Marathon in training. Early mornings only."
              onChange={(e) => set({ bio: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">{s.bio.length}/240</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Motivation line</Label>
            <Input value={s.motivation} onChange={(e) => set({ motivation: e.target.value })} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Public fitness card</Label>
                <p className="text-xs text-muted-foreground">Allow a shareable summary of your stats.</p>
              </div>
            </div>
            <Switch checked={s.publicCard} onCheckedChange={(v) => set({ publicCard: v })} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-start gap-3">
              <Award className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Show streak publicly</Label>
                <p className="text-xs text-muted-foreground">Display your active streak on shared cards.</p>
              </div>
            </div>
            <Switch checked={s.showStreak} onCheckedChange={(v) => set({ showStreak: v })} />
          </div>

          <Button variant="outline" className="w-full" onClick={() => void share()}>
            <Share2 className="mr-2 h-4 w-4" /> Share my profile summary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePowerExtras;
