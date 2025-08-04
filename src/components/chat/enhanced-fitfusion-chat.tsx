import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Settings, 
  Maximize2,
  Minimize2,
  X,
  Video,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResizableChatWindow } from './resizable-chat-window';
import { UserChatList } from './user-chat-list';
import { EnhancedChatInterface } from './enhanced-chat-interface';
import { MobileChatInterface } from './mobile-chat-interface';
import { EnhancedChatSettings } from './enhanced-chat-settings';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export function EnhancedFitfusionChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineUsers] = useState(147);
  const [activeChats] = useState(23);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setActiveTab('chat');
    toast({
      title: "Chat started",
      description: `Now chatting with ${user.name}`
    });
  };

  const handleGroupChatCreate = () => {
    toast({
      title: "Group chat",
      description: "Group chat feature coming soon!"
    });
  };

  const handleVideoCall = () => {
    if (selectedUser) {
      toast({
        title: "Video call",
        description: `Starting video call with ${selectedUser.name}...`
      });
    }
  };

  const handleVoiceCall = () => {
    if (selectedUser) {
      toast({
        title: "Voice call",
        description: `Starting voice call with ${selectedUser.name}...`
      });
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Badge 
          className="absolute -top-2 -right-2 bg-red-500 text-white animate-pulse"
        >
          {activeChats}
        </Badge>
      </motion.div>
    );
  }

  if (isMobile) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="fixed inset-0 z-50 bg-background"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">FitFusion Chat</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{onlineUsers} online</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <MobileChatInterface />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <ResizableChatWindow
        onClose={() => setIsOpen(false)}
        defaultWidth={800}
        defaultHeight={600}
        minWidth={400}
        minHeight={500}
        maxWidth={1200}
        maxHeight={900}
      >
        <div className="h-full flex flex-col">
          {!isMinimized && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="font-semibold">FitFusion Chat</span>
                  </div>
                  {selectedUser && (
                    <>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{selectedUser.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleVoiceCall}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleVideoCall}
                          >
                            <Video className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {onlineUsers} online
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {showSettings ? (
                  <div className="p-4 h-full overflow-y-auto">
                    <EnhancedChatSettings onClose={() => setShowSettings(false)} />
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
                      <TabsTrigger value="users" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Users
                      </TabsTrigger>
                      <TabsTrigger value="chats" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chats
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Assistant
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="users" className="h-full m-0">
                        <UserChatList 
                          onUserSelect={handleUserSelect}
                          onGroupChatCreate={handleGroupChatCreate}
                        />
                      </TabsContent>
                      
                      <TabsContent value="chats" className="h-full m-0">
                        {selectedUser ? (
                          <div className="h-full flex flex-col">
                            <div className="p-3 border-b border-border bg-muted/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedUser(null)}
                                  >
                                    ← Back to chats
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <EnhancedChatInterface />
                            </div>
                          </div>
                        ) : (
                          <div className="h-full">
                            <EnhancedChatInterface />
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="ai" className="h-full m-0">
                        <div className="h-full p-4 flex items-center justify-center">
                          <div className="text-center">
                            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">AI Fitness Assistant</h3>
                            <p className="text-muted-foreground mb-4">Get personalized fitness advice and workout recommendations</p>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              Start AI Chat
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                )}
              </div>
            </>
          )}
        </div>
      </ResizableChatWindow>
    </AnimatePresence>
  );
}