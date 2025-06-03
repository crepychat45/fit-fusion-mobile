
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Palette, 
  Volume2, 
  Eye, 
  Clock, 
  Smartphone,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from "lucide-react";

interface ChatSettingsProps {
  onClose: () => void;
}

export function ChatSettings({ onClose }: ChatSettingsProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("auto");
  const [fontSize, setFontSize] = useState([14]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([75]);
  const [autoSave, setAutoSave] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [messageRetention, setMessageRetention] = useState("30");

  const handleExportData = () => {
    const data = {
      settings: {
        theme,
        fontSize: fontSize[0],
        soundEnabled,
        soundVolume: soundVolume[0],
        autoSave,
        messagePreview,
        onlineStatus,
        readReceipts,
        typingIndicators,
        messageRetention
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitfusion-chat-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Settings exported",
      description: "Your chat settings have been downloaded."
    });
  };

  const handleClearCache = () => {
    // Clear various cache items
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('chat_') || key.startsWith('fitfusion_')
    );
    
    cacheKeys.forEach(key => {
      if (!key.includes('auth') && !key.includes('token')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Cache cleared",
      description: "Chat cache and temporary data have been cleared."
    });
  };

  const handleResetSettings = () => {
    setTheme("auto");
    setFontSize([14]);
    setSoundEnabled(true);
    setSoundVolume([75]);
    setAutoSave(true);
    setMessagePreview(true);
    setOnlineStatus(true);
    setReadReceipts(true);
    setTypingIndicators(true);
    setMessageRetention("30");

    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults."
    });
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the chat interface looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">Font Size</p>
              <Badge variant="outline">{fontSize[0]}px</Badge>
            </div>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              max={20}
              min={12}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound & Notifications
          </CardTitle>
          <CardDescription>
            Configure audio feedback and notification sounds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound Effects</p>
              <p className="text-sm text-muted-foreground">Play sounds for new messages</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          {soundEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Volume</p>
                <Badge variant="outline">{soundVolume[0]}%</Badge>
              </div>
              <Slider
                value={soundVolume}
                onValueChange={setSoundVolume}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy & Visibility
          </CardTitle>
          <CardDescription>
            Control what others can see about your activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Online Status</p>
              <p className="text-sm text-muted-foreground">Show when you're online</p>
            </div>
            <Switch checked={onlineStatus} onCheckedChange={setOnlineStatus} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Read Receipts</p>
              <p className="text-sm text-muted-foreground">Let others know when you've read their messages</p>
            </div>
            <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Typing Indicators</p>
              <p className="text-sm text-muted-foreground">Show when you're typing</p>
            </div>
            <Switch checked={typingIndicators} onCheckedChange={setTypingIndicators} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Message Previews</p>
              <p className="text-sm text-muted-foreground">Show message content in notifications</p>
            </div>
            <Switch checked={messagePreview} onCheckedChange={setMessagePreview} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Control how your chat data is stored and managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-save Messages</p>
              <p className="text-sm text-muted-foreground">Automatically save conversations</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Message Retention</p>
              <p className="text-sm text-muted-foreground">How long to keep messages locally</p>
            </div>
            <Select value={messageRetention} onValueChange={setMessageRetention}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="never">Never delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>

          <Button variant="destructive" onClick={handleResetSettings} className="w-full flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset All Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
