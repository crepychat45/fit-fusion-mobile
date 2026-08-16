import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isNative, nativePlatform, haptic } from "@/lib/native-bridge";
import { useToast } from "@/hooks/use-toast";

/**
 * Native shell behaviours for the Capacitor build.
 *
 * - Hardware/system back button: closes open overlays first, then walks the
 *   in-app history (so Profile -> back returns to the previous tab), and only
 *   exits the app from the home route after a double press.
 * - Status bar + keyboard styling.
 * - Marks <html data-native> so CSS can add safe-area padding.
 *
 * Renders nothing and is a no-op in the browser.
 */
export function NativeShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const exitArmed = useRef(0);
  const depth = useRef(0);
  const locRef = useRef(location.pathname);

  // Track how deep the user has navigated inside the app.
  useEffect(() => {
    if (locRef.current !== location.pathname) {
      depth.current += 1;
      locRef.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    try {
      document.documentElement.dataset.native = isNative() ? "true" : "false";
      document.documentElement.dataset.platform = nativePlatform();
    } catch {
      /* noop */
    }
    if (!isNative()) return;

    let removeBack: (() => void) | undefined;
    let removeResume: (() => void) | undefined;

    const closeTopOverlay = (): boolean => {
      const overlay = document.querySelector<HTMLElement>(
        '[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"], [data-radix-popper-content-wrapper] [data-state="open"]',
      );
      if (!overlay) return false;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return true;
    };

    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("backButton", () => {
          void haptic("light");
          if (closeTopOverlay()) return;

          const atRoot = window.location.pathname === "/" || window.location.pathname === "";
          if (!atRoot) {
            if (depth.current > 0) {
              depth.current -= 1;
              navigate(-1);
            } else {
              navigate("/", { replace: true });
            }
            return;
          }

          const now = Date.now();
          if (now - exitArmed.current < 2000) {
            void App.exitApp();
          } else {
            exitArmed.current = now;
            toast({ title: "Press back again to exit" });
          }
        });
        removeBack = () => void handle.remove();

        const resume = await App.addListener("resume", () => {
          window.dispatchEvent(new Event("fitfusion-app-resume"));
        });
        removeResume = () => void resume.remove();
      } catch {
        /* plugin unavailable */
      }

      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const dark = document.documentElement.classList.contains("dark");
        await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
        if (nativePlatform() === "android") await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        /* noop */
      }

      try {
        const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
        await Keyboard.setScroll({ isDisabled: false });
      } catch {
        /* noop */
      }
    })();

    return () => {
      removeBack?.();
      removeResume?.();
    };
  }, [navigate, toast]);

  return null;
}
