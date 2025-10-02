import React, { useState, useEffect, lazy, Suspense } from "react";
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
import { RescheduleDialog } from "@/components/dashboard/reschedule-dialog";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { LazySection, PlaceholderSection } from "@/components/lazy-section";
import { SimpleFade } from "@/components/optimized-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard, LiquidGlass } from "@/components/enhanced-liquid-glass";
import { motionCSS } from "@/config/motion";
import {
  Brain,
  Heart,
  TrendingUp,
  Shield,
} from "lucide-react";

// Lazy load heavy components that aren't immediately visible
const UpcomingWorkouts = lazy(() => import("@/components/dashboard/upcoming-workouts").then(m => ({ default: m.UpcomingWorkouts })));
const RecentActivitySection = lazy(() => import("@/components/dashboard/recent-activity-section").then(m => ({ default: m.RecentActivitySection })));
const FitfusionChatSection = lazy(() => import("@/components/dashboard/fitfusion-chat-section").then(m => ({ default: m.FitfusionChatSection })));
const HealthMetricsPanel = lazy(() => import("@/components/dashboard/health-metrics-panel").then(m => ({ default: m.HealthMetricsPanel })));
const WeatherWidget = lazy(() => import("@/components/dashboard/weather-widget").then(m => ({ default: m.WeatherWidget })));
const AchievementNotifications = lazy(() => import("@/components/dashboard/achievement-notifications").then(m => ({ default: m.AchievementNotifications })));
const MotivationalQuotes = lazy(() => import("@/components/dashboard/motivational-quotes").then(m => ({ default: m.MotivationalQuotes })));
const EnhancedNotifications = lazy(() => import("@/components/dashboard/enhanced-notifications").then(m => ({ default: m.EnhancedNotifications })));
const EnhancedHomeFeatures = lazy(() => import("@/components/enhanced-home-features").then(m => ({ default: m.EnhancedHomeFeatures })));
const ErrorFixManager = lazy(() => import("@/components/error-fix-manager").then(m => ({ default: m.ErrorFixManager })));

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
      {/* Simplified background - GPU accelerated */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={motionCSS}
      >
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ ...motionCSS, position: 'absolute', inset: 0 }}
        />
      </div>

      <WelcomeHeader userName={userProfile.name} showCompactProfile={true} />

      <div className="space-y-6 relative z-10">
        {/* Activity Summary - Always visible, no animation wrapper */}
        <div className="px-4 -mt-6 relative z-10">
          <LiquidGlass variant="strong" ripple animated className="rounded-xl overflow-hidden">
            <ActivitySummary
              workoutsCompleted={userProfile.stats.workoutsCompleted}
              streakDays={userProfile.stats.streakDays}
              caloriesBurned={userProfile.stats.caloriesBurned}
              avgHeartRate={userProfile.stats.avgHeartRate}
            />
          </LiquidGlass>
        </div>

        {/* AI Banner - Conditional render with simplified animation */}
        <AnimatePresence>
          {showAdvancedFeatures && (
            <SimpleFade className="px-4">
              <LiquidGlass variant="strong" ripple animated className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 overflow-hidden relative rounded-xl">
                <div className="p-4 text-white relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5" />
                    <Badge className="bg-white/20 text-white border-white/30">AI POWERED</Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-1">Next-Gen Fitness Experience</h3>
                  <p className="text-white/90 text-sm mb-3">
                    Advanced AI coaching, real-time biometrics, and personalized nutrition
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { icon: Brain, label: "AI Coach" },
                      { icon: Heart, label: "Biometric Sync" },
                      { icon: TrendingUp, label: "Predictive Analytics" },
                      { icon: Shield, label: "Privacy First" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-1">
                        <item.icon className="h-3 w-3" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlass>
            </SimpleFade>
          )}
        </AnimatePresence>

        {/* Smartwatch Hub - Above fold */}
        <div className="px-4">
          <EnhancedSmartwatchHub />
        </div>

        {/* Quick Actions - Above fold */}
        <QuickActionsPanel />

        {/* Today's Workout - Above fold */}
        <TodaysWorkout workouts={scheduledWorkouts} onReschedule={openRescheduleDialog} />

        {/* Lazy load below-the-fold content */}
        <LazySection fallback={<PlaceholderSection height="300px" />} className="px-4">
          <Suspense fallback={<PlaceholderSection height="300px" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HealthMetricsPanel />
              <WeatherWidget />
            </div>
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="150px" />} className="px-4">
          <Suspense fallback={<PlaceholderSection height="150px" />}>
            <EnhancedNotifications />
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="200px" />} className="px-4">
          <Suspense fallback={<PlaceholderSection height="200px" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AchievementNotifications />
              <MotivationalQuotes />
            </div>
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="250px" />}>
          <Suspense fallback={<PlaceholderSection height="250px" />}>
            <UpcomingWorkouts workouts={scheduledWorkouts} />
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="300px" />}>
          <Suspense fallback={<PlaceholderSection height="300px" />}>
            <FitfusionChatSection />
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="200px" />} className="px-4">
          <Suspense fallback={<PlaceholderSection height="200px" />}>
            <EnhancedHomeFeatures />
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="250px" />}>
          <Suspense fallback={<PlaceholderSection height="250px" />}>
            <RecentActivitySection />
          </Suspense>
        </LazySection>

        <LazySection fallback={<PlaceholderSection height="150px" />} className="px-4 mt-6 mb-20">
          <DailyTip />
        </LazySection>
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
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <ErrorFixManager />
        </Suspense>
      )}

      <MobileNav />
    </div>
  );
};

export default Index;
