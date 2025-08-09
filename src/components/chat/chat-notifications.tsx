
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  BellOff, 
  Volume2, 
  Vibrate, 
  Clock, 
  Users,
  MessageSquare,
  Shield,
  Smartphone,
  Moon,
  Zap
} from "lucide-react";

interface ChatNotificationsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onClose: () => void;
}

export function ChatNotifications({ enabled, onEnabledChange, onClose }: ChatNotificationsProps) {
  const { toast } = useToast();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [privateNotifications, setPrivateNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState([80]);
  const [priority, setPriority] = useState("normal");

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('FitFusion Chat', {
          body: 'This is a test notification from FitFusion Chat!',
          icon: '/favicon.ico'
        });
        
        toast({
          title: "Test notification sent",
          description: "Check your notification panel to see the test notification."
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('FitFusion Chat', {
              body: 'Notifications are now enabled!',
              icon: '/favicon.ico'
            });
          }
        });
      }
    } else {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive desktop notifications."
        });
      } else {
        toast({
          title: "Notifications denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Main Notification Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {enabled ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Master switch for all notifications
                </p>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>

          {enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notification Priority</p>
                  <p className="text-sm text-muted-foreground">How urgent should notifications appear</p>
                </div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={testNotification} variant="outline" className="flex-1">
                  Test Notification
                </Button>
                <Button onClick={requestNotificationPermission} variant="outline" className="flex-1">
                  Request Permission
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      {enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Choose which events trigger notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Private Messages</p>
                  <p className="text-sm text-muted-foreground">Direct messages from other users</p>
                </div>
              </div>
              <Switch checked={privateNotifications} onCheckedChange={setPrivateNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Group Messages</p>
                  <p className="text-sm text-muted-foreground">Messages in group conversations</p>
                </div>
              </div>
              <Switch checked={groupNotifications} onCheckedChange={setGroupNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Mentions</p>
                  <p className="text-sm text-muted-foreground">When someone mentions you specifically</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">High Priority</Badge>
                <Switch checked={mentionNotifications} onCheckedChange={setMentionNotifications} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Important security notifications</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">Critical</Badge>
                <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Methods */}
      {enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Delivery Methods
            </CardTitle>
            <CardDescription>
              How you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Desktop and mobile push notifications</p>
                </div>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Sound Alerts</p>
                  <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            {soundEnabled && (
              <div className="space-y-2 ml-7">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Volume</p>
                  <Badge variant="outline">{notificationVolume[0]}%</Badge>
                </div>
                <Slider
                  value={notificationVolume}
                  onValueChange={setNotificationVolume}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Vibration</p>
                  <p className="text-sm text-muted-foreground">Vibrate device for notifications</p>
                </div>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      {enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when notifications should be silenced
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Quiet Hours</p>
                <p className="text-sm text-muted-foreground">
                  Automatically silence notifications during specified hours
                </p>
              </div>
              <Switch checked={quietHours} onCheckedChange={setQuietHours} />
            </div>

            {quietHours && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time</label>
                  <Select value={quietStart} onValueChange={setQuietStart}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">End Time</label>
                  <Select value={quietEnd} onValueChange={setQuietEnd}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
