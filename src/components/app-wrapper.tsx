import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { SettingsProvider } from "@/contexts/safe-settings-context";
import { EnhancedErrorRecovery } from "@/components/enhanced-error-recovery";
import { SecurityManager } from "@/components/security-manager";
import { AccessibilityManager } from "@/components/accessibility-manager";
import { SmartNotifications } from "@/components/ai/smart-notifications";
import { ProgressiveEnhancement } from "@/components/enhanced-progressive-enhancement";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { MobileCompatibility } from "@/components/mobile-compatibility";

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

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <EnhancedErrorRecovery>
      <QueryClientProvider client={queryClient}>
        <ProgressiveEnhancement>
          <SecurityManager>
            <ThemeProvider>
              <LanguageProvider>
                <SettingsProvider>
                  <AccessibilityManager>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <SmartNotifications />
                      <PerformanceMonitor enableAnalytics enableCaching />
                      <MobileCompatibility />
                      <BrowserRouter>{children}</BrowserRouter>
                    </TooltipProvider>
                  </AccessibilityManager>
                </SettingsProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SecurityManager>
        </ProgressiveEnhancement>
      </QueryClientProvider>
    </EnhancedErrorRecovery>
  );
}
