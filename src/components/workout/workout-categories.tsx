import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Dumbbell, Heart, Wind, Flame, Trophy, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { workouts } from "@/data/workouts";

const CATEGORIES = [
  { key: "strength", label: "Strength", icon: Dumbbell, color: "from-blue-500 to-indigo-600" },
  { key: "cardio", label: "Cardio", icon: Heart, color: "from-pink-500 to-red-600" },
  { key: "hiit", label: "HIIT", icon: Flame, color: "from-orange-500 to-red-500" },
  { key: "flexibility", label: "Mobility", icon: Wind, color: "from-emerald-500 to-teal-600" },
];

export function WorkoutCategories({ onSelect }: { onSelect?: (cat: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CATEGORIES.map((c, i) => {
        const count = workouts.filter((w) => w.category === c.key).length;
        return (
          <motion.button
            key={c.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect?.(c.key)}
            className="text-left"
          >
            <Card className="border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden">
              <CardContent className="p-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-[10px] text-muted-foreground">{count} workouts</div>
              </CardContent>
            </Card>
          </motion.button>
        );
      })}
    </div>
  );
}
