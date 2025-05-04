
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const navigate = useNavigate();

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
        <FitfusionChat />
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
