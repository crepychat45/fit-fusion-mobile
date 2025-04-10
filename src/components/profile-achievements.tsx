
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Dumbbell, Trophy, TrendingUp } from "lucide-react";

export interface Achievement {
  icon: React.ElementType;
  title: string;
  description: string;
  earned: boolean;
}

const achievements: Achievement[] = [
  {
    icon: Trophy,
    title: "Workout Warrior",
    description: "Complete 20 workouts",
    earned: true
  },
  {
    icon: Dumbbell,
    title: "Strength Master",
    description: "Lift 1000kg total in a single week",
    earned: true
  },
  {
    icon: TrendingUp,
    title: "Consistent Athlete",
    description: "Work out 5 days in a row",
    earned: true
  },
  {
    icon: Award,
    title: "Fitness Enthusiast",
    description: "Try all workout categories",
    earned: false
  }
];

export function ProfileAchievements() {
  return (
    <div>
      <h3 className="font-medium mb-2">Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, index) => (
          <Card 
            key={index} 
            className={`${achievement.earned ? "border-primary/30" : "border-muted/50 opacity-70"}`}
          >
            <CardContent className="p-3 flex flex-col items-center text-center">
              <div className={`rounded-full p-2 mb-2 ${achievement.earned ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted-foreground"}`}>
                <achievement.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-medium">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
