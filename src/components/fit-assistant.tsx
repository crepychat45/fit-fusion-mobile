import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Send,
  X,
  Bot,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Coffee,
  Sparkles,
  Brain,
  Calendar,
  Heart,
  BarChart,
  RefreshCw,
  Image,
  Paperclip,
  Download,
  Trash2,
  FileText,
  X as XIcon,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
  media?: MediaItem[];
}

interface MediaItem {
  id: string;
  type: "image" | "document";
  url: string;
  name: string;
  size?: number;
}

const predefinedResponses: Record<string, string[]> = {
  workout: [
    "I recommend starting with a full body workout 3 times per week if you're new to fitness.",
    "For muscle gain, focus on compound exercises like squats, deadlifts, and bench press with progressive overload.",
    "Try HIIT (High-Intensity Interval Training) for effective fat burning in shorter workout sessions.",
    "Remember to include at least one rest day between strength training the same muscle groups.",
  ],
  nutrition: [
    "Aim to consume 0.8-1g of protein per pound of body weight for muscle recovery and growth.",
    "Stay hydrated! Drink water before, during, and after your workouts.",
    "Consider timing your carbohydrate intake around your workouts for optimal energy and recovery.",
    "Eating small, frequent meals throughout the day can help maintain energy levels and support metabolism.",
  ],
  motivation: [
    "Focus on consistency rather than perfection. Small steps each day lead to big results over time.",
    "Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound.",
    "Find a workout buddy or join a community to stay accountable and motivated.",
    "Track your progress with measurements beyond the scale - like strength gains, endurance improvements, or how clothes fit.",
  ],
  help: [
    "You can view your workout history in the Progress tab.",
    "To connect a fitness device, go to Settings > Device > Connect New Device.",
    "You can customize your notification preferences in Settings > Notifications.",
    "Check out the Workouts tab to explore different workout routines.",
  ],
  progress: [
    "Tracking your personal bests (PBs) is a great way to see your strength improvements over time.",
    "Taking progress photos once a month can help you visualize changes that might not be reflected on the scale.",
    "Consider tracking body measurements like waist, hips, and chest for a more complete picture of your progress.",
    "Remember that progress isn't linear - plateaus are normal and part of the journey.",
  ],
  recovery: [
    "Adequate sleep is crucial for muscle recovery and overall fitness progress.",
    "Consider active recovery like walking, swimming, or yoga on your rest days.",
    "Foam rolling and stretching can help reduce muscle soreness and improve flexibility.",
    "Proper nutrition and hydration are essential components of recovery.",
  ],
};

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm your FitFusion Assistant. How can I help you with your fitness journey today?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

const generateResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Check for keywords in the message
  if (
    lowerMessage.includes("workout") ||
    lowerMessage.includes("exercise") ||
    lowerMessage.includes("training")
  ) {
    const responses = predefinedResponses.workout;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    lowerMessage.includes("eat") ||
    lowerMessage.includes("food") ||
    lowerMessage.includes("nutrition") ||
    lowerMessage.includes("diet")
  ) {
    const responses = predefinedResponses.nutrition;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    lowerMessage.includes("motivat") ||
    lowerMessage.includes("stuck") ||
    lowerMessage.includes("giving up") ||
    lowerMessage.includes("don't feel like")
  ) {
    const responses = predefinedResponses.motivation;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("how to") ||
    lowerMessage.includes("where") ||
    lowerMessage.includes("find")
  ) {
    const responses = predefinedResponses.help;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    lowerMessage.includes("progress") ||
    lowerMessage.includes("track") ||
    lowerMessage.includes("improve") ||
    lowerMessage.includes("goal")
  ) {
    const responses = predefinedResponses.progress;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    lowerMessage.includes("recover") ||
    lowerMessage.includes("rest") ||
    lowerMessage.includes("sleep") ||
    lowerMessage.includes("sore")
  ) {
    const responses = predefinedResponses.recovery;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (lowerMessage.includes("thank")) {
    return "You're welcome! I'm here to help on your fitness journey. Let me know if you have any other questions.";
  } else if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    return "Hello there! How can I assist with your fitness goals today?";
  } else if (
    lowerMessage.includes("image") ||
    lowerMessage.includes("photo") ||
    lowerMessage.includes("picture") ||
    lowerMessage.includes("upload")
  ) {
    return "You can share photos or documents with me using the attachment button. This helps me provide more personalized fitness guidance.";
  } else if (
    lowerMessage.includes("file") ||
    lowerMessage.includes("document") ||
    lowerMessage.includes("download")
  ) {
    return "You can share workout plans or nutrition documents with me. I can help you analyze them or you can save my responses for future reference.";
  } else {
    return "I'm not sure I understand. Could you rephrase your question about workouts, nutrition, or fitness goals?";
  }
};

export function FitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  // Using sonner toast directly

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        // Check file size (limit to 5MB per file)
        const oversizedFiles = files.filter(
          (file) => file.size > 5 * 1024 * 1024,
        );
        if (oversizedFiles.length > 0) {
          toast.error("File too large - Files must be less than 5MB");
          return;
        }

        setSelectedFiles((prev) => [...prev, ...files]);
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // Create media items from selected files
    const mediaItems: MediaItem[] = [];

    // Process files if any
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        // In a real app, you would upload these files to a server
        // Here we're using object URLs for demo purposes
        const fileType = file.type.startsWith("image/") ? "image" : "document";
        const fileUrl = URL.createObjectURL(file);

        mediaItems.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: fileType,
          url: fileUrl,
          name: file.name,
          size: file.size,
        });
      });
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      media: mediaItems.length > 0 ? mediaItems : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSelectedFiles([]);

    // Add typing indicator
    setIsTyping(true);
    const typingIndicator: Message = {
      id: "typing-indicator",
      content: "",
      sender: "assistant",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingIndicator]);

    // Simulate typing delay (variable depending on response length)
    setTimeout(
      () => {
        // Remove typing indicator and add response
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator"),
        );
        setIsTyping(false);

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateResponse(userMessage.content),
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);
      },
      Math.random() * 1000 + 800,
    ); // Random delay between 800-1800ms for more natural feel
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleOpenFileInput = () => {
    fileInputRef.current?.click();
    setIsAttachmentMenuOpen(false);
  };

  const openMediaPreview = (media: MediaItem) => {
    setPreviewMedia(media);
    if (media.type === "image") {
      setShowImageFullscreen(true);
    }
  };

  const downloadMedia = (media: MediaItem) => {
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Download started: ${media.name}`);
  };

  const categories = [
    {
      name: "Workout",
      icon: <Dumbbell className="h-4 w-4" />,
      suggestion: "What's a good beginner workout?",
    },
    {
      name: "Nutrition",
      icon: <Coffee className="h-4 w-4" />,
      suggestion: "What should I eat before a workout?",
    },
    {
      name: "Progress",
      icon: <BarChart className="h-4 w-4" />,
      suggestion: "How do I track my progress?",
    },
    {
      name: "Recovery",
      icon: <RefreshCw className="h-4 w-4" />,
      suggestion: "How important is recovery?",
    },
    {
      name: "Motivation",
      icon: <Brain className="h-4 w-4" />,
      suggestion: "How can I stay motivated?",
    },
    {
      name: "Schedule",
      icon: <Calendar className="h-4 w-4" />,
      suggestion: "How often should I workout?",
    },
  ];

  const suggestions = [
    "How often should I workout?",
    "What should I eat after training?",
    "How can I stay motivated?",
    "Where can I find my workout history?",
    "How do I track my progress?",
    "What's the best recovery method?",
  ];

  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        size="icon"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/bot-avatar.svg" alt="AI" />
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <DialogTitle>FitFusion Assistant</DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.isTyping ? (
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex items-center mb-1">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src="/bot-avatar.svg" alt="AI" />
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="h-3 w-3 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">Assistant</span>
                        </div>
                        <div className="flex space-x-1 items-center h-6">
                          <div
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.sender === "assistant" && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src="/bot-avatar.svg" alt="AI" />
                              <AvatarFallback className="bg-primary/10">
                                <Bot className="h-3 w-3 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">
                              Assistant
                            </span>
                          </div>
                        )}
                        <p>{message.content}</p>

                        {/* Media attachments */}
                        {message.media && message.media.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.media.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-md overflow-hidden border ${message.sender === "user" ? "border-primary-foreground/20" : "border-border"}`}
                                onClick={() => openMediaPreview(item)}
                              >
                                {item.type === "image" ? (
                                  <div className="relative group cursor-pointer">
                                    <img
                                      src={item.url}
                                      alt={item.name}
                                      className="max-h-40 w-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Image className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/60 transition-colors">
                                    <FileText
                                      className={`h-8 w-8 ${message.sender === "user" ? "text-primary-foreground" : "text-primary"}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">
                                        {item.name}
                                      </p>
                                      {item.size && (
                                        <p className="text-xs opacity-70">
                                          {formatFileSize(item.size)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-right mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="border rounded-md p-2 pr-8 bg-background">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith("image/") ? (
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <FileText className="h-6 w-6 text-primary" />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium truncate max-w-[100px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-5 w-5 absolute top-1 right-1 p-0"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {messages.length <= 2 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">
                    Suggested questions
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs p-0"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    {showSuggestions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-wrap gap-2 overflow-hidden"
                    >
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => useSuggestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="grid grid-cols-6 gap-1 mb-2">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center justify-center p-2 h-auto text-xs"
                  onClick={() => useSuggestion(category.suggestion)}
                >
                  <div className="mb-1">{category.icon}</div>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Popover
                open={isAttachmentMenuOpen}
                onOpenChange={setIsAttachmentMenuOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={handleOpenFileInput}
                    >
                      <Image className="mr-2 h-4 w-4" /> Upload image
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={handleOpenFileInput}
                    >
                      <FileText className="mr-2 h-4 w-4" /> Upload document
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelection}
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
              />

              <Input
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
                disabled={isTyping}
              />

              <Button
                size="icon"
                className="rounded-full shrink-0"
                onClick={handleSend}
                disabled={
                  (!inputMessage.trim() && selectedFiles.length === 0) ||
                  isTyping
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media preview dialog */}
      <Dialog open={showImageFullscreen} onOpenChange={setShowImageFullscreen}>
        <DialogContent className="max-w-3xl h-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="truncate">{previewMedia?.name}</span>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadMedia(previewMedia!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageFullscreen(false)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto h-full">
            {previewMedia?.type === "image" && (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
