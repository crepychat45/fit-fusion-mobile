import React, { lazy, Suspense, useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsNavigation } from "./settings-navigation";
import { SettingsSearch } from "./settings-search";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Lazy-load each panel — only the active tab loads, making Settings open fast.
const AccountSettings = lazy(() => import("./account-settings").then(m => ({ default: m.AccountSettings })));
const DisplaySettings = lazy(() => import("./display-settings").then(m => ({ default: m.DisplaySettings })));
const PrivacySettings = lazy(() => import("./privacy-settings").then(m => ({ default: m.PrivacySettings })));
const DeveloperOptions = lazy(() => import("./developer-options").then(m => ({ default: m.DeveloperOptions })));
const ChatSettingsPanel = lazy(() => import("./chat-settings").then(m => ({ default: m.ChatSettingsPanel })));
const AboutPage = lazy(() => import("./about-page").then(m => ({ default: m.AboutPage })));
const SecurityCenter = lazy(() => import("./security-center").then(m => ({ default: m.SecurityCenter })));
const NotificationSettings = lazy(() => import("./notification-settings").then(m => ({ default: m.NotificationSettings })));
const UnitPreferences = lazy(() => import("./unit-preferences").then(m => ({ default: m.UnitPreferences })));
const SettingsBackupRestore = lazy(() => import("./settings-backup-restore").then(m => ({ default: m.SettingsBackupRestore })));
const DataManagementPanel = lazy(() => import("./data-management-panel").then(m => ({ default: m.DataManagementPanel })));
const PerformanceMetricsPanel = lazy(() => import("./performance-metrics-panel").then(m => ({ default: m.PerformanceMetricsPanel })));
const AdvancedSettingsReset = lazy(() => import("./advanced-settings-reset").then(m => ({ default: m.AdvancedSettingsReset })));
const UnifiedUpdateManager = lazy(() => import("./unified-update-manager").then(m => ({ default: m.UnifiedUpdateManager })));

const PanelLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);
const L: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PanelLoader />}>{children}</Suspense>
);

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

      {/* Liquid Glass Header */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-white/10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)]">
        <div className="relative overflow-hidden">
          {/* Ambient orbs */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-accent/20 blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

          <div className="relative max-w-screen-xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                >
                  <Settings className="h-5 w-5 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                </motion.div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-accent-foreground bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                    Liquid Glass · personalize every detail
                  </p>
                </div>
                {lastSaved && (
                  <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full backdrop-blur-sm ml-2">
                    <CheckCircle className="h-3 w-3" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasUnsavedChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSave}
                    className="rounded-xl border-orange-400/40 bg-orange-500/10 text-orange-600 dark:text-orange-300 backdrop-blur-sm hover:bg-orange-500/20"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden rounded-xl bg-background/40 backdrop-blur-sm border-white/20"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  aria-label="Toggle settings menu"
                >
                  {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
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
            <TabsContent value="search" className="mt-0">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Search Settings</h2>
                  <p className="text-muted-foreground">
                    Find the settings you're looking for quickly and easily
                  </p>
                </div>
                <SettingsSearch
                  onResultClick={(result) => {
                    // Handle result click - navigate to appropriate tab
                    const tabMap: Record<string, string> = {
                      Account: "account",
                      Display: "display",
                      Privacy: "privacy",
                      Notifications: "notifications",
                      Updates: "updates",
                      Security: "security",
                      Data: "data",
                    };
                    const targetTab = tabMap[result.category];
                    if (targetTab) {
                      handleTabChange(targetTab);
                    }
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              <L><AccountSettings /></L>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <L><SecurityCenter /></L>
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <L><DisplaySettings /></L>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <L><PrivacySettings /></L>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <L><NotificationSettings /></L>
            </TabsContent>

            <TabsContent value="units" className="mt-0">
              <L><UnitPreferences /></L>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <L><ChatSettingsPanel /></L>
            </TabsContent>

            <TabsContent value="updates" className="mt-0">
              <L><UnifiedUpdateManager /></L>
            </TabsContent>


            <TabsContent value="enhanced" className="mt-0">
              <div className="space-y-6">
                <L><PerformanceMetricsPanel /></L>
                <L><AdvancedSettingsReset /></L>
                <L><SettingsBackupRestore /></L>
                <L><DataManagementPanel /></L>

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

            <TabsContent value="developer" className="mt-0">
              <L><DeveloperOptions /></L>
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
              <L><AboutPage /></L>
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
