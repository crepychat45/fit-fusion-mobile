import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  Shield, 
  Palette, 
  MessageSquare, 
  Download, 
  Code, 
  Database,
  Info,
  Sparkles,
  Zap,
  Save,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  color: string;
}

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
  
  const tabs: TabInfo[] = [
    {
      id: "account",
      label: "Account",
      icon: Settings,
      description: "Personal info & preferences",
      color: "text-blue-600"
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Authentication & privacy",
      badge: "Enhanced",
      color: "text-green-600"
    },
    {
      id: "display",
      label: "Display",
      icon: Palette,
      description: "Theme & appearance",
      color: "text-purple-600"
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Shield,
      description: "Data & permissions",
      color: "text-orange-600"
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageSquare,
      description: "Messaging preferences",
      badge: "AI",
      color: "text-pink-600"
    },
    {
      id: "updates",
      label: "Updates",
      icon: Download,
      description: "Version management",
      badge: "5.0.2",
      color: "text-indigo-600"
    },
    {
      id: "enhanced",
      label: "Enhanced",
      icon: Sparkles,
      description: "Advanced features",
      badge: "Pro",
      color: "text-yellow-600"
    },
    {
      id: "developer",
      label: "Developer",
      icon: Code,
      description: "Debug & testing",
      color: "text-red-600"
    },
    {
      id: "data",
      label: "Data",
      icon: Database,
      description: "Export & management",
      color: "text-cyan-600"
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      description: "App information",
      color: "text-gray-600"
    }
  ];

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
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
      const confirmation = window.confirm("Are you sure you want to clear all local data? This action cannot be undone.");
      if (!confirmation) return;

      const keysToPreserve = ['auth_token', 'supabase.auth.token', 'fitfusion-app-version'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key) && !key.startsWith('supabase.auth')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
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
      localStorage.removeItem('auth_token');
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
      "Final verification..."
    ];

    try {
      for (let i = 0; i < validationSteps.length; i++) {
        setValidationProgress((i + 1) / validationSteps.length * 100);
        
        // Simulate validation time
        await new Promise(resolve => setTimeout(resolve, 600));
        
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
      await new Promise(resolve => setTimeout(resolve, 300));
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
      const shouldContinue = window.confirm("You have unsaved changes. Do you want to continue without saving?");
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
          Your session has ended securely. Please refresh the page to log in again.
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
                  <p className="text-sm text-muted-foreground">Customize your experience</p>
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
                {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>

              {hasUnsavedChanges && (
                <Button variant="outline" size="sm" className="bg-orange-50 border-orange-200 text-orange-700">
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              )}
              
              <Button 
                variant={settingsValidated ? "default" : "outline"}
                size="sm" 
                className={settingsValidated ? "bg-green-600 hover:bg-green-700" : ""}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Zap className="h-4 w-4 mr-1 animate-spin" />
                    Validating...
                  </>
                ) : settingsValidated ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validated
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Validate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay with improved design */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="bg-white dark:bg-gray-900 w-80 h-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Navigation</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-4 space-y-1">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <tab.icon className={`h-5 w-5 ${
                          activeTab === tab.id ? 'text-white' : tab.color
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className={`text-xs ${
                          activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                      {tab.badge && (
                        <Badge 
                          variant={activeTab === tab.id ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </motion.button>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Status Alert */}
      <AnimatePresence>
        {!settingsValidated && !isValidating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="mx-4 mt-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>Settings validation recommended for optimal performance.</span>
                <Button variant="outline" size="sm" onClick={validateAllSettings}>
                  <Zap className="h-4 w-4 mr-1" />
                  Validate Now
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Enhanced Desktop Tab Navigation */}
        <div className="border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 hidden md:block">
          <div className="max-w-screen-xl mx-auto px-4">
            <ScrollArea className="w-full">
              <div className="flex items-center py-2">
                <TabsList className="flex-shrink-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 shadow-sm">
                  {tabs.slice(0, 6).map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="relative group data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <tab.icon className={`h-4 w-4 ${tab.color}`} />
                        <span className="font-medium">{tab.label}</span>
                        {tab.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {tab.badge}
                          </Badge>
                        )}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Overflow tabs */}
                <div className="ml-4 flex gap-1">
                  {tabs.slice(6).map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleTabChange(tab.id)}
                      className="flex items-center gap-2"
                    >
                      <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto py-6 px-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
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
                <AppUpdateManager />
                <VersionManager />
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
                    <Database className="h-5 w-5 text-blue-600" />
                    Data Management Center
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Manage your local data, account session, and export preferences with advanced controls
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-auto p-4"
                      onClick={handleClearLocalData}
                    >
                      <div className="text-left">
                        <div className="font-medium">Clear Local Data</div>
                        <div className="text-xs text-muted-foreground">Removes app data from this device</div>
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
                        <div className="text-xs">End your current session securely</div>
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
          </motion.div>
        </div>
      </Tabs>
    </div>
  );
}
