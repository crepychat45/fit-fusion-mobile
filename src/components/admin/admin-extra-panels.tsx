import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CreditCard,
  History,
  MessageSquare,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { logAdminAction } from "@/lib/admin-audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`liquid-glass rounded-2xl border border-border/40 p-5 ${className}`}>
    {children}
  </div>
);

/* --------------------------- Push broadcast --------------------------- */

interface PushRow {
  id: string;
  title: string;
  body: string;
  link: string | null;
  audience: string;
  active: boolean;
  sent_at: string;
}

export function PushCenter() {
  const { toast } = useToast();
  const { userId } = useAdmin();
  const [rows, setRows] = useState<PushRow[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [devices, setDevices] = useState(0);

  const load = useCallback(async () => {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("admin_notifications")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(40),
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
    ]);
    setRows((data ?? []) as PushRow[]);
    setDevices(count ?? 0);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("admin_notifications").insert({
      title: title.trim(),
      body: body.trim(),
      link: link.trim() || null,
      audience,
      created_by: userId,
    });
    setSending(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction("push.send", title.trim(), { audience });
    toast({ title: "Notification delivered", description: "Every open app received it live." });
    setTitle("");
    setBody("");
    setLink("");
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("admin_notifications").update({ active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("admin_notifications").delete().eq("id", id);
    await logAdminAction("push.delete", id);
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-4 w-4" /> Push a notification
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Delivered instantly to every open app. {devices} device(s) registered for background push.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ptitle">Title</Label>
            <Input id="ptitle" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pbody">Message</Label>
            <Textarea id="pbody" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="plink">Open link (optional)</Label>
              <Input id="plink" placeholder="/workouts" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="beta">Beta testers</SelectItem>
                  <SelectItem value="admins">Admins only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={send} disabled={sending}>
            <Send className="mr-2 h-4 w-4" /> {sending ? "Sending…" : "Send notification"}
          </Button>
        </div>
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sent notifications</h2>
          <Button size="sm" variant="ghost" onClick={load} aria-label="Reload">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.body}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="secondary">{r.audience}</Badge>
                    <Badge variant="outline">{new Date(r.sent_at).toLocaleString()}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={r.active}
                    aria-label="Toggle notification"
                    onCheckedChange={(v) => toggle(r.id, v)}
                  />
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------- Moderation ----------------------------- */

interface ModPost {
  id: string;
  user_id: string;
  content: string;
  likes_count: number | null;
  created_at: string;
}

export function ModerationTab() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ModPost[]>([]);
  const [comments, setComments] = useState<
    { id: string; post_id: string; content: string; created_at: string }[]
  >([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from("posts").select("id,user_id,content,likes_count,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("post_comments").select("id,post_id,content,created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    setPosts((p.data ?? []) as ModPost[]);
    setComments(c.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removePost = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      await logAdminAction("post.delete", id);
      toast({ title: "Post removed" });
      load();
    }
  };

  const removeComment = async (id: string) => {
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      await logAdminAction("comment.delete", id);
      load();
    }
  };

  const filtered = posts.filter((p) =>
    p.content.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-4 w-4" /> Community posts ({posts.length})
        </h2>
        <Input
          className="mb-3"
          placeholder="Search posts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-2 rounded-xl border border-border/40 p-3">
              <div className="min-w-0">
                <p className="text-sm">{p.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()} · {p.likes_count ?? 0} likes
                </p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Delete post" onClick={() => removePost(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No posts found.</p>}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-3 text-lg font-semibold">Latest comments ({comments.length})</h2>
        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 rounded-xl border border-border/40 p-3">
              <div className="min-w-0">
                <p className="text-sm">{c.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Delete comment" onClick={() => removeComment(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------- Subscriptions --------------------------- */

interface SubRow {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  price_inr: number;
  expires_at: string;
  auto_renew: boolean;
}

export function SubscriptionsTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SubRow[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("user_subscriptions")
      .select("id,user_id,plan_name,status,billing_cycle,price_inr,expires_at,auto_renew")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as SubRow[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, values: Partial<SubRow>) => {
    const { error } = await supabase.from("user_subscriptions").update(values).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      await logAdminAction("subscription.update", id, values as Record<string, unknown>);
      load();
    }
  };

  const extend = (row: SubRow, days: number) => {
    const base = new Date(row.expires_at).getTime();
    const from = Number.isFinite(base) && base > Date.now() ? base : Date.now();
    patch(row.id, { expires_at: new Date(from + days * 86_400_000).toISOString() });
  };

  const active = rows.filter((r) => r.status === "active");
  const revenue = active.reduce((sum, r) => sum + Number(r.price_inr || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel><p className="text-xs text-muted-foreground">Subscriptions</p><p className="text-2xl font-bold">{rows.length}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold">{active.length}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Active plan value</p><p className="text-2xl font-bold">₹{revenue.toLocaleString("en-IN")}</p></Panel>
      </div>
      <Panel>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="h-4 w-4" /> Premium members
        </h2>
        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.plan_name} · ₹{r.price_inr}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.user_id.slice(0, 8)} · {r.billing_cycle} · expires {new Date(r.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => patch(r.id, { status: v })}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                      <SelectItem value="expired">expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => extend(r, 30)}>+30 days</Button>
                  <Button size="sm" variant="ghost" onClick={() => extend(r, 365)}>+1 year</Button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No subscriptions yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------ Analytics ----------------------------- */

export function AnalyticsTab() {
  const [events, setEvents] = useState<{ event_name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analytics_events")
      .select("event_name,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const top = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => counts.set(e.event_name, (counts.get(e.event_name) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [events]);

  const last24 = events.filter(
    (e) => Date.now() - new Date(e.created_at).getTime() < 86_400_000,
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel><p className="text-xs text-muted-foreground">Events (recent)</p><p className="text-2xl font-bold">{events.length}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Last 24 hours</p><p className="text-2xl font-bold">{last24}</p></Panel>
        <Panel><p className="text-xs text-muted-foreground">Distinct events</p><p className="text-2xl font-bold">{top.length}</p></Panel>
      </div>
      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-4 w-4" /> Most frequent events
          </h2>
          <Button size="sm" variant="ghost" onClick={load} aria-label="Reload analytics">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-2">
            {top.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (count / top[0][1]) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {top.length === 0 && <p className="text-sm text-muted-foreground">No events recorded.</p>}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------ Audit log ----------------------------- */

export function AuditLogTab() {
  const [rows, setRows] = useState<
    { id: string; action: string; target: string | null; created_at: string; details: unknown }[]
  >([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("admin_audit_log")
      .select("id,action,target,created_at,details")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="h-4 w-4" /> Admin activity
        </h2>
        <Button size="sm" variant="ghost" onClick={load} aria-label="Reload audit log">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-[60vh] space-y-2 overflow-auto">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-border/40 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.action}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            {r.target && <p className="truncate text-xs text-muted-foreground">{r.target}</p>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
