import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  Camera,
  Smile,
  Paperclip,
  MapPin,
  Gift,
  Sticker,
  Music,
  FileText,
  Image as ImageIcon,
  Video,
  Phone,
  VideoOff,
  MicOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "💪", "💯", "🔥", "⭐", "🎯", "🏆", "🥇", "🎉", "🎊", "👏",
    "❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💔"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-full right-0 mb-2 p-4 bg-card border rounded-xl shadow-lg min-w-[280px] z-50"
    >
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
        {emojis.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-xl hover:bg-muted rounded-lg p-1 transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="w-full"
        >
          Close
        </Button>
      </div>
    </motion.div>
  );
};

interface AttachmentMenuProps {
  onAttachmentSelect: (type: string) => void;
  onClose: () => void;
}

const AttachmentMenu: React.FC<AttachmentMenuProps> = ({ onAttachmentSelect, onClose }) => {
  const attachmentTypes = [
    { type: "camera", icon: Camera, label: "Camera", color: "bg-blue-500" },
    { type: "gallery", icon: ImageIcon, label: "Gallery", color: "bg-green-500" },
    { type: "video", icon: Video, label: "Video", color: "bg-red-500" },
    { type: "audio", icon: Mic, label: "Voice", color: "bg-purple-500" },
    { type: "document", icon: FileText, label: "Document", color: "bg-orange-500" },
    { type: "location", icon: MapPin, label: "Location", color: "bg-pink-500" },
    { type: "music", icon: Music, label: "Music", color: "bg-indigo-500" },
    { type: "gift", icon: Gift, label: "Gift", color: "bg-yellow-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-full left-0 mb-2 p-4 bg-card border rounded-xl shadow-lg min-w-[320px] z-50"
    >
      <h3 className="font-semibold mb-3">Share Content</h3>
      <div className="grid grid-cols-4 gap-3">
        {attachmentTypes.map((item) => (
          <motion.button
            key={item.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onAttachmentSelect(item.type);
              onClose();
            }}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className={`p-2 rounded-full ${item.color} text-white mb-1`}>
              <item.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

interface VoiceCallProps {
  isActive: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  contact: { name: string; avatar?: string };
}

const VoiceCallOverlay: React.FC<VoiceCallProps> = ({
  isActive,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  isAudioMuted,
  isVideoMuted,
  contact,
}) => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Avatar className="w-32 h-32 mx-auto ring-4 ring-primary/20">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className="text-2xl">{contact.name[0]}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold">{contact.name}</h2>
          <p className="text-muted-foreground">Voice Call • {formatDuration(callDuration)}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isAudioMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={onToggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant={isVideoMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={onToggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-16 h-16"
          >
            <Phone className="h-6 w-6 rotate-135" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export {
  EmojiPicker,
  AttachmentMenu,
  VoiceCallOverlay,
};