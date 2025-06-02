
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FitfusionChat } from "@/components/chat/fitfusion-chat";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { motion } from "framer-motion";

export function FitfusionChatSection() {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">FitFusion Chat</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-xs text-muted-foreground"
          onClick={() => setShowChat(!showChat)}
        >
          {showChat ? "Hide" : "Show"} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-[600px] w-full"
        >
          <AdvancedChatInterface />
        </motion.div>
      )}
    </div>
  );
}
