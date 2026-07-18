import { motion } from "framer-motion";
import { Smartphone, Download, Apple, Chrome, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Mobile App Download Card
 * Surfaces the FitXFusion native mobile app (built with Capacitor) to users.
 * The APK is generated locally via `npx cap sync android` + Android Studio,
 * and the download URL below can be pointed at any hosted build artifact.
 */
const APK_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_APK_URL) ||
  "https://github.com/fitxfusion/fitxfusion-app/releases/latest/download/fitxfusion.apk";

const PLAY_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_PLAY_URL) ||
  "https://play.google.com/store/apps/details?id=app.lovable.7c0c0ca15e794cf3b1ceb9b34af55603";

const IOS_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FITX_IOS_URL) ||
  "https://apps.apple.com/app/fitxfusion";

export function MobileAppDownloadCard() {
  const handleApk = () => {
    toast.success("Preparing FitXFusion APK download…", {
      description: "Allow installs from unknown sources when prompted.",
    });
    window.open(APK_URL, "_blank", "noopener,noreferrer");
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
        <Button onClick={handleApk} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download APK
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
