
import React from "react";
import { QuickActionsPanel } from "./quick-actions-panel";
import { HealthMetricsPanel } from "./health-metrics-panel";
import { AchievementNotifications } from "./achievement-notifications";
import { WeatherWidget } from "./weather-widget";
import { MotivationalQuotes } from "./motivational-quotes";
import { EnhancedNotifications } from "./enhanced-notifications";
import { TodaysWorkout } from "./todays-workout";
import { UpcomingWorkouts } from "./upcoming-workouts";

export function AdvancedDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TodaysWorkout />
        </div>
        <div>
          <QuickActionsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <UpcomingWorkouts />
          <EnhancedNotifications /> {/* Added EnhancedNotifications component */}
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
