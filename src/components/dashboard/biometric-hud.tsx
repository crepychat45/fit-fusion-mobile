import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart, Activity, Droplets, Zap, Brain, Wifi } from "lucide-react";

interface BioMetric {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  color: string;
  percentage: number;
}

export function BiometricHUD() {
  const [metrics, setMetrics] = useState<BioMetric[]>([
    { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, color: "text-red-500", percentage: 65 },
    { label: "SpO2", value: "98", unit: "%", icon: Activity, color: "text-blue-500", percentage: 98 },
    { label: "Hydration", value: "2.1", unit: "L", icon: Droplets, color: "text-cyan-500", percentage: 70 },
    { label: "Energy", value: "82", unit: "%", icon: Zap, color: "text-yellow-500", percentage: 82 },
    { label: "Focus", value: "91", unit: "%", icon: Brain, color: "text-purple-500", percentage: 91 },
  ]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.label === "Heart Rate") {
          const hr = 68 + Math.floor(Math.random() * 12);
          return { ...m, value: String(hr), percentage: Math.round((hr / 180) * 100) };
        }
        return m;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden border-border/50 liquid-glass-strong relative bg-gradient-to-br from-background/90 to-muted/30">
      {/* Scan line effect */}
      <motion.div
        animate={{ y: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-10"
      />
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </motion.div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Live Biometric HUD</span>
          </div>
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-mono">
            <Wifi className="h-3 w-3 mr-1" />SYNC
          </Badge>
        </div>

        <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3 max-[400px]:grid-cols-2">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-2 rounded-lg liquid-glass-subtle"
            >
              {/* Circular progress */}
              <div className="relative w-10 h-10 mx-auto mb-1">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="2" />
                  <motion.circle
                    cx="18" cy="18" r="15" fill="none" strokeWidth="2"
                    className={metric.color}
                    strokeDasharray={`${metric.percentage} ${100 - metric.percentage}`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: `${metric.percentage} ${100 - metric.percentage}` }}
                    transition={{ duration: 1.5, delay: i * 0.15 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <metric.icon className={`h-3 w-3 ${metric.color}`} />
                </div>
              </div>
              <p className="text-sm font-bold text-foreground font-mono">{metric.value}<span className="text-[10px] text-muted-foreground ml-0.5">{metric.unit}</span></p>
              <p className="text-[9px] text-cyan-400/70 font-mono uppercase">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
