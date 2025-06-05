
import React, { useState, useEffect } from "react";
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
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { HealthMetricsPanel } from "@/components/dashboard/health-metrics-panel";
import { AchievementNotifications } from "@/components/dashboard/achievement-notifications";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { MotivationalQuotes } from "@/components/dashboard/motivational-quotes";
import { WatchPanel } from "@/components/dashboard/watch-panel";
import { EnhancedNotifications } from "@/components/dashboard/enhanced-notifications";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Shield, Zap, Target, Brain, Heart, Activity } from "lucide-react";

const scheduledWorkouts = [
  {
    id: "1",
    name: "AI-Powered HIIT",
    time: "07:00 AM",
    day: "Today",
    duration: "45 min",
    difficulty: "Intermediate",
    calories: 380
  },
  {
    id: "2",
    name: "Smart Strength Training",
    time: "06:30 AM",
    day: "Tomorrow",
    duration: "50 min",
    difficulty: "Advanced",
    calories: 420
  }
];

const Index = () => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState("07:00 AM");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowAdvancedFeatures(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const openRescheduleDialog = (workout: any) => {
    setSelectedWorkout(workout);
    setShowReschedule(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-16">
      <WelcomeHeader userName={userProfile.name} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Enhanced Activity Summary */}
        <motion.div variants={itemVariants} className="px-4 -mt-6 relative z-10">
          <ActivitySummary
            workoutsCompleted={userProfile.stats.workoutsCompleted}
            streakDays={userProfile.stats.streakDays}
            caloriesBurned={userProfile.stats.caloriesBurned}
            avgHeartRate={userProfile.stats.avgHeartRate}
          />
        </motion.div>

        {/* AI-Powered Features Banner */}
        <AnimatePresence>
          {showAdvancedFeatures && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4"
            >
              <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 overflow-hidden">
                <CardContent className="p-4 text-white relative">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5" />
                      <Badge className="bg-white/20 text-white border-white/30">
                        AI POWERED
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Next-Gen Fitness Experience</h3>
                    <p className="text-white/90 text-sm mb-3">
                      Advanced AI coaching, real-time biometrics, and personalized nutrition
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        <span>AI Coach</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>Biometric Sync</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Predictive Analytics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Privacy First</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watch Panel - Enhanced */}
        <motion.div variants={itemVariants} className="px-4">
          <WatchPanel />
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={itemVariants}>
          <QuickActionsPanel />
        </motion.div>

        {/* Enhanced Today's Workout */}
        <motion.div variants={itemVariants}>
          <TodaysWorkout 
            workouts={scheduledWorkouts}
            onReschedule={openRescheduleDialog}
          />
        </motion.div>

        {/* Health Metrics & Weather Side by Side */}
        <motion.div variants={itemVariants} className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HealthMetricsPanel />
            <WeatherWidget />
          </div>
        </motion.div>

        {/* Enhanced Notifications */}
        <motion.div variants={itemVariants} className="px-4">
          <EnhancedNotifications />
        </motion.div>

        {/* Achievement & Motivation Combined */}
        <motion.div variants={itemVariants} className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementNotifications />
            <MotivationalQuotes />
          </div>
        </motion.div>

        {/* Upcoming Workouts */}
        <motion.div variants={itemVariants}>
          <UpcomingWorkouts workouts={scheduledWorkouts} />
        </motion.div>

        {/* Enhanced Chat Section */}
        <motion.div variants={itemVariants}>
          <FitfusionChatSection />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <RecentActivitySection />
        </motion.div>

        {/* Daily Tip */}
        <motion.div variants={itemVariants} className="px-4 mt-6 mb-20">
          <DailyTip />
        </motion.div>
      </motion.div>
      
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
