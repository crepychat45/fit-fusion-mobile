
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatAttachment } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { Download, Eye, Play, Pause, Volume2, FileText, Image as ImageIcon, Video, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName: string;
}

export function ChatMessage({ message, isCurrentUser, senderAvatar, senderName }: ChatMessageProps) {
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ChatAttachment | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (attachment: ChatAttachment) => {
    try {
      if (attachment.url.startsWith('blob:') || attachment.url.startsWith('data:')) {
        // Handle blob URLs or data URLs
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular URLs
        const response = await fetch(attachment.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download started",
        description: `${attachment.name} is being downloaded`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download file",
        variant: "destructive"
      });
    }
  };

  const handleMediaPreview = (attachment: ChatAttachment) => {
    setSelectedMedia(attachment);
    setIsMediaPreviewOpen(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, you would control actual audio/video playback here
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderAttachment = (attachment: ChatAttachment) => {
    const isImage = attachment.type === 'image';
    const isVideo = attachment.type === 'video';
    const isAudio = attachment.type === 'audio';

    return (
      <div key={attachment.id} className="mt-2">
        {isImage && (
          <div className="relative max-w-sm">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="rounded-lg max-h-48 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleMediaPreview(attachment)}
              onError={(e) => {
                console.error('Image failed to load:', attachment.url);
                e.currentTarget.style.display = 'none';
              }}
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-80 hover:opacity-100"
              onClick={() => handleMediaPreview(attachment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isVideo && (
          <div className="relative max-w-sm bg-black rounded-lg overflow-hidden">
            <video
              src={attachment.url}
              className="max-h-48 w-auto cursor-pointer"
              onClick={() => handleMediaPreview(attachment)}
              controls={false}
              onError={(e) => {
                console.error('Video failed to load:', attachment.url);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70"
                onClick={() => handleMediaPreview(attachment)}
              >
                <Play className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        )}

        {isAudio && (
          <div className="flex items-center gap-3 bg-muted p-3 rounded-lg max-w-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <p className="text-sm font-medium">{attachment.name}</p>
              <div className="h-1 bg-muted-foreground/20 rounded-full mt-1">
                <div className="h-full w-1/3 bg-primary rounded-full"></div>
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
        )}

        {!isImage && !isVideo && !isAudio && (
          <div className="flex items-center gap-3 bg-muted p-3 rounded-lg max-w-sm hover:bg-muted/80 transition-colors">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getAttachmentIcon(attachment.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(attachment)}
              className="hover:bg-primary/10"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={senderAvatar} alt={senderName} />
            <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex flex-col gap-1 max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}>
          {!isCurrentUser && (
            <span className="text-xs text-muted-foreground font-medium px-1">
              {senderName}
            </span>
          )}
          
          <div className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isCurrentUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted"
          )}>
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
            
            {message.attachments && message.attachments.map(renderAttachment)}
          </div>
          
          <span className="text-xs text-muted-foreground px-1">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Media preview dialog */}
      <Dialog open={isMediaPreviewOpen} onOpenChange={setIsMediaPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4">
            {selectedMedia?.type === 'image' && (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Preview image failed to load:', selectedMedia.url);
                }}
              />
            )}
            
            {selectedMedia?.type === 'video' && (
              <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
                onError={(e) => {
                  console.error('Preview video failed to load:', selectedMedia.url);
                }}
              />
            )}
          </div>
          
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedMedia && formatFileSize(selectedMedia.size)}
            </div>
            <Button
              onClick={() => selectedMedia && handleDownload(selectedMedia)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
