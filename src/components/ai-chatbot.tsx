import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Search,
  Brain,
  Sparkles,
  BarChart,
  Dumbbell,
  Calendar,
  Lock,
  Shield,
  Zap,
  Mic,
  Star,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userProfile } from "@/data/user";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/settings-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIChatAssistant } from "./chat/ai-chat-assistant";
import { SecurePaymentGateway } from "./chat/secure-payment-gateway";
import { AISecuritySystem } from "./chat/ai-security-system";
import { EnhancedAIFeatures } from "./enhanced-ai-features";
import { EnhancedSecurityCenter } from "./enhanced-security-center";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  isThinking?: boolean;
  isSecure?: boolean;
  isEncrypted?: boolean;
  aiModel?: string;
  confidence?: number;
  type?: "text" | "voice" | "image" | "file";
}

const initialMessages: Message[] = [
  {
    text: `Hi there, ${userProfile.name}! I'm your enhanced FitFusion AI assistant (v4.0) with advanced AI technology, secure payments, and military-grade security. How can I help you today?`,
    isBot: true,
    timestamp: new Date(),
    isSecure: true,
    isEncrypted: true,
    aiModel: "FitFusion-AI-Pro",
  },
];

// Enhanced responses with AI features
const responses: Record<string, string> = {
  workout:
    "FitFusion offers various workout routines including cardio, strength training, HIIT, yoga, and more. You can access them in the Workouts tab.",
  diet: "A balanced diet is crucial for fitness. FitFusion recommends a mix of proteins, carbs, healthy fats, and plenty of water. For personalized advice, consult a nutritionist.",
  progress:
    "Track your progress in the Progress tab. You can monitor weight changes, workout statistics, and achievements over time.",
  settings:
    "You can customize your app experience in Settings. Change units, notification preferences, and more from your Profile > Settings.",
  help: "Need help? Visit the Help & Support section from your Profile page for guides, FAQs, and contact options.",
  achievements:
    "FitFusion rewards your consistency with achievements! Complete challenges like workout streaks or trying different routines to earn badges.",
  profile:
    "Your profile stores your personal information, stats, achievements, and settings. You can edit your details anytime.",
  app: "FitFusion is a comprehensive fitness app designed to help you track workouts, monitor progress, and achieve your fitness goals with ease.",
  stats: `Based on your profile, you've completed ${userProfile.stats.workoutsCompleted} workouts, maintained a ${userProfile.stats.streakDays}-day streak, and burned ${userProfile.stats.caloriesBurned} calories this week.`,
  calories: `You've burned ${userProfile.stats.caloriesBurned} calories this week. Keep it up!`,
  streak: `You're on a ${userProfile.stats.streakDays}-day workout streak! Consistency is key to fitness success.`,
  goal: `Your current fitness goal is "${userProfile.goal}". We're here to help you achieve it!`,
  level: `Your fitness level is currently set to "${userProfile.level}". As you progress, this level will adjust to match your improvements.`,
  "dark mode":
    "You can enable dark mode in the Settings tab under App Appearance. It's easier on the eyes during night workouts!",
  notifications:
    "Manage your notification preferences in Settings > Notifications. You can customize alerts for workouts, achievements, and more.",
  premium:
    "Upgrade to FitFusion Premium for advanced AI features, enhanced security, priority support, and exclusive AI models. Secure payment options available with multiple plans: Basic (₹500), Super (₹1000), and Advance (₹1700).",
  nutrition:
    "FitFusion helps you track your macros and calories. Set your daily nutrition goals in the Nutrition tab and log your meals to stay on track.",
  schedule:
    "Plan your workout schedule in the Calendar tab. You can set reminders and track your consistency over time.",
  community:
    "Connect with other fitness enthusiasts in our Community section. Share your progress, join challenges, and get motivated together!",
  privacy:
    "Your privacy is important to us. You can manage all your privacy settings in Settings > Privacy. We use encryption to protect your personal data.",
  subscription:
    "FitFusion offers several subscription plans: Free, Basic (₹500), Super (₹1000), and Advance (₹1700). Each plan offers different features to help you achieve your fitness goals.",
  "app version":
    "FitFusion is currently running version 3.5.2, with enhanced security, improved performance, and new features.",
  security:
    "FitFusion uses military-grade security with AI threat detection, quantum encryption, biometric authentication, and real-time behavior analysis to protect your data.",
  payment:
    "FitFusion offers secure payment gateways with multiple options including cards, crypto, and bank transfers. All payments are protected by PCI DSS compliance and fraud protection.",
  "ai features":
    "FitFusion now includes advanced AI features: AI Chat Assistant with multiple models (GPT-4, Claude, FitFusion-AI), AI Security System with threat detection, and AI-powered personalized recommendations.",
  "ai models":
    "Choose from multiple AI models: FitFusion-AI (personalized fitness AI), GPT-4 (advanced reasoning), and Claude (contextual understanding). Each model offers unique capabilities.",
  voice:
    "FitFusion now supports voice messages! Record and send voice notes to communicate naturally with the AI assistant.",
  media:
    "Share photos, videos, documents, and audio files with the AI assistant for personalized analysis and recommendations.",
  threats:
    "Our AI Security System continuously monitors for threats, blocking malicious inputs, unauthorized access attempts, and data exfiltration in real-time.",
  encryption:
    "All communications are protected with AES-256 encryption, quantum-resistant algorithms, and end-to-end encryption for maximum security.",
  default:
    "I'm your enhanced AI assistant with advanced capabilities. Ask me about AI features, security, payments, or any fitness-related topics!",
};

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [secureMode, setSecureMode] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showSecuritySystem, setShowSecuritySystem] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [showSecurityCenter, setShowSecurityCenter] = useState(false);
  const [aiModel, setAiModel] = useState("FitFusion-AI-Pro");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { language } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateSuggestions = (userInput: string) => {
    if (!userInput.trim()) {
      return [
        "ai features",
        "security",
        "payment",
        "workout",
        "diet",
        "progress",
        "premium",
      ];
    }

    const lowerInput = userInput.toLowerCase();
    return Object.keys(responses)
      .filter((key) => key.includes(lowerInput) && key !== "default")
      .slice(0, 5);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const audio = new Audio("/sounds/message-sent.mp3");
    audio.volume = 0.3;
    audio.play().catch((err) => console.log("Audio playback prevented: ", err));

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
      isEncrypted: encryptionEnabled,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSuggestions([]);

    setIsTyping(true);
    const thinkingMessage: Message = {
      text: "",
      isBot: true,
      timestamp: new Date(),
      isThinking: true,
      isSecure: secureMode,
      isEncrypted: encryptionEnabled,
      aiModel: aiModel,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    setTimeout(
      () => {
        setMessages((prev) => prev.filter((m) => !m.isThinking));

        const lowercaseInput = input.toLowerCase();
        let responseText = responses.default;
        let confidence = 0.85 + Math.random() * 0.15;

        for (const [keyword, response] of Object.entries(responses)) {
          if (lowercaseInput.includes(keyword)) {
            responseText = response;
            confidence = 0.9 + Math.random() * 0.1;
            break;
          }
        }

        // Enhanced personalization
        if (lowercaseInput.includes("name")) {
          responseText = `Your name is set as ${userProfile.name}. You can update it in your profile settings.`;
        } else if (
          lowercaseInput.includes("hello") ||
          lowercaseInput.includes("hi")
        ) {
          responseText = `Hello ${userProfile.name}! I'm your enhanced AI assistant with advanced security and AI features. How can I help you today?`;
        }

        const replyAudio = new Audio("/sounds/message-received.mp3");
        replyAudio.volume = 0.3;
        replyAudio
          .play()
          .catch((err) => console.log("Audio playback prevented: ", err));

        const botMessage: Message = {
          text: responseText,
          isBot: true,
          timestamp: new Date(),
          isSecure: secureMode,
          isEncrypted: encryptionEnabled,
          aiModel: aiModel,
          confidence: confidence,
          type: "text",
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, botMessage]);
      },
      Math.random() * 800 + 1200,
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      setSuggestions(generateSuggestions(value));
    } else {
      setSuggestions([]);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput("Voice message: How can I improve my workout routine?");
      }, 3000);
    }
  };

  const quickActions = [
    {
      text: "AI Features",
      icon: <Brain className="h-3 w-3" />,
      action: () => setShowAIFeatures(true),
    },
    {
      text: "AI Assistant",
      icon: <Sparkles className="h-3 w-3" />,
      action: () => setShowAIAssistant(true),
    },
    {
      text: "Security Center",
      icon: <Shield className="h-3 w-3" />,
      action: () => setShowSecurityCenter(true),
    },
    {
      text: "AI Security",
      icon: <Lock className="h-3 w-3" />,
      action: () => setShowSecuritySystem(true),
    },
    {
      text: "Premium",
      icon: <CreditCard className="h-3 w-3" />,
      action: () => setShowPaymentGateway(true),
    },
    { text: "My stats", icon: <BarChart className="h-3 w-3" /> },
    { text: "Workout tips", icon: <Dumbbell className="h-3 w-3" /> },
    { text: "Today's plan", icon: <Calendar className="h-3 w-3" /> },
  ];

  return (
    <>
      <Card className="h-[500px] flex flex-col glass-card bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:to-purple-900/20 hover-lift">
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-full mr-2">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">FitFusion AI Assistant</h3>
                <p className="text-xs opacity-90">
                  v4.0 • Enhanced with AI & Security
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <Zap className="h-2 w-2 mr-1" />
                {aiModel}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                    >
                      {encryptionEnabled ? (
                        <Shield className="h-3 w-3 text-green-400" />
                      ) : (
                        <Shield className="h-3 w-3 text-white/50" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {encryptionEnabled
                        ? "Encryption active"
                        : "Encryption inactive"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setSecureMode(!secureMode)}
                    >
                      {secureMode ? (
                        <Lock className="h-3 w-3 text-green-400" />
                      ) : (
                        <Lock className="h-3 w-3 text-white/50" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {secureMode
                        ? "Secure mode active"
                        : "Secure mode inactive"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {msg.isThinking ? (
                      <div className="max-w-[80%] p-3 rounded-lg bg-secondary/50 text-foreground rounded-tl-none">
                        <div className="flex items-center mb-1">
                          <div className="rounded-full p-1 mr-1 bg-background/20">
                            <Brain className="h-3 w-3" />
                          </div>
                          <span className="text-xs">AI Assistant</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {msg.aiModel}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.isBot
                            ? "bg-secondary/50 text-foreground rounded-tl-none"
                            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <div className="rounded-full p-1 bg-background/20">
                              {msg.isBot ? (
                                <Brain className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                            </div>
                            <span className="text-xs">
                              {msg.isBot ? "AI Assistant" : "You"}
                            </span>
                            {msg.isBot && msg.aiModel && (
                              <Badge variant="outline" className="text-xs">
                                {msg.aiModel}
                              </Badge>
                            )}
                            {msg.confidence && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-2 w-2 mr-1" />
                                {Math.round(msg.confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                          {msg.isBot && (
                            <div className="flex space-x-1">
                              {msg.isSecure && (
                                <Lock className="h-3 w-3 text-green-500" />
                              )}
                              {msg.isEncrypted && (
                                <Shield className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {format(msg.timestamp, "hh:mm a")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 pt-2">
          <div className="w-full">
            <div className="relative">
              {suggestions.length > 0 && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-card border rounded-lg shadow-lg p-1 z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-secondary/50 rounded cursor-pointer flex items-center"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Ask about AI features, security, payments, or fitness..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  ref={inputRef}
                  disabled={isTyping}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceRecord}
                  className={isRecording ? "bg-red-500 text-white" : ""}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="interactive-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  disabled={!input.trim() || isTyping}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs whitespace-nowrap interactive-button hover-scale"
                    onClick={() => {
                      if (action.action) {
                        action.action();
                      } else {
                        setInput(action.text);
                        setTimeout(() => handleSend(), 100);
                      }
                    }}
                  >
                    {action.icon}
                    <span className="ml-1">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Advanced AI Chat Assistant</DialogTitle>
          </DialogHeader>
          <AIChatAssistant onClose={() => setShowAIAssistant(false)} />
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog open={showPaymentGateway} onOpenChange={setShowPaymentGateway}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Secure Payment Gateway</DialogTitle>
          </DialogHeader>
          <SecurePaymentGateway onClose={() => setShowPaymentGateway(false)} />
        </DialogContent>
      </Dialog>

      {/* AI Features Dialog */}
      <Dialog open={showAIFeatures} onOpenChange={setShowAIFeatures}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enhanced AI Features</DialogTitle>
          </DialogHeader>
          <EnhancedAIFeatures />
        </DialogContent>
      </Dialog>

      {/* Security Center Dialog */}
      <Dialog open={showSecurityCenter} onOpenChange={setShowSecurityCenter}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enhanced Security Center</DialogTitle>
          </DialogHeader>
          <EnhancedSecurityCenter />
        </DialogContent>
      </Dialog>

      {/* Security System Dialog */}
      <Dialog open={showSecuritySystem} onOpenChange={setShowSecuritySystem}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Security System</DialogTitle>
          </DialogHeader>
          <AISecuritySystem />
        </DialogContent>
      </Dialog>
    </>
  );
}
