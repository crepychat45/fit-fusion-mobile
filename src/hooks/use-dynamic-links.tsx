import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DynamicLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  /** Route prefixes this link shows on; empty/"*" means every page. */
  pages?: string[];
  external?: boolean;
}

export const DYNAMIC_LINKS_KEY = "dynamic_links";

const parse = (value: unknown): DynamicLink[] => {
  const raw = Array.isArray(value)
    ? value
    : Array.isArray((value as { links?: unknown })?.links)
      ? (value as { links: unknown[] }).links
      : [];
  return raw
    .map((item, i) => {
      const l = item as Partial<DynamicLink>;
      if (!l || typeof l.label !== "string" || typeof l.url !== "string") return null;
      return {
        id: String(l.id ?? `link-${i}`),
        label: l.label,
        url: l.url,
        icon: typeof l.icon === "string" ? l.icon : undefined,
        pages: Array.isArray(l.pages) ? l.pages.map(String) : ["*"],
        external: /^https?:\/\//i.test(l.url),
      } as DynamicLink;
    })
    .filter((l): l is DynamicLink => l !== null);
};

/**
 * Admin-managed quick links shown across the app.
 * Stored in site_content under the `dynamic_links` key and synced live.
 */
export function useDynamicLinks(currentPath?: string) {
  const [links, setLinks] = useState<DynamicLink[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", DYNAMIC_LINKS_KEY)
      .maybeSingle();
    setLinks(parse(data?.content));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel(`dynamic-links-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: `key=eq.${DYNAMIC_LINKS_KEY}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const visible = links.filter((l) => {
    const pages = l.pages?.length ? l.pages : ["*"];
    if (pages.includes("*")) return true;
    if (!currentPath) return true;
    return pages.some((p) => currentPath === p || currentPath.startsWith(p));
  });

  return { links: visible, allLinks: links, loading, refresh };
}
