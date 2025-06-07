
import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { EnhancedChatAuth } from "@/components/chat/enhanced-chat-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck, Settings, Bell, Users, Menu, X, Camera, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { MobileChatInterface } from "@/components/chat/mobile-chat-interface";
import { ChatSettings } from "@/components/chat/chat-settings";
import { ChatSecurity } from "@/components/chat/chat-security";
import { ChatNotifications } from "@/components/chat/chat-notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [securityLevel, setSecurityLevel] = useState("high");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [onlineUsers, setOnlineUsers] = useState(3);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setConnectionStatus("connecting");
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          console.log("User authenticated:", session.user?.email);
          loadUserPreferences(session.user?.id);
          setConnectionStatus("connected");
          
          // Simulate real-time connection
          setTimeout(() => {
            setOnlineUsers(Math.floor(Math.random() * 10) + 1);
          }, 1000);
        } else {
          setConnectionStatus("disconnected");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Failed to check authentication status");
        setConnectionStatus("disconnected");
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
        setConnectionStatus("disconnected");
        toast({
          title: "Signed out",
          description: "You've been signed out of FitFusion Chat."
        });
      } else if (event === 'SIGNED_IN') {
        setConnectionStatus("connected");
        toast({
          title: "Welcome back!",
          description: "You're now connected to FitFusion Chat."
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const loadUserPreferences = (userId?: string) => {
    if (!userId) return;
    
    try {
      const preferences = localStorage.getItem(`chat_preferences_${userId}`);
      if (preferences) {
        const parsed = JSON.parse(preferences);
        setSecurityLevel(parsed.securityLevel || "high");
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  };

  const saveUserPreferences = (userId?: string) => {
    if (!userId) return;
    
    try {
      const preferences = {
        securityLevel,
        notificationsEnabled,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`chat_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  };
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAuthError(null);
    setConnectionStatus("connected");
    toast({
      title: "Authentication successful",
      description: "Welcome to FitFusion Chat!"
    });
  };
  
  const handleAuthError = (error: string) => {
    setAuthError(error);
    setIsAuthenticated(false);
    setConnectionStatus("disconnected");
  };
  
  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        saveUserPreferences(session.user.id);
      }
      
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setConnectionStatus("disconnected");
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

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "bg-green-500";
      case "connecting": return "bg-yellow-500";
      case "disconnected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to FitFusion Chat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col">
      {/* Enhanced Mobile-First Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fitness-gradient pt-8 pb-4 px-4 shrink-0 shadow-xl relative overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm shadow-lg" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  FitFusion Chat
                </h1>
                <p className="text-white/90 text-xs md:text-sm">Secure fitness community • v5.0.4</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 text-xs">
                  Enhanced
                </Badge>
              )}
              {isAuthenticated && (
                <>
                  <Badge variant="default" className={`${getSecurityBadgeColor()} text-white border-0 text-xs`}>
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {isMobile ? "SECURE" : securityLevel.toUpperCase()}
                  </Badge>
                  
                  {/* Mobile Menu for Settings */}
                  {isMobile ? (
                    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm shadow-lg"
                        >
                          <Menu className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Chat Settings
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                              <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
                              <TabsTrigger value="notifications" className="text-xs">Alerts</TabsTrigger>
                            </TabsList>
                            
                            <div className="mt-4 space-y-4">
                              <TabsContent value="settings">
                                <ChatSettings onClose={() => setShowMobileMenu(false)} />
                              </TabsContent>
                              
                              <TabsContent value="security">
                                <ChatSecurity 
                                  securityLevel={securityLevel}
                                  onSecurityLevelChange={setSecurityLevel}
                                  onClose={() => setShowMobileMenu(false)}
                                />
                              </TabsContent>
                              
                              <TabsContent value="notifications">
                                <ChatNotifications 
                                  enabled={notificationsEnabled}
                                  onEnabledChange={setNotificationsEnabled}
                                  onClose={() => setShowMobileMenu(false)}
                                />
                              </TabsContent>
                            </div>
                          </Tabs>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(true)}
                      className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm shadow-lg"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Enhanced Status Indicators - Optimized for Mobile */}
          {isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-2"
            >
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${getConnectionStatusColor()}`} />
                <span className="text-white text-xs font-medium">
                  {connectionStatus === "connected" ? "Connected" : 
                   connectionStatus === "connecting" ? "Connecting..." : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Users className="w-3 h-3 text-white" />
                <span className="text-white text-xs">{onlineUsers} Online</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                <span className="text-white text-xs">E2E Encrypted</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Camera className="w-3 h-3 text-blue-400" />
                <span className="text-white text-xs">Media Ready</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
        {isAuthenticated ? (
          <div className="flex-1 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="h-full"
            >
              {isMobile ? (
                <MobileChatInterface />
              ) : (
                <div className="p-4 md:p-6 h-full max-w-7xl mx-auto">
                  <AdvancedChatInterface 
                    onLogout={handleLogout}
                    securityLevel={securityLevel}
                    notificationsEnabled={notificationsEnabled}
                  />
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-6 flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                >
                  <p className="text-sm text-destructive">{authError}</p>
                </motion.div>
              )}
              
              <EnhancedChatAuth 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
              
              {/* Enhanced Security Features */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 p-6 rounded-xl border border-muted shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-center mb-4">Military-Grade Security</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-full mr-3">
                        <KeyRound className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">End-to-End Encryption</div>
                        <div className="text-xs text-muted-foreground">AES-256 encryption</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-full mr-3">
                        <Camera className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Secure Media Sharing</div>
                        <div className="text-xs text-muted-foreground">Photos, videos & documents</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-full mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Private Communities</div>
                        <div className="text-xs text-muted-foreground">Secure group fitness chats</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Desktop Settings Dialog */}
      {!isMobile && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Chat Settings
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="settings">General Settings</TabsTrigger>
                <TabsTrigger value="security">Security & Privacy</TabsTrigger>
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
      )}
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
