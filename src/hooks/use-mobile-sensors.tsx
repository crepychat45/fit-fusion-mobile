import { useEffect, useState, useCallback } from "react";

export interface SensorSupport {
  motion: boolean;
  orientation: boolean;
  geolocation: boolean;
  battery: boolean;
  network: boolean;
  vibration: boolean;
}

export interface MotionReading {
  acceleration: { x: number; y: number; z: number };
  rotationRate: { alpha: number; beta: number; gamma: number };
}

export interface OrientationReading {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

export interface BatteryReading {
  level: number;
  charging: boolean;
}

export interface NetworkReading {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Mobile sensor hook — motion, orientation, geolocation, battery, network.
 * Every capability degrades gracefully on unsupported platforms.
 */
export function useMobileSensors(options: { motion?: boolean; orientation?: boolean } = {}) {
  const [support, setSupport] = useState<SensorSupport>({
    motion: false,
    orientation: false,
    geolocation: false,
    battery: false,
    network: false,
    vibration: false,
  });
  const [motion, setMotion] = useState<MotionReading | null>(null);
  const [orientation, setOrientation] = useState<OrientationReading | null>(null);
  const [battery, setBattery] = useState<BatteryReading | null>(null);
  const [network, setNetwork] = useState<NetworkReading>({ online: navigator.onLine });
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");

  useEffect(() => {
    setSupport({
      motion: typeof window !== "undefined" && "DeviceMotionEvent" in window,
      orientation: typeof window !== "undefined" && "DeviceOrientationEvent" in window,
      geolocation: "geolocation" in navigator,
      battery: "getBattery" in navigator,
      network: "connection" in navigator || "onLine" in navigator,
      vibration: "vibrate" in navigator,
    });
  }, []);

  // Motion + Orientation listeners (iOS requires permission gate)
  useEffect(() => {
    if (!options.motion && !options.orientation) return;
    let motionListener: ((e: DeviceMotionEvent) => void) | null = null;
    let orientListener: ((e: DeviceOrientationEvent) => void) | null = null;

    if (options.motion && "DeviceMotionEvent" in window) {
      motionListener = (e) => {
        setMotion({
          acceleration: {
            x: e.accelerationIncludingGravity?.x ?? 0,
            y: e.accelerationIncludingGravity?.y ?? 0,
            z: e.accelerationIncludingGravity?.z ?? 0,
          },
          rotationRate: {
            alpha: e.rotationRate?.alpha ?? 0,
            beta: e.rotationRate?.beta ?? 0,
            gamma: e.rotationRate?.gamma ?? 0,
          },
        });
      };
      window.addEventListener("devicemotion", motionListener);
    }
    if (options.orientation && "DeviceOrientationEvent" in window) {
      orientListener = (e) => {
        setOrientation({
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma,
          absolute: e.absolute,
        });
      };
      window.addEventListener("deviceorientation", orientListener);
    }
    return () => {
      if (motionListener) window.removeEventListener("devicemotion", motionListener);
      if (orientListener) window.removeEventListener("deviceorientation", orientListener);
    };
  }, [options.motion, options.orientation]);

  // Battery
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
        if (!nav.getBattery) return;
        const b = await nav.getBattery();
        if (cancelled) return;
        const update = () => setBattery({ level: b.level, charging: b.charging });
        update();
        b.addEventListener("levelchange", update);
        b.addEventListener("chargingchange", update);
      } catch { /* noop */ }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Network
  useEffect(() => {
    const conn = (navigator as any).connection;
    const read = () => ({
      online: navigator.onLine,
      effectiveType: conn?.effectiveType,
      downlink: conn?.downlink,
      rtt: conn?.rtt,
      saveData: conn?.saveData,
    });
    const update = () => setNetwork(read());
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  const requestMotionPermission = useCallback(async (): Promise<"granted" | "denied"> => {
    const dme = (window as any).DeviceMotionEvent;
    if (dme?.requestPermission) {
      try {
        const result: "granted" | "denied" = await dme.requestPermission();
        setPermission(result);
        return result;
      } catch {
        setPermission("denied");
        return "denied";
      }
    }
    setPermission("granted");
    return "granted";
  }, []);

  const getLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject(new Error("unsupported"));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      });
    });
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }, []);

  return {
    support,
    motion,
    orientation,
    battery,
    network,
    permission,
    requestMotionPermission,
    getLocation,
    vibrate,
  };
}
