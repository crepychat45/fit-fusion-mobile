export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  lastSeen?: Date;
  isVerified?: boolean;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  preferences?: {
    notifications?: boolean;
    theme?: string;
    privacy?: {
      showStatus?: boolean;
      showLastSeen?: boolean;
      readReceipts?: boolean;
      allowMessageRequests?: boolean;
    };
  };
  blockedUsers?: string[];
  securityLevel?: "standard" | "enhanced" | "maximum";
  twoFactorEnabled?: boolean;
  lastSecurityCheck?: Date;
  verified?: boolean; // Legacy field for backward compatibility
}

export interface ChatAttachment {
  id: string;
  type: "image" | "video" | "document" | "audio";
  url: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
  storagePath?: string;
  mimeType?: string;
  createdAt?: Date;
  encryptionKey?: string;
  securityLevel?: "standard" | "encrypted" | "ephemeral";
  virusScanStatus?: "pending" | "clean" | "infected";
  hashSignature?: string;
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
    isEncrypted?: boolean;
    expiresAt?: Date;
    forwardedFrom?: string;
  };
  conversationId?: string;
  replyToMessageId?: string;
  isForwarded?: boolean;
  isPinned?: boolean;
  translation?: {
    content: string;
    language: string;
  };
  securityLevel?: "standard" | "encrypted" | "private" | "ephemeral";
  serverReceipt?: {
    deliveredToServer: boolean;
    timestamp?: Date;
    serverSignature?: string;
  };
  backupStatus?: "pending" | "completed" | "failed" | "excluded";
  validationStatus?: "valid" | "invalid" | "pending";
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
    encryptionEnabled?: boolean;
    autoDeletePeriod?: number; // in days
    isSecure?: boolean;
    category?: "personal" | "work" | "fitness" | "social" | "family";
  };
  securitySettings?: {
    encryptionEnabled: boolean;
    disappearingMessages?: boolean;
    disappearingMessageTimeout?: number; // in seconds
    screenshotDetection?: boolean;
    mediaProtection?: boolean;
    endToEndEncryption?: boolean;
    encryptionProtocol?: string;
  };
  databaseId?: string; // Reference to database record
  syncStatus?: "synced" | "pending" | "failed";
}

export interface ChatSettings {
  encryption: boolean;
  readReceipts: boolean;
  showTypingIndicator: boolean;
  notificationsEnabled: boolean;
  autoTranslate: boolean;
  defaultSecurityLevel: "standard" | "encrypted" | "private" | "ephemeral";
  autoDeletePeriod?: number;
  mediaQuality: "low" | "medium" | "high" | "original";
  cloudBackupEnabled: boolean;
  blockUnknownSenders: boolean;
  version?: string;
  lastUpdateChecked?: Date;
  updateAvailable?: boolean;
  dataStorage?: {
    localStorageLimit?: number; // in MB
    cloudStorageLimit?: number; // in MB
    autoCleanup?: boolean;
    cleanupThreshold?: number; // percentage
  };
  privacySettings?: {
    linkPreviews?: boolean;
    messageValidation?: boolean;
    mediaScanning?: boolean;
    autoBlockSuspicious?: boolean;
  };
}

export interface ChatVersion {
  current: string;
  latest?: string;
  updateAvailable: boolean;
  releaseNotes?: string;
  minRequiredVersion?: string;
  forceUpdate?: boolean;
  lastChecked: Date;
  changelog?: VersionChange[];
  isCheckingUpdate?: boolean;
  updateProgress?: number;
  updateCompleted?: boolean;
  updateInstalled?: boolean;
  installationDate?: Date;
  updateError?: string;
  updateStatus?:
    | "not_started"
    | "downloading"
    | "installing"
    | "completed"
    | "failed";
}

export interface VersionChange {
  version: string;
  date: Date;
  changes: string[];
  isSecurityUpdate?: boolean;
  requiresRestart?: boolean;
}
