
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
import { MessageCircle, MessageSquare, Search, Settings, Users, Shield, Lock } from "lucide-react";
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
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [encryptedChat, setEncryptedChat] = useState(true);
  
  const currentUserId = "current";
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
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

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-hidden">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            <CardTitle>FitFusion Chat</CardTitle>
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
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <p className="text-xs">Your fitness data and messages are protected</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
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
                      {encryptedChat && (
                        <Lock className="h-3 w-3 ml-auto text-green-500" />
                      )}
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
                    <MessageCircle className="h-4 w-4" />
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
                              ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleString()}`
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
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === currentUserId}
                      senderAvatar={otherParticipant.avatar}
                      senderName={otherParticipant.name}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <CardFooter className="p-0">
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
