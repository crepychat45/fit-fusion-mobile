
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Coffee,
  Sparkles,
  Brain,
  Calendar,
  Heart,
  BarChart,
  RefreshCw
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

const predefinedResponses: Record<string, string[]> = {
  workout: [
    "I recommend starting with a full body workout 3 times per week if you're new to fitness.",
    "For muscle gain, focus on compound exercises like squats, deadlifts, and bench press with progressive overload.",
    "Try HIIT (High-Intensity Interval Training) for effective fat burning in shorter workout sessions.",
    "Remember to include at least one rest day between strength training the same muscle groups."
  ],
  nutrition: [
    "Aim to consume 0.8-1g of protein per pound of body weight for muscle recovery and growth.",
    "Stay hydrated! Drink water before, during, and after your workouts.",
    "Consider timing your carbohydrate intake around your workouts for optimal energy and recovery.",
    "Eating small, frequent meals throughout the day can help maintain energy levels and support metabolism."
  ],
  motivation: [
    "Focus on consistency rather than perfection. Small steps each day lead to big results over time.",
    "Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound.",
    "Find a workout buddy or join a community to stay accountable and motivated.",
    "Track your progress with measurements beyond the scale - like strength gains, endurance improvements, or how clothes fit."
  ],
  help: [
    "You can view your workout history in the Progress tab.",
    "To connect a fitness device, go to Settings > Device > Connect New Device.",
    "You can customize your notification preferences in Settings > Notifications.",
    "Check out the Workouts tab to explore different workout routines."
  ],
  progress: [
    "Tracking your personal bests (PBs) is a great way to see your strength improvements over time.",
    "Taking progress photos once a month can help you visualize changes that might not be reflected on the scale.",
    "Consider tracking body measurements like waist, hips, and chest for a more complete picture of your progress.",
    "Remember that progress isn't linear - plateaus are normal and part of the journey."
  ],
  recovery: [
    "Adequate sleep is crucial for muscle recovery and overall fitness progress.",
    "Consider active recovery like walking, swimming, or yoga on your rest days.",
    "Foam rolling and stretching can help reduce muscle soreness and improve flexibility.",
    "Proper nutrition and hydration are essential components of recovery."
  ]
};

const initialMessages: Message[] = [
  {
    id: '1',
    content: "Hello! I'm your FitFusion Assistant. How can I help you with your fitness journey today?",
    sender: 'assistant',
    timestamp: new Date()
  }
];

const generateResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords in the message
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('training')) {
    const responses = predefinedResponses.workout;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
    const responses = predefinedResponses.nutrition;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('motivat') || lowerMessage.includes('stuck') || lowerMessage.includes('giving up') || lowerMessage.includes('don\'t feel like')) {
    const responses = predefinedResponses.motivation;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('help') || lowerMessage.includes('how to') || lowerMessage.includes('where') || lowerMessage.includes('find')) {
    const responses = predefinedResponses.help;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('improve') || lowerMessage.includes('goal')) {
    const responses = predefinedResponses.progress;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('recover') || lowerMessage.includes('rest') || lowerMessage.includes('sleep') || lowerMessage.includes('sore')) {
    const responses = predefinedResponses.recovery;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes('thank')) {
    return "You're welcome! I'm here to help on your fitness journey. Let me know if you have any other questions.";
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello there! How can I assist with your fitness goals today?";
  } else {
    return "I'm not sure I understand. Could you rephrase your question about workouts, nutrition, or fitness goals?";
  }
};

export function FitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    }
  }, [messages]);
  
  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Add typing indicator
    setIsTyping(true);
    const typingIndicator: Message = {
      id: 'typing-indicator',
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingIndicator]);
    
    // Simulate typing delay (variable depending on response length)
    setTimeout(() => {
      // Remove typing indicator and add response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      setIsTyping(false);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(userMessage.content),
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, Math.random() * 1000 + 800); // Random delay between 800-1800ms for more natural feel
  };
  
  const categories = [
    { name: "Workout", icon: <Dumbbell className="h-4 w-4" />, suggestion: "What's a good beginner workout?" },
    { name: "Nutrition", icon: <Coffee className="h-4 w-4" />, suggestion: "What should I eat before a workout?" },
    { name: "Progress", icon: <BarChart className="h-4 w-4" />, suggestion: "How do I track my progress?" },
    { name: "Recovery", icon: <RefreshCw className="h-4 w-4" />, suggestion: "How important is recovery?" },
    { name: "Motivation", icon: <Brain className="h-4 w-4" />, suggestion: "How can I stay motivated?" },
    { name: "Schedule", icon: <Calendar className="h-4 w-4" />, suggestion: "How often should I workout?" }
  ];
  
  const suggestions = [
    "How often should I workout?",
    "What should I eat after training?",
    "How can I stay motivated?",
    "Where can I find my workout history?",
    "How do I track my progress?",
    "What's the best recovery method?"
  ];
  
  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSend(), 100);
  };
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="fixed bottom-20 right-4 rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        size="icon"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/bot-avatar.svg" alt="AI" />
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <DialogTitle>FitFusion Assistant</DialogTitle>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.isTyping ? (
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex items-center mb-1">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src="/bot-avatar.svg" alt="AI" />
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="h-3 w-3 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">Assistant</span>
                        </div>
                        <div className="flex space-x-1 items-center h-6">
                          <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.sender === 'assistant' && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src="/bot-avatar.svg" alt="AI" />
                              <AvatarFallback className="bg-primary/10">
                                <Bot className="h-3 w-3 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">Assistant</span>
                          </div>
                        )}
                        <p>{message.content}</p>
                        <div className="text-right mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t">
            {messages.length <= 2 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Suggested questions</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs p-0" 
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    {showSuggestions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-wrap gap-2 overflow-hidden"
                    >
                      {suggestions.map((suggestion, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => useSuggestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <div className="grid grid-cols-6 gap-1 mb-2">
              {categories.map((category, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="flex flex-col items-center justify-center p-2 h-auto text-xs"
                  onClick={() => useSuggestion(category.suggestion)}
                >
                  <div className="mb-1">{category.icon}</div>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
                disabled={isTyping}
              />
              
              <Button 
                size="icon" 
                className="rounded-full shrink-0" 
                onClick={handleSend}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
