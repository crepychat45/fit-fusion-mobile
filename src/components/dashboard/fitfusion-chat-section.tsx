import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  MessageCircle,
  Users,
  Shield,
  Zap,
  Settings,
  Smartphone,
  Monitor,
  LucideIcon,
  BellRing,
  Lock,
  Brain,
  User,
  HeartHandshake,
  Video,
  Sticker,
  FileImage,
  Mic,
  Search,
  Check,
} from "lucide-react";
import { AdvancedChatInterface } from "@/components/chat/advanced-chat-interface";
import { MobileChatInterface } from "@/components/chat/mobile-chat-interface";
import { EnhancedFitfusionChat } from "@/components/chat/enhanced-fitfusion-chat";
import { EnhancedMobileChat } from "../enhanced-mobile-chat";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ChatFeature {
  name: string;
  icon: LucideIcon;
  description: string;
  isNew?: boolean;
  enabled?: boolean;
  premium?: boolean;
}

export function FitfusionChatSection() {
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [securityLevel, setSecurityLevel] = useState<
    "standard" | "high" | "maximum"
  >("high");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableUsers, setAvailableUsers] = useState(
    Math.floor(Math.random() * 100) + 120,
  );
  const [activeConversations, setActiveConversations] = useState(3);

  useEffect(() => {
    // Simulate changing online users
    const interval = setInterval(() => {
      setAvailableUsers((prev) =>
        Math.max(100, prev + Math.floor(Math.random() * 7) - 3),
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenFullChat = () => {
    navigate("/chat");
  };

  const features: ChatFeature[] = [
    {
      name: "Group Chats",
      icon: Users,
      description: "Connect with workout buddies in group conversations",
      enabled: true,
    },
    {
      name: "Media Sharing",
      icon: FileImage,
      description: "Share photos, videos and files with your contacts",
      enabled: true,
    },
    {
      name: "Advanced Security",
      icon: Shield,
      description: "End-to-end encryption for all messages",
      enabled: true,
    },
    {
      name: "Voice Messages",
      icon: Mic,
      description: "Record and send voice notes",
      isNew: true,
      enabled: true,
    },
    {
      name: "AI Fitness Chat",
      icon: Brain,
      description: "Get workout advice from our AI assistant",
      isNew: true,
      premium: true,
      enabled: true,
    },
    {
      name: "Video Calls",
      icon: Video,
      description: "Face-to-face coaching sessions",
      premium: true,
      enabled: false,
    },
    {
      name: "Search History",
      icon: Search,
      description: "Full search across all conversations",
      enabled: true,
    },
    {
      name: "Smart Stickers",
      icon: Sticker,
      description: "Fitness-themed stickers and GIFs",
      enabled: true,
      isNew: true,
    },
    {
      name: "Trainer Connect",
      icon: HeartHandshake,
      description: "Connect with certified fitness trainers",
      premium: true,
      enabled: false,
    },
  ];

  const toggleFeature = (index: number) => {
    if (features[index].premium) {
      toast({
        title: "✨ Premium Feature",
        description: "Upgrade to FitFusion Pro to enable this feature.",
      });
      return;
    }

    toast({
      title: features[index].enabled ? "Feature Disabled" : "Feature Enabled",
      description: `${features[index].name} has been ${features[index].enabled ? "disabled" : "enabled"}.`,
    });
  };

  const handleSecurityChange = (level: "standard" | "high" | "maximum") => {
    setSecurityLevel(level);
    toast({
      title: "🔒 Security Level Updated",
      description: `Chat security set to ${level} protection.`,
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled
        ? "Notifications Disabled"
        : "Notifications Enabled",
      description: `Chat notifications have been ${notificationsEnabled ? "disabled" : "enabled"}.`,
    });
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
              <CardTitle className="text-lg">FitX Fusion Chat</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>Secure fitness community</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  v5.0.4
                </Badge>
                {isMobile ? (
                  <Smartphone className="h-3 w-3 ml-1" />
                ) : (
                  <Monitor className="h-3 w-3 ml-1" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              <Shield className="h-3 w-3 mr-1" />
              {securityLevel === "maximum"
                ? "Max Security"
                : securityLevel === "high"
                  ? "Enhanced"
                  : "Standard"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-xs"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-xs"
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? "Hide" : "Show"}
              <ChevronRight
                className={`h-4 w-4 ml-1 transition-transform ${showChat ? "rotate-90" : ""}`}
              />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-3">Chat Settings</h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="notifications" className="font-medium">
                        Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts for new messages
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={toggleNotifications}
                    />
                  </div>

                  <div>
                    <Label className="font-medium mb-1.5 block">
                      Security Level
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          securityLevel === "standard" ? "default" : "outline"
                        }
                        onClick={() => handleSecurityChange("standard")}
                        className={`flex-1 ${securityLevel === "standard" ? "" : "border-dashed"}`}
                      >
                        Standard
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          securityLevel === "high" ? "default" : "outline"
                        }
                        onClick={() => handleSecurityChange("high")}
                        className={`flex-1 ${securityLevel === "high" ? "" : "border-dashed"}`}
                      >
                        Enhanced
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          securityLevel === "maximum" ? "default" : "outline"
                        }
                        onClick={() => handleSecurityChange("maximum")}
                        className={`flex-1 ${securityLevel === "maximum" ? "" : "border-dashed"}`}
                      >
                        Maximum
                      </Button>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium mt-4 mb-3">Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${feature.enabled ? "bg-muted/50" : "bg-background"} ${feature.premium && !feature.enabled ? "opacity-50" : ""}`}
                            onClick={() => toggleFeature(index)}
                          >
                            <div
                              className={`p-1.5 rounded-md ${feature.enabled ? "bg-primary/10" : "bg-muted"}`}
                            >
                              <feature.icon
                                className={`h-4 w-4 ${feature.enabled ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center gap-1">
                                <p className="text-sm truncate">
                                  {feature.name}
                                </p>
                                {feature.isNew && (
                                  <Badge className="text-[10px] h-4 bg-green-600">
                                    NEW
                                  </Badge>
                                )}
                                {feature.premium && (
                                  <Badge className="text-[10px] h-4 bg-amber-600">
                                    PRO
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              {feature.enabled ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{feature.description}</p>
                          {feature.premium && !feature.enabled && (
                            <p className="text-xs text-amber-500 mt-1">
                              Premium feature
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Feature Highlights */}
        {!showSettings && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
            >
              <Users className="h-3 w-3 mr-1" />
              {availableUsers}+ Online
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
            >
              <Zap className="h-3 w-3 mr-1" />
              Media Sharing
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            {isMobile && (
              <Badge
                variant="secondary"
                className="text-xs bg-orange-50 text-orange-700 border-orange-200"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Ready
              </Badge>
            )}
          </div>
        )}
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
              <div
                className={`${isMobile ? "h-[500px]" : "h-[600px]"} w-full border-t relative`}
              >
                <EnhancedFitfusionChat />
              </div>

              {/* Enhanced Quick Action Bar */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {activeConversations} active conversations
                  </span>
                  {isMobile && (
                    <>
                      <span>•</span>
                      <span className="text-xs">Mobile optimized</span>
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
                <Badge variant="outline" className="text-xs">
                  {availableUsers}+ online
                </Badge>
                {isMobile && (
                  <Smartphone className="h-4 w-4 text-primary ml-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {isMobile
                  ? "Mobile-optimized secure messaging with AI fitness assistance"
                  : "Start conversations with fitness enthusiasts worldwide"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenFullChat}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {isMobile ? "Launch Mobile Chat" : "Launch Chat"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
