import React, { useEffect, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useAppReleases } from "@/hooks/use-admin-sync";
import { APP_VERSION } from "@/lib/app-version";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const DISMISS_KEY = "fitfusion-remote-release-dismissed";

/** Shows the update drawer as soon as an admin publishes a newer release. */
export function RemoteUpdateDrawer() {
  const { user } = useEnhancedAuth();
  const [beta, setBeta] = useState(false);
  const { latest } = useAppReleases(beta);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("beta_opt_in")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setBeta(Boolean(data?.beta_opt_in));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!latest) return;
    const clean = latest.version.replace(/^v/i, "");
    if (clean === APP_VERSION) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!latest.mandatory && dismissed === latest.id) return;
    setOpen(true);
  }, [latest]);

  if (!latest) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, latest.id);
    setOpen(false);
  };

  const install = () => {
    if (latest.download_url) {
      window.open(latest.download_url, "_blank", "noopener,noreferrer");
      return;
    }
    localStorage.setItem(DISMISS_KEY, latest.id);
    window.location.reload();
  };

  return (
    <Drawer open={open} onOpenChange={(v) => (latest.mandatory ? setOpen(true) : setOpen(v))}>
      <DrawerContent className="liquid-glass">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> {latest.title || `Update ${latest.version}`}
            <Badge variant="secondary">{latest.channel}</Badge>
            {latest.mandatory && <Badge variant="destructive">required</Badge>}
          </DrawerTitle>
          <DrawerDescription>Version {latest.version} is available.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {latest.changelog.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button className="flex-1" onClick={install}>
            <Download className="mr-2 h-4 w-4" /> Install now
          </Button>
          {!latest.mandatory && (
            <Button variant="outline" onClick={dismiss}>
              Later
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
