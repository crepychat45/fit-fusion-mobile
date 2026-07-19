import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Share, Plus, MonitorDown, CheckCircle2, Apple, Chrome } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Platform = "ios" | "android" | "desktop-chromium" | "desktop-safari" | "desktop-firefox" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Firefox/i.test(ua)) return "desktop-firefox";
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) return "desktop-safari";
  return "desktop-chromium";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

export function PwaInstallDialog({ open, onOpenChange }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    setPlatform(detectPlatform());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } catch {
      /* noop */
    }
  };

  const canPrompt = !!deferred && !installed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/20 bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-purple-500">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Install FitFusion App</DialogTitle>
              <DialogDescription>Get the full app experience on your device.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {installed ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <p className="font-semibold text-foreground">FitFusion is installed</p>
            <p className="text-sm text-muted-foreground mt-1">
              Launch it from your home screen or app drawer for the best experience.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1"><Smartphone className="h-3 w-3" /> Offline-ready</Badge>
              <Badge variant="secondary" className="gap-1"><MonitorDown className="h-3 w-3" /> Desktop & Mobile</Badge>
              <Badge variant="secondary">Push Notifications</Badge>
              <Badge variant="secondary">Home-screen Icon</Badge>
            </div>

            {canPrompt && (
              <Button onClick={handleInstall} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold">
                <Download className="h-4 w-4 mr-2" />
                Install FitFusion
              </Button>
            )}

            {platform === "ios" && (
              <div className="rounded-xl border border-white/20 bg-muted/30 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Apple className="h-4 w-4" /> Install on iPhone / iPad
                </div>
                <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
                  <li>Open this page in <b>Safari</b>.</li>
                  <li>Tap the <b>Share</b> icon <Share className="inline h-3.5 w-3.5 mx-0.5" /> at the bottom.</li>
                  <li>Scroll and tap <b>Add to Home Screen</b> <Plus className="inline h-3.5 w-3.5 mx-0.5" />.</li>
                  <li>Confirm the name and tap <b>Add</b>.</li>
                </ol>
              </div>
            )}

            {platform === "android" && !canPrompt && (
              <div className="rounded-xl border border-white/20 bg-muted/30 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Chrome className="h-4 w-4" /> Install on Android
                </div>
                <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
                  <li>Open the browser menu (three dots).</li>
                  <li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
                  <li>Confirm to add FitFusion to your device.</li>
                </ol>
              </div>
            )}

            {platform.startsWith("desktop") && !canPrompt && (
              <div className="rounded-xl border border-white/20 bg-muted/30 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <MonitorDown className="h-4 w-4" /> Install on Desktop
                </div>
                <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
                  <li>In Chrome, Edge or Brave, click the <b>install</b> icon in the address bar.</li>
                  <li>Or open the browser menu and choose <b>Install FitFusion…</b>.</li>
                  <li>Launch it from your desktop or Start menu like any app.</li>
                </ol>
                {platform === "desktop-firefox" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Firefox on desktop does not natively install PWAs. Use Chrome, Edge or Brave for a full install.
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Installing FitFusion is free and takes only a few seconds. You can uninstall it anytime.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PwaInstallDialog;
