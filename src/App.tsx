import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SEOManager } from "./components/seo-manager";
import { PerformanceUtils } from "./utils/performance-utils";
import { AppWrapper } from "./components/app-wrapper";
import { LoadingSpinner } from "./components/common/loading-spinner";

// Critical routes - loaded immediately
import Index from "./pages/Index";
import AuthPage from "./components/auth/auth-page";

// Lazy load all non-critical routes
const Workouts = lazy(() => import("./pages/workouts"));
const WorkoutDetail = lazy(() => import("./pages/workout-detail"));
const ExerciseDetail = lazy(() => import("./pages/exercise-detail"));
const Progress = lazy(() => import("./pages/progress"));
const Profile = lazy(() => import("./pages/profile"));
const Settings = lazy(() => import("./pages/settings"));
const ChatPage = lazy(() => import("./pages/chat"));
const Wearables = lazy(() => import("./pages/wearables"));
const Subscription = lazy(() => import("./pages/subscription"));
const NotificationsPage = lazy(() => import("./pages/notifications"));
const Help = lazy(() => import("./pages/help"));
const ExportData = lazy(() => import("./pages/export-data"));
const Privacy = lazy(() => import("./pages/privacy"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const TermsOfService = lazy(() => import("./pages/terms-of-service"));
const ResetPassword = lazy(() => import("./pages/reset-password"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load non-critical components
const FitAssistant = lazy(() => import("./components/fit-assistant").then(m => ({ default: m.FitAssistant })));
const PerformanceMonitor = lazy(() => import("./components/performance-monitor").then(m => ({ default: m.PerformanceMonitor })));

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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workout-detail/:id" element={<WorkoutDetail />} />
          <Route
            path="/exercise/:workoutId/:exerciseId"
            element={<ExerciseDetail />}
          />
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
      </Suspense>
    </SEOManager>
  );
};

const App: React.FC = () => (
  <AppWrapper>
    <AppContent />
  </AppWrapper>
);

export default App;
