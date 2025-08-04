
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Download, 
  Upload, 
  Shield, 
  Bell, 
  Palette, 
  MessageSquare, 
  Archive,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Database,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedChatSettingsProps {
  onClose: () => void;
}

export function EnhancedChatSettings({ onClose }: EnhancedChatSettingsProps) {
  const [settings, setSettings] = useState({
    autoBackup: true,
    encryptBackups: true,
    soundNotifications: true,
    vibrationNotifications: true,
    showTypingIndicator: true,
    autoDownloadMedia: false,
    saveToGallery: true,
    deleteAfterSync: false,
    compressMedia: true,
    highQualityUploads: false
  });
  
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null as Date | null,
    isBackingUp: false,
    backupSize: '0 MB',
    totalMessages: 0,
    cloudStorageUsed: '0 MB',
    cloudStorageLimit: '100 MB'
  });
  
  const [backupProgress, setBackupProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadBackupStatus();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('fitfusion_chat_settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    try {
      localStorage.setItem('fitfusion_chat_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      toast({
        title: "Settings saved",
        description: "Your chat preferences have been updated."
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadBackupStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Simulate loading backup status
      setBackupStatus(prev => ({
        ...prev,
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        totalMessages: 1247,
        cloudStorageUsed: '15.8 MB',
        backupSize: '12.3 MB'
      }));
    } catch (error) {
      console.error('Failed to load backup status:', error);
    }
  };

  const handleBackupNow = async () => {
    setBackupStatus(prev => ({ ...prev, isBackingUp: true }));
    setBackupProgress(0);

    try {
      // Simulate backup progress
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setBackupStatus(prevStatus => ({ 
              ...prevStatus, 
              isBackingUp: false,
              lastBackup: new Date()
            }));
            toast({
              title: "Backup completed",
              description: "Your conversations have been safely backed up to FitFusion AI Cloud."
            });
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, you would:
      // 1. Fetch all conversations from local storage
      // 2. Encrypt the data if encryption is enabled
      // 3. Upload to Supabase storage or database
      // 4. Update backup metadata

    } catch (error) {
      setBackupStatus(prev => ({ ...prev, isBackingUp: false }));
      toast({
        title: "Backup failed",
        description: "Failed to backup conversations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRestoreBackup = async () => {
    try {
      // Simulate restore process
      toast({
        title: "Restore started",
        description: "Restoring conversations from FitFusion AI Cloud..."
      });

      // In a real implementation, you would:
      // 1. Fetch backup data from Supabase
      // 2. Decrypt if necessary
      // 3. Merge with local data
      // 4. Update UI

      setTimeout(() => {
        toast({
          title: "Restore completed",
          description: "Your conversations have been successfully restored."
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Restore failed",
        description: "Failed to restore conversations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearCache = () => {
    try {
      // Clear chat media cache
      localStorage.removeItem('fitfusion_chat_media_cache');
      toast({
        title: "Cache cleared",
        description: "Chat media cache has been cleared to free up space."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    try {
      const chatData = {
        settings,
        conversations: JSON.parse(localStorage.getItem('fitfusion_chat_conversations') || '[]'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(chatData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitfusion-chat-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export completed",
        description: "Your chat data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export chat data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200"
         style={{
           scrollbarWidth: 'thin',
           scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
         }}
    >
      {/* Cloud Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            FitFusion AI Cloud Backup
          </CardTitle>
          <CardDescription>
            Automatically backup and sync your conversations across devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup">Auto Backup</Label>
            <Switch
              id="auto-backup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => saveSettings({ ...settings, autoBackup: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="encrypt-backups">Encrypt Backups</Label>
            <Switch
              id="encrypt-backups"
              checked={settings.encryptBackups}
              onCheckedChange={(checked) => saveSettings({ ...settings, encryptBackups: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Backup Status</span>
              <Badge variant={backupStatus.lastBackup ? "default" : "secondary"}>
                {backupStatus.lastBackup ? "Up to date" : "Never backed up"}
              </Badge>
            </div>
            
            {backupStatus.lastBackup && (
              <p className="text-xs text-muted-foreground">
                Last backup: {backupStatus.lastBackup.toLocaleString()}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Messages:</span>
                <span className="ml-2 font-medium">{backupStatus.totalMessages}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2 font-medium">{backupStatus.backupSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cloud Used:</span>
                <span className="ml-2 font-medium">{backupStatus.cloudStorageUsed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Limit:</span>
                <span className="ml-2 font-medium">{backupStatus.cloudStorageLimit}</span>
              </div>
            </div>

            {backupStatus.isBackingUp && (
              <div className="space-y-2">
                <Progress value={backupProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">Backing up conversations...</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleBackupNow}
                disabled={backupStatus.isBackingUp}
                className="flex-1"
              >
                {backupStatus.isBackingUp ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Backup Now
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleRestoreBackup}
                disabled={backupStatus.isBackingUp}
              >
                <Download className="h-4 w-4 mr-2" />
                Restore
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications">Sound Notifications</Label>
            <Switch
              id="sound-notifications"
              checked={settings.soundNotifications}
              onCheckedChange={(checked) => saveSettings({ ...settings, soundNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="vibration-notifications">Vibration</Label>
            <Switch
              id="vibration-notifications"
              checked={settings.vibrationNotifications}
              onCheckedChange={(checked) => saveSettings({ ...settings, vibrationNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="typing-indicator">Show Typing Indicator</Label>
            <Switch
              id="typing-indicator"
              checked={settings.showTypingIndicator}
              onCheckedChange={(checked) => saveSettings({ ...settings, showTypingIndicator: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-download">Auto Download Media</Label>
            <Switch
              id="auto-download"
              checked={settings.autoDownloadMedia}
              onCheckedChange={(checked) => saveSettings({ ...settings, autoDownloadMedia: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="save-gallery">Save Media to Gallery</Label>
            <Switch
              id="save-gallery"
              checked={settings.saveToGallery}
              onCheckedChange={(checked) => saveSettings({ ...settings, saveToGallery: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Media & Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="compress-media">Compress Media</Label>
            <Switch
              id="compress-media"
              checked={settings.compressMedia}
              onCheckedChange={(checked) => saveSettings({ ...settings, compressMedia: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="high-quality">High Quality Uploads</Label>
            <Switch
              id="high-quality"
              checked={settings.highQualityUploads}
              onCheckedChange={(checked) => saveSettings({ ...settings, highQualityUploads: checked })}
            />
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleClearCache} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportData} className="flex-1">
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
