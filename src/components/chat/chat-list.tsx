
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatConversation, ChatUser } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2 py-2">
        {conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation.id;
          
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
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{otherUser.name}</div>
                  {conversation.lastMessage && (
                    <p className={cn(
                      "text-xs truncate max-w-[150px]",
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
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
