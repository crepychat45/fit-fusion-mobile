
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatConversation, ChatUser } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lock, Shield, CheckCircle } from "lucide-react";

interface ChatListProps {
  conversations: ChatConversation[];
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function ChatList({
  conversations,
  currentUserId,
  onSelectConversation,
  selectedConversationId
}: ChatListProps) {
  const getOtherParticipant = (conversation: ChatConversation): ChatUser => {
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };
  
  const isMobile = useIsMobile();

  return (
    <ScrollArea className={cn(
      "pr-4",
      isMobile ? "h-[calc(100vh-200px)]" : "h-[calc(100vh-180px)]" 
    )}>
      <div className="space-y-2 py-2">
        {conversations.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground p-4">
            No conversations yet. Start chatting!
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            const isSelected = selectedConversationId === conversation.id;
            const isSecure = conversation.securitySettings?.encryptionEnabled;
            const securityLevel = conversation.securitySettings?.encryptionEnabled ? 
              conversation.securitySettings?.disappearingMessages ? 'ephemeral' : 'encrypted' 
              : 'standard';
            
            return (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 relative">
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>
                      {otherUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {otherUser.status === 'online' && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-1 text-base">
                      {otherUser.name}
                      {isSecure && (
                        securityLevel === 'ephemeral' ? (
                          <Shield className={cn(
                            "h-3.5 w-3.5 ml-1", 
                            isSelected ? "text-primary-foreground" : "text-purple-500"
                          )} />
                        ) : (
                          <Lock className={cn(
                            "h-3.5 w-3.5 ml-1", 
                            isSelected ? "text-primary-foreground" : "text-green-500"
                          )} />
                        )
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className={cn(
                        "text-sm truncate",
                        isMobile ? "max-w-[220px]" : "max-w-[200px]",
                        isSelected 
                          ? "text-primary-foreground/80" 
                          : "text-muted-foreground"
                      )}>
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {conversation.lastMessage && (
                    <span className={cn(
                      "text-xs",
                      isSelected 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })}
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge variant={isSelected ? "outline" : "default"} className={cn(
                      "text-xs h-5 min-w-[20px] flex items-center justify-center",
                      isSelected && "border-primary-foreground text-primary-foreground"
                    )}>
                      {conversation.unreadCount}
                    </Badge>
                  )}
                  {otherUser.isVerified && (
                    <CheckCircle className={cn(
                      "h-3.5 w-3.5", 
                      isSelected ? "text-primary-foreground/80" : "text-blue-500"
                    )} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
