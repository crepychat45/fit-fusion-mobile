import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Shifu",
    lastMessage: "How's your workout going?",
    timestamp: "10:30 pm",
    online: true,
    typing: false,
  },
  {
    id: "2",
    name: "Junedkhan",
    lastMessage: "Let's hit the gym tomorrow!",
    timestamp: "10:29 pm",
    online: false,
  },
  {
    id: "3",
    name: "FitBot Assistant",
    avatar: "🤖",
    lastMessage: "Your weekly report is ready",
    timestamp: "10:29 pm",
    online: true,
    unread: 2,
    typing: true,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "Shifu",
    content: "Hey! How's your workout routine going?",
    timestamp: "10:25 pm",
    isOwn: false,
    reactions: ["👍", "💪"],
  },
  {
    id: "2",
    sender: "You",
    content: "Great! Just finished my HIIT session. Feeling energized! 💪",
    timestamp: "10:28 pm",
    isOwn: true,
    reactions: ["🔥"],
  },
  {
    id: "3",
    sender: "Shifu",
    content:
      "That's awesome! Keep up the great work. Want to join me for a morning run tomorrow?",
    timestamp: "10:30 pm",
    isOwn: false,
  },
];

export function MobileChatInterface() {
  const [showConversations, setShowConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
  };

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
  };

  const quickActions = [
    { icon: Camera, label: "Camera", color: "bg-blue-500" },
    { icon: ImageIcon, label: "Gallery", color: "bg-green-500" },
    { icon: MapPin, label: "Location", color: "bg-red-500" },
    { icon: Mic, label: "Audio", color: "bg-purple-500" },
  ];

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
          : msg,
      ),
    );
  };

  if (showConversations) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Enhanced Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Conversations</h2>
              <p className="text-sm text-gray-400">3 active chats</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="p-2"
          >
            {mockConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleConversationSelect(conversation)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 cursor-pointer transition-all duration-200 mb-2 glass-dark"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-gray-600">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-600 text-white">
                      {conversation.avatar || conversation.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {conversation.typing && (
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs text-blue-400"
                        >
                          typing...
                        </motion.div>
                      )}
                      {!conversation.typing && (
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                    {conversation.unread && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2"
                      >
                        <Badge className="bg-blue-600 text-white text-xs animate-pulse">
                          {conversation.unread}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
      >
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToConversations}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>

          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-gray-600">
              <AvatarImage src={selectedConversation?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-600 text-white text-sm">
                {selectedConversation?.avatar || selectedConversation?.name[0]}
              </AvatarFallback>
            </Avatar>
            {selectedConversation?.online && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">
              {selectedConversation?.name}
            </h3>
            <motion.p
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-xs text-gray-400"
            >
              {selectedConversation?.online ? "Online" : "Last seen recently"}
            </motion.p>
          </div>

          <div className="flex items-center gap-2">
            {[Phone, Video, MoreVertical].map((Icon, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${msg.isOwn ? "order-2" : "order-1"}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`px-4 py-3 rounded-2xl relative group ${
                      msg.isOwn
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                        : "bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex gap-1 mt-2"
                      >
                        {msg.reactions.map((emoji, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-black/20 px-2 py-1 rounded-full"
                          >
                            {emoji}
                          </span>
                        ))}
                      </motion.div>
                    )}

                    {/* Quick reaction buttons */}
                    <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {["❤️", "👍"].map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs hover:bg-gray-700"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                  <p
                    className={`text-xs text-gray-400 mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}
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

      {/* Enhanced Message Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
      >
        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex gap-2 p-2 bg-gray-800/50 rounded-lg">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center p-2 rounded-lg ${action.color} text-white text-xs min-w-[60px]`}
                  >
                    <action.icon className="h-4 w-4 mb-1" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-gray-400 hover:text-white shrink-0 hover:bg-gray-700"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </motion.div>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 pr-10 focus:ring-2 focus:ring-blue-500"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white h-8 w-8 hover:bg-gray-600"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shrink-0 shadow-lg"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
