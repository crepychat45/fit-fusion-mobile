import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Plus,
  Download,
  Upload,
  Palette,
  MessageSquarePlus,
  Archive,
  Trash2,
  UserPlus
} from "lucide-react";
import { MediaUpload } from "./media-upload";
import { EmojiPicker } from "./emoji-picker";
import { ChatBackgroundSelector } from "./chat-background-selector";
import { GroupChatCreator } from "./group-chat-creator";
import { chatStorage } from "@/utils/chat-storage";
import { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

interface AdvancedChatInterfaceProps {
  onLogout?: () => void;
}

export function AdvancedChatInterface({ onLogout }: AdvancedChatInterfaceProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [chatBackground, setChatBackground] = useState("bg-background");
  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadChatData();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);

  const loadChatData = () => {
    const savedConversations = chatStorage.getConversations();
    const savedSettings = chatStorage.getSettings();
    
    setConversations(savedConversations);
    setChatBackground(savedSettings.background || "bg-background");
    
    // Load initial conversation if exists
    if (savedConversations.length > 0 && !activeConversation) {
      const firstConv = savedConversations[0];
      setActiveConversation(firstConv.id);
      loadMessages(firstConv.id);
    }
    
    // Create default conversation if none exist
    if (savedConversations.length === 0) {
      createDefaultConversation();
    }
  };

  const createDefaultConversation = () => {
    const defaultConversation: ChatConversation = {
      id: "default-fitbot",
      participants: [
        { id: "user", name: "You", status: "online" },
        { id: "fitbot", name: "FitBot", status: "online", isVerified: true }
      ],
      unreadCount: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      name: "FitBot Assistant",
      isGroupChat: false,
      metadata: { isSecure: true, encryptionEnabled: true }
    };

    const defaultMessages: ChatMessage[] = [
      {
        id: "welcome-1",
        senderId: "fitbot",
        receiverId: "user",
        content: "Welcome to FitFusion Chat! 🎉 How can I help you with your fitness journey today?",
        timestamp: new Date(Date.now() - 3600000),
        isRead: true
      }
    ];

    setConversations([defaultConversation]);
    setMessages({ [defaultConversation.id]: defaultMessages });
    setActiveConversation(defaultConversation.id);
    
    chatStorage.saveConversations([defaultConversation]);
    chatStorage.saveMessages(defaultConversation.id, defaultMessages);
  };

  const loadMessages = (conversationId: string) => {
    const conversationMessages = chatStorage.getMessages(conversationId);
    setMessages(prev => ({
      ...prev,
      [conversationId]: conversationMessages
    }));
  };

  const createNewUserChat = () => {
    if (!newChatUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username to start a chat.",
        variant: "destructive"
      });
      return;
    }

    const newConversation: ChatConversation = {
      id: `user-${Date.now()}`,
      participants: [
        { id: "user", name: "You", status: "online" },
        { id: newChatUsername.toLowerCase(), name: newChatUsername, status: "online" }
      ],
      unreadCount: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      name: newChatUsername,
      isGroupChat: false,
      metadata: { isSecure: true, encryptionEnabled: true }
    };

    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      senderId: "system",
      receiverId: newConversation.id,
      content: `Chat started with ${newChatUsername}. Say hello! 👋`,
      timestamp: new Date(),
      isRead: true
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setMessages(prev => ({
      ...prev,
      [newConversation.id]: [welcomeMessage]
    }));

    chatStorage.saveConversations(updatedConversations);
    chatStorage.saveMessages(newConversation.id, [welcomeMessage]);

    setActiveConversation(newConversation.id);
    setShowNewChatDialog(false);
    setNewChatUsername("");

    toast({
      title: "New chat created",
      description: `Started a conversation with ${newChatUsername}`
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      receiverId: activeConversation === "default-fitbot" ? "fitbot" : activeConversation,
      content: newMessage,
      timestamp: new Date(),
      isRead: false
    };

    const updatedMessages = [...(messages[activeConversation] || []), message];
    setMessages(prev => ({
      ...prev,
      [activeConversation]: updatedMessages
    }));

    chatStorage.saveMessages(activeConversation, updatedMessages);
    setNewMessage("");

    // Update conversation timestamp
    updateConversationTimestamp(activeConversation);

    // Simulate bot response for FitBot conversation
    if (activeConversation === "default-fitbot") {
      simulateBotResponse(newMessage, activeConversation);
    } else {
      // Simulate user response for user-to-user chats
      simulateUserResponse(newMessage, activeConversation);
    }

    toast({
      title: "Message sent",
      description: "Your message has been delivered securely.",
    });
  };

  const simulateUserResponse = (userMessage: string, conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv || conv.isGroupChat) return;

    const otherUser = conv.participants.find(p => p.id !== "user");
    if (!otherUser) return;

    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "Thanks for the message! 😊",
        "That sounds great! Let's do it together 💪",
        "I'm excited about our fitness journey!",
        "Great idea! When should we start?",
        "That's awesome! Count me in! 🔥",
        "Perfect! I'm ready for the challenge 💪"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const userResponse: ChatMessage = {
        id: `response-${Date.now()}`,
        senderId: otherUser.id,
        receiverId: "user",
        content: randomResponse,
        timestamp: new Date(),
        isRead: true
      };

      const currentMessages = messages[conversationId] || [];
      const updatedMessages = [...currentMessages, userResponse];
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: updatedMessages
      }));

      chatStorage.saveMessages(conversationId, updatedMessages);
      setIsTyping(false);
      updateConversationTimestamp(conversationId);
    }, 1500);
  };

  const simulateBotResponse = (userMessage: string, conversationId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        senderId: "fitbot",
        receiverId: "user",
        content: getBotResponse(userMessage),
        timestamp: new Date(),
        isRead: true
      };

      const currentMessages = messages[conversationId] || [];
      const updatedMessages = [...currentMessages, botResponse];
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: updatedMessages
      }));

      chatStorage.saveMessages(conversationId, updatedMessages);
      setIsTyping(false);
      updateConversationTimestamp(conversationId);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("workout") || message.includes("exercise")) {
      return "I can help you with personalized workout plans! 💪 What's your fitness level and what are your goals?";
    } else if (message.includes("diet") || message.includes("nutrition")) {
      return "Nutrition is key to fitness success! 🥗 Would you like some healthy meal suggestions or information about macro tracking?";
    } else if (message.includes("progress") || message.includes("track")) {
      return "Tracking progress is essential! 📊 You can monitor your workouts, weight, and measurements in the Progress section.";
    } else if (message.includes("group") || message.includes("chat")) {
      return "You can create group chats to connect with other fitness enthusiasts! 👥 Click the '+' button to start a new conversation.";
    } else {
      return "Thanks for your message! I'm here to help with all your fitness questions. Feel free to ask about workouts, nutrition, or tracking your progress. 😊";
    }
  };

  const updateConversationTimestamp = (conversationId: string) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, updatedAt: new Date() }
        : conv
    );
    
    setConversations(updatedConversations);
    chatStorage.saveConversations(updatedConversations);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleMediaUpload = (files: any[]) => {
    if (!activeConversation) return;

    files.forEach(file => {
      const message: ChatMessage = {
        id: `media-${Date.now()}-${Math.random()}`,
        senderId: "user",
        receiverId: activeConversation === "default-fitbot" ? "fitbot" : activeConversation,
        content: `📎 ${file.file.name}`,
        timestamp: new Date(),
        isRead: false,
        attachments: [{
          id: file.id,
          type: file.type,
          url: file.preview || URL.createObjectURL(file.file),
          name: file.file.name,
          size: file.file.size
        }]
      };

      const updatedMessages = [...(messages[activeConversation] || []), message];
      setMessages(prev => ({
        ...prev,
        [activeConversation]: updatedMessages
      }));

      chatStorage.saveMessages(activeConversation, updatedMessages);
    });

    updateConversationTimestamp(activeConversation);
    setShowMediaUpload(false);

    toast({
      title: "Media uploaded",
      description: `${files.length} file(s) shared successfully.`,
    });
  };

  const handleCreateGroup = (groupName: string, selectedUsers: any[]) => {
    const newGroup: ChatConversation = {
      id: `group-${Date.now()}`,
      participants: [
        { id: "user", name: "You", status: "online" },
        ...selectedUsers
      ],
      unreadCount: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      name: groupName,
      isGroupChat: true,
      metadata: { isSecure: true, encryptionEnabled: true }
    };

    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      senderId: "system",
      receiverId: newGroup.id,
      content: `🎉 Group "${groupName}" has been created! Welcome everyone!`,
      timestamp: new Date(),
      isRead: true
    };

    const updatedConversations = [newGroup, ...conversations];
    setConversations(updatedConversations);
    setMessages(prev => ({
      ...prev,
      [newGroup.id]: [welcomeMessage]
    }));

    chatStorage.saveConversations(updatedConversations);
    chatStorage.saveMessages(newGroup.id, [welcomeMessage]);

    setActiveConversation(newGroup.id);
    setShowGroupCreator(false);
  };

  const handleBackgroundChange = (background: string) => {
    setChatBackground(background);
    const settings = chatStorage.getSettings();
    chatStorage.saveSettings({ ...settings, background });
    setShowBackgroundSelector(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const success = await chatStorage.syncData();
    setIsSyncing(false);

    toast({
      title: success ? "Sync completed" : "Sync failed",
      description: success 
        ? "Your chat data has been synchronized." 
        : "Failed to sync data. Please try again.",
      variant: success ? "default" : "destructive"
    });
  };

  const handleBackupDownload = () => {
    chatStorage.downloadBackup();
    toast({
      title: "Backup downloaded",
      description: "Your chat backup has been saved to your device."
    });
  };

  const handleBackupUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        const success = chatStorage.importBackup(backup);
        
        if (success) {
          loadChatData();
          toast({
            title: "Backup restored",
            description: "Your chat data has been successfully restored."
          });
        } else {
          toast({
            title: "Restore failed",
            description: "Invalid backup file format.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Restore failed",
          description: "Could not read backup file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeMessages = activeConversation ? (messages[activeConversation] || []) : [];
  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="flex h-full w-full bg-background border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 min-w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Conversations</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewChatDialog(true)}
                className="h-8 w-8"
                title="New Chat"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGroupCreator(true)}
                className="h-8 w-8"
                title="Create Group"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleSync}
                      disabled={isSyncing}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {isSyncing ? "Syncing..." : "Sync Data"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleBackupDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Backup
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Backup
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowBackgroundSelector(true)}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Background
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                  activeConversation === conversation.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  loadMessages(conversation.id);
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.isGroupChat ? (
                        <Users className="h-5 w-5" />
                      ) : conversation.id === "default-fitbot" ? (
                        "🤖"
                      ) : (
                        conversation.name?.charAt(0) || 'C'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conversation.name || 'Unnamed Chat'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.updatedAt.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.isGroupChat 
                          ? `${conversation.participants.length} members`
                          : conversation.id === "default-fitbot"
                          ? "AI Assistant"
                          : "Private chat"
                        }
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleBackupUpload}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${chatBackground}`}>
        {/* Chat Header */}
        {activeConv && (
          <CardHeader className="pb-3 border-b bg-background/80 backdrop-blur shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {activeConv.isGroupChat ? (
                      <Users className="h-4 w-4" />
                    ) : activeConv.id === "default-fitbot" ? (
                      "🤖"
                    ) : (
                      activeConv.name?.charAt(0) || 'C'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{activeConv.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {activeConv.isGroupChat 
                        ? `${activeConv.participants.length} members`
                        : 'Online'
                      }
                    </span>
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
              </div>
            </div>

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
          </CardHeader>
        )}

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 bg-transparent overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4 min-h-full">
              {activeMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.senderId !== 'user' && (
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="text-xs">
                        {message.senderId === 'fitbot' ? '🤖' : message.senderId.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${message.senderId === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderId === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/80 backdrop-blur border'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      
                      {message.attachments && message.attachments.map((attachment) => (
                        <div key={attachment.id} className="mt-2">
                          {attachment.type === 'image' && (
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="max-w-48 rounded"
                            />
                          )}
                          {attachment.type !== 'image' && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-xs">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  {message.senderId === 'user' && (
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="text-xs">You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="text-xs">
                      {activeConv?.id === "default-fitbot" ? "🤖" : activeConv?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-background/80 backdrop-blur border p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Message Input */}
        {activeConversation && (
          <div className="border-t p-4 bg-background/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-2">
              <Popover open={showMediaUpload} onOpenChange={setShowMediaUpload}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="top">
                  <MediaUpload onFilesSelected={handleMediaUpload} />
                </PopoverContent>
              </Popover>

              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                />
                
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top">
                    <EmojiPicker 
                      onEmojiSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </PopoverContent>
                </Popover>
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
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Enter username to chat with:
              </label>
              <Input
                id="username"
                placeholder="e.g. john_doe"
                value={newChatUsername}
                onChange={(e) => setNewChatUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewUserChat()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createNewUserChat} disabled={!newChatUsername.trim()}>
                Start Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGroupCreator} onOpenChange={setShowGroupCreator}>
        <DialogContent className="p-0">
          <GroupChatCreator
            onCreateGroup={handleCreateGroup}
            onClose={() => setShowGroupCreator(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBackgroundSelector} onOpenChange={setShowBackgroundSelector}>
        <DialogContent className="p-0">
          <ChatBackgroundSelector
            currentBackground={chatBackground}
            onBackgroundChange={handleBackgroundChange}
            onClose={() => setShowBackgroundSelector(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
