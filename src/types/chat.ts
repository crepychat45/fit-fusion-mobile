
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  preferences?: {
    notifications?: boolean;
    theme?: string;
    privacy?: {
      showStatus?: boolean;
      showLastSeen?: boolean;
    }
  };
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
  storagePath?: string;
  mimeType?: string;
  createdAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  metadata?: {
    deliveredAt?: Date;
    readAt?: Date;
    edited?: boolean;
    editedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date;
    ipAddress?: string;
    deviceInfo?: string;
  };
  conversationId?: string;
  replyToMessageId?: string;
}

export interface ChatReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
  createdAt?: Date;
  name?: string;
  isGroupChat?: boolean;
  groupAdmin?: string;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  customColor?: string;
  metadata?: {
    totalMessages?: number;
    totalAttachments?: number;
    lastReadTimestamp?: Record<string, Date>;
  };
}
