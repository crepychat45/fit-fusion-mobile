
import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { userProfile } from "@/data/user";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Simulate authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      // In a real app, you would check session/token validity
      const token = localStorage.getItem("auth_token");
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      checkAuth();
    }, 300); // Reduced delay for better UX
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogin = () => {
    // Set a token for persistent login
    localStorage.setItem("auth_token", "sample_token_" + Date.now());
    setIsAuthenticated(true);
    toast({
      title: "Welcome back!",
      description: "You've successfully logged in to FitFusion Chat."
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You've been logged out of FitFusion Chat."
    });
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
      {!isAuthenticated && (
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
              v4.5.0
            </Badge>
          </div>
        </div>
      )}
      
      <div className={`flex-1 flex flex-col ${isAuthenticated ? '' : 'mt-4'} ${isMobile ? 'pb-20' : ''}`}>
        {isAuthenticated ? (
          <div className="w-full h-full flex-1 overflow-hidden">
            <FitfusionChat onLogout={handleLogout} />
          </div>
        ) : (
          <div className="max-w-md mx-auto px-4">
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
                    <Key className="h-3 w-3 text-primary" />
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
            
            <AuthForm onSuccess={handleLogin} />
          </div>
        )}
      </div>
      
      <MobileNav />
    </div>
  );
};

// Add the Badge component if not already imported
import { Badge } from "@/components/ui/badge";

export default ChatPage;
