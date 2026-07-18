import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Download, ExternalLink, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const REPO = "crepychat45/fit-fusion-mobile";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  updated_at: string;
}

interface LatestRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  assets: ReleaseAsset[];
}

export function AdminAabDownloadCard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) setIsAdmin(false); return; }
      const { data, error } = await (supabase.rpc as any)("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!mounted) return;
      setIsAdmin(!error && data === true);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setRelease(json))
      .catch(() => setRelease(null))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isAdmin === null || isAdmin === false) return null;

  const aab = release?.assets.find((a) => a.name.endsWith(".aab"));
  const apk = release?.assets.find((a) => a.name.endsWith(".apk"));

  const handleAab = () => {
    if (!aab) {
      toast.error("No AAB found in latest release");
      return;
    }
    toast.success(`Downloading ${aab.name}`, { description: release?.tag_name });
    window.open(aab.browser_download_url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
          <Package className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold">Play Store Build (AAB)</h3>
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-300">
              <ShieldAlert className="h-3 w-3" /> Admin only
            </Badge>
            {release?.tag_name && (
              <Badge variant="secondary">{release.tag_name}</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest signed Android App Bundle from GitHub Releases — ready to upload to Google Play Console.
          </p>
        </div>
      </div>

      <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
        <Button onClick={handleAab} disabled={loading || !aab} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {loading ? "Fetching release…" : aab ? "Download AAB" : "AAB unavailable"}
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={() => window.open(release?.html_url || RELEASES_PAGE, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4" />
          View Release
        </Button>
      </div>

      {release && (
        <div className="relative mt-3 text-xs text-muted-foreground space-y-1">
          <div>Published: {new Date(release.published_at).toLocaleString()}</div>
          {apk && <div>APK: {(apk.size / 1024 / 1024).toFixed(2)} MB</div>}
          {aab && <div>AAB: {(aab.size / 1024 / 1024).toFixed(2)} MB</div>}
        </div>
      )}
    </motion.div>
  );
}

export default AdminAabDownloadCard;
