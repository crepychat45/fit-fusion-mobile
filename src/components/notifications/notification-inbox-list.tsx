import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Download, Dumbbell, Megaphone, Shield, Trash2, Trophy, BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNotificationInbox, type InboxItem } from "@/hooks/use-notification-inbox";

const iconFor = (category: InboxItem["category"]) =>
  ({
    admin: Shield,
    announcement: Megaphone,
    update: Download,
    workout: Dumbbell,
    achievement: Trophy,
    push: BellRing,
    system: Bell,
  })[category] ?? Bell;

export const NotificationInboxList: React.FC = () => {
  const navigate = useNavigate();
  const { items, unreadCount, markRead, markAllRead, clearAll, remove } =
    useNotificationInbox();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">
          Recent Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </h3>
        <Button size="sm" variant="ghost" onClick={markAllRead} disabled={!unreadCount}>
          <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = iconFor(item.category);
            return (
              <Card
                key={item.id}
                className={cn(!item.read && "border-primary/40 bg-primary/5")}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <button
                    type="button"
                    className="text-left min-w-0 flex-1"
                    onClick={() => {
                      markRead(item.id);
                      if (item.link) {
                        if (item.link.startsWith("http"))
                          window.open(item.link, "_blank", "noopener");
                        else navigate(item.link);
                      }
                    }}
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Dismiss notification"
                    onClick={() => remove(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={clearAll}
          disabled={!items.length}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Clear All Notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationInboxList;
