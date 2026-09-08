import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, Plus, Save, ToggleLeft, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRemoteConfig } from "@/hooks/use-remote-config";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`liquid-glass rounded-2xl border border-border/40 p-5 ${className}`}>
    {children}
  </div>
);

/* ------------------------- Feature Control Hub ------------------------- */

export function FeatureControlHub() {
  const { switches, refresh } = useRemoteConfig();
  const { toast } = useToast();
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");

  const list = useMemo(
    () => Object.values(switches).sort((a, b) => a.name.localeCompare(b.name)),
    [switches],
  );

  const update = async (
    featureId: string,
    patch: { is_enabled?: boolean; min_app_version?: string | null },
  ) => {
    const { error } = await supabase
      .from("feature_switches")
      .update(patch)
      .eq("feature_id", featureId);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const create = async () => {
    if (!newId.trim()) return;
    const { error } = await supabase.from("feature_switches").insert({
      feature_id: newId.trim(),
      name: newName.trim() || newId.trim(),
      is_enabled: false,
    });
    if (error) {
      toast({ title: "Could not create switch", description: error.message, variant: "destructive" });
      return;
    }
    setNewId("");
    setNewName("");
    refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ToggleLeft className="h-4 w-4" /> Master switches
        </h2>
        <div className="space-y-2">
          {list.length === 0 && <p className="text-sm text-muted-foreground">No switches yet.</p>}
          {list.map((f) => (
            <div
              key={f.feature_id}
              className="rounded-xl border border-border/40 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.description ?? f.feature_id}
                  </p>
                </div>
                <Switch
                  checked={f.is_enabled}
                  aria-label={`Toggle ${f.name}`}
                  onCheckedChange={(v) => update(f.feature_id, { is_enabled: v })}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  className="h-8 text-xs"
                  placeholder="Minimum app version (optional)"
                  defaultValue={f.min_app_version ?? ""}
                  onBlur={(e) =>
                    e.target.value !== (f.min_app_version ?? "") &&
                    update(f.feature_id, { min_app_version: e.target.value.trim() || null })
                  }
                />
                {f.allowed_tiers.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">New feature switch</h2>
        <div className="space-y-3">
          <Input placeholder="feature_id" value={newId} onChange={(e) => setNewId(e.target.value)} />
          <Input
            placeholder="Display name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={create}>
            <Plus className="mr-1 h-4 w-4" /> Create switch
          </Button>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------ Maintenance Mode Switch ---------------------- */

export function MaintenanceSwitch() {
  const { switches, getContent, refresh } = useRemoteConfig();
  const { userId } = useAdmin();
  const { toast } = useToast();
  const notice = getContent<{ message?: string; eta?: string }>("maintenance.notice", {});
  const [message, setMessage] = useState(notice.message ?? "");
  const [eta, setEta] = useState(notice.eta ?? "");
  const active = switches.maintenance_mode?.is_enabled ?? false;

  useEffect(() => {
    setMessage(notice.message ?? "");
    setEta(notice.eta ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice.message, notice.eta]);

  const saveNotice = async () => {
    const { error } = await supabase.from("site_content").upsert({
      key: "maintenance.notice",
      section: "system",
      content: { message, eta },
      last_updated_by: userId,
    });
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Maintenance message saved" });
    refresh();
  };

  const toggle = async (v: boolean) => {
    const { error } = await supabase
      .from("feature_switches")
      .upsert({ feature_id: "maintenance_mode", name: "Maintenance Mode", is_enabled: v });
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: v ? "Maintenance mode ON" : "Maintenance mode OFF" });
      refresh();
    }
  };

  return (
    <Panel>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Wrench className="h-4 w-4" /> Maintenance mode
      </h2>
      <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
        <div>
          <p className="text-sm font-medium">Put the app into maintenance</p>
          <p className="text-xs text-muted-foreground">
            Everyone except administrators sees the maintenance screen.
          </p>
        </div>
        <Switch checked={active} onCheckedChange={toggle} aria-label="Toggle maintenance mode" />
      </div>
      {active && (
        <p className="mt-3 flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" /> The public app is currently offline.
        </p>
      )}
      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="mm">Message</Label>
          <Textarea id="mm" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="eta">ETA</Label>
          <Input id="eta" placeholder="Back at 18:00 IST" value={eta} onChange={(e) => setEta(e.target.value)} />
        </div>
        <Button onClick={saveNotice}>
          <Save className="mr-1 h-4 w-4" /> Save message
        </Button>
      </div>
    </Panel>
  );
}

/* -------------------------- Content CMS Manager ------------------------ */

export function ContentManager() {
  const { content, refresh } = useRemoteConfig();
  const { userId } = useAdmin();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newSection, setNewSection] = useState("general");

  const rows = useMemo(
    () => Object.values(content).sort((a, b) => a.key.localeCompare(b.key)),
    [content],
  );

  const save = async (key: string, section: string) => {
    const raw = drafts[key];
    if (raw === undefined) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      toast({ title: "Invalid format", description: "Content must be valid JSON.", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, section, content: parsed, last_updated_by: userId });
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Content published", description: `${key} is live for all users.` });
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      refresh();
    }
  };

  const create = async () => {
    if (!newKey.trim()) return;
    const { error } = await supabase.from("site_content").insert({
      key: newKey.trim(),
      section: newSection.trim() || "general",
      content: {},
      last_updated_by: userId,
    });
    if (error) {
      toast({ title: "Could not create", description: error.message, variant: "destructive" });
      return;
    }
    setNewKey("");
    refresh();
  };

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Plus className="h-4 w-4" /> New content block
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="home.hero" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Input placeholder="section" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
          <Button onClick={create}>Create block</Button>
        </div>
      </Panel>

      {rows.map((row) => (
        <Panel key={row.key}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{row.key}</p>
              <Badge variant="secondary">{row.section}</Badge>
            </div>
            <Button size="sm" onClick={() => save(row.key, row.section)}>
              <Save className="mr-1 h-4 w-4" /> Publish
            </Button>
          </div>
          <Textarea
            rows={6}
            className="font-mono text-xs"
            value={drafts[row.key] ?? JSON.stringify(row.content, null, 2)}
            onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Updated {new Date(row.updated_at).toLocaleString()}
          </p>
        </Panel>
      ))}
    </div>
  );
}
