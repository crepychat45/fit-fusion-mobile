import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SEOManager } from "./components/seo-manager";
import { PerformanceUtils } from "./utils/performance-utils";
import { AppWrapper } from "./components/app-wrapper";
import Index from "./pages/Index";
import Workouts from "./pages/workouts";
import WorkoutDetail from "./pages/workout-detail";
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
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicy from "./pages/privacy-policy";
import { FitAssistant } from "./components/fit-assistant";
import { PerformanceMonitor } from "./components/performance-monitor";

// QueryClient moved to AppWrapper

function AppContent(): JSX.Element {
  useEffect(() => {
    // Initialize performance monitoring
    PerformanceUtils.measurePerformance?.();
    PerformanceUtils.lazyLoadImages?.();

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <SEOManager>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workout-detail/:id" element={<WorkoutDetail />} />
        <Route path="/exercise/:workoutId/:exerciseId" element={<ExerciseDetail />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/wearables" element={<Wearables />} />
        <Route path="/export-data" element={<ExportData />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FitAssistant />
      <PerformanceMonitor />
    </SEOManager>
  );
}

const App = (): JSX.Element => (
  <AppWrapper>
    <AppContent />
  </AppWrapper>
);

export default App;
