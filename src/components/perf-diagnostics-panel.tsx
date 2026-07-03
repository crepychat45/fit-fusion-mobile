import React, { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { getSnapshot, subscribe, type PerfSnapshot } from "@/utils/perf-telemetry";

const badgeColor = (rating?: string) => {
  if (rating === "good") return "text-emerald-400";
  if (rating === "needs-improvement") return "text-amber-400";
  if (rating === "poor") return "text-rose-400";
  return "text-muted-foreground";
};

export const PerfDiagnosticsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<PerfSnapshot>(() => getSnapshot());

  useEffect(() => {
    if (!open) return;
    setSnap(getSnapshot());
    const unsub = subscribe(() => setSnap(getSnapshot()));
    const id = window.setInterval(() => setSnap(getSnapshot()), 1000);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, [open]);

  // Enable via ?perf=1 or localStorage flag
  const enabled =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("perf") === "1" ||
      localStorage.getItem("fitfusion-perf-panel") === "1");

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Open performance diagnostics"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-3 z-[70] h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center justify-center"
      >
        <Activity className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-3 z-[71] w-[300px] max-h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-4 text-xs text-white shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm">⚡ Startup Diagnostics</div>
            <button aria-label="Close" onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            <div className="opacity-70">Environment</div>
            {snap.connection && <div>Network: <span className="font-mono">{snap.connection}</span></div>}
            {snap.memoryMB !== undefined && <div>JS Heap: <span className="font-mono">{snap.memoryMB} MB</span></div>}
            {snap.bootMs !== undefined && <div>App Ready: <span className="font-mono">{snap.bootMs} ms</span></div>}
          </div>

          <div className="mb-3">
            <div className="opacity-70 mb-1">Web Vitals</div>
            {Object.keys(snap.vitals).length === 0 && <div className="opacity-50">measuring…</div>}
            {Object.entries(snap.vitals).map(([name, v]) => (
              <div key={name} className="flex justify-between">
                <span>{name}</span>
                <span className={`font-mono ${badgeColor(v.rating)}`}>
                  {v.value}
                  {name === "CLS" ? "" : "ms"} · {v.rating}
                </span>
              </div>
            ))}
          </div>

          <div>
            <div className="opacity-70 mb-1">Startup Markers</div>
            {snap.marks.map((m, i) => (
              <div key={`${m.name}-${i}`} className="flex justify-between">
                <span>{m.name}</span>
                <span className="font-mono opacity-80">{m.time} ms</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 opacity-60">
            Toggle: append <span className="font-mono">?perf=1</span> or set
            <span className="font-mono"> localStorage.fitfusion-perf-panel = "1"</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PerfDiagnosticsPanel;
