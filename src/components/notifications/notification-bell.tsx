import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Megaphone, RefreshCw, Trash2, Shield, Download, Dumbbell, Trophy, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNotificationInbox, type InboxItem } from "@/hooks/use-notification-inbox";
import { formatDistanceToNow } from "date-fns";

const iconFor = (category: InboxItem["category"]) => {
  switch (category) {
    case "admin":
      return Shield;
    case "announcement":
      return Megaphone;
    case "update":
      return Download;
    case "workout":
      return Dumbbell;
    case "achievement":
      return Trophy;
    case "push":
      return BellRing;
    default:
      return Bell;
  }
};

const labelFor = (category: InboxItem["category"]) =>
  ({
    admin: "Admin",
    announcement: "Announcement",
    update: "Update",
    push: "Push",
    workout: "Workout",
    achievement: "Achievement",
    system: "System",
  })[category] ?? "Alert";

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  iconClassName,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markRead, markAllRead, clearAll, refresh, loading } =
    useNotificationInbox();

  const openItem = (item: InboxItem) => {
    markRead(item.id);
    if (item.link) {
      setOpen(false);
      if (item.link.startsWith("http")) window.open(item.link, "_blank", "noopener");
      else navigate(item.link);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className={cn("relative", className)}
        >
          <Bell className={cn("h-5 w-5", iconClassName)} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
          </SheetTitle>
          <SheetDescription>
            Admin broadcasts, announcements, app updates and push alerts.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 px-5 pb-3">
          <Button size="sm" variant="outline" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={!unreadCount}>
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll} disabled={!items.length}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        </div>

        <ScrollArea className="flex-1 px-5 pb-6">
          {items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              You're all caught up.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = iconFor(item.category);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-colors flex gap-3 hover:bg-accent/50",
                      !item.read && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <span className="mt-0.5 shrink-0 rounded-lg bg-primary/10 text-primary p-2">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.title}</span>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </span>
                      <span className="block text-sm text-muted-foreground line-clamp-3">
                        {item.body}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0">
                          {labelFor(item.category)}
                        </Badge>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            Notification settings
          </Button>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationBell;
