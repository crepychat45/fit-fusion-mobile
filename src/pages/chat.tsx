
import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { EnhancedChatAuth } from "@/components/chat/enhanced-chat-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck, Settings, Bell, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { ChatSettings } from "@/components/chat/chat-settings";
import { ChatSecurity } from "@/components/chat/chat-security";
import { ChatNotifications } from "@/components/chat/chat-notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [securityLevel, setSecurityLevel] = useState("high");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          console.log("User authenticated:", session.user?.email);
          // Load user preferences
          loadUserPreferences(session.user?.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setIsAuthenticated(!!session);
      setAuthError(null);
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You've been signed out of FitFusion Chat."
        });
      } else if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "You're now signed in to FitFusion Chat."
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const loadUserPreferences = (userId?: string) => {
    if (!userId) return;
    
    // Load from localStorage for now
    const preferences = localStorage.getItem(`chat_preferences_${userId}`);
    if (preferences) {
      const parsed = JSON.parse(preferences);
      setSecurityLevel(parsed.securityLevel || "high");
      setNotificationsEnabled(parsed.notificationsEnabled ?? true);
    }
  };

  const saveUserPreferences = (userId?: string) => {
    if (!userId) return;
    
    const preferences = {
      securityLevel,
      notificationsEnabled,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`chat_preferences_${userId}`, JSON.stringify(preferences));
  };
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAuthError(null);
    toast({
      title: "Authentication successful",
      description: "Welcome to FitFusion Chat!"
    });
  };
  
  const handleAuthError = (error: string) => {
    setAuthError(error);
    setIsAuthenticated(false);
  };
  
  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        saveUserPreferences(session.user.id);
      }
      
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      toast({
        title: "Logged out",
        description: "You've been logged out of FitFusion Chat."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSecurityBadgeColor = () => {
    switch (securityLevel) {
      case "high": return "bg-green-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-orange-600";
      default: return "bg-green-600";
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading FitFusion Chat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col">
      <div className="fitness-gradient pt-8 pb-6 px-4 shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-3 text-white hover:bg-white/20 rounded-full" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">FitFusion Chat</h1>
              <p className="text-white/90 text-sm">Secure fitness community platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-white border-white/30 bg-white/10">
              v5.2.0
            </Badge>
            {isAuthenticated && (
              <>
                <Badge variant="default" className={`${getSecurityBadgeColor()} text-white border-0`}>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {securityLevel.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
        {isAuthenticated ? (
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full max-w-7xl mx-auto">
              <AdvancedChatInterface 
                onLogout={handleLogout}
                securityLevel={securityLevel}
                notificationsEnabled={notificationsEnabled}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-6 flex-1 flex items-center justify-center">
            <div className="w-full">
              {authError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive">{authError}</p>
                </div>
              )}
              
              <EnhancedChatAuth 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
              
              <div className="mt-8 text-center">
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 p-6 rounded-xl border border-muted shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <ShieldCheck className="h-6 w-6 text-primary mr-2" />
                    <h3 className="font-semibold text-lg">Advanced Security</h3>
                  </div>
                  <div className="text-sm space-y-3">
                    <div className="flex items-center justify-center">
                      <span className="bg-primary/10 p-2 rounded-full mr-3">
                        <KeyRound className="h-4 w-4 text-primary" />
                      </span>
                      <span>Military-grade encryption</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="bg-primary/10 p-2 rounded-full mr-3">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </span>
                      <span>Zero-knowledge architecture</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="bg-primary/10 p-2 rounded-full mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </span>
                      <span>Private group conversations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Chat Settings & Security</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="settings" className="h-full">
                <ChatSettings onClose={() => setShowSettings(false)} />
              </TabsContent>
              
              <TabsContent value="security" className="h-full">
                <ChatSecurity 
                  securityLevel={securityLevel}
                  onSecurityLevelChange={setSecurityLevel}
                  onClose={() => setShowSettings(false)}
                />
              </TabsContent>
              
              <TabsContent value="notifications" className="h-full">
                <ChatNotifications 
                  enabled={notificationsEnabled}
                  onEnabledChange={setNotificationsEnabled}
                  onClose={() => setShowSettings(false)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
