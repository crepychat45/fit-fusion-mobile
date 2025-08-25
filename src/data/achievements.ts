import {
  Award,
  Dumbbell,
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Clock,
} from "lucide-react";

export interface Achievement {
  icon: React.ElementType;
  title: string;
  description: string;
  earned: boolean;
}

export const achievements: Achievement[] = [
  {
    icon: Trophy,
    title: "Workout Warrior",
    description: "Complete 20 workouts",
    earned: true,
  },
  {
    icon: Dumbbell,
    title: "Strength Master",
    description: "Lift 1000kg total in a single week",
    earned: true,
  },
  {
    icon: TrendingUp,
    title: "Consistent Athlete",
    description: "Work out 5 days in a row",
    earned: true,
  },
  {
    icon: Award,
    title: "Fitness Enthusiast",
    description: "Try all workout categories",
    earned: false,
  },
  {
    icon: Flame,
    title: "Calorie Crusher",
    description: "Burn 5000 calories in a month",
    earned: false,
  },
  {
    icon: Target,
    title: "Goal Getter",
    description: "Reach your first fitness goal",
    earned: true,
  },
  {
    icon: Clock,
    title: "Dedicated Member",
    description: "Use the app for 30 days straight",
    earned: false,
  },
];
