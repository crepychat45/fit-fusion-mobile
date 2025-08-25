import { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

export interface ChatBackup {
  version: string;
  timestamp: Date;
  conversations: ChatConversation[];
  users: ChatUser[];
  messages: Record<string, ChatMessage[]>;
  settings: {
    background: string;
    notifications: boolean;
    encryption: boolean;
  };
}

class ChatStorageManager {
  private readonly STORAGE_KEYS = {
    CONVERSATIONS: "fitfusion_chat_conversations",
    MESSAGES: "fitfusion_chat_messages",
    USERS: "fitfusion_chat_users",
    SETTINGS: "fitfusion_chat_settings",
    BACKUP_TIMESTAMP: "fitfusion_chat_backup_timestamp",
  };

  // Conversations
  saveConversations(conversations: ChatConversation[]): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations),
      );
      this.updateBackupTimestamp();
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }

  getConversations(): ChatConversation[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS);
      if (data) {
        const conversations = JSON.parse(data);
        // Convert date strings back to Date objects
        return conversations.map((conv: any) => ({
          ...conv,
          updatedAt: new Date(conv.updatedAt),
          createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to load conversations:", error);
      return [];
    }
  }

  // Messages
  saveMessages(conversationId: string, messages: ChatMessage[]): void {
    try {
      const allMessages = this.getAllMessages();
      allMessages[conversationId] = messages;
      localStorage.setItem(
        this.STORAGE_KEYS.MESSAGES,
        JSON.stringify(allMessages),
      );
      this.updateBackupTimestamp();
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }

  getMessages(conversationId: string): ChatMessage[] {
    try {
      const allMessages = this.getAllMessages();
      const messages = allMessages[conversationId] || [];
      // Convert date strings back to Date objects
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        metadata: msg.metadata
          ? {
              ...msg.metadata,
              deliveredAt: msg.metadata.deliveredAt
                ? new Date(msg.metadata.deliveredAt)
                : undefined,
              readAt: msg.metadata.readAt
                ? new Date(msg.metadata.readAt)
                : undefined,
              editedAt: msg.metadata.editedAt
                ? new Date(msg.metadata.editedAt)
                : undefined,
              deletedAt: msg.metadata.deletedAt
                ? new Date(msg.metadata.deletedAt)
                : undefined,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
      return [];
    }
  }

  private getAllMessages(): Record<string, ChatMessage[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to load all messages:", error);
      return {};
    }
  }

  // Users
  saveUsers(users: ChatUser[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users:", error);
    }
  }

  getUsers(): ChatUser[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
      if (data) {
        const users = JSON.parse(data);
        return users.map((user: any) => ({
          ...user,
          lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined,
          lastSecurityCheck: user.lastSecurityCheck
            ? new Date(user.lastSecurityCheck)
            : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to load users:", error);
      return [];
    }
  }

  // Settings
  saveSettings(settings: any): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  getSettings(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return data
        ? JSON.parse(data)
        : {
            background: "bg-background",
            notifications: true,
            encryption: true,
          };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return {
        background: "bg-background",
        notifications: true,
        encryption: true,
      };
    }
  }

  // Backup and Restore
  exportBackup(): ChatBackup {
    const conversations = this.getConversations();
    const users = this.getUsers();
    const settings = this.getSettings();
    const messages: Record<string, ChatMessage[]> = {};

    // Get all messages for all conversations
    conversations.forEach((conv) => {
      messages[conv.id] = this.getMessages(conv.id);
    });

    return {
      version: "1.0.0",
      timestamp: new Date(),
      conversations,
      users,
      messages,
      settings,
    };
  }

  importBackup(backup: ChatBackup): boolean {
    try {
      // Validate backup structure
      if (!backup.version || !backup.conversations || !backup.messages) {
        throw new Error("Invalid backup format");
      }

      // Clear existing data
      this.clearAllData();

      // Import data
      this.saveConversations(backup.conversations);
      if (backup.users) this.saveUsers(backup.users);
      if (backup.settings) this.saveSettings(backup.settings);

      // Import messages
      Object.entries(backup.messages).forEach(([conversationId, messages]) => {
        this.saveMessages(conversationId, messages);
      });

      console.log("Chat backup imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import backup:", error);
      return false;
    }
  }

  downloadBackup(): void {
    try {
      const backup = this.exportBackup();
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `fitfusion-chat-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download backup:", error);
    }
  }

  // Sync simulation
  async syncData(): Promise<boolean> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, this would sync with a server
      // For now, we'll just update the backup timestamp
      this.updateBackupTimestamp();

      console.log("Chat data synced successfully");
      return true;
    } catch (error) {
      console.error("Failed to sync data:", error);
      return false;
    }
  }

  private updateBackupTimestamp(): void {
    localStorage.setItem(
      this.STORAGE_KEYS.BACKUP_TIMESTAMP,
      new Date().toISOString(),
    );
  }

  getLastBackupTime(): Date | null {
    const timestamp = localStorage.getItem(this.STORAGE_KEYS.BACKUP_TIMESTAMP);
    return timestamp ? new Date(timestamp) : null;
  }

  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // Search functionality
  searchMessages(
    query: string,
  ): { conversationId: string; messages: ChatMessage[] }[] {
    const conversations = this.getConversations();
    const results: { conversationId: string; messages: ChatMessage[] }[] = [];

    conversations.forEach((conv) => {
      const messages = this.getMessages(conv.id);
      const matchingMessages = messages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase()),
      );

      if (matchingMessages.length > 0) {
        results.push({
          conversationId: conv.id,
          messages: matchingMessages,
        });
      }
    });

    return results;
  }

  // Storage usage
  getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let totalSize = 0;

      Object.values(this.STORAGE_KEYS).forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });

      // Estimate total available storage (5MB for most browsers)
      const totalAvailable = 5 * 1024 * 1024;

      return {
        used: totalSize,
        total: totalAvailable,
        percentage: Math.round((totalSize / totalAvailable) * 100),
      };
    } catch (error) {
      console.error("Failed to calculate storage usage:", error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

export const chatStorage = new ChatStorageManager();
