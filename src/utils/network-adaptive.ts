/**
 * Network-adaptive download engine.
 * Uses navigator.connection to detect slow / saver networks and toggles
 * a global `data-saver` flag consumed by heavy widgets.
 */
import { useEffect, useState } from "react";

type NavConn = {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener?: (t: string, cb: () => void) => void;
  removeEventListener?: (t: string, cb: () => void) => void;
};

export interface NetworkStatus {
  effectiveType: string;
  saveData: boolean;
  downlink: number;
  rtt: number;
  isSlow: boolean;
  dataSaverActive: boolean;
}

function getConn(): NavConn | null {
  return (
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    null
  );
}

export function getNetworkStatus(): NetworkStatus {
  const c = getConn();
  const effectiveType = c?.effectiveType ?? "4g";
  const saveData = Boolean(c?.saveData);
  const isSlow =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";
  const manual = localStorage.getItem("fitfusion_data_saver") === "true";
  const dataSaverActive = manual || saveData || isSlow;
  applyDataSaver(dataSaverActive);
  return {
    effectiveType,
    saveData,
    downlink: c?.downlink ?? 0,
    rtt: c?.rtt ?? 0,
    isSlow,
    dataSaverActive,
  };
}

export function applyDataSaver(on: boolean) {
  document.documentElement.dataset.dataSaver = on ? "true" : "false";
}

export function setManualDataSaver(on: boolean) {
  localStorage.setItem("fitfusion_data_saver", on ? "true" : "false");
  applyDataSaver(on || getNetworkStatus().dataSaverActive);
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => getNetworkStatus());
  useEffect(() => {
    const c = getConn();
    const update = () => setStatus(getNetworkStatus());
    const onOnline = () => update();
    c?.addEventListener?.("change", update);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    return () => {
      c?.removeEventListener?.("change", update);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOnline);
    };
  }, []);
  return status;
}
