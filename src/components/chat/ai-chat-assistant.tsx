
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Brain, Shield, Lock, Zap, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AIMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  isSecure: boolean;
  aiModel?: "gpt-4" | "claude" | "fitfusion-ai";
  confidence?: number;
}

interface AIChatAssistantProps {
  onClose?: () => void;
}

export function AIChatAssistant({ onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your FitFusion AI Assistant powered by advanced AI technology. I can help you with workouts, nutrition, health tracking, and more. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
      isSecure: true,
      aiModel: "fitfusion-ai",
      confidence: 0.98
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"gpt-4" | "claude" | "fitfusion-ai">("fitfusion-ai");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing with different responses based on model
    const responses = {
      "fitfusion-ai": `Based on your FitFusion data and advanced AI analysis, here's my personalized response to: "${userMessage}". I've analyzed your fitness patterns, nutrition habits, and health metrics to provide the most relevant guidance.`,
      "gpt-4": `Using GPT-4 technology to analyze your query: "${userMessage}". I can provide comprehensive fitness and health insights based on the latest research and your personal data.`,
      "claude": `Through Claude's advanced reasoning capabilities, I understand you're asking about: "${userMessage}". Let me provide you with detailed, contextual fitness guidance.`
    };

    return responses[selectedModel] || responses["fitfusion-ai"];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date(),
      isSecure: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      const aiResponse = await generateAIResponse(input);
      
      const botMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isBot: true,
        timestamp: new Date(),
        isSecure: true,
        aiModel: selectedModel,
        confidence: 0.85 + Math.random() * 0.15
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "AI Response Generated",
        description: `Response from ${selectedModel} with ${Math.round((botMessage.confidence || 0) * 100)}% confidence`,
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case "gpt-4": return <Brain className="h-3 w-3" />;
      case "claude": return <Sparkles className="h-3 w-3" />;
      case "fitfusion-ai": return <Zap className="h-3 w-3" />;
      default: return <Bot className="h-3 w-3" />;
    }
  };

  const getModelColor = (model: string) => {
    switch (model) {
      case "gpt-4": return "bg-green-500";
      case "claude": return "bg-purple-500";
      case "fitfusion-ai": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">FitFusion AI Assistant</h3>
              <p className="text-xs opacity-90">Powered by Advanced AI Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Lock className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          {(["fitfusion-ai", "gpt-4", "claude"] as const).map((model) => (
            <Button
              key={model}
              variant={selectedModel === model ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedModel(model)}
              className={`text-xs ${selectedModel === model ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              {getModelIcon(model)}
              <span className="ml-1 capitalize">{model.replace("-", " ")}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot 
                      ? 'bg-white/80 dark:bg-gray-800/80 text-foreground' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.isBot ? (
                        <div className={`p-1 rounded-full ${getModelColor(message.aiModel || "fitfusion-ai")}`}>
                          {getModelIcon(message.aiModel || "fitfusion-ai")}
                        </div>
                      ) : (
                        <div className="p-1 bg-white/20 rounded-full">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                      <span className="text-xs font-medium">
                        {message.isBot ? `AI (${message.aiModel || "fitfusion-ai"})` : 'You'}
                      </span>
                      {message.isBot && message.confidence && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-2 w-2 mr-1" />
                          {Math.round(message.confidence * 100)}%
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {message.isSecure && <Shield className="h-3 w-3 text-green-500" />}
                        <Lock className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${getModelColor(selectedModel)}`}>
                      {getModelIcon(selectedModel)}
                    </div>
                    <span className="text-xs">AI is thinking...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder={`Ask ${selectedModel} about fitness, nutrition, or health...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
