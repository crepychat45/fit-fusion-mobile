
import React, { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { useToast } from "@/components/ui/use-toast";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Simulate authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  
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
    }, 500);
    
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-white" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">FitFusion Chat</h1>
            <p className="text-white/80 text-sm">Connect with fitness friends securely</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 mt-6 pb-20">
        {isAuthenticated ? (
          <FitfusionChat />
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Sign in to FitFusion Chat</h2>
              <p className="text-muted-foreground">
                Connect with trainers and friends to discuss your fitness journey
              </p>
            </div>
            <AuthForm onSuccess={handleLogin} />
          </div>
        )}
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
