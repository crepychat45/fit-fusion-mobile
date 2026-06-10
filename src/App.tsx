import React, { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppWrapper } from "./components/app-wrapper";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { clearAppCaches, isRecoverableResourceError, markAppReady, recoverApp } from "@/utils/app-recovery";
import { BootLoader } from "@/components/common/boot-loader";
import { prefetchAllRoutes } from "@/utils/route-prefetch";

const Loader = BootLoader;

const lazyWithRetry = <T extends React.ComponentType<any>>(importer: () => Promise<{ default: T }>) =>
  lazy(() =>
    importer()
      .then((module) => {
        markAppReady();
        return module;
      })
      .catch(async (error) => {
        if (isRecoverableResourceError(error)) {
          await clearAppCaches();

          try {
            const retryModule = await importer();
            markAppReady();
            return retryModule;
          } catch (retryError) {
            await recoverApp("lazy route import failed after retry", retryError);
            throw retryError;
          }
        }

        throw error;
      })
  );

// Lazy load pages
const Index = lazyWithRetry(() => import("./pages/Index"));
const Workouts = lazyWithRetry(() => import("./pages/workouts"));
const WorkoutDetail = lazyWithRetry(() => import("./pages/workout-detail"));
const WorkoutPlans = lazyWithRetry(() => import("./pages/workout-plans"));
const WorkoutSession = lazyWithRetry(() => import("./pages/workout-session"));
const Community = lazyWithRetry(() => import("./pages/community"));
const ExerciseDetail = lazyWithRetry(() => import("./pages/exercise-detail"));
const Progress = lazyWithRetry(() => import("./pages/progress"));
const Profile = lazyWithRetry(() => import("./pages/profile"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Settings = lazyWithRetry(() => import("./pages/settings"));
const NotificationsPage = lazyWithRetry(() => import("./pages/notifications"));
const Privacy = lazyWithRetry(() => import("./pages/privacy"));
const Help = lazyWithRetry(() => import("./pages/help"));
const Wearables = lazyWithRetry(() => import("./pages/wearables"));
const ExportData = lazyWithRetry(() => import("./pages/export-data"));
const Subscription = lazyWithRetry(() => import("./pages/subscription"));
const ChatPage = lazyWithRetry(() => import("./pages/chat"));
const AuthPage = lazyWithRetry(() => import("./components/auth/auth-page"));
const ResetPassword = lazyWithRetry(() => import("./pages/reset-password"));
const TermsOfService = lazyWithRetry(() => import("./pages/terms-of-service"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/privacy-policy"));
const Onboarding = lazyWithRetry(() => import("./pages/onboarding"));
const ToolsPage = lazyWithRetry(() => import("./pages/tools"));
const ProgressTrackerPage = lazyWithRetry(() => import("./pages/progress-tracker"));
const NutritionPage = lazyWithRetry(() => import("./pages/nutrition"));
const VaultPage = lazyWithRetry(() => import("./pages/vault"));
const FitAssistant = lazyWithRetry(() => import("./components/fit-assistant").then(m => ({ default: m.FitAssistant })));

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<Loader />}>{children}</Suspense>
  </ErrorBoundary>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const [assistantEnabled, setAssistantEnabled] = useState(false);

  useEffect(() => {
    const enableAssistant = () => setAssistantEnabled(true);
    const timeout = window.setTimeout(enableAssistant, 3500);
    // Pre-warm route chunks during idle so navigations feel instant
    const prefetchTimeout = window.setTimeout(() => prefetchAllRoutes(), 5200);
    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(prefetchTimeout);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<P><Index /></P>} />
          <Route path="/auth" element={<P><AuthPage /></P>} />
          <Route path="/reset-password" element={<P><ResetPassword /></P>} />
          <Route path="/terms-of-service" element={<P><TermsOfService /></P>} />
          <Route path="/privacy-policy" element={<P><PrivacyPolicy /></P>} />
          <Route path="/onboarding" element={<P><Onboarding /></P>} />

          {/* Protected */}
          <Route path="/workouts" element={<ProtectedRoute><P><Workouts /></P></ProtectedRoute>} />
          <Route path="/workout-plans" element={<ProtectedRoute><P><WorkoutPlans /></P></ProtectedRoute>} />
          <Route path="/workout-detail/:id" element={<ProtectedRoute><P><WorkoutDetail /></P></ProtectedRoute>} />
          <Route path="/workout-session/:id" element={<ProtectedRoute><P><WorkoutSession /></P></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><P><Community /></P></ProtectedRoute>} />
          <Route path="/exercise/:workoutId/:exerciseId" element={<ProtectedRoute><P><ExerciseDetail /></P></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><P><Progress /></P></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><P><Profile /></P></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><P><ChatPage /></P></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><P><Settings /></P></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><P><NotificationsPage /></P></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><P><Privacy /></P></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><P><Help /></P></ProtectedRoute>} />
          <Route path="/wearables" element={<ProtectedRoute><P><Wearables /></P></ProtectedRoute>} />
          <Route path="/export-data" element={<ProtectedRoute><P><ExportData /></P></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><P><Subscription /></P></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><P><ToolsPage /></P></ProtectedRoute>} />
          <Route path="/progress-tracker" element={<ProtectedRoute><P><ProgressTrackerPage /></P></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><P><NutritionPage /></P></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><P><VaultPage /></P></ProtectedRoute>} />

          <Route path="*" element={<P><NotFound /></P>} />
        </Routes>
      </AnimatePresence>
      {assistantEnabled && (
        <Suspense fallback={null}>
          <FitAssistant />
        </Suspense>
      )}
    </>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppWrapper>
      <AppContent />
    </AppWrapper>
  </ErrorBoundary>
);

export default App;
