import React, { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivitySummary } from "@/components/activity-summary";
import { userProfile } from "@/data/user";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { ProfileHeader } from "@/components/profile-header";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, TrendingUp, Shield, Sparkles, Dumbbell, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const DailyTip = lazy(() => import("@/components/daily-tip").then((m) => ({ default: m.DailyTip })));
const TodaysWorkout = lazy(() => import("@/components/dashboard/todays-workout").then((m) => ({ default: m.TodaysWorkout })));
const UpcomingWorkouts = lazy(() => import("@/components/dashboard/upcoming-workouts").then((m) => ({ default: m.UpcomingWorkouts })));
const RecentActivitySection = lazy(() => import("@/components/dashboard/recent-activity-section").then((m) => ({ default: m.RecentActivitySection })));
const FitfusionChatSection = lazy(() => import("@/components/dashboard/fitfusion-chat-section").then((m) => ({ default: m.FitfusionChatSection })));
const RescheduleDialog = lazy(() => import("@/components/dashboard/reschedule-dialog").then((m) => ({ default: m.RescheduleDialog })));
const QuickActionsPanel = lazy(() => import("@/components/dashboard/quick-actions-panel").then((m) => ({ default: m.QuickActionsPanel })));
const HealthMetricsPanel = lazy(() => import("@/components/dashboard/health-metrics-panel").then((m) => ({ default: m.HealthMetricsPanel })));
const AchievementNotifications = lazy(() => import("@/components/dashboard/achievement-notifications").then((m) => ({ default: m.AchievementNotifications })));
const MotivationalQuotes = lazy(() => import("@/components/dashboard/motivational-quotes").then((m) => ({ default: m.MotivationalQuotes })));
const EnhancedNotifications = lazy(() => import("@/components/dashboard/enhanced-notifications").then((m) => ({ default: m.EnhancedNotifications })));
const DailyWorkouts = lazy(() => import("@/components/dashboard/daily-workouts").then((m) => ({ default: m.DailyWorkouts })));
const WorkoutStreakWidget = lazy(() => import("@/components/dashboard/workout-streak-widget").then((m) => ({ default: m.WorkoutStreakWidget })));
const BiometricHUD = lazy(() => import("@/components/dashboard/biometric-hud").then((m) => ({ default: m.BiometricHUD })));
const HydrationEnergyTracker = lazy(() => import("@/components/dashboard/hydration-energy-tracker").then((m) => ({ default: m.HydrationEnergyTracker })));
const AdaptiveWorkoutEngine = lazy(() => import("@/components/dashboard/adaptive-workout-engine").then((m) => ({ default: m.AdaptiveWorkoutEngine })));
const TodaysGoalsWidget = lazy(() => import("@/components/dashboard/todays-goals-widget").then((m) => ({ default: m.TodaysGoalsWidget })));
const PersonalRecordsWidget = lazy(() => import("@/components/dashboard/personal-records-widget").then((m) => ({ default: m.PersonalRecordsWidget })));
const QuickBoostWidget = lazy(() => import("@/components/dashboard/quick-boost-widget").then((m) => ({ default: m.QuickBoostWidget })));
const DailyChallengeWidget = lazy(() => import("@/components/dashboard/daily-challenge-widget").then((m) => ({ default: m.DailyChallengeWidget })));
const MonthlySecurityScanWidget = lazy(() => import("@/components/home/monthly-security-scan-widget").then((m) => ({ default: m.MonthlySecurityScanWidget })));
const VitalityIndexWidget = lazy(() => import("@/components/dashboard/vitality-index-widget").then((m) => ({ default: m.VitalityIndexWidget })));
const MobileNav = lazy(() => import("@/components/mobile-nav").then((m) => ({ default: m.MobileNav })));
const MobileFloatingActions = lazy(() => import("@/components/mobile/mobile-floating-actions").then((m) => ({ default: m.MobileFloatingActions })));
const MobileAIAssistant = lazy(() => import("@/components/mobile/mobile-ai-assistant").then((m) => ({ default: m.MobileAIAssistant })));
const MobileSecurityCenter = lazy(() => import("@/components/mobile/mobile-security-center").then((m) => ({ default: m.MobileSecurityCenter })));

const HomeSectionFallback = () => <div className="mx-4 h-28 rounded-2xl border border-border/20 bg-card/40 animate-pulse" />;

const scheduledWorkouts = [
  { id: "1", name: "AI-Powered HIIT", time: "07:00 AM", day: "Today", duration: "45 min", difficulty: "Intermediate", calories: 380 },
  { id: "2", name: "Smart Strength Training", time: "06:30 AM", day: "Tomorrow", duration: "50 min", difficulty: "Advanced", calories: 420 },
];

const Index = () => {
  const navigate = useNavigate();
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState("07:00 AM");
  const [showMobileAI, setShowMobileAI] = useState(false);
  const [showMobileSecurity, setShowMobileSecurity] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleProfileUpdate = () => {
      // Trigger any necessary updates
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* Ambient background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <WelcomeHeader userName={userProfile.name} showCompactProfile={true} />

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="px-4 mt-4">
          <ProfileHeader />
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5 relative z-10 mt-4">
          {/* Daily Motivation Quote */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/20 rounded-xl shrink-0">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground italic">"The only bad workout is the one that didn't happen."</p>
                  <p className="text-xs text-muted-foreground mt-1">— Daily Motivation</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Start Workout */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary rounded-xl shadow-md">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Quick Start</h2>
                    <p className="text-xs text-muted-foreground">Jump into a recommended workout</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/workouts?quick=true")} className="rounded-xl h-9 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  <Flame className="h-3.5 w-3.5 mr-1" />Start Now
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Activity Summary */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
              <ActivitySummary
                workoutsCompleted={userProfile.stats.workoutsCompleted}
                streakDays={userProfile.stats.streakDays}
                caloriesBurned={userProfile.stats.caloriesBurned}
                avgHeartRate={userProfile.stats.avgHeartRate}
              />
            </div>
          </motion.div>

          {/* Vitality Index — new in v7.0 */}
          <motion.div variants={fadeUp} className="px-4">
            <Suspense fallback={<HomeSectionFallback />}>
              <VitalityIndexWidget />
            </Suspense>
          </motion.div>

          {/* Daily Challenge — claim XP for daily targets */}
          <motion.div variants={fadeUp} className="px-4">
            <Suspense fallback={<HomeSectionFallback />}>
              <DailyChallengeWidget />
            </Suspense>
          </motion.div>

          {/* Today's Goals (Liquid Glass) */}
          <motion.div variants={fadeUp} className="px-4">
            <Suspense fallback={<HomeSectionFallback />}>
              <TodaysGoalsWidget />
            </Suspense>
          </motion.div>

          {/* Personal Records Showcase */}
          <motion.div variants={fadeUp} className="px-4">
            <Suspense fallback={<HomeSectionFallback />}>
              <PersonalRecordsWidget />
            </Suspense>
          </motion.div>
          {/* Monthly Security & Privacy Scan */}
          <motion.div variants={fadeUp} className="px-4">
            <Suspense fallback={<HomeSectionFallback />}>
              <MonthlySecurityScanWidget />
            </Suspense>
          </motion.div>


          {/* Quick Boost — 4 micro-actions for instant momentum */}
          <motion.div variants={fadeUp}>
            <Suspense fallback={<HomeSectionFallback />}>
              <QuickBoostWidget />
            </Suspense>
          </motion.div>



          {/* Weekly Summary Card */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">This Week</h3>
                <Badge className="ml-auto bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">+12%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <div className="text-lg font-bold text-foreground">4</div>
                  <div className="text-[10px] text-muted-foreground">Workouts</div>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <div className="text-lg font-bold text-foreground">2.1k</div>
                  <div className="text-[10px] text-muted-foreground">Calories</div>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <div className="text-lg font-bold text-foreground">128m</div>
                  <div className="text-[10px] text-muted-foreground">Active</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Banner */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-primary/80 to-accent-foreground p-5 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/60" />
              <div className="relative z-10 text-primary-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">
                    AI POWERED
                  </Badge>
                </div>
                <h3 className="text-lg font-bold mb-1">Next-Gen Fitness</h3>
                <p className="text-primary-foreground/80 text-sm mb-3">AI coaching, biometrics & personalized plans</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { icon: Brain, label: "AI Coach" },
                    { icon: Heart, label: "Biometric Sync" },
                    { icon: TrendingUp, label: "Analytics" },
                    { icon: Shield, label: "Privacy First" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-primary-foreground/90">
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Biometric HUD */}
          <Suspense fallback={<HomeSectionFallback />}>
            <motion.div variants={fadeUp} className="px-4">
              <BiometricHUD />
            </motion.div>

          {/* Adaptive Engine + Hydration */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdaptiveWorkoutEngine />
              <HydrationEnergyTracker />
            </div>
          </motion.div>

          {/* Daily Workouts */}
          <motion.div variants={fadeUp} className="px-4">
            <DailyWorkouts />
          </motion.div>

          {/* Workout Streak */}
          <motion.div variants={fadeUp} className="px-4">
            <WorkoutStreakWidget />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}>
            <QuickActionsPanel />
          </motion.div>

          {/* Today's Workout */}
          <motion.div variants={fadeUp}>
            <TodaysWorkout workouts={scheduledWorkouts} onReschedule={(w: any) => { setSelectedWorkout(w); setShowReschedule(true); }} />
          </motion.div>

          {/* Metrics + Weather */}
          <motion.div variants={fadeUp} className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HealthMetricsPanel />
              <MotivationalQuotes />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={fadeUp} className="px-4">
            <EnhancedNotifications />
          </motion.div>

          {/* Achievements */}
          <motion.div variants={fadeUp} className="px-4">
            <AchievementNotifications />
          </motion.div>

          {/* Upcoming Workouts */}
          <motion.div variants={fadeUp}>
            <UpcomingWorkouts workouts={scheduledWorkouts} />
          </motion.div>

          {/* Chat Section */}
          <motion.div variants={fadeUp}>
            <FitfusionChatSection />
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp}>
            <RecentActivitySection />
          </motion.div>

          {/* Daily Tip */}
            <motion.div variants={fadeUp} className="px-4 mb-20">
              <DailyTip />
            </motion.div>
          </Suspense>
        </motion.div>

        <Suspense fallback={null}>
          <RescheduleDialog
            isOpen={showReschedule}
            onClose={() => setShowReschedule(false)}
            workout={selectedWorkout}
            scheduledDate={scheduledDate}
            onDateChange={setScheduledDate}
            scheduledTime={scheduledTime}
            onTimeChange={setScheduledTime}
          />
        </Suspense>

        {isMobile && (
          <Suspense fallback={null}>
            <MobileFloatingActions
              onAIAssistant={() => setShowMobileAI(true)}
              onSecurity={() => setShowMobileSecurity(true)}
              onVoiceCommand={() => setShowMobileAI(true)}
              onQuickWorkout={() => navigate("/workouts?quick=true")}
            />
            <MobileAIAssistant isOpen={showMobileAI} onClose={() => setShowMobileAI(false)} />
            <MobileSecurityCenter isOpen={showMobileSecurity} onClose={() => setShowMobileSecurity(false)} />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
    </MainLayout>
  );
};

export default Index;
