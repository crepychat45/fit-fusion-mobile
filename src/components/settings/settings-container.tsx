
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { DisplaySettings } from "./display-settings";
import { PrivacySettings } from "./privacy-settings";
import { DeveloperOptions } from "./developer-options";
import { ChatSettingsPanel } from "./chat-settings";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function SettingsContainer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  
  const handleClearLocalData = () => {
    try {
      // Clear only app data, not authentication
      const keysToPreserve = ['auth_token', 'supabase.auth.token'];
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
  
  if (isLoggedOut) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="max-w-screen-xl mx-auto px-4">
            <TabsList className="flex flex-nowrap overflow-x-auto py-2 scrollbar-none -mb-px">
              <TabsTrigger value="account" className="flex-shrink-0">Account</TabsTrigger>
              <TabsTrigger value="display" className="flex-shrink-0">Display</TabsTrigger>
              <TabsTrigger value="privacy" className="flex-shrink-0">Privacy</TabsTrigger>
              <TabsTrigger value="chat" className="flex-shrink-0">Chat</TabsTrigger>
              <TabsTrigger value="developer" className="flex-shrink-0">Developer</TabsTrigger>
              <TabsTrigger value="data" className="flex-shrink-0">Data Management</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto py-6 px-4">
          <TabsContent value="account" className="mt-0">
            <AccountSettings />
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
        </div>
      </Tabs>
    </div>
  );
}
