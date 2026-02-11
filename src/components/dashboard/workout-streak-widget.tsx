import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const completedDays = [true, true, true, false, true, true, false]; // This week

export function WorkoutStreakWidget() {
  const streakDays = 12;
  const bestStreak = 21;
  const thisWeekCompleted = completedDays.filter(Boolean).length;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Workout Streak</h3>
              <p className="text-xs text-muted-foreground font-normal">Keep the fire going!</p>
            </div>
          </div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-3">
              🔥 {streakDays}
            </Badge>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly calendar */}
        <div className="flex justify-between">
          {weekDays.map((day, i) => (
            <motion.div
              key={day}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] text-muted-foreground">{day}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                completedDays[i]
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                  : i === new Date().getDay() - 1
                    ? "border-2 border-dashed border-orange-400 text-muted-foreground"
                    : "bg-muted text-muted-foreground"
              }`}>
                {completedDays[i] ? "✓" : i + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: "Current", value: `${streakDays} days`, color: "text-orange-500" },
            { icon: Trophy, label: "Best", value: `${bestStreak} days`, color: "text-yellow-500" },
            { icon: Calendar, label: "This Week", value: `${thisWeekCompleted}/7`, color: "text-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/50">
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-bold text-sm">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
