
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MessageCircle, Users, Shield, Zap, Settings } from "lucide-react";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function FitfusionChatSection() {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  
  const handleOpenFullChat = () => {
    navigate("/chat");
  };

  return (
    <Card className="mx-4 mt-6 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">FitFusion Chat</CardTitle>
              <p className="text-sm text-muted-foreground">Connect securely with fitness friends</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs"
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? "Hide" : "Show"} 
              <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showChat ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Group Chats
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Media Sharing
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Advanced Security
          </Badge>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 600 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="h-[600px] w-full border-t">
                <AdvancedChatInterface 
                  securityLevel="high" 
                  notificationsEnabled={true}
                />
              </div>
              
              {/* Quick action bar */}
              <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>3 active conversations</span>
                </div>
                
                <Button 
                  onClick={handleOpenFullChat}
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                >
                  Open Full Chat
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat preview when collapsed */}
      {!showChat && (
        <CardContent className="pt-0">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Chat Ready</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Start conversations with fitness enthusiasts worldwide
            </p>
            <Button 
              onClick={handleOpenFullChat}
              size="sm" 
              className="w-full"
            >
              Launch Chat
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
