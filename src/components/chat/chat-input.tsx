
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAttachment } from "@/types/chat";
import { Paperclip, Send, X, FileText, FileVideo, FileAudio, Image as ImageIcon, Camera, Mic, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) {
      toast({
        title: "Cannot send empty message",
        description: "Please type a message or attach a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      onSendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
      toast({
        title: "Message sent",
        description: attachments.length > 0 ? `Message sent with ${attachments.length} attachment(s)` : "Message sent successfully"
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime',
      // Audio
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg',
      // Documents
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 10MB limit`,
        variant: "destructive"
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported format`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(validateFile);
      
      if (validFiles.length > 0) {
        setAttachments(prev => [...prev, ...validFiles]);
        toast({
          title: "Files added",
          description: `${validFiles.length} file(s) ready to send`
        });
      }
      
      // Reset input
      e.target.value = '';
    }
  };

  const handleAttachmentClick = (type: string) => {
    try {
      switch (type) {
        case "camera":
          if (cameraInputRef.current) {
            cameraInputRef.current.click();
          }
          break;
        case "image":
          if (fileInputRef.current) {
            fileInputRef.current.setAttribute("accept", "image/*");
            fileInputRef.current.click();
          }
          break;
        case "video":
          if (videoInputRef.current) {
            videoInputRef.current.click();
          }
          break;
        case "audio":
          if (audioInputRef.current) {
            audioInputRef.current.click();
          }
          break;
        case "document":
          if (documentInputRef.current) {
            documentInputRef.current.click();
          }
          break;
        default:
          if (fileInputRef.current) {
            fileInputRef.current.setAttribute("accept", "*/*");
            fileInputRef.current.click();
          }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file picker",
        variant: "destructive"
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "Attachment removed successfully"
    });
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
    if (file.type.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Not supported",
          description: "Voice recording not supported on this device",
          variant: "destructive"
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Recording complete",
          description: "Voice message recorded successfully"
        });
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border-t p-3 bg-background">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept="*/*"
      />
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="video/*"
      />
      <input
        type="file"
        ref={audioInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="audio/*"
      />
      <input
        type="file"
        ref={documentInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-muted rounded-md p-2 pr-8 relative animate-fade-in"
            >
              {getFileIcon(file)}
              <div className="ml-2">
                <p className="text-xs font-medium truncate max-w-[100px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost" 
                size="icon"
                className="h-6 w-6 p-0 absolute right-1 top-1"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Attachment menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0 hover:bg-primary/10"
              disabled={isLoading}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-2">
            <div className="grid gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("camera")}
              >
                <Camera className="mr-2 h-4 w-4" />
                <span>Camera</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("image")}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Photo</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("video")}
              >
                <FileVideo className="mr-2 h-4 w-4" />
                <span>Video</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("audio")}
              >
                <FileAudio className="mr-2 h-4 w-4" />
                <span>Audio</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("document")}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full flex-shrink-0",
            isRecording ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-primary/10"
          )}
          onClick={startVoiceRecording}
          disabled={isLoading || isRecording}
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        {/* Message input */}
        <div className="relative flex-1">
          <Input
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-12 focus:ring-2 focus:ring-primary"
            disabled={isLoading || isRecording}
            maxLength={1000}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            {message.length}/1000
          </div>
        </div>

        {/* Send button */}
        <Button
          variant="default"
          size="icon"
          className="rounded-full flex-shrink-0"
          onClick={handleSendMessage}
          disabled={isLoading || isRecording || (!message.trim() && attachments.length === 0)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-red-600 animate-fade-in">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Recording voice message...</span>
        </div>
      )}
    </div>
  );
}
