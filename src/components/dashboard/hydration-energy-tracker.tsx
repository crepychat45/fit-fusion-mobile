import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Droplets, Zap, Plus, Minus } from "lucide-react";

export function HydrationEnergyTracker() {
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem("fitfusion-hydration");
    return saved ? JSON.parse(saved).glasses || 3 : 3;
  });
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem("fitfusion-energy");
    return saved ? JSON.parse(saved).level || 72 : 72;
  });

  const waterGoal = 8;
  const waterPercent = Math.min((water / waterGoal) * 100, 100);

  const addWater = () => {
    const next = Math.min(water + 1, 12);
    setWater(next);
    localStorage.setItem("fitfusion-hydration", JSON.stringify({ glasses: next, date: new Date().toDateString() }));
  };

  const removeWater = () => {
    const next = Math.max(water - 1, 0);
    setWater(next);
    localStorage.setItem("fitfusion-hydration", JSON.stringify({ glasses: next, date: new Date().toDateString() }));
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-cyan-500" />
          Hydration & Energy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Hydration */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-24 h-32 rounded-xl border-2 border-cyan-500/30 overflow-hidden bg-cyan-950/20">
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-500 to-cyan-400/70"
                animate={{ height: `${waterPercent}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
              {/* Bubbles */}
              {waterPercent > 10 && (
                <>
                  <motion.div animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/30" />
                  <motion.div animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-6 right-5 w-1.5 h-1.5 rounded-full bg-white/20" />
                </>
              )}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-lg font-bold text-white drop-shadow-lg">{water}/{waterGoal}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={removeWater}><Minus className="h-3 w-3" /></Button>
              <span className="text-xs text-muted-foreground">glasses</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={addWater}><Plus className="h-3 w-3" /></Button>
            </div>
          </div>

          {/* Energy */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-32 rounded-xl border-2 border-yellow-500/30 overflow-hidden bg-yellow-950/20">
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-yellow-500 to-orange-400/70"
                animate={{ height: `${energy}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
              {/* Spark effects */}
              {energy > 50 && (
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  <Zap className="h-5 w-5 text-yellow-300 drop-shadow-lg" />
                </motion.div>
              )}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-lg font-bold text-white drop-shadow-lg">{energy}%</span>
              </div>
            </div>
            <Badge variant="outline" className="mt-2 text-xs">
              {energy >= 80 ? "🔥 High Energy" : energy >= 50 ? "⚡ Normal" : "😴 Low"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
