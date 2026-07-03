/**
 * Startup Performance Telemetry
 * Captures Web Vitals (LCP, CLS, INP, FCP, TTFB) + custom startup markers.
 * Exposes window.__fitfusionPerf for the diagnostics panel.
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

export interface StartupMark {
  name: string;
  time: number; // ms since navigation start
}

export interface PerfSnapshot {
  vitals: Record<string, { value: number; rating: string }>;
  marks: StartupMark[];
  memoryMB?: number;
  connection?: string;
  bootMs?: number;
}

const state: PerfSnapshot = {
  vitals: {},
  marks: [],
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function mark(name: string) {
  const time = Math.round(performance.now());
  state.marks.push({ name, time });
  try {
    performance.mark(`fitfusion:${name}`);
  } catch {
    /* noop */
  }
  notify();
}

function record(metric: Metric) {
  state.vitals[metric.name] = {
    value: Math.round(metric.value * 100) / 100,
    rating: metric.rating,
  };
  notify();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): PerfSnapshot {
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  return {
    ...state,
    memoryMB: mem ? Math.round(mem.usedJSHeapSize / 1048576) : undefined,
    connection: conn?.effectiveType,
    bootMs: state.marks.find((m) => m.name === "app-ready")?.time,
  };
}

let initialized = false;
export function initPerfTelemetry() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  mark("telemetry-init");

  try {
    onLCP(record);
    onCLS(record);
    onINP(record);
    onFCP(record);
    onTTFB(record);
  } catch (e) {
    console.warn("[Perf] web-vitals failed to init", e);
  }

  (window as unknown as { __fitfusionPerf?: () => PerfSnapshot }).__fitfusionPerf = getSnapshot;
}

// Initialize as early as possible (module import time)
initPerfTelemetry();
mark("script-loaded");
