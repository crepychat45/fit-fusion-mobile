
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ActivitySummary } from "@/components/activity-summary";
import { userProfile } from "@/data/user";
import { DailyTip } from "@/components/daily-tip";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { TodaysWorkout } from "@/components/dashboard/todays-workout";
import { UpcomingWorkouts } from "@/components/dashboard/upcoming-workouts";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";
import { FitfusionChatSection } from "@/components/dashboard/fitfusion-chat-section";
import { RescheduleDialog } from "@/components/dashboard/reschedule-dialog";

const scheduledWorkouts = [
  {
    id: "1",
    name: "Upper Body",
    time: "07:00 AM",
    day: "Today",
    duration: "45 min"
  },
  {
    id: "2",
    name: "Cardio Session",
    time: "06:30 AM",
    day: "Tomorrow",
    duration: "30 min"
  }
];

const Index = () => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState("07:00 AM");
  
  const openRescheduleDialog = (workout: any) => {
    setSelectedWorkout(workout);
    setShowReschedule(true);
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <WelcomeHeader userName={userProfile.name} />
      
      <div className="px-4 -mt-6 relative z-10">
        <ActivitySummary
          workoutsCompleted={userProfile.stats.workoutsCompleted}
          streakDays={userProfile.stats.streakDays}
          caloriesBurned={userProfile.stats.caloriesBurned}
          avgHeartRate={userProfile.stats.avgHeartRate}
        />
      </div>
      
      <TodaysWorkout 
        workouts={scheduledWorkouts}
        onReschedule={openRescheduleDialog}
      />
      
      <UpcomingWorkouts workouts={scheduledWorkouts} />
      
      <FitfusionChatSection />
      
      <RecentActivitySection />
      
      <div className="px-4 mt-6 mb-20">
        <DailyTip />
      </div>
      
      <RescheduleDialog
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        workout={selectedWorkout}
        scheduledDate={scheduledDate}
        onDateChange={setScheduledDate}
        scheduledTime={scheduledTime}
        onTimeChange={setScheduledTime}
      />
      
      <MobileNav />
    </div>
  );
};

export default Index;
