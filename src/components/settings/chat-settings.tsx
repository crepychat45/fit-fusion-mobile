import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bell, Lock, Smartphone } from "lucide-react";
import { ChatSettings } from "@/types/chat";
import { VersionManager } from "./version-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrivacySettings } from "./privacy-settings";
import { DeveloperOptions } from "./developer-options";

export function ChatSettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ChatSettings>({
    encryption: true,
    readReceipts: true,
    showTypingIndicator: true,
    notificationsEnabled: true,
    autoTranslate: false,
    defaultSecurityLevel: "encrypted",
    mediaQuality: "high",
    cloudBackupEnabled: true,
    blockUnknownSenders: false,
    version: "4.6.0",
    privacySettings: {
      linkPreviews: true,
      messageValidation: true,
      mediaScanning: true,
      autoBlockSuspicious: false,
    },
  });

  // Load saved settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem("chat-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem("chat-settings", JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key: keyof ChatSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof ChatSettings],
    }));

    toast({
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")} has been ${!settings[key as keyof ChatSettings] ? "enabled" : "disabled"}.`,
    });
  };

  const handlePrivacySettingToggle = (
    setting: keyof ChatSettings["privacySettings"],
  ) => {
    if (settings.privacySettings) {
      setSettings((prev) => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [setting]: !prev.privacySettings?.[setting],
        },
      }));

      toast({
        description: `${setting.charAt(0).toUpperCase() + setting.slice(1).replace(/([A-Z])/g, " $1")} has been ${!settings.privacySettings[setting] ? "enabled" : "disabled"}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="security">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="version">Version</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your chat security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="encryption">End-to-End Encryption</Label>
                  <span className="text-xs text-muted-foreground">
                    Encrypt all your messages for maximum privacy
                  </span>
                </div>
                <Switch
                  id="encryption"
                  checked={settings.encryption}
                  onCheckedChange={() => handleToggle("encryption")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="blockUnknownSenders">
                    Block Unknown Senders
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Only receive messages from people in your contacts
                  </span>
                </div>
                <Switch
                  id="blockUnknownSenders"
                  checked={settings.blockUnknownSenders}
                  onCheckedChange={() => handleToggle("blockUnknownSenders")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="securityLevel">Default Security Level</Label>
                  <span className="text-xs text-muted-foreground">
                    Set the default security level for new conversations
                  </span>
                </div>
                <select
                  id="securityLevel"
                  className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={settings.defaultSecurityLevel}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultSecurityLevel: e.target.value as any,
                    }))
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="encrypted">Encrypted</option>
                  <option value="private">Private</option>
                  <option value="ephemeral">Ephemeral</option>
                </select>
              </div>

              {/* Message Validation */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="messageValidation">Message Validation</Label>
                  <span className="text-xs text-muted-foreground">
                    Verify authenticity of incoming messages
                  </span>
                </div>
                <Switch
                  id="messageValidation"
                  checked={settings.privacySettings?.messageValidation ?? true}
                  onCheckedChange={() =>
                    handlePrivacySettingToggle("messageValidation")
                  }
                />
              </div>

              {/* Media Scanning */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="mediaScanning">Media Scanning</Label>
                  <span className="text-xs text-muted-foreground">
                    Scan attachments for viruses and malware
                  </span>
                </div>
                <Switch
                  id="mediaScanning"
                  checked={settings.privacySettings?.mediaScanning ?? true}
                  onCheckedChange={() =>
                    handlePrivacySettingToggle("mediaScanning")
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="h-4 w-4 mr-1" />
                <span>All messages are encrypted during transit</span>
              </div>
            </CardFooter>
          </Card>

          <PrivacySettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your chat notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="notificationsEnabled">
                    Push Notifications
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Receive notifications for new messages
                  </span>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={() => handleToggle("notificationsEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="showTypingIndicator">Typing Indicators</Label>
                  <span className="text-xs text-muted-foreground">
                    Show when others are typing
                  </span>
                </div>
                <Switch
                  id="showTypingIndicator"
                  checked={settings.showTypingIndicator}
                  onCheckedChange={() => handleToggle("showTypingIndicator")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="readReceipts">Read Receipts</Label>
                  <span className="text-xs text-muted-foreground">
                    Let others know when you've read their messages
                  </span>
                </div>
                <Switch
                  id="readReceipts"
                  checked={settings.readReceipts}
                  onCheckedChange={() => handleToggle("readReceipts")}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Bell className="h-4 w-4 mr-1" />
                <span>
                  You can customize notifications for individual chats
                </span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Storage</CardTitle>
              <CardDescription>
                Manage your chat data and storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="cloudBackupEnabled">Cloud Backup</Label>
                  <span className="text-xs text-muted-foreground">
                    Backup your chat history to the cloud
                  </span>
                </div>
                <Switch
                  id="cloudBackupEnabled"
                  checked={settings.cloudBackupEnabled}
                  onCheckedChange={() => handleToggle("cloudBackupEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="mediaQuality">Media Quality</Label>
                  <span className="text-xs text-muted-foreground">
                    Set the quality for sending media files
                  </span>
                </div>
                <select
                  id="mediaQuality"
                  className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={settings.mediaQuality}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      mediaQuality: e.target.value as any,
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="original">Original</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="autoDeletePeriod">Auto-Delete Messages</Label>
                  <span className="text-xs text-muted-foreground">
                    Automatically delete messages after a period
                  </span>
                </div>
                <select
                  id="autoDeletePeriod"
                  className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={settings.autoDeletePeriod || 0}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoDeletePeriod: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value="0">Never</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              {/* Link Previews */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="linkPreviews">Link Previews</Label>
                  <span className="text-xs text-muted-foreground">
                    Show previews for links shared in chat
                  </span>
                </div>
                <Switch
                  id="linkPreviews"
                  checked={settings.privacySettings?.linkPreviews ?? true}
                  onCheckedChange={() =>
                    handlePrivacySettingToggle("linkPreviews")
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4 mr-1" />
                <span>Estimated storage usage: 24.5 MB</span>
              </div>
              <Button variant="outline" size="sm">
                Clear Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="version">
          <Card>
            <CardHeader>
              <CardTitle>Version Information</CardTitle>
              <CardDescription>View and manage app updates</CardDescription>
            </CardHeader>
            <CardContent>
              <VersionManager />
            </CardContent>
          </Card>

          <div className="mt-6">
            <DeveloperOptions />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
