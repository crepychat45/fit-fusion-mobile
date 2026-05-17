import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  keywords: string[];
}

const SETTINGS_INDEX: SettingsSearchResult[] = [
  // Account Settings
  {
    id: "account-email",
    title: "Email Address",
    description: "Update your email address and verify it",
    category: "Account",
    keywords: ["email", "account", "contact"],
  },
  {
    id: "account-password",
    title: "Password",
    description: "Change your password and security options",
    category: "Account",
    keywords: ["password", "security", "change password"],
  },
  {
    id: "account-language",
    title: "Language",
    description: "Select your preferred language",
    category: "Account",
    keywords: ["language", "localization", "english", "spanish"],
  },

  // Display Settings
  {
    id: "display-theme",
    title: "Theme",
    description: "Choose between light and dark theme",
    category: "Display",
    keywords: ["theme", "dark mode", "light mode", "appearance"],
  },
  {
    id: "display-font",
    title: "Font Size",
    description: "Adjust the font size for better readability",
    category: "Display",
    keywords: ["font", "size", "text", "readability"],
  },
  {
    id: "display-layout",
    title: "Layout",
    description: "Customize your layout preferences",
    category: "Display",
    keywords: ["layout", "arrangement", "columns"],
  },

  // Privacy Settings
  {
    id: "privacy-data",
    title: "Data Collection",
    description: "Control what data is collected about you",
    category: "Privacy",
    keywords: ["privacy", "data", "collection", "tracking"],
  },
  {
    id: "privacy-analytics",
    title: "Analytics",
    description: "Share usage analytics to improve the app",
    category: "Privacy",
    keywords: ["analytics", "tracking", "statistics"],
  },
  {
    id: "privacy-third-party",
    title: "Third-Party Sharing",
    description: "Control sharing of data with third parties",
    category: "Privacy",
    keywords: ["third party", "sharing", "partners"],
  },

  // Notifications
  {
    id: "notifications-general",
    title: "General Notifications",
    description: "Enable or disable general notifications",
    category: "Notifications",
    keywords: ["notifications", "alerts", "general"],
  },
  {
    id: "notifications-email",
    title: "Email Notifications",
    description: "Manage email notification preferences",
    category: "Notifications",
    keywords: ["email", "notifications", "mail"],
  },
  {
    id: "notifications-push",
    title: "Push Notifications",
    description: "Control push notification settings",
    category: "Notifications",
    keywords: ["push", "notifications", "mobile"],
  },

  // Updates
  {
    id: "updates-auto",
    title: "Automatic Updates",
    description: "Enable automatic app updates",
    category: "Updates",
    keywords: ["updates", "automatic", "upgrade"],
  },
  {
    id: "updates-scheduler",
    title: "Update Scheduler",
    description: "Schedule updates at preferred times",
    category: "Updates",
    keywords: ["scheduler", "schedule", "timing"],
  },
  {
    id: "updates-rollback",
    title: "Rollback Updates",
    description: "Revert to previous app version",
    category: "Updates",
    keywords: ["rollback", "revert", "previous"],
  },

  // Security
  {
    id: "security-2fa",
    title: "Two-Factor Authentication",
    description: "Enable 2FA for additional security",
    category: "Security",
    keywords: ["security", "2fa", "authentication", "two-factor"],
  },
  {
    id: "security-sessions",
    title: "Active Sessions",
    description: "View and manage your active sessions",
    category: "Security",
    keywords: ["sessions", "devices", "active"],
  },
  {
    id: "security-permissions",
    title: "App Permissions",
    description: "Manage app permissions and access",
    category: "Security",
    keywords: ["permissions", "access", "app"],
  },

  // Data Management
  {
    id: "data-export",
    title: "Export Data",
    description: "Export your personal data",
    category: "Data",
    keywords: ["export", "data", "download"],
  },
  {
    id: "data-backup",
    title: "Backup & Restore",
    description: "Create and restore data backups",
    category: "Data",
    keywords: ["backup", "restore", "recovery"],
  },
  {
    id: "data-delete",
    title: "Delete Account",
    description: "Permanently delete your account",
    category: "Data",
    keywords: ["delete", "account", "remove"],
  },
];

interface SettingsSearchProps {
  onResultClick?: (result: SettingsSearchResult) => void;
}

export function SettingsSearch({ onResultClick }: SettingsSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return SETTINGS_INDEX.filter((item) => {
      const searchFields = [
        item.title,
        item.description,
        ...item.keywords,
      ].join(" ").toLowerCase();

      return searchFields.includes(lowerQuery);
    }).slice(0, 8); // Limit to 8 results
  }, [query]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Account: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      Display: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      Privacy: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
      Notifications: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
      Updates: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      Security: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      Data: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
    };
    return colors[category] || colors.Account;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search settings, preferences, features..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      <AnimatePresence>
        {query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No settings found for "{query}"</p>
              </div>
            ) : (
              <ScrollArea className="h-64 rounded-lg border p-2">
                <div className="space-y-2">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onResultClick?.(result)}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`ml-2 text-xs ${getCategoryColor(
                            result.category,
                          )}`}
                        >
                          {result.category}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
