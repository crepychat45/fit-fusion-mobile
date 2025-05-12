
import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSettings } from "@/components/settings/account-settings"; 
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Add auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
              className="mr-2 text-white" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">FitFusion Chat</h1>
              <p className="text-white/80 text-sm">Connect with fitness friends securely</p>
            </div>
          </div>
          <Badge variant="outline" className="text-white border-white/30">
            v4.6.0
          </Badge>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile ? 'pb-20' : ''}`}>
        {isAuthenticated ? (
          <div className="w-full h-full flex-1 overflow-hidden">
            <FitfusionChat onLogout={handleLogout} />
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Sign in to FitFusion Chat</h2>
              <p className="text-muted-foreground">
                Connect with trainers and friends to discuss your fitness journey
              </p>
            </div>
            
            <div className="mb-6 bg-muted/30 p-4 rounded-lg border border-muted">
              <div className="flex items-center mb-2">
                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Security Features</h3>
              </div>
              <Separator className="my-2" />
              <div className="text-sm space-y-2">
                <p className="flex items-center">
                  <span className="bg-primary/10 p-1 rounded mr-2">
                    <KeyRound className="h-3 w-3 text-primary" />
                  </span>
                  End-to-end encryption
                </p>
                <p className="flex items-center">
                  <span className="bg-primary/10 p-1 rounded mr-2">
                    <svg className="h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a5 5 0 0 1 5 5v1H7V7a5 5 0 0 1 5-5z"></path>
                      <rect x="5" y="8" width="14" height="12" rx="2" ry="2"></rect>
                      <circle cx="12" cy="14" r="2"></circle>
                      <path d="M12 16v2"></path>
                    </svg>
                  </span>
                  Biometric & PIN protection
                </p>
                <p className="flex items-center">
                  <span className="bg-primary/10 p-1 rounded mr-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                  </span>
                  Privacy controls
                </p>
              </div>
            </div>
            
            <div className="bg-background rounded-lg border">
              <AccountSettings />
            </div>
          </div>
        )}
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
