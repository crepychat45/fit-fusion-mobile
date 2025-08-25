import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { MobileFloatingActions } from "@/components/mobile/mobile-floating-actions";
import { MobileAIAssistant } from "@/components/mobile/mobile-ai-assistant";
import { MobileSecurityCenter } from "@/components/mobile/mobile-security-center";
import { MobileDeviceDetector } from "@/components/mobile/mobile-device-detector";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivitySummary } from "@/components/activity-summary";
import { userProfile } from "@/data/user";
import { DailyTip } from "@/components/daily-tip";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { EnhancedSmartwatchHub } from "@/components/dashboard/enhanced-smartwatch-hub";
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
import {
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Brain,
  Heart,
  Activity,
} from "lucide-react";
import { ErrorFixManager } from "@/components/error-fix-manager";

const scheduledWorkouts = [
  {
    id: "1",
    name: "AI-Powered HIIT",
    time: "07:00 AM",
    day: "Today",
    duration: "45 min",
    difficulty: "Intermediate",
    calories: 380,
  },
  {
    id: "2",
    name: "Smart Strength Training",
    time: "06:30 AM",
    day: "Tomorrow",
    duration: "50 min",
    difficulty: "Advanced",
    calories: 420,
  },
];

const Index = () => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    new Date(),
  );
  const [scheduledTime, setScheduledTime] = useState("07:00 AM");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showMobileAI, setShowMobileAI] = useState(false);
  const [showMobileSecurity, setShowMobileSecurity] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowAdvancedFeatures(true);
    }, 1000);

    // Listen for profile updates
    const handleProfileUpdate = () => {
      // Force re-render of profile components
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const openRescheduleDialog = (workout: any) => {
    setSelectedWorkout(workout);
    setShowReschedule(true);
  };

  const handleQuickWorkout = () => {
    // Use React Router for navigation instead of window.location
    const event = new CustomEvent("navigate", {
      detail: "/workouts?quick=true",
    });
    window.dispatchEvent(event);
  };

  const handleVoiceCommand = () => {
    if (isMobile) {
      setShowMobileAI(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-16 relative overflow-hidden">
      {/* Background animations */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"
        />
      </div>

      <WelcomeHeader userName={userProfile.name} showCompactProfile={true} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 relative z-10"
      >
        {/* Enhanced Activity Summary with better animations */}
        <motion.div
          variants={itemVariants}
          className="px-4 -mt-6 relative z-10"
          whileHover={{ scale: 1.01 }}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="hover-lift"
          >
            <ActivitySummary
              workoutsCompleted={userProfile.stats.workoutsCompleted}
              streakDays={userProfile.stats.streakDays}
              caloriesBurned={userProfile.stats.caloriesBurned}
              avgHeartRate={userProfile.stats.avgHeartRate}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced AI-Powered Features Banner */}
        <AnimatePresence>
          {showAdvancedFeatures && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
              className="px-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, rotate: [0, 1, 0] }}
                className="hover-glow"
              >
                <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 overflow-hidden relative">
                  <motion.div
                    animate={{
                      background: [
                        "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                        "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))",
                        "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
                      ],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0"
                  />
                  <CardContent className="p-4 text-white relative z-10">
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Brain className="h-5 w-5" />
                        </motion.div>
                        <Badge className="bg-white/20 text-white border-white/30 animate-pulse">
                          AI POWERED
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold mb-1">
                        Next-Gen Fitness Experience
                      </h3>
                      <p className="text-white/90 text-sm mb-3">
                        Advanced AI coaching, real-time biometrics, and
                        personalized nutrition
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, staggerChildren: 0.1 }}
                        className="grid grid-cols-2 gap-2 text-xs"
                      >
                        {[
                          { icon: Brain, label: "AI Coach" },
                          { icon: Heart, label: "Biometric Sync" },
                          { icon: TrendingUp, label: "Predictive Analytics" },
                          { icon: Shield, label: "Privacy First" },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="flex items-center gap-1"
                          >
                            <item.icon className="h-3 w-3" />
                            <span>{item.label}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Smartwatch Hub */}
        <motion.div
          variants={itemVariants}
          className="px-4"
          whileHover={{ y: -2 }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hover-lift"
          >
            <EnhancedSmartwatchHub />
          </motion.div>
        </motion.div>

        {/* Enhanced Quick Actions Panel */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
          <QuickActionsPanel />
        </motion.div>

        {/* Enhanced Today's Workout */}
        <motion.div variants={itemVariants} className="hover-lift">
          <TodaysWorkout
            workouts={scheduledWorkouts}
            onReschedule={openRescheduleDialog}
          />
        </motion.div>

        {/* Health Metrics & Weather Side by Side with staggered animation */}
        <motion.div variants={itemVariants} className="px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hover-lift"
            >
              <HealthMetricsPanel />
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hover-lift"
            >
              <WeatherWidget />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Notifications with glow effect */}
        <motion.div variants={itemVariants} className="px-4">
          <motion.div whileHover={{ scale: 1.01 }} className="hover-glow">
            <EnhancedNotifications />
          </motion.div>
        </motion.div>

        {/* Achievement & Motivation Combined with bounce animation */}
        <motion.div variants={itemVariants} className="px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="hover-scale"
            >
              <AchievementNotifications />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              className="hover-scale"
            >
              <MotivationalQuotes />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Upcoming Workouts */}
        <motion.div variants={itemVariants} className="hover-lift">
          <UpcomingWorkouts workouts={scheduledWorkouts} />
        </motion.div>

        {/* Enhanced Chat Section with special effects */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }}>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(139, 92, 246, 0.1)",
                "0 0 30px rgba(139, 92, 246, 0.2)",
                "0 0 20px rgba(139, 92, 246, 0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FitfusionChatSection />
          </motion.div>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div variants={itemVariants} className="hover-lift">
          <RecentActivitySection />
        </motion.div>

        {/* Enhanced Daily Tip with floating animation */}
        <motion.div variants={itemVariants} className="px-4 mt-6 mb-20">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.02 }}
            className="hover-glow"
          >
            <DailyTip />
          </motion.div>
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

      {/* Mobile Device Detector */}
      <MobileDeviceDetector />

      {/* Mobile Features */}
      {isMobile && (
        <>
          <MobileFloatingActions
            onAIAssistant={() => setShowMobileAI(true)}
            onSecurity={() => setShowMobileSecurity(true)}
            onVoiceCommand={handleVoiceCommand}
            onQuickWorkout={handleQuickWorkout}
          />

          <MobileAIAssistant
            isOpen={showMobileAI}
            onClose={() => setShowMobileAI(false)}
          />

          <MobileSecurityCenter
            isOpen={showMobileSecurity}
            onClose={() => setShowMobileSecurity(false)}
          />
        </>
      )}

      {/* Error Fix Manager for debugging */}
      {process.env.NODE_ENV === "development" && <ErrorFixManager />}

      <MobileNav />
    </div>
  );
};

export default Index;
