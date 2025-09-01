import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { ErrorRecovery } from "@/components/error-recovery";
import { SecurityManager } from "@/components/security-manager";
import { AccessibilityManager } from "@/components/accessibility-manager";
import { SmartNotifications } from "@/components/ai/smart-notifications";

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
                    <SmartNotifications />
                    <BrowserRouter>{children}</BrowserRouter>
                  </TooltipProvider>
                </AccessibilityManager>
              </SettingsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SecurityManager>
      </QueryClientProvider>
    </ErrorRecovery>
  );
}
