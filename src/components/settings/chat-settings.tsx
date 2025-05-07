import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Check, Download, Lock, RefreshCcw, Shield, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import { ChatSettings, ChatVersion } from "@/types/chat";

export function ChatSettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ChatSettings>({
    encryption: true,
    readReceipts: true,
    showTypingIndicator: true,
    notificationsEnabled: true,
    autoTranslate: false,
    defaultSecurityLevel: 'encrypted',
    mediaQuality: 'high',
    cloudBackupEnabled: true,
    blockUnknownSenders: false,
    version: '4.5.0',
  });

  const [versionInfo, setVersionInfo] = useState<ChatVersion>({
    current: '4.5.0',
    latest: '4.5.0',
    updateAvailable: false,
    lastChecked: new Date(),
  });

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const handleToggle = (key: keyof ChatSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof ChatSettings],
    }));

    toast({
      description: `${key} has been ${!settings[key as keyof ChatSettings] ? 'enabled' : 'disabled'}.`
    });
  };

  const checkForUpdates = () => {
    setIsCheckingUpdate(true);
    
    // Simulate checking for updates
    setTimeout(() => {
      setVersionInfo({
        current: '4.5.0',
        latest: '4.5.1',
        updateAvailable: true,
        releaseNotes: 'Added new security features, improved chat performance, fixed dark mode, and enhanced mobile layouts.',
        lastChecked: new Date(),
      });
      
      setIsCheckingUpdate(false);
      
      toast({
        title: "Update available",
        description: "A new version of FitFusion Chat is available.",
      });
    }, 2000);
  };
  
  const installUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setUpdateSuccess(true);
          
          // Update version info after successful update
          setVersionInfo(prev => ({
            ...prev,
            current: prev.latest || prev.current,
            updateAvailable: false,
            lastChecked: new Date(),
          }));
          
          toast({
            title: "Update complete",
            description: "FitFusion Chat has been updated to the latest version.",
          });

          // Reset update success message after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false);
          }, 3000);
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleViewChangelog = () => {
    setShowChangelog(!showChangelog);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat Version</CardTitle>
              <CardDescription>View and manage app updates</CardDescription>
            </div>
            <Badge variant="outline" className={cn("h-6", updateSuccess && "bg-green-100 text-green-800")}>
              v{versionInfo.current}
              {updateSuccess && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Current version</h4>
              <p className="text-sm text-muted-foreground">
                Last checked: {versionInfo.lastChecked.toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkForUpdates} 
              disabled={isCheckingUpdate}
              className="gap-2"
            >
              {isCheckingUpdate ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Check for updates
                </>
              )}
            </Button>
          </div>
          
          {versionInfo.updateAvailable && (
            <div className="mt-4 bg-muted p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="font-medium">Update available: v{versionInfo.latest}</span>
                </div>
                {isUpdating ? (
                  <span className="text-xs text-muted-foreground">{updateProgress}%</span>
                ) : (
                  <Button 
                    size="sm"
                    onClick={installUpdate}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                )}
              </div>
              
              {isUpdating && (
                <Progress value={updateProgress} className="h-2 mt-2" />
              )}
              
              {!isUpdating && (
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs p-0 h-auto underline"
                    onClick={handleViewChangelog}
                  >
                    {showChangelog ? "Hide changelog" : "View changelog"}
                  </Button>
                  
                  {showChangelog && versionInfo.releaseNotes && (
                    <div className="mt-2 text-sm bg-background/80 p-2 rounded border">
                      <p className="font-medium text-xs mb-1">What's new in v{versionInfo.latest}:</p>
                      <p className="text-xs">{versionInfo.releaseNotes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {updateProgress === 100 && (
                <div className="mt-2 flex items-center text-green-500">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Update completed! Restarting...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">v4.5.0 Release Notes</h4>
            <div className="text-sm bg-muted/50 p-3 rounded border">
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li>Enhanced mobile layouts and responsive design</li>
                <li>Fixed dark mode issues across all screens</li>
                <li>Improved chat security with end-to-end encryption</li>
                <li>Added version checking with interactive animations</li>
                <li>Performance optimizations for better speed</li>
                <li>Bug fixes related to notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your chat security preferences</CardDescription>
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
              onCheckedChange={() => handleToggle('encryption')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="blockUnknownSenders">Block Unknown Senders</Label>
              <span className="text-xs text-muted-foreground">
                Only receive messages from people in your contacts
              </span>
            </div>
            <Switch 
              id="blockUnknownSenders" 
              checked={settings.blockUnknownSenders} 
              onCheckedChange={() => handleToggle('blockUnknownSenders')} 
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
              onChange={(e) => setSettings(prev => ({
                ...prev,
                defaultSecurityLevel: e.target.value as any
              }))}
            >
              <option value="standard">Standard</option>
              <option value="encrypted">Encrypted</option>
              <option value="private">Private</option>
              <option value="ephemeral">Ephemeral</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-1" />
            <span>All messages are encrypted during transit</span>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your chat notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="notificationsEnabled">Push Notifications</Label>
              <span className="text-xs text-muted-foreground">
                Receive notifications for new messages
              </span>
            </div>
            <Switch 
              id="notificationsEnabled" 
              checked={settings.notificationsEnabled} 
              onCheckedChange={() => handleToggle('notificationsEnabled')} 
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
              onCheckedChange={() => handleToggle('showTypingIndicator')} 
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
              onCheckedChange={() => handleToggle('readReceipts')} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Bell className="h-4 w-4 mr-1" />
            <span>You can customize notifications for individual chats</span>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Storage</CardTitle>
          <CardDescription>Manage your chat data and storage usage</CardDescription>
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
              onCheckedChange={() => handleToggle('cloudBackupEnabled')} 
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
              onChange={(e) => setSettings(prev => ({
                ...prev,
                mediaQuality: e.target.value as any
              }))}
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
              onChange={(e) => setSettings(prev => ({
                ...prev,
                autoDeletePeriod: parseInt(e.target.value)
              }))}
            >
              <option value="0">Never</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
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
    </div>
  );
}

// Add the cn utility function for convenience
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
