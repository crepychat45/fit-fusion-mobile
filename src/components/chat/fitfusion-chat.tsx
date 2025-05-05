
import React, { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatList } from "./chat-list";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  MessageSquare, 
  Search, 
  Settings, 
  Users, 
  Shield, 
  Lock, 
  Bell, 
  BellOff,
  Trash2,
  UserPlus,
  Smartphone,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userProfile } from "@/data/user";
import { ChatAttachment, ChatConversation, ChatMessage as ChatMessageType, ChatUser } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

// Mock data for chat
const mockUsers: ChatUser[] = [
  {
    id: "u1",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    status: "online"
  },
  {
    id: "u2",
    name: "Mike Peterson",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    status: "online"
  },
  {
    id: "u3",
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: "u4",
    name: "Jason Lee",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    status: "away"
  },
  {
    id: "u5",
    name: "Michelle Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    status: "online"
  },
];

// Generate mock conversations
const generateMockConversations = (): ChatConversation[] => {
  const currentUserId = "current";
  
  return mockUsers.map((user, index) => {
    const messages: ChatMessageType[] = [
      {
        id: `msg1-${index}`,
        senderId: index % 2 === 0 ? currentUserId : user.id,
        receiverId: index % 2 === 0 ? user.id : currentUserId,
        content: index % 2 === 0 
          ? "Hey! How's your fitness journey going?" 
          : "It's going great! I've been following the workout plan you recommended.",
        timestamp: new Date(Date.now() - (index + 1) * 3600000),
        isRead: true
      },
      {
        id: `msg2-${index}`,
        senderId: index % 2 === 0 ? user.id : currentUserId,
        receiverId: index % 2 === 0 ? currentUserId : user.id,
        content: "I'm planning to try that new HIIT workout tomorrow.",
        timestamp: new Date(Date.now() - (index + 0.5) * 3600000),
        isRead: index !== 0
      }
    ];
    
    return {
      id: `conv-${index}`,
      participants: [
        {
          id: currentUserId,
          name: userProfile.name,
          avatar: userProfile.avatar || "/placeholder.svg"
        },
        user
      ],
      lastMessage: messages[messages.length - 1],
      unreadCount: index === 0 ? 1 : 0,
      updatedAt: new Date(Date.now() - index * 3600000)
    };
  });
};

export function FitfusionChat() {
  const [activeTab, setActiveTab] = useState("chats");
  const [conversations, setConversations] = useState<ChatConversation[]>(generateMockConversations());
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [encryptedChat, setEncryptedChat] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [chatBackupEnabled, setChatBackupEnabled] = useState(true);
  const [biometricLockEnabled, setBiometricLockEnabled] = useState(false);
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState("30 days");
  
  const currentUserId = "current";
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScrollEnabled]);
  
  useEffect(() => {
    if (selectedConversationId) {
      // In a real app, we would fetch messages from an API
      // For this demo, we'll generate some mock messages
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        const mockMessages: ChatMessageType[] = [];
        const otherUser = conversation.participants.find(p => p.id !== currentUserId)!;
        
        // Generate 10-15 mock messages
        const count = Math.floor(Math.random() * 6) + 10;
        for (let i = 0; i < count; i++) {
          const isCurrentUser = Math.random() > 0.5;
          const hasAttachment = Math.random() > 0.8;
          let attachments: ChatAttachment[] | undefined = undefined;
          
          if (hasAttachment) {
            const attachmentType = Math.random() > 0.5 ? 'image' : 'document';
            attachments = [{
              id: `att-${i}`,
              type: attachmentType,
              url: attachmentType === 'image' 
                ? `https://picsum.photos/500/300?random=${i}` 
                : '#',
              name: attachmentType === 'image' 
                ? 'workout-progress.jpg' 
                : 'fitness-plan.pdf',
              size: Math.floor(Math.random() * 1000000) + 100000,
            }];
          }
          
          mockMessages.push({
            id: `msg-${selectedConversationId}-${i}`,
            senderId: isCurrentUser ? currentUserId : otherUser.id,
            receiverId: isCurrentUser ? otherUser.id : currentUserId,
            content: isCurrentUser 
              ? ["How's your workout going?", "Have you tried the new protein shake?", "Let's schedule a workout session", "How many sets did you do?"][i % 4]
              : ["It's going great!", "I hit a new PR today!", "The new gym equipment is amazing", "I'll share my workout routine with you"][i % 4],
            timestamp: new Date(Date.now() - (count - i) * 600000),
            isRead: true,
            attachments
          });
        }
        
        // Add the last message from the conversation
        if (conversation.lastMessage) {
          mockMessages.push({
            ...conversation.lastMessage,
            isRead: true
          });
          
          // Mark conversation as read
          setConversations(prev => 
            prev.map(c => 
              c.id === selectedConversationId
                ? { ...c, unreadCount: 0 }
                : c
            )
          );
        }
        
        // Sort messages by timestamp
        mockMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(mockMessages);
        
        // Ensure scroll to bottom after messages load
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);
  
  const handleSendMessage = (content: string, attachmentFiles: File[]) => {
    if (!selectedConversationId || (!content.trim() && attachmentFiles.length === 0)) return;
    
    setIsSending(true);
    
    // In a real app, we would send the message to an API
    // For this demo, we'll just add it to the local state
    setTimeout(() => {
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        const otherUser = conversation.participants.find(p => p.id !== currentUserId)!;
        
        // Create attachments from files
        const attachments: ChatAttachment[] = attachmentFiles.map((file, index) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          const isAudio = file.type.startsWith("audio/");
          
          let type: "image" | "video" | "document" | "audio" = "document";
          if (isImage) type = "image";
          else if (isVideo) type = "video";
          else if (isAudio) type = "audio";
          
          return {
            id: `new-att-${Date.now()}-${index}`,
            type,
            url: isImage ? URL.createObjectURL(file) : "#",
            name: file.name,
            size: file.size,
          };
        });
        
        // Create new message
        const newMessage: ChatMessageType = {
          id: `new-msg-${Date.now()}`,
          senderId: currentUserId,
          receiverId: otherUser.id,
          content: content.trim(),
          timestamp: new Date(),
          isRead: false,
          attachments: attachments.length > 0 ? attachments : undefined
        };
        
        // Add message to the messages list
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversation's last message
        setConversations(prev => 
          prev.map(c => 
            c.id === selectedConversationId
              ? { 
                  ...c, 
                  lastMessage: newMessage,
                  updatedAt: new Date()
                }
              : c
          ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        );
        
        if (attachments.length > 0) {
          toast({
            description: `Files uploaded successfully!`,
          });
        }
        
        setIsSending(false);
        
        // Ensure scroll to bottom after sending
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
        
        // Simulate reply after 1-3 seconds
        setTimeout(() => {
          const replyMessage: ChatMessageType = {
            id: `new-reply-${Date.now()}`,
            senderId: otherUser.id,
            receiverId: currentUserId,
            content: [
              "Great! I'll check it out.",
              "Thanks for sharing!",
              "That sounds awesome!",
              "I'll get back to you on that soon.",
            ][Math.floor(Math.random() * 4)],
            timestamp: new Date(),
            isRead: true
          };
          
          setMessages(prev => [...prev, replyMessage]);
          
          setConversations(prev => 
            prev.map(c => 
              c.id === selectedConversationId
                ? { 
                    ...c, 
                    lastMessage: replyMessage,
                    updatedAt: new Date()
                  }
                : c
            ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          );
          
          // Ensure scroll to bottom after reply
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        }, Math.random() * 2000 + 1000);
      }
    }, 500);
  };
  
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUserId);

  // Function to toggle privacy features
  const togglePrivacy = () => {
    setPrivacyEnabled(!privacyEnabled);
    toast({
      description: !privacyEnabled ? "Privacy features enabled" : "Privacy features disabled",
    });
  };

  // Function to toggle encryption
  const toggleEncryption = () => {
    setEncryptedChat(!encryptedChat);
    toast({
      description: !encryptedChat ? "Encrypted chat enabled" : "Encrypted chat disabled",
    });
  };

  // Function to toggle notifications
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      description: !notificationsEnabled ? "Chat notifications enabled" : "Chat notifications disabled",
    });
  };

  // Function to toggle biometric lock
  const toggleBiometricLock = () => {
    setBiometricLockEnabled(!biometricLockEnabled);
    toast({
      description: !biometricLockEnabled ? "Biometric lock enabled" : "Biometric lock disabled",
    });
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    if (!selectedConversationId) return;
    
    setMessages([]);
    toast({
      description: "Chat history cleared",
    });
  };

  // Function to delete conversation
  const deleteConversation = () => {
    if (!selectedConversationId) return;
    
    setConversations(prev => prev.filter(c => c.id !== selectedConversationId));
    setSelectedConversationId(undefined);
    toast({
      description: "Conversation deleted",
    });
  };

  // Select a default conversation if none is selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-hidden">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>FitFusion Chat</CardTitle>
              <p className="text-xs text-muted-foreground">Connect with your fitness community</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Shield className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Privacy & Security</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Privacy Mode</p>
                      <p className="text-xs text-muted-foreground">Hide sensitive information</p>
                    </div>
                    <Button 
                      variant={privacyEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={togglePrivacy}
                    >
                      {privacyEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">End-to-End Encryption</p>
                      <p className="text-xs text-muted-foreground">Secure your messages</p>
                    </div>
                    <Button 
                      variant={encryptedChat ? "default" : "outline"}
                      size="sm"
                      onClick={toggleEncryption}
                    >
                      {encryptedChat ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Biometric Lock</p>
                      <p className="text-xs text-muted-foreground">Require authentication to access</p>
                    </div>
                    <Button 
                      variant={biometricLockEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleBiometricLock}
                    >
                      {biometricLockEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <p className="text-xs">Your fitness data and messages are protected</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="pb-4">
                  <SheetTitle>Chat Settings</SheetTitle>
                  <SheetDescription>
                    Configure your FitFusion chat experience
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(100vh-150px)]">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="notifications">Chat Notifications</Label>
                        <span className="text-xs text-muted-foreground">
                          Receive notifications for new messages
                        </span>
                      </div>
                      <Switch 
                        id="notifications" 
                        checked={notificationsEnabled}
                        onCheckedChange={toggleNotifications}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Privacy & Security</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="privacy-mode">Privacy Mode</Label>
                        <span className="text-xs text-muted-foreground">
                          Hide sensitive information in chats
                        </span>
                      </div>
                      <Switch 
                        id="privacy-mode" 
                        checked={privacyEnabled}
                        onCheckedChange={togglePrivacy}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="encryption">End-to-End Encryption</Label>
                        <span className="text-xs text-muted-foreground">
                          Secure your messages with encryption
                        </span>
                      </div>
                      <Switch 
                        id="encryption" 
                        checked={encryptedChat}
                        onCheckedChange={toggleEncryption}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="biometric">Biometric Lock</Label>
                        <span className="text-xs text-muted-foreground">
                          Require biometric authentication
                        </span>
                      </div>
                      <Switch 
                        id="biometric" 
                        checked={biometricLockEnabled}
                        onCheckedChange={toggleBiometricLock}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Data Retention</Label>
                      <select
                        id="data-retention"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={dataRetentionPeriod}
                        onChange={(e) => setDataRetentionPeriod(e.target.value)}
                      >
                        <option value="7 days">7 days</option>
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                        <option value="1 year">1 year</option>
                        <option value="forever">Keep forever</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Messages older than this will be automatically deleted
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Chat Experience</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="auto-scroll">Auto-scroll to New Messages</Label>
                        <span className="text-xs text-muted-foreground">
                          Automatically scroll to new messages
                        </span>
                      </div>
                      <Switch 
                        id="auto-scroll" 
                        checked={autoScrollEnabled}
                        onCheckedChange={setAutoScrollEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="chat-backup">Chat Backup</Label>
                        <span className="text-xs text-muted-foreground">
                          Backup your chat history
                        </span>
                      </div>
                      <Switch 
                        id="chat-backup" 
                        checked={chatBackupEnabled}
                        onCheckedChange={setChatBackupEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Chat Theme</Label>
                      <select
                        id="theme"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                        <option value="fitness">Fitness Theme</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size</Label>
                      <select
                        id="font-size"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Data Management</h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Chat History
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear Chat History</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to clear your chat history? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>Cancel</Button>
                          <Button variant="destructive" onClick={clearChatHistory}>Clear History</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Conversation
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Conversation</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>Cancel</Button>
                          <Button variant="destructive" onClick={deleteConversation}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" className="w-full" size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Export Chat Data
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid md:grid-cols-3 h-[500px]">
        <div className={cn(
          "border-r",
          selectedConversationId ? "hidden md:block" : "block"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-2 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chats">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chats
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Contacts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <TabsContent value="chats" className="m-0 p-0">
              <ChatList
                conversations={filteredConversations}
                currentUserId={currentUserId}
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
              />
            </TabsContent>
            
            <TabsContent value="contacts" className="m-0">
              <ScrollArea className="h-[372px]">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Your Contacts</h3>
                    <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                      <UserPlus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {mockUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        // Find or create conversation with this user
                        let conversation = conversations.find(c => 
                          c.participants.some(p => p.id === user.id)
                        );
                        
                        if (!conversation) {
                          conversation = {
                            id: `new-conv-${Date.now()}`,
                            participants: [
                              {
                                id: currentUserId,
                                name: userProfile.name,
                                avatar: userProfile.avatar || "/placeholder.svg"
                              },
                              user
                            ],
                            unreadCount: 0,
                            updatedAt: new Date()
                          };
                          
                          setConversations(prev => [...prev, conversation!]);
                        }
                        
                        setSelectedConversationId(conversation.id);
                        setActiveTab("chats");
                      }}
                    >
                      <Avatar className="h-10 w-10 mr-3 relative">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        
                        {user.status === 'online' && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                        )}
                        {user.status === 'away' && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-500 border-2 border-background"></span>
                        )}
                      </Avatar>
                      
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {user.status === 'online' 
                            ? 'Online' 
                            : user.status === 'away'
                              ? 'Away'
                              : user.lastSeen 
                                ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                                : 'Offline'
                          }
                        </p>
                      </div>
                      <div className="ml-auto flex flex-col items-end">
                        {encryptedChat && (
                          <Lock className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className={cn(
          "md:col-span-2 flex flex-col",
          selectedConversationId ? "block" : "hidden md:block"
        )}>
          {selectedConversationId && otherParticipant ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden mr-2"
                    onClick={() => setSelectedConversationId(undefined)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8 mr-2 relative">
                    <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                    <AvatarFallback>{otherParticipant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    
                    {otherParticipant.status === 'online' && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{otherParticipant.name}</h3>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">
                        {otherParticipant.status === 'online' 
                          ? 'Online' 
                          : otherParticipant.status === 'away'
                            ? 'Away'
                            : otherParticipant.lastSeen 
                              ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleDateString()} at ${new Date(otherParticipant.lastSeen).toLocaleTimeString()}`
                              : 'Offline'
                        }
                      </p>
                      {encryptedChat && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px] flex items-center gap-[2px]">
                          <Lock className="h-2 w-2" /> Encrypted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleNotifications}
                    title={notificationsEnabled ? "Mute notifications" : "Enable notifications"}
                  >
                    {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56">
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start" size="sm">
                          <Smartphone className="mr-2 h-4 w-4" />
                          View Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-destructive" size="sm" 
                          onClick={clearChatHistory}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Chat
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-destructive" size="sm"
                          onClick={deleteConversation}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Conversation
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ScrollArea 
                  className="h-full p-4" 
                  ref={messagesContainerRef}
                >
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex justify-center items-center h-32 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isCurrentUser={message.senderId === currentUserId}
                          senderAvatar={otherParticipant.avatar}
                          senderName={otherParticipant.name}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>
              
              <CardFooter className="p-0 border-t">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  isLoading={isSending} 
                />
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Welcome to FitFusion Chat</h3>
              <p className="text-muted-foreground text-center max-w-xs">
                Connect with fitness buddies, trainers, and friends to share your fitness journey
              </p>
              {encryptedChat && (
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  <Lock className="h-3 w-3" />
                  <span>End-to-end encrypted</span>
                </div>
              )}
              <Button 
                className="mt-4"
                onClick={() => setActiveTab("contacts")}
              >
                Start a Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
