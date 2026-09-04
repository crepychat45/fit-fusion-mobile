import React from "react";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";
import { SettingsProvider } from "@/contexts/settings-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle } from "lucide-react";

interface SafeSettingsWrapperProps {
  children: React.ReactNode;
}

const SettingsErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle>Settings Error</CardTitle>
        <CardDescription>
          There was an error loading the settings. This might be due to corrupted data or a configuration issue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={retry} className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Retry Loading Settings
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            // Clear settings and retry
            localStorage.removeItem('fitfusion-settings');
            retry();
          }}
          className="w-full"
        >
          Reset Settings & Retry
        </Button>
      </CardContent>
    </Card>
  </div>
);

export function SafeSettingsWrapper({ children }: SafeSettingsWrapperProps) {
  return (
    <EnhancedErrorBoundary fallback={SettingsErrorFallback}>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </EnhancedErrorBoundary>
  );
}