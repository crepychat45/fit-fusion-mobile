
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/theme-context";
import { LanguageProvider } from "./contexts/language-context";
import { SettingsProvider } from "./contexts/settings-context";
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
import { FitAssistant } from "./components/fit-assistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/workout/:id" element={<WorkoutDetail />} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FitAssistant />
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
