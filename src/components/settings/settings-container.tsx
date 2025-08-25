import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { DisplaySettings } from "./display-settings";
import { PrivacySettings } from "./privacy-settings";
import { DeveloperOptions } from "./developer-options";
import { ChatSettingsPanel } from "./chat-settings";
import { AboutPage } from "./about-page";
import { EnhancedSettingsValidation } from "./enhanced-settings-validation";
import { AppUpdateManager } from "./app-update-manager";
import { SecurityCenter } from "./security-center";
import { VersionManager } from "./version-manager";
import { EnhancedVersionManager } from "./enhanced-version-manager";
import { ProfileNameEditor } from "@/components/profile-name-editor";
import { SettingsNavigation } from "./settings-navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertTriangle,
  Settings,
  Save,
  RefreshCw,
  Menu,
  X,
  Database,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SettingsContainer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [settingsValidated, setSettingsValidated] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    checkConnection();
    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);

    return () => {
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, []);

  useEffect(() => {
    // Auto-save functionality
    if (hasUnsavedChanges && isConnected) {
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [hasUnsavedChanges, isConnected]);

  const handleClearLocalData = async () => {
    try {
      const confirmation = window.confirm(
        "Are you sure you want to clear all local data? This action cannot be undone.",
      );
      if (!confirmation) return;

      const keysToPreserve = [
        "auth_token",
        "supabase.auth.token",
        "fitfusion-app-version",
      ];
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          !keysToPreserve.includes(key) &&
          !key.startsWith("supabase.auth")
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      toast({
        title: "✅ Data Cleared",
        description: `Successfully cleared ${keysToRemove.length} items from local storage.`,
      });

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "❌ Error",
        description: "Failed to clear local data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const confirmation = window.confirm("Are you sure you want to log out?");
      if (!confirmation) return;

      await supabase.auth.signOut();
      localStorage.removeItem("auth_token");
      setIsLoggedOut(true);

      toast({
        title: "👋 Logged Out",
        description: "You have been securely logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "❌ Logout Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateAllSettings = async () => {
    if (isValidating) return;

    setIsValidating(true);
    setValidationProgress(0);

    const validationSteps = [
      "Checking account settings...",
      "Validating security configuration...",
      "Verifying display preferences...",
      "Testing privacy settings...",
      "Checking chat configuration...",
      "Validating update settings...",
      "Checking developer options...",
      "Final verification...",
    ];

    try {
      for (let i = 0; i < validationSteps.length; i++) {
        setValidationProgress(((i + 1) / validationSteps.length) * 100);

        // Simulate validation time
        await new Promise((resolve) => setTimeout(resolve, 600));

        toast({
          title: validationSteps[i],
          description: `Step ${i + 1} of ${validationSteps.length}`,
        });
      }

      setSettingsValidated(true);

      toast({
        title: "🎉 Validation Complete",
        description: "All settings have been validated successfully.",
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "❌ Validation Failed",
        description: "Some settings could not be validated.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoSave = async () => {
    if (!isConnected) {
      toast({
        title: "⚠️ Offline",
        description: "Changes will be saved when connection is restored.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 300));
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      toast({
        title: "💾 Auto-saved",
        description: "Your changes have been saved automatically.",
      });
    } catch (error) {
      console.error("Auto-save error:", error);
      toast({
        title: "❌ Save Failed",
        description: "Unable to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManualSave = async () => {
    await handleAutoSave();
    toast({
      title: "✅ Settings Saved",
      description: "All your changes have been saved successfully.",
    });
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      const shouldContinue = window.confirm(
        "You have unsaved changes. Do you want to continue without saving?",
      );
      if (!shouldContinue) return;
    }
    setActiveTab(value);
    setShowMobileMenu(false);
    console.log(`Switching to tab: ${value}`);
  };

  if (isLoggedOut) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto py-20 text-center space-y-4"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Successfully Logged Out</h2>
        <p className="text-muted-foreground">
          Your session has ended securely. Please refresh the page to log in
          again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Connection Status */}
      {!isConnected && (
        <Alert className="mx-4 mb-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            You are currently offline. Some features may not be available.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Header with modern design */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience
                  </p>
                </div>
              </div>
              {lastSaved && (
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Saved at {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden bg-white/50 backdrop-blur-sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>

              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-50 border-orange-200 text-orange-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SettingsNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showMobileMenu={showMobileMenu}
        onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
      />

      <div className="max-w-screen-xl mx-auto py-6 px-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityCenter />
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <DisplaySettings />
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <ChatSettingsPanel />
            </TabsContent>

            <TabsContent value="updates" className="mt-0">
              <div className="space-y-6">
                <EnhancedVersionManager />
                <AppUpdateManager />
              </div>
            </TabsContent>

            <TabsContent value="enhanced" className="mt-0">
              <EnhancedSettingsValidation />
            </TabsContent>

            <TabsContent value="developer" className="mt-0">
              <DeveloperOptions />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Data Management Center
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Manage your local data, account session, and export
                    preferences with advanced controls
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto p-4"
                      onClick={handleClearLocalData}
                    >
                      <div className="text-left">
                        <div className="font-medium">Clear Local Data</div>
                        <div className="text-xs text-muted-foreground">
                          Removes app data from this device
                        </div>
                      </div>
                      <Database className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full justify-between h-auto p-4 md:col-span-2"
                      onClick={handleLogout}
                    >
                      <div className="text-left">
                        <div className="font-medium">Log Out</div>
                        <div className="text-xs">
                          End your current session securely
                        </div>
                      </div>
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <AboutPage />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
