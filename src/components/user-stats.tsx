
import React from "react";
import { Dumbbell, Calendar, Flame, Heart } from "lucide-react";
import { ActivityCard } from "@/components/activity-card";

interface UserStatsProps {
  workoutsCompleted?: number;
  streakDays?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
}

export function UserStats({ 
  workoutsCompleted = 0, 
  streakDays = 0, 
  caloriesBurned = 0, 
  avgHeartRate = 0 
}: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ActivityCard
        title="Workouts"
        value={workoutsCompleted}
        subtitle="Total completed"
        icon={<Dumbbell className="h-4 w-4" />}
      />
      
      <ActivityCard
        title="Streak"
        value={streakDays}
        subtitle="Days in a row"
        icon={<Calendar className="h-4 w-4" />}
      />
      
      <ActivityCard
        title="Calories"
        value={caloriesBurned}
        subtitle="Burned this week"
        icon={<Flame className="h-4 w-4" />}
      />
      
      <ActivityCard
        title="Heart Rate"
        value={avgHeartRate}
        subtitle="Avg. BPM"
        icon={<Heart className="h-4 w-4" />}
      />
    </div>
  );
}
