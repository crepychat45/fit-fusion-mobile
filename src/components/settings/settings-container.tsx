import { SettingsTransferPanel, PushDevicePanel } from "@/components/extras/page-toolkits";
import React, { lazy, Suspense, useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { localAppDataKeys, resolveSettingsTab } from "@/lib/settings-sections";
import { HISTORY_EVENT } from "@/lib/workout-history";
import { CUSTOM_EVENT } from "@/lib/custom-workouts";
import { logger } from "@/lib/logger";
import { useLocation, useNavigate } from "react-router-dom";
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
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-load each panel — only the active tab loads, making Settings open fast.
const LiveUpdatePanel = lazy(() => import("./live-update-panel").then(m => ({ default: m.LiveUpdatePanel })));
const MaxX = (n: string) => lazy(() => import("./settings-max-extras").then((m) => ({ default: (m as unknown as Record<string, React.ComponentType>)[n] })));
const AccountMaxExtras = MaxX("AccountMaxExtras");
const SecurityMaxExtras = MaxX("SecurityMaxExtras");
const DisplayMaxExtras = MaxX("DisplayMaxExtras");
const PrivacyMaxExtras = MaxX("PrivacyMaxExtras");
const NotificationMaxExtras = MaxX("NotificationMaxExtras");
const UnitsMaxExtras = MaxX("UnitsMaxExtras");
const ChatMaxExtras = MaxX("ChatMaxExtras");
const DataMaxExtras = MaxX("DataMaxExtras");
const DeveloperMaxExtras = MaxX("DeveloperMaxExtras");
const AboutMaxExtras = MaxX("AboutMaxExtras");
const AccountSettings = lazy(() => import("./account-settings").then(m => ({ default: m.AccountSettings })));
const DisplaySettings = lazy(() => import("./display-settings").then(m => ({ default: m.DisplaySettings })));
const PrivacySettings = lazy(() => import("./privacy-settings").then(m => ({ default: m.PrivacySettings })));
const DeveloperOptions = lazy(() => import("./developer-options").then(m => ({ default: m.DeveloperOptions })));
const ChatSettingsPanel = lazy(() => import("./chat-settings").then(m => ({ default: m.ChatSettingsPanel })));
const SecurityLiveCenter = lazy(() => import("./settings-live-extras").then(m => ({ default: m.SecurityLiveCenter })));
const PrivacyLivePanel = lazy(() => import("./settings-live-extras").then(m => ({ default: m.PrivacyLivePanel })));
const NotificationLivePanel = lazy(() => import("./settings-live-extras").then(m => ({ default: m.NotificationLivePanel })));
const WorkoutLivePanel = lazy(() => import("./settings-live-extras").then(m => ({ default: m.WorkoutLivePanel })));
const StorageLivePanel = lazy(() => import("./settings-live-extras").then(m => ({ default: m.StorageLivePanel })));
const AboutPage = lazy(() => import("./about-page").then(m => ({ default: m.AboutPage })));
const SecurityCenter = lazy(() => import("./security-center").then(m => ({ default: m.SecurityCenter })));
const NotificationSettings = lazy(() => import("./notification-settings").then(m => ({ default: m.NotificationSettings })));
const UnitPreferences = lazy(() => import("./unit-preferences").then(m => ({ default: m.UnitPreferences })));
const SettingsBackupRestore = lazy(() => import("./settings-backup-restore").then(m => ({ default: m.SettingsBackupRestore })));
const DataManagementPanel = lazy(() => import("./data-management-panel").then(m => ({ default: m.DataManagementPanel })));
const PerformanceMetricsPanel = lazy(() => import("./performance-metrics-panel").then(m => ({ default: m.PerformanceMetricsPanel })));
const AdvancedSettingsReset = lazy(() => import("./advanced-settings-reset").then(m => ({ default: m.AdvancedSettingsReset })));
const UnifiedUpdateManager = lazy(() => import("./unified-update-manager").then(m => ({ default: m.UnifiedUpdateManager })));
const AccountQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.AccountQuantumExtras })));
const SecurityQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.SecurityQuantumExtras })));
const DisplayQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.DisplayQuantumExtras })));
const PrivacyQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.PrivacyQuantumExtras })));
const NotificationQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.NotificationQuantumExtras })));
const UnitsQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.UnitsQuantumExtras })));
const ChatQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.ChatQuantumExtras })));
const DataQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.DataQuantumExtras })));
const DeveloperQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.DeveloperQuantumExtras })));
const AboutQuantumExtras = lazy(() => import("./settings-quantum-extras").then(m => ({ default: m.AboutQuantumExtras })));
const AccountFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.AccountFusionExtras })));
const SecurityFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.SecurityFusionExtras })));
const DisplayFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.DisplayFusionExtras })));
const PrivacyFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.PrivacyFusionExtras })));
const NotificationFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.NotificationFusionExtras })));
const UnitsFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.UnitsFusionExtras })));
const ChatFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.ChatFusionExtras })));
const DataFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.DataFusionExtras })));
const DeveloperFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.DeveloperFusionExtras })));
const AboutFusionExtras = lazy(() => import("./settings-fusion-extras").then(m => ({ default: m.AboutFusionExtras })));
const AccountHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.AccountHyperExtras })));
const SecurityHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.SecurityHyperExtras })));
const DisplayHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.DisplayHyperExtras })));
const PrivacyHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.PrivacyHyperExtras })));
const NotificationHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.NotificationHyperExtras })));
const UnitsHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.UnitsHyperExtras })));
const ChatHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.ChatHyperExtras })));
const DataHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.DataHyperExtras })));
const DeveloperHyperExtras = lazy(() => import("./settings-hyper-extras").then(m => ({ default: m.DeveloperHyperExtras })));
import { ConfirmDialog } from "./confirm-dialog";
const VersionControlPanel = lazy(() => import("./version-control-panel").then(m => ({ default: m.VersionControlPanel })));
const AppearancePanel = lazy(() => import("./appearance-panel").then(m => ({ default: m.AppearancePanel })));
const NotificationPreferences = lazy(() => import("./notification-preferences").then(m => ({ default: m.NotificationPreferences })));
const DataBackupPanel = lazy(() => import("./data-backup-panel").then(m => ({ default: m.DataBackupPanel })));
const SystemHealthPanel = lazy(() => import("./system-health-panel").then(m => ({ default: m.SystemHealthPanel })));
const PwaVaultPanel = lazy(() => import("./pwa-vault-panel").then(m => ({ default: m.PwaVaultPanel })));
const NetworkAdaptiveBanner = lazy(() => import("./network-adaptive-banner").then(m => ({ default: m.NetworkAdaptiveBanner })));
const OneTapUpdateCenter = lazy(() => import("./one-tap-update-center").then(m => ({ default: m.OneTapUpdateCenter })));
const SettingsCopilot = lazy(() => import("./settings-copilot").then(m => ({ default: m.SettingsCopilot })));
const AccountExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.AccountExtras })));
const SecurityExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.SecurityExtras })));
const DisplayExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.DisplayExtras })));
const PrivacyExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.PrivacyExtras })));
const NotificationExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.NotificationExtras })));
const UnitsExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.UnitsExtras })));
const ChatExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.ChatExtras })));
const UpdateExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.UpdateExtras })));
const EnhancedValidationExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.EnhancedValidationExtras })));
const DeveloperExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.DeveloperExtras })));
const DataExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.DataExtras })));
const AboutExtras = lazy(() => import("./settings-power-extras").then(m => ({ default: m.AboutExtras })));
const AccountProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.AccountProExtras })));
const SecurityProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.SecurityProExtras })));
const DisplayProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.DisplayProExtras })));
const PrivacyProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.PrivacyProExtras })));
const NotificationProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.NotificationProExtras })));
const UnitsProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.UnitsProExtras })));
const ChatProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.ChatProExtras })));
const UpdateProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.UpdateProExtras })));
const DeveloperProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.DeveloperProExtras })));
const DataProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.DataProExtras })));
const AboutProExtras = lazy(() => import("./settings-pro-extras").then(m => ({ default: m.AboutProExtras })));
const UpdateCenter = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.UpdateCenter })));
const AccountNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.AccountNextExtras })));
const DisplayNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.DisplayNextExtras })));
const NotificationNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.NotificationNextExtras })));
const UnitsNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.UnitsNextExtras })));
const ChatNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.ChatNextExtras })));
const DataNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.DataNextExtras })));
const SecurityNextExtras = lazy(() => import("./settings-nextgen-extras").then(m => ({ default: m.SecurityNextExtras })));
const NetworkLabPanel = lazy(() => import("./network-lab-panel").then(m => ({ default: m.NetworkLabPanel })));
const NetworkRealtimePanel = lazy(() => import("./network-realtime-panel").then(m => ({ default: m.NetworkRealtimePanel })));
const AccountUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.AccountUltraExtras })));
const SecurityUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.SecurityUltraExtras })));
const DisplayUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.DisplayUltraExtras })));
const PrivacyUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.PrivacyUltraExtras })));
const NotificationUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.NotificationUltraExtras })));
const UnitsUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.UnitsUltraExtras })));
const ChatUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.ChatUltraExtras })));
const DataUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.DataUltraExtras })));
const DeveloperUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.DeveloperUltraExtras })));
const AboutUltraExtras = lazy(() => import("./settings-ultra-extras").then(m => ({ default: m.AboutUltraExtras })));

const AccountNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.AccountNovaExtras })));
const SecurityNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.SecurityNovaExtras })));
const DisplayNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.DisplayNovaExtras })));
const PrivacyNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.PrivacyNovaExtras })));
const NotificationNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.NotificationNovaExtras })));
const UnitsNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.UnitsNovaExtras })));
const ChatNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.ChatNovaExtras })));
const DataNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.DataNovaExtras })));
const DeveloperNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.DeveloperNovaExtras })));
const PythonLabPanel = lazy(() => import("./python-lab-panel").then(m => ({ default: m.PythonLabPanel })));
const AboutNovaExtras = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.AboutNovaExtras })));
const UpdateNovaCenter = lazy(() => import("./settings-nova-extras").then(m => ({ default: m.UpdateNovaCenter })));

const AccountPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.AccountPrimeExtras })));
const SecurityPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.SecurityPrimeExtras })));
const DisplayPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.DisplayPrimeExtras })));
const PrivacyPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.PrivacyPrimeExtras })));
const NotificationPrimePanel = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.NotificationPrimePanel })));
const UnitsPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.UnitsPrimeExtras })));
const ChatPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.ChatPrimeExtras })));
const DataPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.DataPrimeExtras })));
const DeveloperPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.DeveloperPrimeExtras })));
const AboutPrimeExtras = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.AboutPrimeExtras })));
const UpdateHealthPanel = lazy(() => import("./settings-prime-extras").then(m => ({ default: m.UpdateHealthPanel })));

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
  const location = useLocation();
  const navigate = useNavigate();
  // Deep link support: /settings?tab=updates opens that tab directly.
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return resolveSettingsTab(new URLSearchParams(window.location.search).get("tab"));
    } catch {
      return "account";
    }
  });

  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

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
    setActiveTab(resolveSettingsTab(new URLSearchParams(location.search).get("tab")));
  }, [location.search]);

  const handleClearLocalData = async () => {
    try {
      const keysToRemove = localAppDataKeys(localStorage);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.dispatchEvent(new Event(HISTORY_EVENT));
      window.dispatchEvent(new Event(CUSTOM_EVENT));

      toast({
        title: "✅ Data Cleared",
        description: `Successfully cleared ${keysToRemove.length} items from local storage.`,
      });

    } catch (error) {
      logger.error("Error clearing data:", error);
      toast({
        title: "❌ Error",
        description: "Failed to clear local data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      localStorage.removeItem("auth_token");
      setIsLoggedOut(true);

      toast({
        title: "👋 Logged Out",
        description: "You have been securely logged out.",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      toast({
        title: "❌ Logout Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    const tab = resolveSettingsTab(value);
    setActiveTab(tab);
    setShowMobileMenu(false);
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  if (isLoggedOut) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto py-20 text-center space-y-4"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Successfully Logged Out</h2>
        <p className="text-muted-foreground">
          Your session has ended securely. Please refresh the page to log in
          again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 bg-primary text-primary-foreground"
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
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-border/30 shadow-lg">
        <div className="relative overflow-hidden">
          <div className="relative max-w-screen-xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                >
                  <Settings className="h-5 w-5 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-foreground/30 to-transparent pointer-events-none" />
                </motion.div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-accent-foreground bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                    Account and app preferences
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-background/40 backdrop-blur-sm border-border/30"
                  onClick={() => handleTabChange("search")}
                  aria-label="Search settings"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Search</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden rounded-xl bg-background/40 backdrop-blur-sm border-border/30"
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

      <div className="max-w-screen-xl mx-auto py-6 px-4 space-y-4">
        
        <L><SettingsCopilot /></L>
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
                      Updates: "about",
                      Chat: "chat",
                      Units: "display",
                      About: "about",
                      Developer: "about",
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
              <div className="space-y-6">
                <L><AccountSettings /></L>
                <L><AccountExtras /></L>
                <L><AccountProExtras /></L>
                <L><AccountNextExtras /></L>
                <L><AccountUltraExtras /></L>
                <L><AccountMaxExtras /></L>
                <L><AccountHyperExtras /></L>
                <L><AccountQuantumExtras /></L>
                <L><AccountFusionExtras /></L>
                <L><AccountNovaExtras /></L>
                <L><AccountPrimeExtras /></L>
                <L><NetworkAdaptiveBanner /></L>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="space-y-6">
                <L><SecurityLiveCenter /></L>
                <L><SecurityCenter /></L>
                <L><SecurityExtras /></L>
                <L><SecurityProExtras /></L>
                <L><SecurityNextExtras /></L>
                <L><SecurityUltraExtras /></L>
                <L><SecurityMaxExtras /></L>
                <L><SecurityHyperExtras /></L>
                <L><SecurityQuantumExtras /></L>
                <L><SecurityFusionExtras /></L>
                <L><SecurityNovaExtras /></L>
                <L><SecurityPrimeExtras /></L>
              </div>
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <div className="space-y-6">
                <L><AppearancePanel /></L>
                <L><DisplaySettings /></L>
                <L><DisplayExtras /></L>
                <L><DisplayProExtras /></L>
                <L><DisplayNextExtras /></L>
                <L><DisplayUltraExtras /></L>
                <L><DisplayMaxExtras /></L>
                <L><DisplayHyperExtras /></L>
                <L><DisplayQuantumExtras /></L>
                <L><DisplayFusionExtras /></L>
                <L><DisplayNovaExtras /></L>
                <L><DisplayPrimeExtras /></L>
                <h2 className="text-lg font-semibold">Units & Workout Preferences</h2>

                <L><WorkoutLivePanel /></L>
                <L><UnitPreferences /></L>
                <L><UnitsExtras /></L>
                <L><UnitsProExtras /></L>
                <L><UnitsNextExtras /></L>
                <L><UnitsUltraExtras /></L>
                <L><UnitsMaxExtras /></L>
                <L><UnitsHyperExtras /></L>
                <L><UnitsQuantumExtras /></L>
                <L><UnitsFusionExtras /></L>
                <L><UnitsNovaExtras /></L>
                <L><UnitsPrimeExtras /></L>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <div className="space-y-6">
                <L><PrivacyLivePanel /></L>
                <L><PrivacySettings /></L>
                <L><PrivacyExtras /></L>
                <L><PrivacyProExtras /></L>
                <L><PrivacyUltraExtras /></L>
                <L><PrivacyMaxExtras /></L>
                <L><PrivacyHyperExtras /></L>
                <L><PrivacyQuantumExtras /></L>
                <L><PrivacyFusionExtras /></L>
                <L><PrivacyNovaExtras /></L>
                <L><PrivacyPrimeExtras /></L>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="space-y-6">
                <PushDevicePanel />
                <L><NotificationLivePanel /></L>
                <L><NotificationPreferences /></L>
                <L><NotificationSettings /></L>
                <L><NotificationExtras /></L>
                <L><NotificationProExtras /></L>
                <L><NotificationNextExtras /></L>
                <L><NotificationUltraExtras /></L>
                <L><NotificationMaxExtras /></L>
                <L><NotificationHyperExtras /></L>
                <L><NotificationQuantumExtras /></L>
                <L><NotificationFusionExtras /></L>
                <L><NotificationNovaExtras /></L>
                <L><NotificationPrimePanel /></L>
              </div>
            </TabsContent>



            <TabsContent value="chat" className="mt-0">
              <div className="space-y-6">
                <L><ChatSettingsPanel /></L>
                <L><ChatExtras /></L>
                <L><ChatProExtras /></L>
                <L><ChatNextExtras /></L>
                <L><ChatUltraExtras /></L>
                <L><ChatMaxExtras /></L>
                <L><ChatHyperExtras /></L>
                <L><ChatQuantumExtras /></L>
                <L><ChatFusionExtras /></L>
                <L><ChatNovaExtras /></L>
                <L><ChatPrimeExtras /></L>
              </div>
            </TabsContent>








            <TabsContent value="data" className="mt-0">
              <div className="space-y-6">
                <L><StorageLivePanel /></L>
                <L><DataMaxExtras /></L>
                <SettingsTransferPanel />
                <L><DataBackupPanel /></L>
                <L><DataExtras /></L>
                <L><DataProExtras /></L>
                <L><DataNextExtras /></L>
                <L><DataUltraExtras /></L>
                <L><DataQuantumExtras /></L>
                <L><DataFusionExtras /></L>
                <L><DataNovaExtras /></L>
                <L><DataPrimeExtras /></L>
                <L><NetworkRealtimePanel /></L>
                <L><NetworkLabPanel /></L>
                <L><SystemHealthPanel /></L>
                <L><EnhancedValidationExtras /></L>
                <L><PerformanceMetricsPanel /></L>
                <L><AdvancedSettingsReset /></L>
                <L><SettingsBackupRestore /></L>
                <L><DataManagementPanel /></L>

                <div className="bg-muted/30 p-6 rounded-lg border">
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
                      onClick={() => setConfirmClearOpen(true)}
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
                      onClick={() => setConfirmLogoutOpen(true)}
                    >
                      <div className="text-left">
                        <div className="font-medium">Log Out</div>
                        <div className="text-xs">
                          Sign out on every device
                        </div>
                      </div>
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="space-y-6">
                <L><AboutPage /></L>
                <L><AboutMaxExtras /></L>
                <L><AboutExtras /></L>
                <L><AboutProExtras /></L>
                <L><AboutUltraExtras /></L>
                <L><AboutQuantumExtras /></L>
                <L><AboutFusionExtras /></L>
                <L><AboutNovaExtras /></L>
                <L><AboutPrimeExtras /></L>
                <L><DeveloperOptions /></L>
                <L><DeveloperExtras /></L>
                <L><DeveloperProExtras /></L>
                <L><DeveloperUltraExtras /></L>
                <L><DeveloperMaxExtras /></L>
                <L><DeveloperHyperExtras /></L>
                <L><DeveloperQuantumExtras /></L>
                <L><DeveloperFusionExtras /></L>
                <L><DeveloperNovaExtras /></L>
                <L><DeveloperPrimeExtras /></L>
                <L><PythonLabPanel /></L>
                <h2 className="text-lg font-semibold">App Updates</h2>

                <L><LiveUpdatePanel /></L>
                <L><OneTapUpdateCenter /></L>
                <L><UpdateHealthPanel /></L>
                <L><VersionControlPanel /></L>
                <L><PwaVaultPanel /></L>
                <L><DataFusionExtras /></L>
              </div>
            </TabsContent>


          </Tabs>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        onConfirm={handleClearLocalData}
        title="Clear all local data?"
        description="This removes cached app data from this device. Your session and account are preserved."
        confirmLabel="Clear data"
        destructive
      />
      <ConfirmDialog
        open={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        onConfirm={handleLogout}
        title="Sign out of all devices?"
        description="This ends your session on every device signed into this account."
        confirmLabel="Sign out everywhere"
        destructive
      />
    </div>
  );
}
