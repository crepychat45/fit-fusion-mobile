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
  TrendingUp,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
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
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "responding">(
    "idle",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "system",
        content:
          "👋 Hi! I'm your mobile AI fitness assistant. I can help with workouts, nutrition, form corrections, and motivation. What can I help you with today?",
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          voiceEnabled: true,
        },
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mobile-optimized AI responses
  const generateMobileAIResponse = async (
    userMessage: string,
  ): Promise<Message> => {
    setAiStatus("thinking");

    // Simulate processing time (shorter for mobile)
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1500),
    );

    setAiStatus("responding");

    const mobileResponses = {
      workout: [
        "🏋️ Perfect! Let's create a quick mobile-friendly workout. I can guide you through exercises step-by-step with voice commands. Say 'start workout' to begin!",
        "💪 Great question! I'll show you proper form with visual cues optimized for your phone screen. Your current form score is 8.5/10 - excellent work!",
        "🎯 Your progress is amazing! You've completed 12 workouts this month with 85% consistency. Tap the stats to see detailed mobile analytics.",
        "🔥 Let's do a 5-minute HIIT session! I'll count down and motivate you through each exercise. Ready? 3... 2... 1... GO!",
        "⚡ Based on your heart rate data, I recommend a moderate intensity workout today. Your recovery is at 92% - perfect for strength training!",
        "🏃‍♂️ Your running pace has improved by 15% this month! Let's build on that momentum with interval training.",
        "🎵 I've curated a high-energy playlist that matches your workout rhythm. Music sync activated!",
      ],
      nutrition: [
        "🥗 I'll create a personalized meal plan based on your goals: muscle gain with 2,200 calories daily. Saved to your mobile for grocery shopping!",
        "⚡ Smart choice! Here's your macro breakdown: 40% carbs, 30% protein, 30% fats. Screenshot this for easy reference.",
        "💧 Hydration reminder set! You need 2.5L daily. I'll notify you every 2 hours - next reminder in 1h 45m.",
        "📱 Scan your meals with your camera - I can analyze nutrition content instantly! Just point and tap the scan button.",
        "🍎 Your vitamin D levels look low. Consider adding salmon, eggs, or supplements. I've added suggestions to your meal plan.",
        "⏰ Perfect meal timing! Eating protein within 30 minutes post-workout maximizes muscle recovery.",
        "🌟 Your nutrition consistency is 88% this week - fantastic! Small improvements lead to big results.",
      ],
      motivation: [
        "🔥 You're unstoppable! Your mobile stats show 5-day streak with 95% goal completion. That's champion-level consistency!",
        "⭐ Every rep counts! You've lifted 12,540 lbs this week - that's literally a small car! I'm tracking your amazing progress.",
        "💎 Champions are made in moments like this. You've overcome 3 plateau challenges - your dedication is inspiring!",
        "🚀 Your mobile fitness journey is inspiring. 847 calories burned today, heart rate peaked at 165 BPM - you crushed those goals!",
        "🏆 Remember why you started. You wanted to feel stronger, healthier, more confident. Look how far you've come!",
        "⚡ Your body is adapting perfectly. Recovery heart rate improved by 8 BPM - your cardiovascular fitness is through the roof!",
        "🌟 Tough day? I've got your back. Even 10 minutes of movement counts. Let's start small and build momentum together.",
      ],
      mobile: [
        "📱 I'm your pocket fitness expert! Try voice commands ('start workout'), camera nutrition scanning, or shake for quick suggestions!",
        "🎯 Mobile fitness revolution! I adapt to your screen, track your movements, sync with wearables, and optimize for one-handed use.",
        "⚡ Pro mobile tips: Double-tap for quick workouts, long-press for voice mode, swipe up for stats, and use landscape for exercise videos!",
        "📊 Your mobile dashboard: 12 workouts completed, 5-day streak, 847 cal burned today, next workout: Upper Body (tomorrow 7 AM).",
        "🔋 Battery-optimized AI: I use 15% less power than other fitness apps while providing 3x more personalized insights!",
        "📲 Offline mode activated! Your workouts, progress, and AI coaching work even without internet. Sync when connected.",
        "🎮 Gamified fitness: You've unlocked 'Consistency Champion' badge! Next: 'Calorie Crusher' (burn 1000+ in one session).",
      ],
      smartwatch: [
        "⌚ Your smartwatch data shows optimal workout timing at 7 AM when your HRV is highest. Shall I schedule your next session?",
        "📡 Smartwatch sync complete! Real-time heart rate, calories, steps, and sleep quality all integrated for perfect coaching.",
        "🔔 Your watch detected elevated stress. I recommend 5 minutes of guided breathing. Watch will vibrate with breathing cues.",
        "📈 Watch analytics: You're most active on Tuesdays (avg 8,500 steps) and least on Sundays (4,200 steps). Let's balance this!",
      ],
    };

    // Determine response category
    let category = "mobile";
    if (
      userMessage.toLowerCase().includes("workout") ||
      userMessage.toLowerCase().includes("exercise")
    ) {
      category = "workout";
    } else if (
      userMessage.toLowerCase().includes("nutrition") ||
      userMessage.toLowerCase().includes("diet")
    ) {
      category = "nutrition";
    } else if (
      userMessage.toLowerCase().includes("motivate") ||
      userMessage.toLowerCase().includes("help")
    ) {
      category = "motivation";
    }

    const responseTexts =
      mobileResponses[category as keyof typeof mobileResponses];
    const randomResponse =
      responseTexts[Math.floor(Math.random() * responseTexts.length)];

    setAiStatus("idle");

    return {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: randomResponse,
      timestamp: new Date(),
      metadata: {
        confidence: Math.floor(Math.random() * 15) + 85,
        processingTime: Math.floor(Math.random() * 1500) + 500,
        voiceEnabled: voiceEnabled,
      },
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await generateMobileAIResponse(userMessage.content);
      setMessages((prev) => [...prev, aiResponse]);

      // Voice feedback for mobile
      if (voiceEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          aiResponse.content.replace(/[🔥💪🎯⭐💎🚀📱⚡📊🥗💧]/g, ""),
        );
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
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start voice recording
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          toast({
            title: "🎤 Voice Recording Started",
            description: "Speak your fitness question now...",
          });
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
          toast({
            title: "✅ Voice Captured",
            description: `Transcribed: "${transcript}"`,
          });

          // Auto-send the message after voice input
          setTimeout(() => {
            if (transcript.trim()) {
              handleSendMessage();
            }
          }, 500);
        };

        recognition.onerror = (event) => {
          setIsRecording(false);
          toast({
            title: "❌ Voice Error",
            description: "Speech recognition failed. Please try again.",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } else {
        toast({
          title: "Voice Not Supported",
          description: "Voice recognition not available on this device.",
          variant: "destructive",
        });
        setIsRecording(false);
      }
    } else {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "🔄 Processing Voice",
        description: "Converting your speech to text...",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "thinking":
        return "text-yellow-500 border-yellow-500";
      case "responding":
        return "text-blue-500 border-blue-500";
      default:
        return "text-green-500 border-green-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "thinking":
        return <Brain className="h-3 w-3 animate-pulse" />;
      case "responding":
        return <TrendingUp className="h-3 w-3 animate-bounce" />;
      default:
        return <Heart className="h-3 w-3 animate-pulse" />;
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
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col safe-area-padding"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
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
                    {voiceEnabled ? (
                      <Volume2 className="h-3 w-3" />
                    ) : (
                      <VolumeX className="h-3 w-3" />
                    )}
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
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[50vh] custom-scrollbar xs:p-4 xs:space-y-4 sm:max-h-[55vh]">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-4"
                          : message.type === "ai"
                            ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mr-4"
                            : "bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mr-4"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === "user" && (
                          <User className="h-3 w-3" />
                        )}
                        {message.type === "ai" && <Bot className="h-3 w-3" />}
                        {message.type === "system" && (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium opacity-70">
                          {message.type === "ai"
                            ? "AI Coach"
                            : message.type === "user"
                              ? "You"
                              : "System"}
                        </span>
                        <span className="text-xs opacity-50">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.metadata && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <div className="flex items-center gap-3 text-xs opacity-60">
                            {message.metadata.confidence && (
                              <span>
                                Confidence: {message.metadata.confidence}%
                              </span>
                            )}
                            {message.metadata.processingTime && (
                              <span>
                                ⚡ {message.metadata.processingTime}ms
                              </span>
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
                      <span className="text-sm text-muted-foreground">
                        AI is thinking
                      </span>
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
                    {isRecording ? (
                      <MicOff className="h-4 w-4 text-red-600" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
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
                  { label: "Motivation", icon: Zap },
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
