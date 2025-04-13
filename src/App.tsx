
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/wearables" element={<Wearables />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
