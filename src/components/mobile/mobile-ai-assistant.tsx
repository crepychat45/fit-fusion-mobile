import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Brain, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Zap, 
  Shield, 
  Heart, 
  Activity,
  Target,
  Camera,
  Settings,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  MessageCircle,
  Bot,
  User,
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    voiceEnabled?: boolean;
  };
}

interface MobileAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAIAssistant({ isOpen, onClose }: MobileAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "responding">("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "system",
        content: "👋 Hi! I'm your mobile AI fitness assistant. I can help with workouts, nutrition, form corrections, and motivation. What can I help you with today?",
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          voiceEnabled: true
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mobile-optimized AI responses
  const generateMobileAIResponse = async (userMessage: string): Promise<Message> => {
    setAiStatus("thinking");
    
    // Simulate processing time (shorter for mobile)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    setAiStatus("responding");

    const mobileResponses = {
      workout: [
        "🏋️ Perfect! Let's create a quick mobile-friendly workout. I can guide you through exercises step-by-step with voice commands.",
        "💪 Great question! I'll show you proper form with visual cues optimized for your phone screen.",
        "🎯 Your progress is amazing! Tap the stats to see detailed mobile analytics.",
        "🔥 Let's do a 5-minute HIIT session! I'll count down and motivate you through each exercise."
      ],
      nutrition: [
        "🥗 I'll create a personalized meal plan you can save to your mobile gallery for grocery shopping.",
        "⚡ Smart choice! Here's a quick nutrition tip you can screenshot and save.",
        "💧 Hydration reminder set! I'll notify you throughout the day on your mobile.",
        "📱 Scan your meals with your camera - I can analyze nutrition content instantly!"
      ],
      motivation: [
        "🔥 You're unstoppable! Your mobile stats show incredible consistency!",
        "⭐ Every rep counts! I'm tracking your progress right here on mobile.",
        "💎 Champions are made in moments like this. Keep pushing!",
        "🚀 Your mobile fitness journey is inspiring. Let's crush today's goals!"
      ],
      mobile: [
        "📱 I'm optimized for mobile! Try voice commands, camera features, or quick gestures.",
        "🎯 Mobile fitness made easy! I adapt to your screen size and usage patterns.",
        "⚡ Quick mobile tip: Shake your phone for instant workout suggestions!",
        "📊 Your mobile dashboard has all your stats in bite-sized, easy-to-read cards."
      ]
    };

    // Determine response category
    let category = "mobile";
    if (userMessage.toLowerCase().includes("workout") || userMessage.toLowerCase().includes("exercise")) {
      category = "workout";
    } else if (userMessage.toLowerCase().includes("nutrition") || userMessage.toLowerCase().includes("diet")) {
      category = "nutrition";
    } else if (userMessage.toLowerCase().includes("motivate") || userMessage.toLowerCase().includes("help")) {
      category = "motivation";
    }

    const responseTexts = mobileResponses[category as keyof typeof mobileResponses];
    const randomResponse = responseTexts[Math.floor(Math.random() * responseTexts.length)];

    setAiStatus("idle");

    return {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: randomResponse,
      timestamp: new Date(),
      metadata: {
        confidence: Math.floor(Math.random() * 15) + 85,
        processingTime: Math.floor(Math.random() * 1500) + 500,
        voiceEnabled: voiceEnabled
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await generateMobileAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      
      // Voice feedback for mobile
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content.replace(/[🔥💪🎯⭐💎🚀📱⚡📊🥗💧]/g, ''));
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
      
      toast({
        title: "AI Response Ready",
        description: `Mobile-optimized response with ${aiResponse.metadata?.confidence}% confidence`,
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Please check your mobile connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start voice recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        toast({
          title: "🎤 Voice Recording Started",
          description: "Speak your fitness question now...",
        });
      } else {
        toast({
          title: "Voice Not Supported",
          description: "Voice recognition not available on this device.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "🔄 Processing Voice",
        description: "Converting your speech to text...",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "thinking": return "text-yellow-500 border-yellow-500";
      case "responding": return "text-blue-500 border-blue-500";
      default: return "text-green-500 border-green-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "thinking": return <Brain className="h-3 w-3 animate-pulse" />;
      case "responding": return <TrendingUp className="h-3 w-3 animate-bounce" />;
      default: return <Heart className="h-3 w-3 animate-pulse" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="p-2 bg-primary/20 rounded-full"
                  >
                    <Brain className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">Mobile AI Coach</h3>
                    <p className="text-sm text-muted-foreground">
                      Fitness Assistant • Touch Optimized
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(aiStatus)}`}
                  >
                    {getStatusIcon(aiStatus)}
                    {aiStatus}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    ✕
                  </Button>
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="flex items-center gap-1"
                  >
                    {voiceEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    Voice
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] custom-scrollbar">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                      message.type === "user" 
                        ? "bg-primary text-primary-foreground ml-4" 
                        : message.type === "ai"
                        ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mr-4"
                        : "bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mr-4"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === "user" && <User className="h-3 w-3" />}
                        {message.type === "ai" && <Bot className="h-3 w-3" />}
                        {message.type === "system" && <Sparkles className="h-3 w-3" />}
                        <span className="text-xs font-medium opacity-70">
                          {message.type === "ai" ? "AI Coach" : 
                           message.type === "user" ? "You" : "System"}
                        </span>
                        <span className="text-xs opacity-50">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.metadata && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <div className="flex items-center gap-3 text-xs opacity-60">
                            {message.metadata.confidence && (
                              <span>Confidence: {message.metadata.confidence}%</span>
                            )}
                            {message.metadata.processingTime && (
                              <span>⚡ {message.metadata.processingTime}ms</span>
                            )}
                            {message.metadata.voiceEnabled && (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-3 rounded-2xl mr-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Input */}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about workouts, nutrition, or motivation..."
                    className="min-h-[50px] max-h-[100px] resize-none text-base rounded-2xl border-2 focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceRecording}
                    className={`rounded-full ${isRecording ? "bg-red-100 border-red-300" : ""}`}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="rounded-full bg-primary hover:bg-primary/90"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                {[
                  { label: "Quick Workout", icon: Activity },
                  { label: "Nutrition Tips", icon: Heart },
                  { label: "Form Check", icon: Target },
                  { label: "Motivation", icon: Zap }
                ].map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(action.label)}
                    className="flex items-center gap-1 whitespace-nowrap rounded-full"
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}