
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, Search, Brain, Sparkles, Info, BarChart, Dumbbell, Calendar, Lock, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userProfile } from "@/data/user";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/settings-context";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  isThinking?: boolean;
  isSecure?: boolean;
  isEncrypted?: boolean;
}

const initialMessages: Message[] = [
  {
    text: `Hi there, ${userProfile.name}! I'm your FitFusion assistant (v3.5.2). How can I help you today with your fitness journey?`,
    isBot: true,
    timestamp: new Date(),
    isSecure: true,
    isEncrypted: true
  }
];

// Pre-defined responses for common fitness questions
const responses: Record<string, string> = {
  "workout": "FitFusion offers various workout routines including cardio, strength training, HIIT, yoga, and more. You can access them in the Workouts tab.",
  "diet": "A balanced diet is crucial for fitness. FitFusion recommends a mix of proteins, carbs, healthy fats, and plenty of water. For personalized advice, consult a nutritionist.",
  "progress": "Track your progress in the Progress tab. You can monitor weight changes, workout statistics, and achievements over time.",
  "settings": "You can customize your app experience in Settings. Change units, notification preferences, and more from your Profile > Settings.",
  "help": "Need help? Visit the Help & Support section from your Profile page for guides, FAQs, and contact options.",
  "achievements": "FitFusion rewards your consistency with achievements! Complete challenges like workout streaks or trying different routines to earn badges.",
  "profile": "Your profile stores your personal information, stats, achievements, and settings. You can edit your details anytime.",
  "app": "FitFusion is a comprehensive fitness app designed to help you track workouts, monitor progress, and achieve your fitness goals with ease.",
  "stats": `Based on your profile, you've completed ${userProfile.stats.workoutsCompleted} workouts, maintained a ${userProfile.stats.streakDays}-day streak, and burned ${userProfile.stats.caloriesBurned} calories this week.`,
  "calories": `You've burned ${userProfile.stats.caloriesBurned} calories this week. Keep it up!`,
  "streak": `You're on a ${userProfile.stats.streakDays}-day workout streak! Consistency is key to fitness success.`,
  "goal": `Your current fitness goal is "${userProfile.goal}". We're here to help you achieve it!`,
  "level": `Your fitness level is currently set to "${userProfile.level}". As you progress, this level will adjust to match your improvements.`,
  "dark mode": "You can enable dark mode in the Settings tab under App Appearance. It's easier on the eyes during night workouts!",
  "notifications": "Manage your notification preferences in Settings > Notifications. You can customize alerts for workouts, achievements, and more.",
  "premium": "FitFusion Premium offers exclusive workouts, detailed analytics, personalized training plans, and priority support. Check your profile to upgrade!",
  "nutrition": "FitFusion helps you track your macros and calories. Set your daily nutrition goals in the Nutrition tab and log your meals to stay on track.",
  "schedule": "Plan your workout schedule in the Calendar tab. You can set reminders and track your consistency over time.",
  "community": "Connect with other fitness enthusiasts in our Community section. Share your progress, join challenges, and get motivated together!",
  "privacy": "Your privacy is important to us. You can manage all your privacy settings in Settings > Privacy. We use encryption to protect your personal data.",
  "subscription": "FitFusion offers several subscription plans: Free, Basic (₹500), Super (₹1000), and Advance (₹1700). Each plan offers different features to help you achieve your fitness goals.",
  "app version": "FitFusion is currently running version 3.5.2, with enhanced security, improved performance, and new features.",
  "security": "FitFusion uses industry-standard encryption to protect your data. Your personal information is never shared with third parties without your explicit consent.",
  "default": "I'm not sure about that. Please check our Help & Support section for more information or contact us directly."
};

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [secureMode, setSecureMode] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
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
    // Auto-focus input on component mount
    inputRef.current?.focus();
  }, []);
  
  const generateSuggestions = (userInput: string) => {
    if (!userInput.trim()) {
      return ["workout", "diet", "progress", "stats", "achievements", "privacy", "subscription"];
    }
    
    const lowerInput = userInput.toLowerCase();
    return Object.keys(responses).filter(key => 
      key.includes(lowerInput) && key !== "default"
    ).slice(0, 5);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Play send sound
    const audio = new Audio("/sounds/message-sent.mp3");
    audio.volume = 0.3;
    audio.play().catch(err => console.log("Audio playback prevented: ", err));
    
    // Add user message
    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
      isEncrypted: encryptionEnabled
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSuggestions([]);
    
    // Add typing indicator
    setIsTyping(true);
    const thinkingMessage: Message = {
      text: "",
      isBot: true,
      timestamp: new Date(),
      isThinking: true,
      isSecure: secureMode,
      isEncrypted: encryptionEnabled
    };
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Process response
    setTimeout(() => {
      // Remove thinking message
      setMessages(prev => prev.filter(m => !m.isThinking));
      
      const lowercaseInput = input.toLowerCase();
      let responseText = responses.default;
      let isSecure = secureMode;
      
      // Simple keyword matching
      for (const [keyword, response] of Object.entries(responses)) {
        if (lowercaseInput.includes(keyword)) {
          responseText = response;
          break;
        }
      }
      
      // Adding personalization and more dynamic responses
      if (lowercaseInput.includes("name")) {
        responseText = `Your name is set as ${userProfile.name} in your profile. You can change it in Profile > Edit Profile.`;
      } else if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi")) {
        responseText = `Hello ${userProfile.name}! How can I help you with your fitness journey today?`;
      } else if (lowercaseInput.includes("today") && lowercaseInput.includes("workout")) {
        responseText = `Based on your schedule, today you have a Full Body Strength workout planned. It's a 45-minute session with 5 exercises.`;
      } else if (lowercaseInput.includes("thank")) {
        responseText = `You're welcome! I'm here to help you achieve your fitness goals. Let me know if you need anything else.`;
      } else if (lowercaseInput.includes("theme") || lowercaseInput.includes("dark mode") || lowercaseInput.includes("light mode")) {
        responseText = `You can change your theme preferences in Settings > Display. Choose between light, dark, or system mode according to your preference.`;
      } else if (lowercaseInput.includes("version")) {
        responseText = `FitFusion is currently running version 3.5.2, with enhanced security, improved performance, and new features.`;
      } else if (lowercaseInput.includes("subscription") || lowercaseInput.includes("plan") || lowercaseInput.includes("premium")) {
        responseText = `FitFusion offers several subscription plans: Free (limited features), Basic (₹500/month), Super (₹1000/month), and Advance (₹1700/month). Each plan offers different features to support your fitness journey. Check the Subscription page for more details.`;
      } else if (lowercaseInput.includes("language") || lowercaseInput.includes("languages")) {
        responseText = `You can change the app language in Settings > Display > Language. We support multiple languages including English, Spanish, French, German, and many more!`;
      } else if (lowercaseInput.includes("security") || lowercaseInput.includes("secure") || lowercaseInput.includes("encryption")) {
        responseText = `FitFusion takes your security seriously. All messages in this chat are end-to-end encrypted, and we use industry-standard encryption for all your personal data. You can manage security settings in Settings > Privacy & Security.`;
      }
      
      // Message received sound
      const replyAudio = new Audio("/sounds/message-received.mp3");
      replyAudio.volume = 0.3;
      replyAudio.play().catch(err => console.log("Audio playback prevented: ", err));
      
      const botMessage: Message = {
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        isSecure,
        isEncrypted: encryptionEnabled
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
    }, Math.random() * 800 + 800); // Random delay between 800-1600ms
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
  
  const toggleSecureMode = () => {
    setSecureMode(!secureMode);
    
    // Add system message about secure mode change
    const modeMessage: Message = {
      text: secureMode 
        ? "Secure mode disabled. Messages are not protected."
        : "Secure mode enabled. Messages are protected.",
      isBot: true,
      timestamp: new Date(),
      isSecure: !secureMode,
      isEncrypted: encryptionEnabled
    };
    
    setMessages(prev => [...prev, modeMessage]);
  };

  const toggleEncryption = () => {
    setEncryptionEnabled(!encryptionEnabled);
    
    // Add system message about encryption change
    const encryptionMessage: Message = {
      text: encryptionEnabled 
        ? "End-to-end encryption disabled. Your messages are not encrypted."
        : "End-to-end encryption enabled. Your messages are now encrypted.",
      isBot: true,
      timestamp: new Date(),
      isSecure: secureMode,
      isEncrypted: !encryptionEnabled
    };
    
    setMessages(prev => [...prev, encryptionMessage]);
  };

  // New feature - Quick action buttons
  const quickActions = [
    { text: "My stats", icon: <BarChart className="h-3 w-3" /> },
    { text: "Workout tips", icon: <Dumbbell className="h-3 w-3" /> },
    { text: "Progress check", icon: <BarChart className="h-3 w-3" /> },
    { text: "Today's plan", icon: <Calendar className="h-3 w-3" /> },
    { text: "Privacy info", icon: <Shield className="h-3 w-3" /> },
    { text: "Subscription", icon: <Zap className="h-3 w-3" /> }
  ];

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Bot className="h-5 w-5 text-primary mr-2" />
          <div>
            <h3 className="font-medium">FitFusion Assistant</h3>
            <p className="text-xs text-muted-foreground">v3.5.2</p>
          </div>
        </div>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 mx-1" 
                  onClick={toggleEncryption}
                >
                  {encryptionEnabled ? (
                    <Shield className="h-4 w-4 text-green-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{encryptionEnabled ? "End-to-end encryption active" : "End-to-end encryption inactive"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={toggleSecureMode}
                >
                  {secureMode ? (
                    <Lock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{secureMode ? "Secure mode active" : "Secure mode inactive"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.isThinking ? (
                    <div className="max-w-[80%] p-3 rounded-lg bg-secondary/50 text-foreground rounded-tl-none">
                      <div className="flex items-center mb-1">
                        <div className="rounded-full p-1 mr-1 bg-background/20">
                          <Bot className="h-3 w-3" />
                        </div>
                        <span className="text-xs">Assistant</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isBot 
                          ? 'bg-secondary/50 text-foreground rounded-tl-none' 
                          : 'bg-primary text-primary-foreground rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="rounded-full p-1 mr-1 bg-background/20">
                            {msg.isBot ? (
                              <Bot className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                          </div>
                          <span className="text-xs">{msg.isBot ? 'Assistant' : 'You'}</span>
                        </div>
                        {msg.isBot && (
                          <div className="flex space-x-1 ml-2">
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
                        {format(msg.timestamp, 'hh:mm a')}
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
            
            <div className="flex">
              <Input
                placeholder="Ask about fitness, workouts, or app features..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 mr-2"
                ref={inputRef}
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="bg-primary"
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {messages.length <= 2 && (
              <div className="mt-3 bg-secondary/30 rounded-lg p-3">
                <p className="text-xs font-medium flex items-center mb-2">
                  <MessageSquare className="h-3 w-3 mr-1" /> Suggested questions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["How to track progress?", "What workouts are available?", "Show my stats", "Subscription plans", "Privacy settings"].map((q, i) => (
                    <div 
                      key={i} 
                      className="text-xs py-1 px-2 bg-background/50 rounded cursor-pointer hover:bg-background flex items-center"
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => handleSend(), 100);
                      }}
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap"
                  onClick={() => {
                    setInput(action.text);
                    setTimeout(() => handleSend(), 100);
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
  );
}
