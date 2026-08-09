import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Fingerprint, KeyRound, Star, Trash2, Pencil, ShieldCheck, ShieldAlert,
  Lock, AlertTriangle, Sparkles, Mail,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  listPasskeys, enrollPasskey, verifyPasskey, renamePasskey,
  setDefaultPasskey, removePasskey, probePasskeySupport, PasskeyError,
  attachSessionToPasskey,
  type PasskeyRecord,
} from "@/lib/passkey-manager";
import { supabase } from "@/integrations/supabase/client";

type Props = { userEmail?: string };

export function PasskeyManagementPanel({ userEmail }: Props) {
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [caps, setCaps] = useState({ supported: false, platformAvailable: false, conditionalMediation: false });
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [lastError, setLastError] = useState<{ title: string; hint: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPasskeys(await listPasskeys());
    } catch (e) {
      handleError(e, "Vault error");
      setPasskeys([]);
    }
  }, [handleError]);

  useEffect(() => {
    probePasskeySupport().then(setCaps);
    refresh();
  }, [refresh]);

  const handleError = (e: unknown, fallbackTitle: string) => {
    const err = e instanceof PasskeyError ? e : null;
    const title = err?.message || fallbackTitle;
    const hint = err?.suggestion || "You can still sign in via email magic link or password.";
    setLastError({ title, hint });
    toast({ title, description: hint, variant: "destructive" });
  };

  const doEnroll = async () => {
    if (!userEmail) {
      toast({ title: "Sign in required", description: "Open Profile while signed in to add a passkey.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLastError(null);
    try {
      const rec = await enrollPasskey({ email: userEmail, name: newLabel || undefined });
      // Attach the current Supabase session so future passkey unlocks can
      // restore it directly (no email round-trip). Tokens are stored inside
      // the AES-GCM encrypted passkey vault.
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.refresh_token && session.access_token) {
          await attachSessionToPasskey(rec.id, {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      } catch { /* non-fatal */ }
      setNewLabel("");
      await refresh();
      toast({ title: "Passkey added 🔐", description: `${rec.name} is ready for fast sign-in.` });
    } catch (e) {
      handleError(e, "Could not add passkey");
    } finally {
      setLoading(false);
    }
  };

  const doTest = async (id: string) => {
    setLastError(null);
    try {
      const rec = await verifyPasskey(id);
      if (rec) {
        await refresh();
        toast({ title: "Verified ✓", description: `${rec.name} works on this device.` });
      }
    } catch (e) { handleError(e, "Verification failed"); }
  };

  const doRename = async (id: string) => {
    if (!editName.trim()) return setEditing(null);
    await renamePasskey(id, editName);
    setEditing(null);
    setEditName("");
    await refresh();
    toast({ title: "Renamed" });
  };

  const doDefault = async (id: string) => {
    await setDefaultPasskey(id);
    await refresh();
    toast({ title: "Default sign-in updated" });
  };

  const doRemove = async (id: string) => {
    await removePasskey(id);
    await refresh();
    toast({ title: "Passkey removed" });
  };

  const fallbackMagicLink = async () => {
    if (!userEmail) return;
    const { error } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth-callback` },
    });
    if (error) toast({ title: "Failed to send link", description: error.message, variant: "destructive" });
    else toast({ title: "Magic link sent", description: `Check ${userEmail}` });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-accent/5 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fingerprint className="h-4 w-4 text-primary" /> Passkey Manager
          <Badge variant="outline" className="ml-auto text-[10px] gap-1">
            <Lock className="h-2.5 w-2.5" /> E2E encrypted
          </Badge>
        </CardTitle>
        <CardDescription>
          Passwordless sign-in with fingerprint, Face ID, or Windows Hello. Vault encrypted with AES-GCM 256 on this device.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Capability status */}
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <StatusPill ok={caps.supported} label="WebAuthn" />
          <StatusPill ok={caps.platformAvailable} label="Biometrics" />
          <StatusPill ok={caps.conditionalMediation} label="Autofill" />
        </div>

        {/* Enroll new */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Add new passkey
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Label (e.g. iPhone 15, Work laptop)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value.slice(0, 40))}
              className="h-9 text-xs"
              disabled={loading}
            />
            <Button size="sm" onClick={doEnroll} disabled={loading || !caps.supported || !caps.platformAvailable || !userEmail}>
              <Fingerprint className="h-3.5 w-3.5 mr-1.5" />
              {loading ? "…" : "Enroll"}
            </Button>
          </div>
          {!caps.platformAvailable && caps.supported && (
            <p className="text-[10px] text-amber-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> No platform authenticator found. Set up Face ID/Fingerprint/Windows Hello first.
            </p>
          )}
        </div>

        {/* Error banner */}
        {lastError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
              <ShieldAlert className="h-3.5 w-3.5" /> {lastError.title}
            </div>
            <p className="text-[11px] text-muted-foreground">{lastError.hint}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fallbackMagicLink} disabled={!userEmail}>
                <Mail className="h-3.5 w-3.5 mr-1.5" /> Send magic link
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setLastError(null)}>Dismiss</Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {passkeys.length === 0 && (
            <div className="text-[11px] text-muted-foreground text-center py-4">
              No passkeys yet. Add one above for one-tap sign-in.
            </div>
          )}
          {passkeys.map((p) => (
            <div key={p.id} className="rounded-xl border border-border/20 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary shrink-0" />
                {editing === p.id ? (
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value.slice(0, 40))}
                    onKeyDown={(e) => e.key === "Enter" && doRename(p.id)}
                    className="h-7 text-xs"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate flex items-center gap-1.5">
                      {p.name}
                      {p.isDefault && (
                        <Badge variant="default" className="h-4 text-[9px] px-1.5 gap-0.5">
                          <Star className="h-2.5 w-2.5" /> Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Added {new Date(p.createdAt).toLocaleDateString()}
                      {p.lastUsedAt && ` • Used ${new Date(p.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editing === p.id ? (
                  <>
                    <Button size="sm" onClick={() => doRename(p.id)} className="h-7 text-[11px]">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-7 text-[11px]">Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => doTest(p.id)}>
                      <ShieldCheck className="h-3 w-3 mr-1" /> Test
                    </Button>
                    <Button
                      size="sm" variant="outline" className="h-7 text-[11px]"
                      onClick={() => { setEditing(p.id); setEditName(p.name); }}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Rename
                    </Button>
                    {!p.isDefault && (
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => doDefault(p.id)}>
                        <Star className="h-3 w-3 mr-1" /> Set default
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-[11px] text-destructive" onClick={() => doRemove(p.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`rounded-lg border px-2 py-1 text-center ${
      ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
         : "border-border/30 bg-muted/20 text-muted-foreground"
    }`}>
      {ok ? "✓" : "×"} {label}
    </div>
  );
}

export default PasskeyManagementPanel;
