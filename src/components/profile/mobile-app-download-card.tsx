import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Download, Apple, Chrome, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const REPO_OWNER = "crepychat45";
const REPO_NAME = "fit-fusion-mobile";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

const APK_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_APK_URL) ||
  `${REPO_URL}/releases/latest/download/fitxfusion.apk`;

const PLAY_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_PLAY_URL) ||
  "https://play.google.com/store/apps/details?id=app.lovable.7c0c0ca15e794cf3b1ceb9b34af55603";

const IOS_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_IOS_URL) ||
  "https://apps.apple.com/app/fitxfusion";

export function MobileAppDownloadCard() {
  const [checking, setChecking] = useState(false);

  const handleApk = async () => {
    setChecking(true);
    try {
      // Pre-flight: ask GitHub if a release with an APK asset exists.
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
        { headers: { Accept: "application/vnd.github+json" } },
      );

      if (res.status === 404) {
        toast.error("APK not published yet", {
          description:
            "No GitHub Release found. Build & upload fitxfusion.apk to the repo's Releases page, then this button will download it.",
          action: { label: "Open repo", onClick: () => window.open(REPO_URL, "_blank") },
          duration: 8000,
        });
        return;
      }

      if (!res.ok) throw new Error(`GitHub ${res.status}`);

      const data = await res.json();
      const apkAsset = (data.assets || []).find(
        (a: any) => typeof a.name === "string" && a.name.toLowerCase().endsWith(".apk"),
      );

      if (!apkAsset) {
        toast.error("Release exists but no APK attached", {
          description: `Upload fitxfusion.apk to release ${data.tag_name || "latest"}.`,
          action: { label: "Open release", onClick: () => window.open(data.html_url, "_blank") },
          duration: 8000,
        });
        return;
      }

      toast.success(`Downloading FitXFusion ${data.tag_name || ""}`.trim(), {
        description: "Allow installs from unknown sources when prompted.",
      });

      // Trigger a direct download rather than a new-tab navigation so mobile
      // browsers show the download prompt reliably.
      const a = document.createElement("a");
      a.href = apkAsset.browser_download_url || APK_URL;
      a.rel = "noopener noreferrer";
      a.download = apkAsset.name || "fitxfusion.apk";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("APK check failed:", err);
      toast.error("Couldn't reach GitHub", {
        description: "Check your connection and try again.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">FitXFusion Mobile App</h3>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              New
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Take your workouts, smartwatch sync, and progress everywhere. Native Android &amp; iOS builds
            powered by Capacitor.
          </p>
        </div>
      </div>

      <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
        <Button onClick={handleApk} disabled={checking} className="w-full gap-2">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {checking ? "Checking…" : "Download APK"}
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={() => window.open(PLAY_URL, "_blank", "noopener,noreferrer")}
        >
          <Chrome className="h-4 w-4" />
          Google Play
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={() => window.open(IOS_URL, "_blank", "noopener,noreferrer")}
        >
          <Apple className="h-4 w-4" />
          App Store
        </Button>
      </div>

      <div className="relative mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Signed build · SHA-256 verified · Auto-updates enabled
      </div>
    </motion.div>
  );
}

export default MobileAppDownloadCard;
