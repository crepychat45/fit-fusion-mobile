
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    text: "Hi there! I'm your FitFusion assistant. How can I help you today with your fitness journey?",
    isBot: true,
    timestamp: new Date()
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
  "default": "I'm not sure about that. Please check our Help & Support section for more information or contact us directly."
};

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Process response
    setTimeout(() => {
      const lowercaseInput = input.toLowerCase();
      let responseText = responses.default;
      
      // Simple keyword matching
      for (const [keyword, response] of Object.entries(responses)) {
        if (lowercaseInput.includes(keyword)) {
          responseText = response;
          break;
        }
      }
      
      const botMessage: Message = {
        text: responseText,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium mb-2 flex items-center">
          <Bot className="h-5 w-5 text-primary mr-2" />
          FitFusion Assistant
        </h3>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot 
                      ? 'bg-secondary/50 text-foreground rounded-tl-none' 
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div className="rounded-full p-1 mr-1 bg-background/20">
                      {msg.isBot ? (
                        <Bot className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-xs">{msg.isBot ? 'Assistant' : 'You'}</span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex mt-4">
          <Input
            placeholder="Ask about fitness, workouts, or app features..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 mr-2"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="bg-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
