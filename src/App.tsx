import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SEOManager } from "./components/seo-manager";
import { PerformanceUtils } from "./utils/performance-utils";
import { AppWrapper } from "./components/app-wrapper";
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
  useEffect(() => {
    // Initialize performance monitoring
    PerformanceUtils.measurePerformance?.();
    PerformanceUtils.lazyLoadImages?.();

    // Register service worker for PWA (if available and window exists)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }
  }, []);

  return (
    <SEOManager>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/workout-plans" element={<ProtectedRoute><WorkoutPlans /></ProtectedRoute>} />
        <Route path="/workout-detail/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
        <Route path="/workout-session/:id" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/exercise/:workoutId/:exerciseId" element={<ProtectedRoute><ExerciseDetail /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/wearables" element={<ProtectedRoute><Wearables /></ProtectedRoute>} />
        <Route path="/export-data" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FitAssistant />
      <PerformanceMonitor />
    </SEOManager>
  );
};

const App: React.FC = () => (
  <AppWrapper>
    <AppContent />
  </AppWrapper>
);

export default App;
