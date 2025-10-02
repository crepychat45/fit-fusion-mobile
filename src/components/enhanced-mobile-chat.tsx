import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Send,
  Plus,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Search,
  ArrowLeft,
  Mic,
  Camera,
  Image as ImageIcon,
  MapPin,
  Heart,
  ThumbsUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiPicker, AttachmentMenu, VoiceCallOverlay } from "./chat/enhanced-chat-features";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type?: "text" | "image" | "audio" | "location";
  reactions?: string[];
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
  unread?: number;
  typing?: boolean;
}

interface EnhancedMobileChatProps {
  onClose?: () => void;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "AI Fitness Coach",
    avatar: "🤖",
    lastMessage: "Great workout today! Ready for tomorrow?",
    timestamp: "2 min",
    online: true,
    typing: false,
    unread: 2,
  },
  {
    id: "2", 
    name: "Workout Buddy",
    lastMessage: "Let's hit the gym tomorrow!",
    timestamp: "5 min",
    online: true,
    unread: 1,
  },
  {
    id: "3",
    name: "Nutrition Expert",
    avatar: "🥗",
    lastMessage: "Your meal plan is ready",
    timestamp: "1h",
    online: false,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "AI Fitness Coach",
    content: "Hey! How's your fitness journey going? 💪",
    timestamp: "10:25 AM",
    isOwn: false,
    reactions: ["💪", "🔥"],
  },
  {
    id: "2",
    sender: "You",
    content: "Great! Just finished my HIIT session. Feeling energized! 🔥",
    timestamp: "10:28 AM",
    isOwn: true,
    reactions: ["❤️"],
  },
  {
    id: "3",
    sender: "AI Fitness Coach", 
    content: "Awesome! HIIT is fantastic for cardiovascular health and fat burning. How are you feeling? Want some post-workout recovery tips?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
];

export function EnhancedMobileChat({ onClose }: EnhancedMobileChatProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showConversations, setShowConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: selectedConversation?.name || "AI Fitness Coach",
        content: generateResponse(message),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: false,
      };

      setMessages(prev => [...prev, botResponse]);
    }, 1500);

    toast({
      title: "Message sent",
      description: "Your message was delivered successfully.",
    });
  };

  const generateResponse = (userMessage: string): string => {
    const responses = [
      "That's fantastic! Keep pushing your limits! 💪",
      "You're doing amazing! Consistency is key to success! 🌟",
      "Great progress! Let's keep building on this momentum! 🚀",
      "Excellent work! Your dedication is truly inspiring! ⭐",
      "Keep it up! Every workout brings you closer to your goals! 🎯",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
  };

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentSelect = (type: string) => {
    toast({
      title: `${type} sharing`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} sharing feature coming soon!`,
    });
    setShowAttachments(false);
  };

  const handleVoiceCall = () => {
    setShowCall(true);
    toast({
      title: "Voice call started",
      description: `Calling ${selectedConversation?.name || "AI Coach"}...`,
    });
  };

  const handleEndCall = () => {
    setShowCall(false);
    setIsAudioMuted(false);
    setIsVideoMuted(true);
    toast({
      title: "Call ended",
      description: "Voice call has been ended.",
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
          : msg
      )
    );
  };

  if (!isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="fixed inset-0 z-50 bg-background"
      >
        <VoiceCallOverlay
          isActive={showCall}
          onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
          onToggleVideo={() => setIsVideoMuted(!isVideoMuted)}
          onEndCall={handleEndCall}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          contact={{ name: selectedConversation?.name || "AI Coach" }}
        />

        {showConversations ? (
          // Conversations List View
          <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/5 to-background">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-b bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">FitFusion Chat</h2>
                  <p className="text-sm text-muted-foreground">
                    {mockConversations.length} conversations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>

            <ScrollArea className="flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="p-4 space-y-3"
              >
                {mockConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConversationSelect(conversation)}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 border border-border/50 backdrop-blur-sm"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                          {conversation.avatar || conversation.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread && (
                          <Badge className="ml-2 bg-primary text-primary-foreground animate-pulse">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </div>
        ) : (
          // Chat View
          <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/5 to-background">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-b bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedConversation?.avatar || selectedConversation?.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {selectedConversation?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation?.online ? "Online" : "Last seen recently"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] ${msg.isOwn ? "order-2" : "order-1"}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-2xl relative group ${
                            msg.isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-card border rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex gap-1 mt-2 flex-wrap"
                            >
                              {msg.reactions.map((emoji, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-background/20 px-2 py-1 rounded-full backdrop-blur-sm"
                                >
                                  {emoji}
                                </span>
                              ))}
                            </motion.div>
                          )}

                          <div className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {["❤️", "👍", "💪"].map((emoji) => (
                              <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="w-8 h-8 bg-card border rounded-full flex items-center justify-center text-xs hover:bg-muted transition-colors"
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                        <p
                          className={`text-xs text-muted-foreground mt-1 ${
                            msg.isOwn ? "text-right" : "text-left"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-t bg-card/50 backdrop-blur-sm relative"
            >
              <AnimatePresence>
                {showEmojiPicker && (
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
                {showAttachments && (
                  <AttachmentMenu
                    onAttachmentSelect={handleAttachmentSelect}
                    onClose={() => setShowAttachments(false)}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}