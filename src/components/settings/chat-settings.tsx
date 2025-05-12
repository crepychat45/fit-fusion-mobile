
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Check, Download, Lock, RefreshCcw, Shield, Smartphone, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { ChatSettings, ChatVersion } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

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
    privacySettings: {
      linkPreviews: true,
      messageValidation: true,
      mediaScanning: true,
      autoBlockSuspicious: false
    }
  });

  const [versionInfo, setVersionInfo] = useState<ChatVersion>({
    current: '4.5.0',
    latest: '4.5.0',
    updateAvailable: false,
    lastChecked: new Date(),
    isCheckingUpdate: false,
    updateProgress: 0,
    updateCompleted: false,
    updateInstalled: false,
    updateStatus: 'not_started',
    changelog: [
      {
        version: '4.5.0',
        date: new Date('2025-05-01'),
        changes: [
          'Enhanced mobile layouts and responsive design',
          'Fixed dark mode issues across all screens',
          'Improved chat security with end-to-end encryption',
          'Added version checking with interactive animations',
          'Performance optimizations for better speed',
          'Bug fixes related to notifications'
        ],
        isSecurityUpdate: true,
        requiresRestart: false
      },
      {
        version: '4.4.0',
        date: new Date('2025-04-15'),
        changes: [
          'Added group chat capabilities',
          'Improved attachment handling',
          'Enhanced user profiles',
          'Fixed several UI bugs in dark mode'
        ],
        isSecurityUpdate: false,
        requiresRestart: true
      },
      {
        version: '4.3.5',
        date: new Date('2025-03-28'),
        changes: [
          'Security patch for message encryption',
          'Performance improvements for large chats',
          'Fixed message delivery status indicators'
        ],
        isSecurityUpdate: true,
        requiresRestart: false
      }
    ]
  });

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showFullChangelog, setShowFullChangelog] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedVersionInfo = localStorage.getItem('chat-version-info');
    if (savedVersionInfo) {
      const parsedInfo = JSON.parse(savedVersionInfo);
      // Convert string dates back to Date objects
      if (parsedInfo.lastChecked) {
        parsedInfo.lastChecked = new Date(parsedInfo.lastChecked);
      }
      if (parsedInfo.installationDate) {
        parsedInfo.installationDate = new Date(parsedInfo.installationDate);
      }
      if (parsedInfo.changelog) {
        parsedInfo.changelog = parsedInfo.changelog.map((change: any) => ({
          ...change,
          date: new Date(change.date)
        }));
      }
      setVersionInfo(parsedInfo);
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chat-settings', JSON.stringify(settings));
  }, [settings]);
  
  // Save version info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chat-version-info', JSON.stringify(versionInfo));
  }, [versionInfo]);
  
  const handleToggle = (key: keyof ChatSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof ChatSettings],
    }));

    toast({
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} has been ${!settings[key as keyof ChatSettings] ? 'enabled' : 'disabled'}.`
    });
  };

  const checkForUpdates = () => {
    setIsCheckingUpdate(true);
    setVersionInfo(prev => ({...prev, isCheckingUpdate: true}));
    
    toast({
      title: "Checking for updates...",
      description: "Please wait while we check for the latest version.",
    });
    
    // Simulate a server call to check for updates
    setTimeout(() => {
      setVersionInfo(prev => ({
        ...prev,
        isCheckingUpdate: false,
        current: '4.5.0',
        latest: '4.5.1',
        updateAvailable: true,
        releaseNotes: 'Added new security features, improved chat performance, fixed dark mode, and enhanced mobile layouts.',
        lastChecked: new Date(),
        updateStatus: 'not_started'
      }));
      
      setIsCheckingUpdate(false);
      
      toast({
        title: "Update available",
        description: "Version 4.5.1 is now available with new features and improvements.",
        variant: "default",
      });
    }, 2000);
  };
  
  const installUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setVersionInfo(prev => ({
      ...prev, 
      updateProgress: 0, 
      updateStatus: 'downloading'
    }));
    
    toast({
      title: "Installing update",
      description: "Starting download of version 4.5.1...",
    });
    
    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        const newProgress = prev + 10;
        setVersionInfo(currentInfo => ({
          ...currentInfo, 
          updateProgress: newProgress,
          updateStatus: newProgress < 50 ? 'downloading' : 'installing'
        }));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setUpdateSuccess(true);
          
          // Important: Update the current version to match the latest version
          setVersionInfo(currentInfo => ({
            ...currentInfo, 
            updateProgress: 100,
            updateCompleted: true,
            current: currentInfo.latest || currentInfo.current,
            updateAvailable: false,
            lastChecked: new Date(),
            updateStatus: 'completed',
            updateInstalled: true,
            installationDate: new Date()
          }));
          
          // Update the settings version to match the latest version
          setSettings(currentSettings => ({
            ...currentSettings,
            version: versionInfo.latest || currentSettings.version,
            lastUpdateChecked: new Date()
          }));
          
          toast({
            title: "Update complete",
            description: `FitFusion Chat has been updated to version ${versionInfo.latest}.`,
            variant: "default", 
          });

          // Reset update success message after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false);
            setVersionInfo(currentInfo => ({
              ...currentInfo, 
              updateCompleted: false, 
              updateProgress: 0
            }));
          }, 3000);
          
          return 0;
        }
        
        // Show progress toasts at specific intervals
        if (newProgress === 30) {
          toast({
            title: "Download progress: 30%",
            description: "Downloading update files...",
          });
        } else if (newProgress === 60) {
          toast({
            title: "Installing: 60%",
            description: "Preparing to install...",
          });
        } else if (newProgress === 90) {
          toast({
            title: "Installing: 90%",
            description: "Almost done...",
          });
        }
        
        return newProgress;
      });
    }, 500);
  };

  const handleViewChangelog = () => {
    setShowChangelog(!showChangelog);
  };
  
  const handleToggleFullChangelog = () => {
    setShowFullChangelog(!showFullChangelog);
  };

  const handlePrivacySettingToggle = (setting: keyof ChatSettings['privacySettings']) => {
    if (settings.privacySettings) {
      setSettings(prev => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [setting]: !prev.privacySettings?.[setting]
        }
      }));

      toast({
        description: `${setting.charAt(0).toUpperCase() + setting.slice(1).replace(/([A-Z])/g, ' $1')} has been ${!settings.privacySettings[setting] ? 'enabled' : 'disabled'}.`
      });
    }
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
            <Badge 
              variant="outline" 
              className={cn(
                "h-6 transition-all duration-300", 
                updateSuccess ? "bg-green-100 text-green-800" : "",
                versionInfo.updateAvailable ? "bg-amber-100 text-amber-800" : ""
              )}
            >
              v{versionInfo.current}
              {updateSuccess && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
              {versionInfo.updateAvailable && !updateSuccess && <AlertTriangle className="h-3 w-3 ml-1 text-amber-600" />}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Current version</h4>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 inline" />
                Last checked: {versionInfo.lastChecked.toLocaleDateString()} {versionInfo.lastChecked.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              {versionInfo.updateInstalled && versionInfo.installationDate && (
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1 inline" />
                  Installed: {versionInfo.installationDate.toLocaleDateString()} {versionInfo.installationDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkForUpdates} 
              disabled={isCheckingUpdate || isUpdating}
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
            <div className="mt-4 bg-muted/50 p-3 rounded-md border border-amber-200 animate-fade-in">
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
                    className="flex items-center gap-1 animate-pulse"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                )}
              </div>
              
              {isUpdating && (
                <div className="mt-2">
                  <Progress value={updateProgress} className="h-2 animate-pulse" />
                  <p className="text-xs text-center mt-1">
                    {versionInfo.updateStatus === 'downloading' 
                      ? 'Downloading update...' 
                      : 'Installing update...'}
                  </p>
                </div>
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
                    <div className="mt-2 text-sm bg-background/80 p-2 rounded border animate-fade-in">
                      <p className="font-medium text-xs mb-1">What's new in v{versionInfo.latest}:</p>
                      <p className="text-xs">{versionInfo.releaseNotes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {updateProgress === 100 && (
                <div className="mt-2 flex items-center text-green-500 animate-fade-in">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Update completed! Restarting...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Version History</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={handleToggleFullChangelog}
              >
                {showFullChangelog ? "Show Less" : "Show All"}
              </Button>
            </div>
            
            <div className="space-y-3 text-sm bg-muted/50 p-3 rounded border">
              {versionInfo.changelog?.slice(0, showFullChangelog ? undefined : 1).map((version, index) => (
                <div key={index} className={index > 0 ? "pt-3 border-t" : ""}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={version.isSecurityUpdate ? "bg-green-100 text-green-800" : ""}>
                        v{version.version}
                      </Badge>
                      {version.isSecurityUpdate && (
                        <Badge variant="secondary" className="text-[10px] h-5">Security Update</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {version.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <ul className="space-y-1 list-disc list-inside text-xs ml-1">
                    {version.changes.map((change, changeIndex) => (
                      <li key={changeIndex}>{change}</li>
                    ))}
                  </ul>
                  
                  {version.requiresRestart && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      This update requires app restart
                    </p>
                  )}
                </div>
              ))}
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
          
          {/* New security option - Message Validation */}
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
              onCheckedChange={() => handlePrivacySettingToggle('messageValidation')} 
            />
          </div>
          
          {/* New security option - Media Scanning */}
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
              onCheckedChange={() => handlePrivacySettingToggle('mediaScanning')} 
            />
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
          
          {/* New option - Link Previews */}
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
              onCheckedChange={() => handlePrivacySettingToggle('linkPreviews')} 
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
    </div>
  );
}

// Add the cn utility function for convenience
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
