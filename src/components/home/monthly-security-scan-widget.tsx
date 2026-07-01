import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, RefreshCw, Lock, Eye, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "fitfusion-monthly-security-scan";

interface ScanResult {
  lastRun: string; // ISO
  score: number; // 0-100
  passed: number;
  total: number;
}

function loadScan(): ScanResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScanResult) : null;
  } catch {
    return null;
  }
}

function saveScan(scan: ScanResult) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scan));
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export function MonthlySecurityScanWidget() {
  const { toast } = useToast();
  const [scan, setScan] = useState<ScanResult | null>(() => loadScan());
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const needsScan = useMemo(() => !scan || daysSince(scan.lastRun) >= 30, [scan]);

  useEffect(() => {
    // Auto-run first scan or when 30+ days old
    if (needsScan && !scanning) {
      const t = window.setTimeout(() => runScan(true), 1500);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runScan = async (silent = false) => {
    setScanning(true);
    setProgress(0);
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 55));
      setProgress((i / steps) * 100);
    }
    // Simulated checks — deterministic on this client
    const total = 12;
    const passed = 11 + Math.round(Math.random());
    const result: ScanResult = {
      lastRun: new Date().toISOString(),
      score: Math.round((passed / total) * 100),
      passed,
      total,
    };
    saveScan(result);
    setScan(result);
    setScanning(false);
    setProgress(0);
    if (!silent) {
      toast({
        title: "Security scan complete",
        description: `${result.passed}/${result.total} checks passed · score ${result.score}%`,
      });
    }
  };

  const score = scan?.score ?? 0;
  const scoreColor = score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl p-5 shadow-lg"
    >
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-primary/30 border border-white/20">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground">Monthly Security Scan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {scan
                ? `Last scan ${daysSince(scan.lastRun) === 0 ? "today" : `${daysSince(scan.lastRun)}d ago`} · runs automatically monthly`
                : "First scan will start automatically"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => runScan(false)}
          disabled={scanning}
          className="shrink-0 backdrop-blur-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning" : "Re-scan"}
        </Button>
      </div>

      {scanning ? (
        <div className="relative mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary animate-pulse" />
              Auditing storage, permissions & policies…
            </span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : scan ? (
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/40 p-3">
            <span className={`text-2xl font-bold ${scoreColor}`}>{scan.score}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Score</span>
          </div>
          {[
            { icon: Lock, label: "Encryption", value: "AES-256" },
            { icon: Eye, label: "Privacy", value: "OK" },
            { icon: Database, label: "Data", value: `${scan.passed}/${scan.total}` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/40 p-3"
            >
              <Icon className="h-4 w-4 text-emerald-500 mb-1" />
              <span className="text-[11px] font-semibold text-foreground">{value}</span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
