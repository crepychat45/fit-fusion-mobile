
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAttachment } from "@/types/chat";
import { Paperclip, Send, Smile, X, FileText, FileVideo, FileAudio, Image as ImageIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Limit file size (5MB per file)
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const handleAttachmentClick = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("accept", getAcceptString(type));
      fileInputRef.current.click();
    }
  };

  const getAcceptString = (type: string) => {
    switch (type) {
      case "image": return "image/*";
      case "video": return "video/*";
      case "audio": return "audio/*";
      case "document": return ".pdf,.doc,.docx,.xls,.xlsx,.txt";
      default: return "*/*";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  return (
    <div className="border-t p-3">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
      />
      
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-muted rounded-md p-2 pr-8 relative"
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2">
            <div className="grid gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleAttachmentClick("image")}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Image</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleAttachmentClick("video")}
              >
                <FileVideo className="mr-2 h-4 w-4" />
                <span>Video</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleAttachmentClick("audio")}
              >
                <FileAudio className="mr-2 h-4 w-4" />
                <span>Audio</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleAttachmentClick("document")}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="relative flex-1">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 bottom-0"
            onClick={handleSendMessage}
            disabled={isLoading || (!message.trim() && attachments.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
