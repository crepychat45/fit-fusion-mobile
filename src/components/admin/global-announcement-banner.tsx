import React, { useState } from "react";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { useAdminSync } from "@/hooks/use-admin-sync";
import { cn } from "@/lib/utils";

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
} as const;

const STYLES = {
  info: "border-primary/30 text-foreground",
  warning: "border-amber-500/40 text-foreground",
  critical: "border-destructive/50 text-foreground",
} as const;

/** Renders active global announcements at the top of every screen. */
export function GlobalAnnouncementBanner() {
  const { announcements } = useAdminSync();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = announcements.filter((a) => a.active && !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 space-y-1 p-2">
      {visible.map((a) => {
        const Icon = ICONS[a.type] ?? Info;
        return (
          <div
            key={a.id}
            role="status"
            className={cn(
              "liquid-glass flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm shadow-sm",
              STYLES[a.type],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{a.title}</p>
              <p className="text-muted-foreground">{a.message}</p>
            </div>
            <button
              aria-label="Dismiss announcement"
              onClick={() => setDismissed((d) => [...d, a.id])}
              className="rounded-full p-1 hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
