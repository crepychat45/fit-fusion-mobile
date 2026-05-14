import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, Flame, Heart, Zap, Target } from "lucide-react";

interface AdaptiveData {
  caloriesBurned: number;
  avgHeartRate: number;
  difficulty: "easy" | "moderate" | "intense" | "extreme";
  recommendation: string;
  adjustmentPercent: number;
  nextDifficulty: string;
}

const getAdaptiveData = (): AdaptiveData => {
  const saved = localStorage.getItem("fitfusion-last-session");
  const defaults = { calories: 280, heartRate: 128 };
  let calories = defaults.calories;
  let heartRate = defaults.heartRate;

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      calories = parsed.caloriesBurned || defaults.calories;
      heartRate = parsed.avgHeartRate || defaults.heartRate;
    } catch { /* use defaults */ }
  }

  // Logic: high calories + high HR = was intense, reduce next; low = increase
  const intensity = (calories / 300) * 0.6 + (heartRate / 150) * 0.4;
  
  if (intensity > 1.1) {
    return {
      caloriesBurned: calories, avgHeartRate: heartRate,
      difficulty: "extreme",
      recommendation: "Great effort yesterday! Tomorrow's workout will dial back intensity for active recovery.",
      adjustmentPercent: -15,
      nextDifficulty: "Moderate Recovery",
    };
  } else if (intensity > 0.85) {
    return {
      caloriesBurned: calories, avgHeartRate: heartRate,
      difficulty: "intense",
      recommendation: "Strong session! We'll maintain this level with slight progressive overload.",
      adjustmentPercent: 5,
      nextDifficulty: "Progressive Build",
    };
  } else if (intensity > 0.6) {
    return {
      caloriesBurned: calories, avgHeartRate: heartRate,
      difficulty: "moderate",
      recommendation: "Solid workout. Tomorrow we'll push a bit harder to keep your progress on track.",
      adjustmentPercent: 10,
      nextDifficulty: "Intensity Boost",
    };
  } else {
    return {
      caloriesBurned: calories, avgHeartRate: heartRate,
      difficulty: "easy",
      recommendation: "Light day detected. Tomorrow's plan will ramp up to maximize your potential.",
      adjustmentPercent: 20,
      nextDifficulty: "Challenge Mode",
    };
  }
};

export function AdaptiveWorkoutEngine() {
  const [data, setData] = useState<AdaptiveData | null>(null);

  useEffect(() => {
    setData(getAdaptiveData());
  }, []);

  if (!data) return null;

  const difficultyColors = {
    easy: "text-green-500",
    moderate: "text-yellow-500",
    intense: "text-orange-500",
    extreme: "text-red-500",
  };

  const AdjustIcon = data.adjustmentPercent > 0 ? TrendingUp : data.adjustmentPercent < 0 ? TrendingDown : Minus;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
            <Brain className="h-5 w-5 text-primary" />
          </motion.div>
          AI Adaptive Engine
          <Badge variant="secondary" className="ml-auto text-xs">Auto-Adjust</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yesterday's metrics */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Calories Burned</span>
            </div>
            <p className="text-xl font-bold">{data.caloriesBurned}</p>
          </motion.div>
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Avg Heart Rate</span>
            </div>
            <p className="text-xl font-bold">{data.avgHeartRate} <span className="text-xs font-normal">bpm</span></p>
          </motion.div>
        </div>

        {/* Adjustment */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Tomorrow's Plan</span>
            </div>
            <Badge className={`${data.adjustmentPercent > 0 ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"} border-0`}>
              <AdjustIcon className="h-3 w-3 mr-1" />
              {data.adjustmentPercent > 0 ? "+" : ""}{data.adjustmentPercent}%
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-sm">{data.nextDifficulty}</span>
          </div>
          <p className="text-xs text-muted-foreground">{data.recommendation}</p>
        </motion.div>

        {/* Intensity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Session Intensity</span>
            <span className={`font-semibold ${difficultyColors[data.difficulty]}`}>{data.difficulty}</span>
          </div>
          <Progress value={data.difficulty === "easy" ? 25 : data.difficulty === "moderate" ? 50 : data.difficulty === "intense" ? 75 : 95} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
