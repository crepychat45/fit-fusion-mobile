import React from "react";
import { QuickActionsPanel } from "./quick-actions-panel";
import { HealthMetricsPanel } from "./health-metrics-panel";
import { AchievementNotifications } from "./achievement-notifications";
import { WeatherWidget } from "./weather-widget";
import { MotivationalQuotes } from "./motivational-quotes";
import { EnhancedNotifications } from "./enhanced-notifications";
import { TodaysWorkout } from "./todays-workout";
import { UpcomingWorkouts } from "./upcoming-workouts";

const scheduledWorkouts = [
  {
    id: "1",
    name: "AI-Powered HIIT",
    time: "07:00 AM",
    day: "Today",
    duration: "45 min",
  },
  {
    id: "2",
    name: "Smart Strength Training",
    time: "06:30 AM",
    day: "Tomorrow",
    duration: "50 min",
  },
];

export function AdvancedDashboard() {
  const handleReschedule = (workout: any) => {
    console.log("Rescheduling workout:", workout);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TodaysWorkout
            workouts={scheduledWorkouts}
            onReschedule={handleReschedule}
          />
        </div>
        <div>
          <QuickActionsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <UpcomingWorkouts workouts={scheduledWorkouts} />
          <EnhancedNotifications />
          <HealthMetricsPanel />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <AchievementNotifications />
          <MotivationalQuotes />
        </div>
      </div>
    </div>
  );
}
