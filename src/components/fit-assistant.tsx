
import React, { useState } from "react";
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
  Sparkles
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

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
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
  } else {
    return "I'm not sure I understand. Could you rephrase your question about workouts, nutrition, or fitness goals?";
  }
};

export function FitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  
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
    
    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(userMessage.content),
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const suggestions = [
    "How often should I workout?",
    "What should I eat after training?",
    "How can I stay motivated?",
    "Where can I find my workout history?"
  ];
  
  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSend();
  };
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="fixed bottom-20 right-4 rounded-full h-12 w-12 shadow-lg bg-primary"
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
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <DialogTitle>FitFusion Assistant</DialogTitle>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
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
                          <AvatarFallback>
                            <Bot className="h-3 w-3" />
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
                </div>
              ))}
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
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full shrink-0" 
                title="Quick Workout Questions"
                onClick={() => useSuggestion("What's a good beginner workout?")}
              >
                <Dumbbell className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full shrink-0" 
                title="Nutrition Questions"
                onClick={() => useSuggestion("What should I eat before a workout?")}
              >
                <Coffee className="h-4 w-4" />
              </Button>
              
              <Input
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              
              <Button 
                size="icon" 
                className="rounded-full shrink-0" 
                onClick={handleSend}
                disabled={!inputMessage.trim()}
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
