import React from "react";
import { Dumbbell, Calendar, Flame, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UserStatsProps {
  workoutsCompleted?: number;
  streakDays?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
}

// Creating a simplified ActivityCard component specifically for UserStats
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-secondary p-1.5 text-secondary-foreground">
            {icon}
          </div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export function UserStats({
  workoutsCompleted = 0,
  streakDays = 0,
  caloriesBurned = 0,
  avgHeartRate = 0,
}: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Workouts"
        value={workoutsCompleted}
        subtitle="Total completed"
        icon={<Dumbbell className="h-4 w-4" />}
      />

      <StatCard
        title="Streak"
        value={streakDays}
        subtitle="Days in a row"
        icon={<Calendar className="h-4 w-4" />}
      />

      <StatCard
        title="Calories"
        value={caloriesBurned}
        subtitle="Burned this week"
        icon={<Flame className="h-4 w-4" />}
      />

      <StatCard
        title="Heart Rate"
        value={avgHeartRate}
        subtitle="Avg. BPM"
        icon={<Heart className="h-4 w-4" />}
      />
    </div>
  );
}
