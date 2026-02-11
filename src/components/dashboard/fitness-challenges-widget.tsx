import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Users, Timer, Flame, Target, ChevronRight, Zap } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "community";
  progress: number;
  goal: number;
  unit: string;
  participants: number;
  reward: string;
  endsIn: string;
  icon: React.ElementType;
}

const challenges: Challenge[] = [
  { id: "1", title: "10K Steps Challenge", description: "Walk 10,000 steps today", type: "daily", progress: 7200, goal: 10000, unit: "steps", participants: 1420, reward: "50 XP", endsIn: "8h left", icon: Target },
  { id: "2", title: "Burn 500 Cal", description: "Burn 500 calories through exercise", type: "daily", progress: 324, goal: 500, unit: "cal", participants: 890, reward: "75 XP", endsIn: "8h left", icon: Flame },
  { id: "3", title: "Weekly Warrior", description: "Complete 5 workouts this week", type: "weekly", progress: 3, goal: 5, unit: "workouts", participants: 2340, reward: "200 XP", endsIn: "3d left", icon: Zap },
  { id: "4", title: "Community Push-Up", description: "Team goal: 100,000 push-ups", type: "community", progress: 78500, goal: 100000, unit: "push-ups", participants: 5200, reward: "Badge", endsIn: "5d left", icon: Users },
];

export function FitnessChallengesWidget() {
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set(["1", "3"]));

  const handleJoin = (id: string) => {
    setJoinedChallenges(prev => new Set([...prev, id]));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "weekly": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "community": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "";
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Active Challenges</h3>
              <p className="text-xs text-muted-foreground font-normal">Compete & earn rewards</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{joinedChallenges.size} Joined</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`p-3 transition-all hover:shadow-md ${joinedChallenges.has(challenge.id) ? "border-primary/30" : "border-dashed"}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <challenge.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm truncate">{challenge.title}</span>
                    <Badge className={`text-[10px] px-1.5 ${getTypeColor(challenge.type)}`}>{challenge.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  {joinedChallenges.has(challenge.id) && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{challenge.progress.toLocaleString()} / {challenge.goal.toLocaleString()} {challenge.unit}</span>
                        <span className="font-medium">{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.goal) * 100} className="h-1.5" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{challenge.participants.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{challenge.endsIn}</span>
                    <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{challenge.reward}</span>
                  </div>
                </div>
                {!joinedChallenges.has(challenge.id) ? (
                  <Button size="sm" onClick={() => handleJoin(challenge.id)}>Join</Button>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-300">Joined</Badge>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
