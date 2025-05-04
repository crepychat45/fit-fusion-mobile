
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-xl font-bold text-white">FitFusion Chat</h1>
        <p className="text-white/80 text-sm">Connect with fitness friends</p>
      </div>
      
      <div className="px-4 mt-6">
        <FitfusionChat />
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ChatPage;
