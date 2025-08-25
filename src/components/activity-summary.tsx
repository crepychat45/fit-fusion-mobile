import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, Heart, Zap } from "lucide-react";

export interface ActivitySummaryProps {
  workoutsCompleted?: number;
  streakDays?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
}

export function ActivitySummary({
  workoutsCompleted = 0,
  streakDays = 0,
  caloriesBurned = 0,
  avgHeartRate = 0,
}: ActivitySummaryProps) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardContent className="grid grid-cols-2 gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary p-2">
            <Dumbbell className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Workouts</p>
            <p className="text-2xl font-bold">{workoutsCompleted}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary p-2">
            <Flame className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Calories</p>
            <p className="text-2xl font-bold">{caloriesBurned}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary p-2">
            <Heart className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Avg. Heart Rate</p>
            <p className="text-2xl font-bold">{avgHeartRate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary p-2">
            <Zap className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Current Streak</p>
            <p className="text-2xl font-bold">{streakDays} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
