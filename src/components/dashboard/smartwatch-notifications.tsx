import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Heart,
  Activity,
  AlertCircle,
  TrendingUp,
  Users,
  Smartphone,
} from "lucide-react";

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: "apps" | "fitness" | "system";
}

const defaultNotifications: NotificationSetting[] = [
  {
    id: "calls",
    name: "Phone Calls",
    description: "Incoming call notifications",
    icon: Phone,
    enabled: true,
    category: "apps",
  },
  {
    id: "messages",
    name: "Messages",
    description: "SMS and messaging apps",
    icon: MessageSquare,
    enabled: true,
    category: "apps",
  },
  {
    id: "email",
    name: "Email",
    description: "Email notifications",
    icon: Mail,
    enabled: false,
    category: "apps",
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Event and meeting reminders",
    icon: Calendar,
    enabled: true,
    category: "apps",
  },
  {
    id: "social",
    name: "Social Media",
    description: "Social network updates",
    icon: Users,
    enabled: false,
    category: "apps",
  },
  {
    id: "workout-goals",
    name: "Workout Goals",
    description: "Daily fitness goal notifications",
    icon: TrendingUp,
    enabled: true,
    category: "fitness",
  },
  {
    id: "heart-rate",
    name: "Heart Rate Alerts",
    description: "Abnormal heart rate warnings",
    icon: Heart,
    enabled: true,
    category: "fitness",
  },
  {
    id: "activity-reminder",
    name: "Activity Reminders",
    description: "Stand up and move reminders",
    icon: Activity,
    enabled: true,
    category: "fitness",
  },
  {
    id: "hydration",
    name: "Hydration Alerts",
    description: "Water intake reminders",
    icon: Activity,
    enabled: false,
    category: "fitness",
  },
  {
    id: "system-updates",
    name: "System Updates",
    description: "Software and firmware updates",
    icon: Smartphone,
    enabled: true,
    category: "system",
  },
  {
    id: "low-battery",
    name: "Low Battery",
    description: "Battery level warnings",
    icon: AlertCircle,
    enabled: true,
    category: "system",
  },
];

export const SmartWatchNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("smartwatch-notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
    }
  }, []);

  const handleToggle = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    );
    setNotifications(updated);
    localStorage.setItem("smartwatch-notifications", JSON.stringify(updated));

    const notification = updated.find((n) => n.id === id);
    toast({
      title: notification?.enabled ? "Enabled" : "Disabled",
      description: `${notification?.name} notifications ${notification?.enabled ? "enabled" : "disabled"}`,
    });
  };

  const getEnabledCount = (category: string) => {
    return notifications.filter((n) => n.category === category && n.enabled).length;
  };

  const getTotalCount = (category: string) => {
    return notifications.filter((n) => n.category === category).length;
  };

  const categories = [
    { id: "apps", name: "App Notifications", icon: Bell },
    { id: "fitness", name: "Fitness & Health", icon: Activity },
    { id: "system", name: "System Alerts", icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const categoryNotifications = notifications.filter(
          (n) => n.category === category.id
        );
        const enabledCount = getEnabledCount(category.id);
        const totalCount = getTotalCount(category.id);

        return (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.name}
                </CardTitle>
                <Badge variant="secondary">
                  {enabledCount}/{totalCount} enabled
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryNotifications.map((notification, index) => {
                  const NotifIcon = notification.icon;
                  return (
                    <React.Fragment key={notification.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`rounded-lg p-2 ${
                            notification.enabled 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <NotifIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={notification.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {notification.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={notification.id}
                          checked={notification.enabled}
                          onCheckedChange={() => handleToggle(notification.id)}
                        />
                      </div>
                      {index < categoryNotifications.length - 1 && <Separator />}
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
