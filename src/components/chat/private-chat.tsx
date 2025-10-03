import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Lock,
  Shield,
  User,
  Bot,
  Heart,
  Smile,
  Camera,
  Mic,
  MoreHorizontal,
  UserPlus,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";

interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: "text" | "voice" | "image";
  encrypted: boolean;
  read: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  role: "user" | "ai" | "coach";
}

const mockUsers: ChatUser[] = [
  {
    id: "ai-coach",
    name: "FitFusion AI Coach",
    avatar: "/api/placeholder/40/40",
    online: true,
    role: "ai",
  },
  {
    id: "trainer-sarah",
    name: "Sarah (Trainer)",
    avatar: "/api/placeholder/40/40",
    online: true,
    role: "coach",
  },
  {
    id: "user-alex",
    name: "Alex Thompson",
    avatar: "/api/placeholder/40/40",
    online: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    role: "user",
  },
];

export function PrivateChat() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(
    mockUsers[0],
  );
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useEnhancedAuth();

  // Load messages for selected user
  useEffect(() => {
    if (selectedUser) {
      loadMessagesForUser(selectedUser.id);
    }
  }, [selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessagesForUser = (userId: string) => {
    // Simulate loading messages from storage
    const mockMessages: PrivateMessage[] = [
      {
        id: "1",
        senderId: userId,
        receiverId: user?.id || "current-user",
        content:
          userId === "ai-coach"
            ? "Hello! I'm your AI fitness coach. How can I help you achieve your fitness goals today?"
            : userId === "trainer-sarah"
              ? "Hi! Ready for today's workout session? I've prepared a custom routine for you."
              : "Hey! How's your fitness journey going?",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: "text",
        encrypted: true,
        read: true,
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedUser) return;

    const newMessage: PrivateMessage = {
      id: Date.now().toString(),
      senderId: user?.id || "current-user",
      receiverId: selectedUser.id,
      content: inputValue.trim(),
      timestamp: new Date(),
      type: "text",
      encrypted: true,
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI or trainer response
    if (selectedUser.role === "ai" || selectedUser.role === "coach") {
      setIsTyping(true);

      setTimeout(
        () => {
          const responses = {
            ai: [
              "That's a great question! Based on your fitness profile, I'd recommend...",
              "I can help you create a personalized workout plan. What are your current fitness goals?",
              "Remember to stay hydrated and listen to your body during workouts!",
              "Your progress is looking excellent! Keep up the great work! 💪",
            ],
            coach: [
              "Excellent mindset! Let's focus on proper form and consistent effort.",
              "I'm proud of your dedication. Remember, progress takes time and patience.",
              "That's exactly the kind of commitment that leads to results!",
              "Let's schedule your next session. How does Wednesday sound?",
            ],
          };

          const responseArray =
            responses[selectedUser.role as keyof typeof responses];
          const randomResponse =
            responseArray[Math.floor(Math.random() * responseArray.length)];

          const aiResponse: PrivateMessage = {
            id: (Date.now() + 1).toString(),
            senderId: selectedUser.id,
            receiverId: user?.id || "current-user",
            content: randomResponse,
            timestamp: new Date(),
            type: "text",
            encrypted: true,
            read: false,
          };

          setMessages((prev) => [...prev, aiResponse]);
          setIsTyping(false);
        },
        1000 + Math.random() * 2000,
      );
    }

    toast({
      title: "Message sent",
      description: `Secure message delivered to ${selectedUser.name}`,
    });
  };

  const getUserStatus = (user: ChatUser) => {
    if (user.online) return { text: "Online", color: "bg-green-500" };
    if (user.lastSeen) {
      const minutesAgo = Math.floor(
        (Date.now() - user.lastSeen.getTime()) / (1000 * 60),
      );
      if (minutesAgo < 60)
        return { text: `${minutesAgo}m ago`, color: "bg-yellow-500" };
      const hoursAgo = Math.floor(minutesAgo / 60);
      return { text: `${hoursAgo}h ago`, color: "bg-gray-500" };
    }
    return { text: "Offline", color: "bg-gray-500" };
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ai":
        return <Bot className="h-4 w-4" />;
      case "coach":
        return <Heart className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ai":
        return "bg-blue-600";
      case "coach":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Private Messages
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <Shield className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Dialog open={showUserList} onOpenChange={setShowUserList}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Contacts
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat Contacts</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {mockUsers.map((chatUser) => {
                    const status = getUserStatus(chatUser);
                    return (
                      <div
                        key={chatUser.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedUser?.id === chatUser.id
                            ? "border-primary bg-primary/10"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedUser(chatUser);
                          setShowUserList(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={chatUser.avatar} />
                              <AvatarFallback>
                                {getRoleIcon(chatUser.role)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${status.color}`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {chatUser.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${getRoleBadgeColor(chatUser.role)} text-white border-0`}
                              >
                                {chatUser.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {status.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedUser && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback>
                  {getRoleIcon(selectedUser.role)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getUserStatus(selectedUser).color}`}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedUser.name}</span>
                <Badge
                  variant="outline"
                  className={`${getRoleBadgeColor(selectedUser.role)} text-white border-0`}
                >
                  {selectedUser.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getUserStatus(selectedUser).text}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((message) => {
                const isOwn = message.senderId === (user?.id || "current-user");
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.encrypted && (
                            <Lock className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted p-3 rounded-2xl rounded-bl-md max-w-[80%]">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {selectedUser?.name} is typing...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${selectedUser?.name || "someone"}...`}
                className="pr-20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
