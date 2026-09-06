import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  Flag,
  Gauge,
  Megaphone,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useAdminSync } from "@/hooks/use-admin-sync";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_VERSION } from "@/lib/app-version";
import { getSystemDiagnostics, type SystemDiagnostics } from "@/utils/system-diagnostics";

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`liquid-glass rounded-2xl border border-border/40 p-5 ${className}`}>
    {children}
  </div>
);

/* ------------------------------ Releases ------------------------------ */

function ReleasesTab() {
  const { releases, refresh } = useAdminSync();
  const { userId } = useAdmin();
  const { toast } = useToast();
  const [version, setVersion] = useState("");
  const [minVersion, setMinVersion] = useState("");
  const [channel, setChannel] = useState<"stable" | "beta">("stable");
  const [title, setTitle] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    if (!version.trim()) {
      toast({ title: "Version required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("app_releases").insert({
      version: version.trim(),
      min_version: minVersion.trim() || null,
      channel,
      title: title.trim() || `Release ${version.trim()}`,
      changelog: items.map((i) => i.trim()).filter(Boolean),
      mandatory,
      download_url: downloadUrl.trim() || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not publish", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Release published", description: `${version} pushed to ${channel} channel.` });
    setVersion("");
    setMinVersion("");
    setTitle("");
    setDownloadUrl("");
    setItems([""]);
    setMandatory(false);
    refresh();
  };

  const revoke = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("app_releases")
      .update({ is_active: !isActive })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isActive ? "Release revoked" : "Release restored" });
    refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Rocket className="h-4 w-4" /> Publish a release
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ver">Version</Label>
              <Input id="ver" placeholder="v8.1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="minver">Minimum version</Label>
              <Input
                id="minver"
                placeholder={`v${APP_VERSION}`}
                value={minVersion}
                onChange={(e) => setMinVersion(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Crystal Glass refresh" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as "stable" | "beta")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable — everyone</SelectItem>
                  <SelectItem value="beta">Beta — opted-in testers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">Download URL (optional)</Label>
              <Input id="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Mandatory update</p>
              <p className="text-xs text-muted-foreground">Forces clients to install before continuing.</p>
            </div>
            <Switch checked={mandatory} onCheckedChange={setMandatory} />
          </div>

          <div className="space-y-2">
            <Label>Changelog</Label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={item}
                  placeholder="What changed?"
                  onChange={(e) =>
                    setItems((prev) => prev.map((p, i) => (i === idx ? e.target.value : p)))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove changelog item"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, ""])}>
              <Plus className="mr-1 h-4 w-4" /> Add item
            </Button>
          </div>

          <Button className="w-full" onClick={publish} disabled={saving}>
            {saving ? "Publishing…" : "Publish release"}
          </Button>
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Releases</h2>
        <div className="space-y-3">
          {releases.length === 0 && (
            <p className="text-sm text-muted-foreground">No releases published yet.</p>
          )}
          {releases.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {r.version} · {r.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="secondary">{r.channel}</Badge>
                    {r.mandatory && <Badge variant="destructive">mandatory</Badge>}
                    <Badge variant={r.is_active ? "default" : "outline"}>
                      {r.is_active ? "active" : "revoked"}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant={r.is_active ? "destructive" : "outline"} onClick={() => revoke(r.id, r.is_active)}>
                  {r.is_active ? "Revoke" : "Restore"}
                </Button>
              </div>
              {r.changelog.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {r.changelog.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------- Feature flags ---------------------------- */

function FlagsTab() {
  const { flags, refresh } = useAdminSync();
  const { toast } = useToast();
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const toggle = async (key: string, next: boolean) => {
    const { error } = await supabase.from("feature_flags").update({ is_enabled: next }).eq("key", key);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const create = async () => {
    if (!newKey.trim()) return;
    const { error } = await supabase
      .from("feature_flags")
      .insert({ key: newKey.trim(), description: newDesc.trim() || null, is_enabled: false });
    if (error) {
      toast({ title: "Could not create flag", description: error.message, variant: "destructive" });
      return;
    }
    setNewKey("");
    setNewDesc("");
    refresh();
  };

  const list = Object.values(flags).sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Flag className="h-4 w-4" /> Live modules
        </h2>
        <div className="space-y-2">
          {list.map((f) => (
            <div key={f.key} className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{f.key}</p>
                <p className="truncate text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch checked={f.is_enabled} onCheckedChange={(v) => toggle(f.key, v)} aria-label={`Toggle ${f.key}`} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-4 text-lg font-semibold">New flag</h2>
        <div className="space-y-3">
          <Input placeholder="flag_key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <Button onClick={create}>Create flag</Button>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------- Users -------------------------------- */

interface AdminUserRow {
  user_id: string;
  name: string | null;
  username: string | null;
  created_at: string;
  beta_opt_in: boolean;
  is_disabled: boolean;
  isAdmin: boolean;
}

function UsersTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id,name,username,created_at,beta_opt_in,is_disabled")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setRows(
      (profiles ?? []).map((p) => ({
        user_id: p.user_id,
        name: p.name,
        username: p.username,
        created_at: p.created_at,
        beta_opt_in: Boolean(p.beta_opt_in),
        is_disabled: Boolean(p.is_disabled),
        isAdmin: adminIds.has(p.user_id),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (userId: string, patch: Record<string, boolean>) => {
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else load();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.username ?? "").toLowerCase().includes(q) ||
        r.user_id.includes(q),
    );
  }, [rows, query]);

  const betaCount = rows.filter((r) => r.beta_opt_in).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel><p className="text-xs text-muted-foreground">Total users</p><p className="text-2xl font-bold">{rows.length}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Beta testers</p><p className="text-2xl font-bold">{betaCount}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Admins</p><p className="text-2xl font-bold">{rows.filter((r) => r.isAdmin).length}</p></Panel>
      </div>
      <Panel>
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, username or id" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">User</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Beta</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.user_id} className="border-t border-border/40">
                    <td className="py-2">
                      <p className="font-medium">{r.name ?? "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">@{r.username ?? r.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>{r.isAdmin ? <Badge>admin</Badge> : <Badge variant="outline">user</Badge>}</td>
                    <td>
                      <Switch
                        checked={r.beta_opt_in}
                        aria-label="Toggle beta enrollment"
                        onCheckedChange={(v) => update(r.user_id, { beta_opt_in: v })}
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={r.is_disabled ? "outline" : "ghost"}
                        onClick={() => update(r.user_id, { is_disabled: !r.is_disabled })}
                      >
                        {r.is_disabled ? "Disabled" : "Active"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* --------------------------- Announcements ---------------------------- */

function AnnouncementsPanel() {
  const { announcements, refresh } = useAdminSync();
  const { userId } = useAdmin();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "critical">("info");

  const publish = async () => {
    if (!title.trim() || !message.trim()) return;
    const { error } = await supabase
      .from("global_announcements")
      .insert({ title: title.trim(), message: message.trim(), type, created_by: userId });
    if (error) {
      toast({ title: "Could not publish", description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setMessage("");
    toast({ title: "Announcement live" });
    refresh();
  };

  const setActive = async (id: string, active: boolean) => {
    await supabase.from("global_announcements").update({ active }).eq("id", id);
    refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="h-4 w-4" /> Broadcast
        </h2>
        <div className="space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Message shown to every user" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={publish}>Publish banner</Button>
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Recent broadcasts</h2>
        <div className="space-y-2">
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">Nothing published yet.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-2 rounded-xl border border-border/40 p-3">
              <div className="min-w-0">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.message}</p>
                <Badge variant="secondary" className="mt-1">{a.type}</Badge>
              </div>
              <Switch checked={a.active} aria-label="Toggle announcement" onCheckedChange={(v) => setActive(a.id, v)} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------- Diagnostics ---------------------------- */

function DiagnosticsTab() {
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);
  useEffect(() => {
    getSystemDiagnostics().then(setDiag).catch(() => setDiag(null));
  }, []);

  return (
    <Panel>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Gauge className="h-4 w-4" /> System diagnostics
      </h2>
      <pre className="max-h-[60vh] overflow-auto rounded-xl bg-muted/40 p-4 text-xs">
        {diag ? JSON.stringify(diag, null, 2) : "Collecting…"}
      </pre>
    </Panel>
  );
}

/* -------------------------------- Page -------------------------------- */

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { releases, flags, announcements } = useAdminSync();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/50 to-accent/40" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-3 px-4 pb-6 pt-10 text-primary-foreground"
        >
          <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-primary-foreground/10" aria-label="Go back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <ShieldCheck className="h-5 w-5" />
          <h1 className="text-xl font-bold">Admin Control Center</h1>
          <Badge className="ml-auto bg-primary-foreground/20 text-primary-foreground">v{APP_VERSION}</Badge>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-4">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Panel>
                <div className="flex items-center gap-2 text-muted-foreground"><Rocket className="h-4 w-4" /><span className="text-xs">Active releases</span></div>
                <p className="text-2xl font-bold">{releases.filter((r) => r.is_active).length}</p>
              </Panel>
              <Panel>
                <div className="flex items-center gap-2 text-muted-foreground"><Flag className="h-4 w-4" /><span className="text-xs">Enabled flags</span></div>
                <p className="text-2xl font-bold">{Object.values(flags).filter((f) => f.is_enabled).length}</p>
              </Panel>
              <Panel>
                <div className="flex items-center gap-2 text-muted-foreground"><Activity className="h-4 w-4" /><span className="text-xs">Live announcements</span></div>
                <p className="text-2xl font-bold">{announcements.filter((a) => a.active).length}</p>
              </Panel>
            </div>
            <AnnouncementsPanel />
          </TabsContent>

          <TabsContent value="releases" className="mt-4"><ReleasesTab /></TabsContent>
          <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
          <TabsContent value="flags" className="mt-4"><FlagsTab /></TabsContent>
          <TabsContent value="diagnostics" className="mt-4"><DiagnosticsTab /></TabsContent>
        </Tabs>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> Changes broadcast instantly to every signed-in client.
        </p>
      </div>
    </div>
  );
};

export default AdminPage;
