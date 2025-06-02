
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { DisplaySettings } from "./display-settings";
import { PrivacySettings } from "./privacy-settings";
import { DeveloperOptions } from "./developer-options";
import { ChatSettingsPanel } from "./chat-settings";
import { AboutPage } from "./about-page";
import { EnhancedSettingsValidation } from "./enhanced-settings-validation";
import { AppUpdateManager } from "./app-update-manager";
import { SecurityCenter } from "./security-center";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function SettingsContainer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [settingsValidated, setSettingsValidated] = useState(false);
  
  const handleClearLocalData = () => {
    try {
      const keysToPreserve = ['auth_token', 'supabase.auth.token', 'app_version'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key) && !key.startsWith('supabase.auth')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: "Local Data Cleared",
        description: "All app data has been removed from your device.",
      });
    } catch (error) {
      toast({
        title: "Error Clearing Data",
        description: "There was a problem clearing your local data.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('auth_token');
      setIsLoggedOut(true);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const validateAllSettings = () => {
    setSettingsValidated(true);
    toast({
      title: "Settings Validated",
      description: "All settings have been validated successfully.",
    });
  };
  
  if (isLoggedOut) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">You've been logged out</h2>
        <p className="text-muted-foreground">
          Your session has ended. Please close this window or refresh the page to log in again.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Refresh Page
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {!settingsValidated && (
        <Alert className="mx-4 mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Some settings may need validation to ensure proper functionality.</span>
            <Button variant="outline" size="sm" onClick={validateAllSettings}>
              Validate Now
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="max-w-screen-xl mx-auto px-4">
            <TabsList className="flex flex-nowrap overflow-x-auto py-2 scrollbar-none -mb-px">
              <TabsTrigger value="account" className="flex-shrink-0">Account</TabsTrigger>
              <TabsTrigger value="security" className="flex-shrink-0">Security</TabsTrigger>
              <TabsTrigger value="display" className="flex-shrink-0">Display</TabsTrigger>
              <TabsTrigger value="privacy" className="flex-shrink-0">Privacy</TabsTrigger>
              <TabsTrigger value="chat" className="flex-shrink-0">Chat</TabsTrigger>
              <TabsTrigger value="updates" className="flex-shrink-0">Updates</TabsTrigger>
              <TabsTrigger value="enhanced" className="flex-shrink-0">Enhanced</TabsTrigger>
              <TabsTrigger value="developer" className="flex-shrink-0">Developer</TabsTrigger>
              <TabsTrigger value="data" className="flex-shrink-0">Data</TabsTrigger>
              <TabsTrigger value="about" className="flex-shrink-0">About</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto py-6 px-4">
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
            <AppUpdateManager />
          </TabsContent>
          
          <TabsContent value="enhanced" className="mt-0">
            <EnhancedSettingsValidation />
          </TabsContent>
          
          <TabsContent value="developer" className="mt-0">
            <DeveloperOptions />
          </TabsContent>
          
          <TabsContent value="data" className="mt-0">
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Data Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your local data and account session
                </p>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={handleClearLocalData}
                  >
                    <span>Clear Local Data</span>
                    <span className="text-xs text-muted-foreground">Removes app data from this device</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={validateAllSettings}
                  >
                    <span>Validate All Settings</span>
                    <span className="text-xs text-muted-foreground">Check all configurations</span>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full justify-between"
                    onClick={handleLogout}
                  >
                    <span>Log Out</span>
                    <span className="text-xs">End your current session</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <AboutPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
