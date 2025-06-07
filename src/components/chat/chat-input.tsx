
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatAttachment } from "@/types/chat";
import { Paperclip, Send, X, FileText, FileVideo, FileAudio, Image as ImageIcon, Camera, Mic, Plus, Smile, StopCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { EmojiPicker } from "./emoji-picker";

interface ChatInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      // Videos
      'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime', 'video/mkv', 'video/wmv', 'video/flv',
      // Audio
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg', 'audio/aac', 'audio/flac', 'audio/wma',
      // Documents
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf', 'text/csv', 'application/json', 'application/xml'
    ];

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 50MB limit`,
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

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const file = new File([blob], `voice-recording-${Date.now()}.${recorder.mimeType.includes('webm') ? 'webm' : 'mp4'}`, {
          type: recorder.mimeType
        });
        
        if (validateFile(file)) {
          setAttachments(prev => [...prev, file]);
          toast({
            title: "Voice recording complete",
            description: "Voice message added to attachments"
          });
        }
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };
      
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      recorder.start();
      
      toast({
        title: "Recording started",
        description: "Tap the microphone again to stop recording"
      });
      
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        accept="video/mp4,video/webm,video/mov,video/avi,video/quicktime,video/mkv,video/wmv,video/flv"
      />
      <input
        type="file"
        ref={audioInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/mpeg,audio/aac,audio/flac,audio/wma"
      />
      <input
        type="file"
        ref={documentInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.json,.xml"
      />
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-muted rounded-md p-2 pr-8 relative animate-fade-in min-w-0"
            >
              {getFileIcon(file)}
              <div className="ml-2 min-w-0 flex-1">
                <p className="text-xs font-medium truncate max-w-[120px]" title={file.name}>{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost" 
                size="icon"
                className="h-6 w-6 p-0 absolute right-1 top-1 hover:bg-destructive/10"
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
          <PopoverContent className="w-[240px] p-2">
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
                <span>Photo & Images</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("video")}
              >
                <FileVideo className="mr-2 h-4 w-4" />
                <span>Videos (MP4, WebM, MOV)</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("audio")}
              >
                <FileAudio className="mr-2 h-4 w-4" />
                <span>Music & Audio</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                onClick={() => handleAttachmentClick("document")}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Documents (PDF, Office)</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0 hover:bg-primary/10"
              disabled={isLoading}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="top">
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
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
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isLoading}
        >
          {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        {/* Message input */}
        <div className="relative flex-1">
          <Input
            placeholder={isRecording ? `Recording... ${formatRecordingTime(recordingTime)}` : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-16 focus:ring-2 focus:ring-primary"
            disabled={isLoading || isRecording}
            maxLength={2000}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            {message.length}/2000
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
          <span className="text-sm font-medium">Recording... {formatRecordingTime(recordingTime)}</span>
          <span className="text-xs text-muted-foreground ml-2">Tap stop when finished</span>
        </div>
      )}
    </div>
  );
}
