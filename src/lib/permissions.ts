/**
 * Unified permission manager for Web, PWA and Capacitor (APK / iOS).
 *
 * Two independent layers:
 *  1. OS/browser permission  — granted / denied / prompt (asked through the
 *     native plugin when running in Capacitor, through the web API otherwise).
 *  2. In-app switch          — the user can turn a capability OFF even when the
 *     OS granted it. Guards installed by `installPermissionGuards()` make the
 *     underlying browser APIs fail while a capability is switched off, so
 *     "disabled" really means the feature cannot run anywhere in the app.
 */

import { isNative, nativePlatform } from "@/lib/native-bridge";

export type PermissionKey =
  | "notifications"
  | "push"
  | "camera"
  | "microphone"
  | "location"
  | "motion"
  | "storage"
  | "clipboard";

export type PermState = "granted" | "denied" | "prompt" | "unsupported" | "unknown";

export interface PermissionInfo {
  key: PermissionKey;
  label: string;
  description: string;
  /** OS / browser level state. */
  state: PermState;
  /** In-app switch — false means the app refuses to use it. */
  enabled: boolean;
  /** Effectively usable right now. */
  active: boolean;
  native: boolean;
}

export const PERMISSION_META: Record<
  PermissionKey,
  { label: string; description: string }
> = {
  notifications: {
    label: "Notifications",
    description: "Workout reminders, streak alerts and chat messages.",
  },
  push: {
    label: "Push Notifications",
    description: "Alerts delivered even when FitXFusion is closed.",
  },
  camera: {
    label: "Camera",
    description: "Progress photos, form analysis and profile pictures.",
  },
  microphone: {
    label: "Microphone",
    description: "Voice notes, voice coaching and dictation in chat.",
  },
  location: {
    label: "Location",
    description: "Outdoor run tracking, distance and route mapping.",
  },
  motion: {
    label: "Motion & Fitness",
    description: "Step counting and rep detection from device sensors.",
  },
  storage: {
    label: "Offline Storage",
    description: "Keep workouts and media cached for offline use.",
  },
  clipboard: {
    label: "Clipboard",
    description: "Copy share links, invite codes and exported data.",
  },
};

export const PERMISSION_KEYS = Object.keys(PERMISSION_META) as PermissionKey[];

/* ------------------------------------------------------------------ */
/* In-app switches                                                     */
/* ------------------------------------------------------------------ */

const LS_KEY = "fitfusion-permission-switches";
export const PERMISSIONS_CHANGED_EVENT = "fitfusion-permissions-changed";

type Switches = Partial<Record<PermissionKey, boolean>>;

function readSwitches(): Switches {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Switches) : {};
  } catch {
    return {};
  }
}

function writeSwitches(next: Switches) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* storage full / blocked */
  }
  try {
    window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT, { detail: next }));
  } catch {
    /* noop */
  }
}

/** Capabilities default to ON so existing features keep working. */
export function isEnabled(key: PermissionKey): boolean {
  if (typeof window === "undefined") return true;
  const v = readSwitches()[key];
  return v !== false;
}

export function setEnabled(key: PermissionKey, value: boolean) {
  const next = { ...readSwitches(), [key]: value };
  writeSwitches(next);
  if (!value) void revoke(key);
}

/** True only when the OS granted it AND the in-app switch is on. */
export function canUse(key: PermissionKey): boolean {
  return isEnabled(key) && lastKnown[key] !== "denied";
}

export function onPermissionsChanged(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(PERMISSIONS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(PERMISSIONS_CHANGED_EVENT, handler);
}

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

const lastKnown: Partial<Record<PermissionKey, PermState>> = {};

function normalise(v: unknown): PermState {
  const s = String(v ?? "").toLowerCase();
  if (s === "granted" || s === "authorized" || s === "always" || s === "whileinuse") return "granted";
  if (s === "denied") return "denied";
  if (s === "prompt" || s === "prompt-with-rationale" || s === "default") return "prompt";
  return "unknown";
}

async function queryWeb(name: string): Promise<PermState> {
  try {
    const st = await navigator.permissions?.query({ name: name as PermissionName });
    return st ? normalise(st.state) : "unknown";
  } catch {
    return "unknown";
  }
}

export async function queryPermission(key: PermissionKey): Promise<PermState> {
  let state: PermState = "unknown";
  try {
    switch (key) {
      case "notifications":
      case "push": {
        if (isNative()) {
          if (key === "push") {
            const { PushNotifications } = await import("@capacitor/push-notifications");
            state = normalise((await PushNotifications.checkPermissions()).receive);
          } else {
            const { LocalNotifications } = await import("@capacitor/local-notifications");
            state = normalise((await LocalNotifications.checkPermissions()).display);
          }
          break;
        }
        if (typeof Notification === "undefined") {
          state = "unsupported";
          break;
        }
        if (key === "push" && !("PushManager" in window)) {
          state = "unsupported";
          break;
        }
        state = normalise(Notification.permission);
        break;
      }
      case "camera": {
        if (isNative()) {
          const { Camera } = await import("@capacitor/camera");
          state = normalise((await Camera.checkPermissions()).camera);
          break;
        }
        state = navigator.mediaDevices ? await queryWeb("camera") : "unsupported";
        break;
      }
      case "microphone": {
        if (isNative()) {
          state = "prompt"; // resolved on first use by the WebView
          break;
        }
        state = navigator.mediaDevices ? await queryWeb("microphone") : "unsupported";
        break;
      }
      case "location": {
        if (isNative()) {
          const { Geolocation } = await import("@capacitor/geolocation");
          state = normalise((await Geolocation.checkPermissions()).location);
          break;
        }
        state = navigator.geolocation ? await queryWeb("geolocation") : "unsupported";
        break;
      }
      case "motion": {
        const anyWin = window as unknown as {
          DeviceMotionEvent?: { requestPermission?: () => Promise<string> };
        };
        if (!("DeviceMotionEvent" in window)) state = "unsupported";
        else if (typeof anyWin.DeviceMotionEvent?.requestPermission === "function") state = "prompt";
        else state = "granted";
        break;
      }
      case "storage": {
        if (!navigator.storage?.persisted) state = "unsupported";
        else state = (await navigator.storage.persisted()) ? "granted" : "prompt";
        break;
      }
      case "clipboard": {
        if (!navigator.clipboard) state = "unsupported";
        else {
          const w = await queryWeb("clipboard-write");
          state = w === "unknown" ? "prompt" : w;
        }
        break;
      }
    }
  } catch {
    state = "unknown";
  }
  lastKnown[key] = state;
  return state;
}

export async function queryAllPermissions(): Promise<PermissionInfo[]> {
  const native = isNative();
  return Promise.all(
    PERMISSION_KEYS.map(async (key) => {
      const state = await queryPermission(key);
      const enabled = isEnabled(key);
      return {
        key,
        ...PERMISSION_META[key],
        state,
        enabled,
        active: enabled && state === "granted",
        native,
      } satisfies PermissionInfo;
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

export interface RequestResult {
  state: PermState;
  ok: boolean;
  message: string;
}

const DENIED_HINT = isNativeHint();
function isNativeHint(): string {
  return "Open your device Settings › Apps › FitXFusion › Permissions to allow it.";
}

export async function requestPermission(key: PermissionKey): Promise<RequestResult> {
  // Turning a capability on in-app is implicit when the user requests it.
  if (!isEnabled(key)) setEnabledSilently(key, true);

  try {
    switch (key) {
      case "notifications": {
        if (isNative()) {
          const { LocalNotifications } = await import("@capacitor/local-notifications");
          const r = await LocalNotifications.requestPermissions();
          return finish(key, normalise(r.display));
        }
        if (typeof Notification === "undefined") return finish(key, "unsupported");
        return finish(key, normalise(await Notification.requestPermission()));
      }
      case "push": {
        if (isNative()) {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          const r = await PushNotifications.requestPermissions();
          const st = normalise(r.receive);
          if (st === "granted") await PushNotifications.register();
          return finish(key, st);
        }
        if (typeof Notification === "undefined" || !("PushManager" in window))
          return finish(key, "unsupported");
        return finish(key, normalise(await Notification.requestPermission()));
      }
      case "camera": {
        if (isNative()) {
          const { Camera } = await import("@capacitor/camera");
          const r = await Camera.requestPermissions({ permissions: ["camera"] });
          return finish(key, normalise(r.camera));
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        return finish(key, "granted");
      }
      case "microphone": {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        return finish(key, "granted");
      }
      case "location": {
        if (isNative()) {
          const { Geolocation } = await import("@capacitor/geolocation");
          const r = await Geolocation.requestPermissions();
          return finish(key, normalise(r.location));
        }
        await new Promise<void>((res, rej) =>
          navigator.geolocation.getCurrentPosition(() => res(), rej, { timeout: 12000 }),
        );
        return finish(key, "granted");
      }
      case "motion": {
        const req = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } })
          .DeviceMotionEvent?.requestPermission;
        if (typeof req !== "function") return finish(key, "granted");
        return finish(key, normalise(await req()));
      }
      case "storage": {
        if (!navigator.storage?.persist) return finish(key, "unsupported");
        return finish(key, (await navigator.storage.persist()) ? "granted" : "denied");
      }
      case "clipboard": {
        if (!navigator.clipboard) return finish(key, "unsupported");
        await navigator.clipboard.writeText("");
        return finish(key, "granted");
      }
    }
  } catch (e) {
    const state = await queryPermission(key);
    return {
      state: state === "granted" ? "denied" : state,
      ok: false,
      message:
        state === "denied" || state === "granted"
          ? DENIED_HINT
          : (e as Error)?.message || "Permission request was dismissed.",
    };
  }
  return { state: "unknown", ok: false, message: "Unsupported permission." };
}

function finish(key: PermissionKey, state: PermState): RequestResult {
  lastKnown[key] = state;
  try {
    window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
  } catch {
    /* noop */
  }
  return {
    state,
    ok: state === "granted",
    message:
      state === "granted"
        ? `${PERMISSION_META[key].label} enabled.`
        : state === "denied"
          ? DENIED_HINT
          : state === "unsupported"
            ? `${PERMISSION_META[key].label} is not supported on this device.`
            : "Permission was not granted.",
  };
}

function setEnabledSilently(key: PermissionKey, value: boolean) {
  const next = { ...readSwitches(), [key]: value };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Revoke / stop usage when a switch is turned off                     */
/* ------------------------------------------------------------------ */

const liveStreams = new Set<MediaStream>();
const liveWatches = new Set<number>();

export async function revoke(key: PermissionKey) {
  try {
    if (key === "camera" || key === "microphone") {
      liveStreams.forEach((s) => {
        s.getTracks().forEach((t) => {
          if (key === "camera" ? t.kind === "video" : t.kind === "audio") t.stop();
        });
      });
    }
    if (key === "location") {
      liveWatches.forEach((id) => nativeGeoClear?.call(navigator.geolocation, id));
      liveWatches.clear();
    }
    if (key === "push" && !isNative() && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager?.getSubscription();
      await sub?.unsubscribe();
    }
    if (key === "push" && isNative()) {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      await PushNotifications.removeAllListeners();
    }
  } catch {
    /* best effort */
  }
  try {
    window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Guards — make disabled capabilities actually stop working           */
/* ------------------------------------------------------------------ */

let nativeGeoClear: typeof navigator.geolocation.clearWatch | null = null;
let installed = false;

class PermissionBlockedError extends Error {
  name = "NotAllowedError";
}

function blocked(key: PermissionKey) {
  return new PermissionBlockedError(
    `${PERMISSION_META[key].label} is turned off in FitXFusion settings.`,
  );
}

/** Call once at boot. Idempotent. */
export function installPermissionGuards() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // --- getUserMedia -------------------------------------------------
  const md = navigator.mediaDevices;
  if (md?.getUserMedia) {
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints?: MediaStreamConstraints) => {
      if (constraints?.video && !isEnabled("camera")) throw blocked("camera");
      if (constraints?.audio && !isEnabled("microphone")) throw blocked("microphone");
      const stream = await original(constraints);
      liveStreams.add(stream);
      stream.addEventListener?.("inactive", () => liveStreams.delete(stream));
      return stream;
    };
  }

  // --- geolocation --------------------------------------------------
  const geo = navigator.geolocation;
  if (geo) {
    const getCurrent = geo.getCurrentPosition.bind(geo);
    const watch = geo.watchPosition.bind(geo);
    nativeGeoClear = geo.clearWatch.bind(geo);

    geo.getCurrentPosition = (success, error, options) => {
      if (!isEnabled("location")) {
        error?.({ code: 1, message: blocked("location").message } as GeolocationPositionError);
        return;
      }
      getCurrent(success, error, options);
    };
    geo.watchPosition = (success, error, options) => {
      if (!isEnabled("location")) {
        error?.({ code: 1, message: blocked("location").message } as GeolocationPositionError);
        return -1;
      }
      const id = watch(success, error, options);
      liveWatches.add(id);
      return id;
    };
    geo.clearWatch = (id: number) => {
      liveWatches.delete(id);
      nativeGeoClear?.(id);
    };
  }

  // --- Notifications ------------------------------------------------
  if (typeof window.Notification !== "undefined") {
    const OriginalNotification = window.Notification;
    const originalRequest = OriginalNotification.requestPermission?.bind(OriginalNotification);

    const Guarded = function (this: unknown, title: string, options?: NotificationOptions) {
      if (!isEnabled("notifications")) throw blocked("notifications");
      return new OriginalNotification(title, options);
    } as unknown as typeof Notification;

    Guarded.prototype = OriginalNotification.prototype;
    Object.defineProperty(Guarded, "permission", {
      get: () => (isEnabled("notifications") ? OriginalNotification.permission : "denied"),
    });
    Guarded.requestPermission = async (cb?: NotificationPermissionCallback) => {
      if (!isEnabled("notifications")) {
        cb?.("denied");
        return "denied" as NotificationPermission;
      }
      const r = (await originalRequest?.()) ?? "denied";
      cb?.(r);
      return r;
    };
    (Guarded as unknown as Record<string, unknown>).maxActions =
      (OriginalNotification as unknown as Record<string, unknown>).maxActions;


    try {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        writable: true,
        value: Guarded,
      });
    } catch {
      /* some browsers lock this down */
    }
  }
}

/* ------------------------------------------------------------------ */
/* Convenience helpers for feature code                                */
/* ------------------------------------------------------------------ */

/** Request access on demand; returns true when the feature may proceed. */
export async function ensurePermission(key: PermissionKey): Promise<boolean> {
  if (!isEnabled(key)) return false;
  const state = await queryPermission(key);
  if (state === "granted") return true;
  if (state === "denied" || state === "unsupported") return false;
  return (await requestPermission(key)).ok;
}

export function platformLabel(): string {
  if (!isNative()) return typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
    ? "Installed PWA"
    : "Web";
  return nativePlatform() === "ios" ? "iOS app" : "Android app";
}
