import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAdminAction } from "@/lib/admin-audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReleaseLike {
  id: string;
  version: string;
  title: string;
  min_version: string | null;
  channel: "stable" | "beta";
  mandatory: boolean;
  download_url: string | null;
  changelog: string[];
}

/** Edit every field of a published release, live for all clients. */
export const ReleaseEditDialog: React.FC<{ release: ReleaseLike; onSaved: () => void }> = ({
  release,
  onSaved,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(release);
  const [items, setItems] = useState<string[]>(release.changelog.length ? release.changelog : [""]);
  const [saving, setSaving] = useState(false);

  const reset = (next: boolean) => {
    if (next) {
      setForm(release);
      setItems(release.changelog.length ? release.changelog : [""]);
    }
    setOpen(next);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_releases")
      .update({
        version: form.version.trim(),
        title: form.title.trim(),
        min_version: form.min_version?.trim() || null,
        channel: form.channel,
        mandatory: form.mandatory,
        download_url: form.download_url?.trim() || null,
        changelog: items.map((i) => i.trim()).filter(Boolean),
      })
      .eq("id", release.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction("release.update", release.version);
    toast({ title: "Release updated", description: "All clients see the change instantly." });
    setOpen(false);
    onSaved();
  };

  const remove = async () => {
    const { error } = await supabase.from("app_releases").delete().eq("id", release.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction("release.delete", release.version);
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Edit release">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit release</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Version</Label>
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
            <div>
              <Label>Minimum version</Label>
              <Input
                value={form.min_version ?? ""}
                onChange={(e) => setForm({ ...form, min_version: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Channel</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => setForm({ ...form, channel: v as "stable" | "beta" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-between rounded-xl border border-border/40 px-3 py-2">
              <span className="text-sm">Mandatory</span>
              <Switch
                checked={form.mandatory}
                aria-label="Mandatory update"
                onCheckedChange={(v) => setForm({ ...form, mandatory: v })}
              />
            </div>
          </div>
          <div>
            <Label>Download URL</Label>
            <Input
              value={form.download_url ?? ""}
              onChange={(e) => setForm({ ...form, download_url: e.target.value })}
            />
          </div>
          <div>
            <Label>Changelog</Label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      setItems((prev) => prev.map((p, i) => (i === idx ? e.target.value : p)))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove item"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setItems((p) => [...p, ""])}>
                <Plus className="mr-1 h-4 w-4" /> Add item
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={remove}>Delete</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AnnouncementLike {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
}

/** Edit or delete a live banner. */
export const AnnouncementEditDialog: React.FC<{
  announcement: AnnouncementLike;
  onSaved: () => void;
}> = ({ announcement, onSaved }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(announcement);

  const save = async () => {
    const { error } = await supabase
      .from("global_announcements")
      .update({ title: form.title.trim(), message: form.message.trim(), type: form.type })
      .eq("id", announcement.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction("announcement.update", announcement.id);
    toast({ title: "Banner updated" });
    setOpen(false);
    onSaved();
  };

  const remove = async () => {
    const { error } = await supabase.from("global_announcements").delete().eq("id", announcement.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction("announcement.delete", announcement.id);
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setForm(announcement);
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Edit announcement">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit banner</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AnnouncementLike["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={remove}>Delete</Button>
          <Button onClick={save}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
