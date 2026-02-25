import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SEOManager } from "./components/seo-manager";
import { PerformanceUtils } from "./utils/performance-utils";
import { AppWrapper } from "./components/app-wrapper";
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper";
import { SkipNav } from "./components/accessibility/skip-nav";
import { InstallPrompt } from "./components/pwa/install-prompt";
import { OfflineIndicator } from "./components/pwa/offline-indicator";
import { PageTransition } from "./components/page-transition";
import { AnimatePresence } from "framer-motion";
import ToolsPage from "./pages/tools";
import ProgressTrackerPage from "./pages/progress-tracker";
import NutritionPage from "./pages/nutrition";
import VaultPage from "./pages/vault";
import Index from "./pages/Index";
import Workouts from "./pages/workouts";
import WorkoutDetail from "./pages/workout-detail";
import WorkoutPlans from "./pages/workout-plans";
import WorkoutSession from "./pages/workout-session";
import Community from "./pages/community";
import ExerciseDetail from "./pages/exercise-detail";
import Progress from "./pages/progress";
import Profile from "./pages/profile";
import NotFound from "./pages/NotFound";
import Settings from "./pages/settings";
import NotificationsPage from "./pages/notifications";
import Privacy from "./pages/privacy";
import Help from "./pages/help";
import Wearables from "./pages/wearables";
import ExportData from "./pages/export-data";
import Subscription from "./pages/subscription";
import ChatPage from "./pages/chat";
import AuthPage from "./components/auth/auth-page";
import ResetPassword from "./pages/reset-password";
import { ProtectedRoute } from "./components/auth/protected-route";
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicy from "./pages/privacy-policy";
import Onboarding from "./pages/onboarding";
import { FitAssistant } from "./components/fit-assistant";
import { PerformanceMonitor } from "./components/performance-monitor";

const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    PerformanceUtils.measurePerformance?.();
    PerformanceUtils.lazyLoadImages?.();

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }
  }, []);

  return (
    <ErrorBoundaryWrapper>
      <SkipNav />
      <SEOManager>
        <InstallPrompt />
        <OfflineIndicator />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
            <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
            
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><PageTransition><Workouts /></PageTransition></ProtectedRoute>} />
            <Route path="/workout-plans" element={<ProtectedRoute><PageTransition><WorkoutPlans /></PageTransition></ProtectedRoute>} />
            <Route path="/workout-detail/:id" element={<ProtectedRoute><PageTransition><WorkoutDetail /></PageTransition></ProtectedRoute>} />
            <Route path="/workout-session/:id" element={<ProtectedRoute><PageTransition><WorkoutSession /></PageTransition></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><PageTransition><Community /></PageTransition></ProtectedRoute>} />
            <Route path="/exercise/:workoutId/:exerciseId" element={<ProtectedRoute><PageTransition><ExerciseDetail /></PageTransition></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><PageTransition><Progress /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><PageTransition><ChatPage /></PageTransition></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><PageTransition><NotificationsPage /></PageTransition></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PageTransition><Privacy /></PageTransition></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><PageTransition><Help /></PageTransition></ProtectedRoute>} />
            <Route path="/wearables" element={<ProtectedRoute><PageTransition><Wearables /></PageTransition></ProtectedRoute>} />
            <Route path="/export-data" element={<ProtectedRoute><PageTransition><ExportData /></PageTransition></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><PageTransition><Subscription /></PageTransition></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><PageTransition><ToolsPage /></PageTransition></ProtectedRoute>} />
            <Route path="/progress-tracker" element={<ProtectedRoute><PageTransition><ProgressTrackerPage /></PageTransition></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><PageTransition><NutritionPage /></PageTransition></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><PageTransition><VaultPage /></PageTransition></ProtectedRoute>} />
            
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
        <FitAssistant />
        <PerformanceMonitor />
      </SEOManager>
    </ErrorBoundaryWrapper>
  );
};

const App: React.FC = () => (
  <AppWrapper>
    <AppContent />
  </AppWrapper>
);

export default App;
