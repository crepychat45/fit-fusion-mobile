import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle, Trophy, UserPlus, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "like" | "comment" | "achievement" | "follow" | "challenge";
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    user: { name: "Jordan Lee", initials: "JL" },
    content: "liked your workout post",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
  },
  {
    id: "n2",
    type: "comment",
    user: { name: "Sam Rivera", initials: "SR" },
    content: "commented on your post: 'Great progress!'",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: false,
  },
  {
    id: "n3",
    type: "achievement",
    content: "You earned the '7-Day Streak' achievement!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: "n4",
    type: "challenge",
    content: "New challenge available: 30-Day Workout Streak",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: "n5",
    type: "follow",
    user: { name: "Alex Thompson", initials: "AT" },
    content: "started following you",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "challenge":
        return <Target className="h-4 w-4 text-purple-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                  !notification.isRead && "bg-primary/5"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                {notification.user ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                      {notification.user.initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    {notification.user && (
                      <span className="font-semibold">{notification.user.name} </span>
                    )}
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
