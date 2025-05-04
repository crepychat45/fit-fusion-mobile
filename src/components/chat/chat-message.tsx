
import React from "react";
import { ChatMessage as ChatMessageType, ChatAttachment } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Check, CheckCheck, Download, File, FileAudio, FileText, FileVideo, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName: string;
}

export function ChatMessage({
  message,
  isCurrentUser,
  senderAvatar,
  senderName
}: ChatMessageProps) {
  const handleDownload = (attachment: ChatAttachment) => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = "_blank";
    link.click();
  };
  
  const renderAttachmentPreview = (attachment: ChatAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="relative group overflow-hidden rounded-md">
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-h-48 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative group overflow-hidden rounded-md">
            <video 
              src={attachment.url}
              className="max-h-48 max-w-full object-cover rounded-md"
              controls
            />
          </div>
        );
      case 'audio':
        return (
          <div className="bg-accent/30 rounded-md p-2 flex items-center space-x-2">
            <FileAudio className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-medium truncate">{attachment.name}</p>
              <audio controls className="max-w-full h-8 mt-1">
                <source src={attachment.url} />
              </audio>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="bg-accent/30 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[160px]">{attachment.name}</p>
                {attachment.size && (
                  <p className="text-xs text-muted-foreground">
                    {Math.round(attachment.size / 1024)} KB
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDownload(attachment)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "flex mb-4 max-w-[85%]",
      isCurrentUser ? "ml-auto" : "mr-auto"
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>
            {senderName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg p-3 max-w-prose break-words",
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted rounded-tl-none"
        )}>
          {message.content && (
            <p className="text-sm mb-1">{message.content}</p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(
              "grid gap-2 mt-2",
              message.attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"
            )}>
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {renderAttachmentPreview(attachment)}
                </div>
              ))}
            </div>
          )}
          
          <div className={cn(
            "flex items-center mt-1",
            isCurrentUser ? "justify-end" : "justify-start"
          )}>
            <span className="text-xs opacity-70">
              {format(message.timestamp, "h:mm a")}
            </span>
            {isCurrentUser && (
              <span className="ml-1">
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
