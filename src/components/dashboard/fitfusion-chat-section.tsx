
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MessageCircle, Users, Shield, Zap, Settings, Smartphone, Monitor } from "lucide-react";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { MobileChatInterface } from "@/components/chat/mobile-chat-interface";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function FitfusionChatSection() {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleOpenFullChat = () => {
    navigate("/chat");
  };

  return (
    <Card className="mx-4 mt-6 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">FitFusion Chat</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>Secure fitness community</span>
                {isMobile ? (
                  <Smartphone className="h-3 w-3 ml-1" />
                ) : (
                  <Monitor className="h-3 w-3 ml-1" />
                )}
              </p>
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

        {/* Enhanced Feature Highlights */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            <Users className="h-3 w-3 mr-1" />
            Group Chats
          </Badge>
          <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            <Zap className="h-3 w-3 mr-1" />
            Media Sharing
          </Badge>
          <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            <Settings className="h-3 w-3 mr-1" />
            Advanced Security
          </Badge>
          {isMobile && (
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile Optimized
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: isMobile ? 500 : 600 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="p-0">
              <div className={`${isMobile ? 'h-[500px]' : 'h-[600px]'} w-full border-t`}>
                {isMobile ? (
                  <MobileChatInterface />
                ) : (
                  <AdvancedChatInterface 
                    securityLevel="high" 
                    notificationsEnabled={true}
                  />
                )}
              </div>
              
              {/* Enhanced Quick Action Bar */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">3 active conversations</span>
                  {isMobile && (
                    <>
                      <span>•</span>
                      <span className="text-xs">Mobile ready</span>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={handleOpenFullChat}
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 shadow-sm"
                >
                  Open Full Chat
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Preview */}
      {!showChat && (
        <CardContent className="pt-0">
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-4 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Chat System Ready</span>
                {isMobile && <Smartphone className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {isMobile 
                  ? "Mobile-optimized secure messaging for fitness enthusiasts"
                  : "Start conversations with fitness enthusiasts worldwide"
                }
              </p>
              <Button 
                onClick={handleOpenFullChat}
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isMobile ? "Launch Mobile Chat" : "Launch Chat"}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
