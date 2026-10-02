import { askCoach } from "@/lib/ai-coach";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Brain, 
  TrendingUp,
  Heart,
  Zap,
  Target,
  Activity,
  Calendar,
  Trophy,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'workout' | 'nutrition' | 'motivation';
}

interface AICapability {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const AI_CAPABILITIES: AICapability[] = [
  {
    name: "Workout Planning",
    icon: <Target className="h-4 w-4" />,
    color: "bg-blue-500",
    description: "Create personalized workout routines"
  },
  {
    name: "Nutrition Advice",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-green-500",
    description: "Get meal plans and nutrition tips"
  },
  {
    name: "Progress Analysis",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-purple-500",
    description: "Analyze your fitness progress"
  },
  {
    name: "Motivation Coach",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-orange-500",
    description: "Stay motivated with AI coaching"
  },
  {
    name: "Form Analysis",
    icon: <Activity className="h-4 w-4" />,
    color: "bg-red-500",
    description: "AI-powered form correction"
  },
  {
    name: "Smart Scheduling",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-indigo-500",
    description: "Optimize your workout schedule"
  }
];

const QUICK_ACTIONS = [
  "Create a workout plan",
  "Analyze my progress",
  "Suggest healthy meals",
  "Motivate me today",
  "Fix my form",
  "Schedule workouts"
];

interface EnhancedAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedAIAssistant({ isOpen, onClose }: EnhancedAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hello! I'm your enhanced AI fitness assistant. I can help you with workouts, nutrition, progress tracking, and motivation. What would you like to work on today?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    setIsThinking(true);
    
    try {
      return await askCoach(messages.filter(m => m.sender !== 'ai' || m.content).map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.content } as const)).concat([{ role: 'user', content: userMessage }]));
    } catch (e: any) {
      return `⚠️ ${e?.message ?? 'The AI Coach is unavailable right now.'}`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      const aiResponse = await generateAIResponse(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "AI Assistant Error",
        description: "Sorry, I'm having trouble processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognition.onerror = () => {
        toast({
          title: "Voice Recognition Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive"
        });
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <Card className="w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="h-8 w-8" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    FitFusion AI <Sparkles className="h-5 w-5 text-yellow-300" />
                  </CardTitle>
                  <p className="text-sm text-purple-100">Enhanced AI Fitness Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Capabilities Sidebar */}
            <div className="w-64 bg-muted/30 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Capabilities
              </h3>
              <div className="space-y-2">
                {AI_CAPABILITIES.map((capability) => (
                  <motion.div
                    key={capability.name}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeCapability === capability.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                    onClick={() => setActiveCapability(
                      activeCapability === capability.name ? null : capability.name
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded ${capability.color} text-white`}>
                        {capability.icon}
                      </div>
                      <span className="font-medium text-sm">{capability.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{capability.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2 text-sm">Quick Actions</h4>
                <div className="space-y-1">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="h-4 w-4 text-purple-600" />
                        </motion.div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask your AI fitness assistant anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={startVoiceRecognition}
                    className={isListening ? 'bg-red-100 border-red-300' : ''}
                    disabled={isThinking}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Powered by Advanced AI • Voice Enabled
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}