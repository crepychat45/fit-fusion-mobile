import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Real count of signed-in users with the app open, via a shared presence channel. */
export function useOnlinePresence() {
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid || cancelled) return;
      channel = supabase.channel("fitfusion-presence", { config: { presence: { key: uid } } });
      channel
        .on("presence", { event: "sync" }, () => {
          setOnline(Object.keys(channel!.presenceState()));
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") await channel!.track({ at: Date.now() });
        });
    });
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { onlineCount: online.length, onlineIds: online };
}
