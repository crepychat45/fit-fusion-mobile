import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Cloud, CloudOff, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { runSecurityChecks, type SecurityCheck } from "@/lib/security-checks";

type Profile = { name: string | null; username: string | null; avatar_url: string | null; fitness_level: string | null; fitness_goals: string[] | null };

/** Settings landing: real profile, real security checks, real cloud settings timestamp. */
export function SettingsOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [security, setSecurity] = useState<{ score: number; checks: SecurityCheck[] } | null>(null);
  const [sync, setSync] = useState<{ state: "idle" | "syncing" | "ok" | "error" | "offline" | "signed-out"; at?: string; error?: string }>({ state: "idle" });

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) return setSync({ state: "offline" });
    setSync((s) => ({ ...s, state: "syncing" }));
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return setSync({ state: "signed-out" });
    const { data, error } = await supabase.from("user_settings").select("updated_at").eq("user_id", uid).maybeSingle();
    if (error) return setSync({ state: "error", error: error.message });
    setSync({ state: "ok", at: data?.updated_at ?? undefined });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setEmail(u?.email ?? null);
      if (u) {
        const { data: p } = await supabase.from("profiles").select("name,username,avatar_url,fitness_level,fitness_goals").eq("user_id", u.id).maybeSingle();
        setProfile(p ?? null);
      }
    });
    runSecurityChecks().then(setSecurity).catch(() => setSecurity(null));
    syncNow();
    const on = () => syncNow();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, [syncNow]);

  const name = profile?.name || email?.split("@")[0] || "Guest";
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "No cloud changes yet");
  const failed = security?.checks.filter((c) => !c.passed) ?? [];

  return (
    <div className="grid gap-3 px-4 pt-4 sm:grid-cols-3">
      <section className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback><UserRound className="h-5 w-5" /></AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.username ? `@${profile.username}` : email ?? "Not signed in"}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground truncate">
          {[profile?.fitness_level, profile?.fitness_goals?.[0]].filter(Boolean).join(" · ") || "Add your level and goal"}
        </p>
        <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl" onClick={() => navigate(email ? "/profile" : "/auth")}>
          {email ? "Edit Profile" : "Sign in"}
        </Button>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-4" aria-live="polite">
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Security</p>
          <span className="text-lg font-bold tabular-nums">{security ? `${security.score}/100` : "…"}</span>
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          {(security?.checks ?? []).slice(0, 4).map((c) => (
            <li key={c.id} className="flex items-center gap-1.5">
              {c.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <AlertTriangle className="h-3.5 w-3.5 text-secondary" />}
              <span className={c.passed ? "" : "text-muted-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        {failed.length > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{failed.length} item{failed.length > 1 ? "s" : ""} to improve. Tip: {failed[0].tip}</p>}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-4" aria-live="polite">
        <p className="font-semibold flex items-center gap-2">
          {sync.state === "offline" || sync.state === "error" ? <CloudOff className="h-4 w-4 text-destructive" /> : <Cloud className="h-4 w-4 text-primary" />}
          Cloud Sync
        </p>
        <p className="mt-2 text-sm">
          {{ idle: "Checking…", syncing: "Syncing…", ok: "✓ Connected", error: "Sync error", offline: "You're offline", "signed-out": "Sign in to sync" }[sync.state]}
        </p>
        <p className="text-xs text-muted-foreground">{sync.state === "error" ? sync.error : `Last saved: ${fmt(sync.at)}`}</p>
        <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl" onClick={syncNow} disabled={sync.state === "syncing"}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${sync.state === "syncing" ? "animate-spin" : ""}`} />Sync now
        </Button>
      </section>
    </div>
  );
}
