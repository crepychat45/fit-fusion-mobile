
import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { EnhancedChatAuth } from "@/components/chat/enhanced-chat-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/common/loading-spinner";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          console.log("User authenticated:", session.user?.email);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Add auth state listener
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading FitFusion Chat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fitness-gradient pt-8 pb-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-white hover:bg-white/20" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">FitFusion Chat</h1>
              <p className="text-white/80 text-sm">Connect with fitness friends securely</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/30">
              v4.7.0
            </Badge>
            {isAuthenticated && (
              <Badge variant="default" className="bg-green-600 text-white">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile ? 'pb-20' : ''}`}>
        {isAuthenticated ? (
          <div className="w-full h-full flex-1 overflow-hidden">
            <FitfusionChat onLogout={handleLogout} />
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 flex-1 flex items-center justify-center">
            <div className="w-full">
              {authError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{authError}</p>
                </div>
              )}
              
              <EnhancedChatAuth 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
              
              <div className="mt-6 text-center">
                <div className="mb-4 bg-muted/30 p-4 rounded-lg border border-muted">
                  <div className="flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Security Features</h3>
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center justify-center">
                      <span className="bg-primary/10 p-1 rounded mr-2">
                        <KeyRound className="h-3 w-3 text-primary" />
                      </span>
                      End-to-end encryption
                    </p>
                    <p className="flex items-center justify-center">
                      <span className="bg-primary/10 p-1 rounded mr-2">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                      </span>
                      Secure authentication
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
