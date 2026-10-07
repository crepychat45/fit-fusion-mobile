import { askCoach } from "@/lib/ai-coach";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Send,
  MoreVertical,
  Users,
  Shield,
  Settings,
  Phone,
  Video,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmojiPicker, AttachmentMenu, VoiceCallOverlay } from "./enhanced-chat-features";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwnMessage: boolean;
  avatar?: string;
}

interface EnhancedChatInterfaceProps {
  onLogout?: () => void;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
}

export function EnhancedChatInterface({
  onLogout,
  selectedUser,
}: EnhancedChatInterfaceProps & { selectedUser?: User | null }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: selectedUser ? selectedUser.name : "FitBot",
      content: selectedUser
        ? `Hi there! Ready to chat about fitness and workouts?`
        : "Welcome to FitX Fusion Chat! I'm your AI fitness assistant. Ask me anything about workouts, nutrition, progress tracking, or get personalized recommendations. How can I help you achieve your fitness goals today?",
      timestamp: new Date(Date.now() - 3600000),
      isOwnMessage: false,
      avatar: selectedUser ? selectedUser.avatar : "🤖",
    },
    {
      id: "2",
      sender: "You",
      content: selectedUser
        ? "Hey! How's your training going?"
        : "Hi! I'm looking for some workout recommendations for beginners.",
      timestamp: new Date(Date.now() - 3000000),
      isOwnMessage: true,
    },
    {
      id: "3",
      sender: selectedUser ? selectedUser.name : "FitBot",
      content: selectedUser
        ? "Going great! Just finished my HIIT session. What about you?"
        : "Excellent! For beginners, I recommend starting with:\n\n🏃‍♂️ **Cardio Foundation (Week 1-2):**\n- 20-minute brisk walks daily\n- Light stretching\n\n💪 **Strength Building (Week 3-4):**\n- Bodyweight squats (3 sets of 10)\n- Push-ups (3 sets of 5-10)\n- Planks (3 sets of 30 seconds)\n\n🎯 **Progressive Training (Week 5+):**\n- Add resistance bands\n- Increase repetitions\n- Include yoga for flexibility\n\nWould you like me to create a personalized 4-week workout plan based on your fitness level and goals?",
      timestamp: new Date(Date.now() - 2400000),
      isOwnMessage: false,
      avatar: selectedUser ? selectedUser.avatar : "🤖",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter messages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(
        (message) =>
          message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.sender.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [searchQuery, messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date(),
      isOwnMessage: true,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    if (selectedUser) return; // real people reply themselves; no fake auto-replies
    setIsTyping(true);
    const asked = newMessage;
    askCoach([{ role: "user", content: asked }])
      .catch((e: any) => `⚠️ ${e?.message ?? "AI Coach unavailable."}`)
      .then((reply) => {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "FitBot", content: reply, timestamp: new Date(), isOwnMessage: false, avatar: "🤖" } as Message]);
        setIsTyping(false);
      });

    toast({
      title: "Message sent",
      description: "Your message has been delivered securely.",
    });
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayMessages = searchQuery.trim() ? filteredMessages : messages;

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>FC</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">FitX Fusion Chat</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar (when open) */}
        {isSearchOpen && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              {filteredMessages.length} message(s) found for "{searchQuery}"
            </span>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {!message.isOwnMessage && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="text-xs">
                      {message.avatar || message.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[70%] ${message.isOwnMessage ? "order-first" : ""}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.isOwnMessage && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarFallback className="text-xs">🤖</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
