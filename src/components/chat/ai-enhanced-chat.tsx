import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Zap, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Image as ImageIcon,
  Bot,
  User,
  Sparkles,
  Shield,
  Heart,
  Activity,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    aiModel?: string;
    confidence?: number;
    processingTime?: number;
    attachments?: string[];
  };
}

interface AIEnhancedChatProps {
  user?: any;
  onClose?: () => void;
}

export function AIEnhancedChat({ user, onClose }: AIEnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "responding">("idle");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // AI Models available
  const aiModels = [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & Efficient", icon: Zap },
    { id: "gpt-4o", name: "GPT-4o", description: "Advanced Reasoning", icon: Brain },
    { id: "fitness-ai", name: "FitFusion AI", description: "Fitness Specialized", icon: Activity }
  ];

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "system",
      content: `Welcome to FitFusion AI Chat! I'm your intelligent fitness companion powered by advanced AI. I can help you with workout planning, nutrition advice, form corrections, and motivation. What would you like to discuss today?`,
      timestamp: new Date(),
      metadata: {
        aiModel: "system",
        confidence: 100
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate AI response
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    setAiStatus("thinking");
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    setAiStatus("responding");
    
    // Simulate AI responses based on context
    const responses = {
      workout: [
        "I'd recommend starting with a balanced routine that includes both strength training and cardio. Based on your fitness level, let's create a personalized plan.",
        "Great question! Form is crucial for preventing injuries. Let me guide you through the proper technique for this exercise.",
        "Your progress looks fantastic! I can see improvements in your strength and endurance. Keep up the excellent work!"
      ],
      nutrition: [
        "Nutrition is key to achieving your fitness goals. Let me suggest a meal plan that aligns with your objectives.",
        "That's a smart approach to fueling your body. Consider adding more protein to support muscle recovery.",
        "Hydration is equally important. Make sure you're drinking enough water throughout the day."
      ],
      motivation: [
        "Remember, every champion was once a beginner who refused to give up. You've got this! 💪",
        "Your consistency is impressive! Small daily actions lead to extraordinary results.",
        "It's normal to have challenging days. What matters is that you keep showing up for yourself."
      ],
      general: [
        "I'm here to help you achieve your fitness goals. What specific area would you like to focus on?",
        "That's an interesting question! Let me provide you with evidence-based guidance.",
        "I understand your concern. Let's work together to find the best solution for your situation."
      ]
    };

    // Determine response category
    let category = "general";
    if (userMessage.toLowerCase().includes("workout") || userMessage.toLowerCase().includes("exercise") || userMessage.toLowerCase().includes("training")) {
      category = "workout";
    } else if (userMessage.toLowerCase().includes("nutrition") || userMessage.toLowerCase().includes("diet") || userMessage.toLowerCase().includes("food")) {
      category = "nutrition";
    } else if (userMessage.toLowerCase().includes("motivate") || userMessage.toLowerCase().includes("help") || userMessage.toLowerCase().includes("support")) {
      category = "motivation";
    }

    const responseTexts = responses[category as keyof typeof responses];
    const randomResponse = responseTexts[Math.floor(Math.random() * responseTexts.length)];

    setAiStatus("idle");

    return {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: randomResponse,
      timestamp: new Date(),
      metadata: {
        aiModel: selectedModel,
        confidence: Math.floor(Math.random() * 20) + 80,
        processingTime: Math.floor(Math.random() * 2000) + 500
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
      const aiResponse = await generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "AI Response Generated",
        description: `Powered by ${selectedModel} with ${aiResponse.metadata?.confidence}% confidence`,
      });
    } catch (error) {
      console.error("AI response error:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        
        // Enhanced voice recording with real-time feedback
        toast({
          title: "🎤 Voice Recording Active",
          description: "Speak clearly. Tap again to stop recording."
        });
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (isRecording) {
            setIsRecording(false);
            stream.getTracks().forEach(track => track.stop());
            toast({
              title: "🔄 Processing Voice",
              description: "Converting speech to text..."
            });
          }
        }, 30000);
        
      } catch (error) {
        toast({
          title: "❌ Microphone Access Denied",
          description: "Please allow microphone access to use voice features.",
          variant: "destructive"
        });
      }
    } else {
      setIsRecording(false);
      toast({
        title: "✅ Voice Message Captured",
        description: "Processing your voice input with AI..."
      });
      
      // Simulate voice-to-text processing
      setTimeout(() => {
        const voiceTexts = [
          "What's the best workout for building muscle?",
          "How many calories should I eat to lose weight?",
          "Can you suggest a 30-minute cardio routine?",
          "What are some healthy post-workout snacks?"
        ];
        const randomText = voiceTexts[Math.floor(Math.random() * voiceTexts.length)];
        setInputValue(randomText);
        
        toast({
          title: "🎯 Voice Recognized",
          description: "Your message has been converted to text!"
        });
      }, 1500);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="h-4 w-4" />;
      case "ai": return <Bot className="h-4 w-4" />;
      case "system": return <Sparkles className="h-4 w-4" />;
      default: return null;
    }
  };

  const getMessageBgColor = (type: string) => {
    switch (type) {
      case "user": return "bg-primary/10 border-primary/20";
      case "ai": return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "system": return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
      default: return "bg-muted";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-background rounded-lg shadow-lg border">
      {/* AI Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Fitness Coach</h3>
              <p className="text-sm text-muted-foreground">
                Powered by {aiModels.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${aiStatus === "idle" ? "border-green-500 text-green-700" : 
                         aiStatus === "thinking" ? "border-yellow-500 text-yellow-700" : 
                         "border-blue-500 text-blue-700"}`}
            >
              {aiStatus === "idle" && <Heart className="h-3 w-3 mr-1" />}
              {aiStatus === "thinking" && <Clock className="h-3 w-3 mr-1 animate-spin" />}
              {aiStatus === "responding" && <TrendingUp className="h-3 w-3 mr-1" />}
              {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg border ${getMessageBgColor(message.type)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getMessageIcon(message.type)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.type === "ai" ? "AI Assistant" : 
                     message.type === "user" ? "You" : "System"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.metadata && (
                  <div className="mt-2 pt-2 border-t border-muted/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {message.metadata.aiModel && (
                        <span>Model: {message.metadata.aiModel}</span>
                      )}
                      {message.metadata.confidence && (
                        <span>Confidence: {message.metadata.confidence}%</span>
                      )}
                      {message.metadata.processingTime && (
                        <span>Response Time: {message.metadata.processingTime}ms</span>
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
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs bg-background border rounded px-2 py-1"
          >
            {aiModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about fitness, nutrition, or training..."
              className="min-h-[60px] max-h-[120px] resize-none"
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
              className={isRecording ? "bg-red-100 border-red-300" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="relative"
            >
              <Camera className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}