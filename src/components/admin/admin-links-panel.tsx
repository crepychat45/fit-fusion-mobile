import React, { useEffect, useState } from "react";
import { Link2, Plus, Save, Trash2, Rocket, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { useAdminSync } from "@/hooks/use-admin-sync";
import { useDynamicLinks, DYNAMIC_LINKS_KEY, normalizeSafeLink, type DynamicLink } from "@/hooks/use-dynamic-links";
import { APP_VERSION } from "@/lib/app-version";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="liquid-glass rounded-2xl border border-border/40 p-5">{children}</div>
);

const PAGE_OPTIONS = [
  { value: "*", label: "All pages" },
  { value: "/", label: "Home" },
  { value: "/workouts", label: "Workouts" },
  { value: "/progress", label: "Progress" },
  { value: "/community", label: "Community" },
  { value: "/profile", label: "Profile" },
  { value: "/settings", label: "Settings" },
  { value: "/subscription", label: "Premium" },
];

/** Manage the dynamic quick links that appear across every page. */
export function DynamicLinksManager() {
  const { toast } = useToast();
  const { userId } = useAdmin();
  const { allLinks, refresh } = useDynamicLinks();
  const [draft, setDraft] = useState<DynamicLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(allLinks);
  }, [allLinks]);

  const update = (id: string, patch: Partial<DynamicLink>) =>
    setDraft((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const add = () =>
    setDraft((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, label: "", url: "", pages: ["*"] },
    ]);

  const save = async () => {
    const invalid = draft.find((link) => link.label.trim() && link.url.trim() && !normalizeSafeLink(link.url));
    if (invalid) {
      toast({ title: "Unsafe destination blocked", description: "Use an internal /route or a secure https:// URL.", variant: "destructive" });
      return;
    }
    const clean = draft
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l) => ({
        id: l.id,
        label: l.label.trim(),
         url: normalizeSafeLink(l.url) ?? "",
        pages: l.pages?.length ? l.pages : ["*"],
      }));
    setSaving(true);
    const { error } = await supabase.from("site_content").upsert(
      {
        key: DYNAMIC_LINKS_KEY,
        section: "navigation",
        content: clean,
        last_updated_by: userId,
      },
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save links", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Links published", description: `${clean.length} quick links are live for all users.` });
    refresh();
  };

  return (
    <Panel>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <Link2 className="h-4 w-4" /> Dynamic links
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Shown in the More menu on every page. Internal routes start with “/”, external links with “https://”.
      </p>

      <div className="space-y-3">
        {draft.map((link) => (
          <div key={link.id} className="rounded-xl border border-border/40 p-3 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={link.label}
                  placeholder="Summer Challenge"
                  onChange={(e) => update(link.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Destination</Label>
                <Input
                  value={link.url}
                  placeholder="/challenges or https://…"
                  onChange={(e) => update(link.id, { url: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PAGE_OPTIONS.map((opt) => {
                const active = (link.pages ?? ["*"]).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const current = link.pages ?? ["*"];
                      const next = active
                        ? current.filter((p) => p !== opt.value)
                        : [...current.filter((p) => p !== "*" || opt.value === "*"), opt.value];
                      update(link.id, { pages: next.length ? next : ["*"] });
                    }}
                  >
                    <Badge variant={active ? "default" : "outline"} className="cursor-pointer">
                      {opt.label}
                    </Badge>
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                aria-label="Remove link"
                onClick={() => setDraft((prev) => prev.filter((l) => l.id !== link.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {draft.length === 0 && (
          <p className="text-sm text-muted-foreground">No dynamic links yet.</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="mr-1 h-4 w-4" /> Add link
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1 h-4 w-4" /> {saving ? "Publishing…" : "Publish links"}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/** One-tap publishing of an update that every client sees immediately. */
export function QuickPushUpdate() {
  const { toast } = useToast();
  const { userId } = useAdmin();
  const { releases, refresh } = useAdminSync();
  const [version, setVersion] = useState("");
  const [note, setNote] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [busy, setBusy] = useState(false);

  const bump = () => {
    const base = releases[0]?.version?.replace(/^v/i, "") || APP_VERSION;
    const parts = base.split(".").map((n) => parseInt(n, 10) || 0);
    parts[2] = (parts[2] ?? 0) + 1;
    setVersion(parts.join("."));
  };

  const push = async () => {
    const normalized = version.trim().replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(normalized)) {
      toast({ title: "Use a valid version", description: "Example: 8.1.0", variant: "destructive" });
      return;
    }
    if (releases.some((release) => release.version.replace(/^v/i, "") === normalized)) {
      toast({ title: "Version already exists", description: `v${normalized} is already in release history.`, variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("app_releases").insert({
       version: normalized,
      channel: "stable",
       title: `FitxFusion ${normalized}`,
      changelog: note
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      mandatory,
      is_active: true,
      published: true,
      created_by: userId,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Push failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: `v${version} pushed to all users`,
      description: "The update popup and Settings → Updates now show this version.",
    });
    setVersion("");
    setNote("");
    setMandatory(false);
    refresh();
  };

  return (
    <Panel>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <Rocket className="h-4 w-4" /> Quick push update
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Publishes instantly: every signed-in user gets the update popup and the download in Settings → Updates.
      </p>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="8.1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
          <Button variant="outline" onClick={bump}>
            Bump
          </Button>
        </div>
        <div>
          <Label className="text-xs">Changelog (one item per line)</Label>
          <textarea
            className="mt-1 w-full rounded-md border border-border/50 bg-background/50 p-2 text-sm"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={"Faster workout player\nFixed sync issues"}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Required update</p>
            <p className="text-xs text-muted-foreground">Users must install before continuing.</p>
          </div>
          <Switch checked={mandatory} onCheckedChange={setMandatory} />
        </div>
        <Button className="w-full" onClick={push} disabled={busy}>
          <Send className="mr-2 h-4 w-4" /> {busy ? "Pushing…" : "Push to all users"}
        </Button>
      </div>
    </Panel>
  );
}
