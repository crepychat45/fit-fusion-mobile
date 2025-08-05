
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/theme-context";
import { LanguageProvider } from "./contexts/language-context";
import { SettingsProvider } from "./contexts/settings-context";
import { ErrorRecovery } from "./components/error-recovery";
import { SecurityManager } from "./components/security-manager";
import { AccessibilityManager } from "./components/accessibility-manager";
import { SEOManager } from "./components/seo-manager";
import { PerformanceUtils } from "./utils/performance-utils";
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
import { FitAssistant } from "./components/fit-assistant";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function AppContent() {
  React.useEffect(() => {
    // Initialize performance monitoring
    PerformanceUtils.measurePerformance();
    PerformanceUtils.lazyLoadImages();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FitAssistant />
    </SEOManager>
  );
}

const App = () => (
  <ErrorRecovery>
    <QueryClientProvider client={queryClient}>
      <SecurityManager>
        <ThemeProvider>
          <LanguageProvider>
            <SettingsProvider>
              <AccessibilityManager>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AppContent />
                  </BrowserRouter>
                </TooltipProvider>
              </AccessibilityManager>
            </SettingsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SecurityManager>
    </QueryClientProvider>
  </ErrorRecovery>
);

export default App;
