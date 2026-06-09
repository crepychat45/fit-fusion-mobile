import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Check, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Challenge {
  id: string;
  title: string;
  desc: string;
  target: number;
  unit: string;
  xp: number;
}

const DAILY_POOL: Challenge[] = [
  { id: "steps", title: "Move More", desc: "Hit your daily step goal", target: 8000, unit: "steps", xp: 120 },
  { id: "water", title: "Stay Hydrated", desc: "Drink 8 glasses of water", target: 8, unit: "glasses", xp: 80 },
  { id: "stretch", title: "Stretch Break", desc: "Complete 10 minutes of stretching", target: 10, unit: "min", xp: 60 },
  { id: "burn", title: "Calorie Crusher", desc: "Burn 400 active calories", target: 400, unit: "kcal", xp: 150 },
  { id: "mindful", title: "Mindful Minute", desc: "5 minutes of breathing", target: 5, unit: "min", xp: 50 },
];

const STORAGE_KEY = "fitfusion-daily-challenge";

interface State {
  date: string;
  challengeId: string;
  progress: number;
  claimed: boolean;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const pickChallenge = (): Challenge => {
  const day = new Date().getDate();
  return DAILY_POOL[day % DAILY_POOL.length];
};

export const DailyChallengeWidget: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") {
      return { date: todayKey(), challengeId: pickChallenge().id, progress: 0, claimed: false };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed.date === todayKey()) return parsed;
      }
    } catch {}
    return { date: todayKey(), challengeId: pickChallenge().id, progress: 0, claimed: false };
  });

  const challenge = DAILY_POOL.find((c) => c.id === state.challengeId) ?? DAILY_POOL[0];
  const pct = Math.min(100, Math.round((state.progress / challenge.target) * 100));
  const completed = state.progress >= challenge.target;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const logProgress = () => {
    if (completed) return;
    const next = Math.min(challenge.target, state.progress + Math.ceil(challenge.target / 4));
    setState((s) => ({ ...s, progress: next }));
    if (next >= challenge.target) {
      toast({ title: "🎉 Challenge Complete!", description: `Tap claim to grab your ${challenge.xp} XP.` });
    }
  };

  const claim = () => {
    if (!completed || state.claimed) return;
    setState((s) => ({ ...s, claimed: true }));
    toast({ title: `+${challenge.xp} XP earned`, description: "Streak boosted • Check back tomorrow." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 backdrop-blur-xl shadow-lg p-4 overflow-hidden relative"
    >
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/15 rounded-xl">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Daily Challenge</h3>
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">+{challenge.xp} XP</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{challenge.title} — resets at midnight</p>
          </div>
          {state.claimed && (
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
              <Check className="h-3 w-3 mr-1" />Claimed
            </Badge>
          )}
        </div>

        <p className="text-sm text-foreground/90 mb-2">{challenge.desc}</p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>{state.progress.toLocaleString()} / {challenge.target.toLocaleString()} {challenge.unit}</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-primary to-accent-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 rounded-xl border-border/30 text-xs"
            onClick={logProgress}
            disabled={completed}
          >
            <Flame className="h-3.5 w-3.5 mr-1" />
            {completed ? "Complete" : "Log Progress"}
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            onClick={claim}
            disabled={!completed || state.claimed}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {state.claimed ? "Claimed" : "Claim XP"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallengeWidget;
