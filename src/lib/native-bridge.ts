/**
 * Capacitor native bridge.
 *
 * Every helper degrades gracefully on the web: plugins are imported lazily and
 * failures fall back to the browser implementation, so the deployed web app
 * keeps working with zero native code.
 */

type Cap = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

function cap(): Cap | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Capacitor?: Cap }).Capacitor ?? null;
}

export function isNative(): boolean {
  try {
    return !!cap()?.isNativePlatform?.();
  } catch {
    return false;
  }
}

export function nativePlatform(): "ios" | "android" | "web" {
  try {
    const p = cap()?.getPlatform?.();
    return p === "ios" || p === "android" ? p : "web";
  } catch {
    return "web";
  }
}

/* ------------------------------------------------------------------ */
/* Haptics                                                             */
/* ------------------------------------------------------------------ */

export async function haptic(style: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  if (!isNative()) {
    try {
      navigator.vibrate?.(style === "heavy" ? 30 : style === "error" ? [20, 40, 20] : 12);
    } catch {
      /* noop */
    }
    return;
  }
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (style === "success" || style === "error") {
      await Haptics.notification({
        type: style === "success" ? NotificationType.Success : NotificationType.Error,
      });
      return;
    }
    await Haptics.impact({
      style:
        style === "heavy" ? ImpactStyle.Heavy : style === "medium" ? ImpactStyle.Medium : ImpactStyle.Light,
    });
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Biometrics                                                          */
/* ------------------------------------------------------------------ */

export type BiometryInfo = {
  available: boolean;
  /** Native biometry kind when known: face / fingerprint / iris / none. */
  kind: "face" | "fingerprint" | "iris" | "device-credential" | "platform" | "none";
  native: boolean;
  reason?: string;
};

let biometryCache: { at: number; info: BiometryInfo } | null = null;

/** True biometric capability check — native first, WebAuthn platform authenticator second. */
export async function checkBiometry(force = false): Promise<BiometryInfo> {
  if (!force && biometryCache && Date.now() - biometryCache.at < 30_000) return biometryCache.info;

  let info: BiometryInfo = { available: false, kind: "none", native: false };

  if (isNative()) {
    try {
      const { NativeBiometric, BiometryType } = await import("capacitor-native-biometric");
      const res = await NativeBiometric.isAvailable({ useFallback: true });
      const map: Record<number, BiometryInfo["kind"]> = {
        [BiometryType.NONE]: "none",
        [BiometryType.TOUCH_ID]: "fingerprint",
        [BiometryType.FACE_ID]: "face",
        [BiometryType.FINGERPRINT]: "fingerprint",
        [BiometryType.FACE_AUTHENTICATION]: "face",
        [BiometryType.IRIS_AUTHENTICATION]: "iris",
        [BiometryType.MULTIPLE]: "platform",
      };
      info = {
        available: !!res.isAvailable,
        kind: res.isAvailable ? map[res.biometryType] ?? "platform" : "none",
        native: true,
        reason: res.errorCode ? `code ${res.errorCode}` : undefined,
      };
    } catch (e) {
      info = { available: false, kind: "none", native: true, reason: (e as Error)?.message };
    }
  }

  if (!info.available) {
    try {
      const PKC = (window as unknown as { PublicKeyCredential?: any }).PublicKeyCredential;
      const ok = !!(await PKC?.isUserVerifyingPlatformAuthenticatorAvailable?.());
      if (ok) info = { available: true, kind: "platform", native: false };
    } catch {
      /* noop */
    }
  }

  biometryCache = { at: Date.now(), info };
  return info;
}

/** Native biometric prompt. Returns false when unavailable or cancelled. */
export async function nativeBiometricVerify(reason = "Unlock FitXFusion"): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.verifyIdentity({
      reason,
      title: "FitXFusion",
      subtitle: "Confirm it's you",
      description: reason,
      useFallback: true,
      maxAttempts: 3,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Store a secret behind the device keychain / keystore so passkey + app-lock
 * material survives web-view storage clears on native builds.
 */
export async function nativeSecureSet(key: string, value: string): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.setCredentials({ username: key, password: value, server: `fitxfusion.${key}` });
    return true;
  } catch {
    return false;
  }
}

export async function nativeSecureGet(key: string): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    const c = await NativeBiometric.getCredentials({ server: `fitxfusion.${key}` });
    return c?.password ?? null;
  } catch {
    return null;
  }
}

export async function nativeSecureDelete(key: string): Promise<void> {
  if (!isNative()) return;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.deleteCredentials({ server: `fitxfusion.${key}` });
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Device info                                                         */
/* ------------------------------------------------------------------ */

export type NativeDeviceInfo = {
  model: string;
  platform: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
};

export async function getNativeDevice(): Promise<NativeDeviceInfo | null> {
  if (!isNative()) return null;
  try {
    const { Device } = await import("@capacitor/device");
    const [info, battery] = await Promise.all([Device.getInfo(), Device.getBatteryInfo().catch(() => null)]);
    return {
      model: info.model,
      platform: info.platform,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      batteryLevel: battery?.batteryLevel,
      isCharging: battery?.isCharging,
    };
  } catch {
    return null;
  }
}
