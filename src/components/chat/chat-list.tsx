
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatConversation, ChatUser } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lock } from "lucide-react";

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
      isMobile ? "h-[calc(100vh-240px)]" : "h-[calc(100vh-220px)]" 
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
                  <Avatar className="h-9 w-9 relative">
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>
                      {otherUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {otherUser.status === 'online' && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      {otherUser.name}
                      {isSecure && (
                        <Lock className={cn(
                          "h-3 w-3 ml-1", 
                          isSelected ? "text-primary-foreground" : "text-green-500"
                        )} />
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className={cn(
                        "text-xs truncate",
                        isMobile ? "max-w-[180px]" : "max-w-[150px]",
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
                      "text-[10px]",
                      isSelected 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })}
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge variant={isSelected ? "outline" : "default"} className={cn(
                      "text-xs h-4 min-w-[18px] flex items-center justify-center",
                      isSelected && "border-primary-foreground text-primary-foreground"
                    )}>
                      {conversation.unreadCount}
                    </Badge>
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
