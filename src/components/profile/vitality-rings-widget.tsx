import React from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Heart } from "lucide-react";

interface Ring {
  label: string;
  value: number;
  target: number;
  color: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;
}

const RINGS: Ring[] = [
  { label: "Move",  value: 420, target: 600, color: "#ec4899", glow: "rgba(236,72,153,0.55)", icon: Flame, unit: "kcal" },
  { label: "Push",  value: 38,  target: 45,  color: "#a78bfa", glow: "rgba(167,139,250,0.55)", icon: Zap,   unit: "min"  },
  { label: "Pulse", value: 11,  target: 12,  color: "#38bdf8", glow: "rgba(56,189,248,0.55)", icon: Heart, unit: "hr"   },
];

const Ring: React.FC<{ r: Ring; i: number }> = ({ r, i }) => {
  const radius = 34 - i * 8;
  const c = 2 * Math.PI * radius;
  const pct = Math.min(1, r.value / r.target);
  return (
    <circle
      cx="50" cy="50" r={radius}
      fill="none" stroke={r.color} strokeWidth="6" strokeLinecap="round"
      strokeDasharray={c}
      strokeDashoffset={c * (1 - pct)}
      style={{ filter: `drop-shadow(0 0 6px ${r.glow})` }}
      transform="rotate(-90 50 50)"
    />
  );
};

export const VitalityRingsWidget: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-2xl p-5"
      style={{ boxShadow: "0 20px 60px -30px hsl(var(--primary) / 0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      {/* Aurora glow */}
      <div aria-hidden className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-pink-500/25 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-5">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* track rings */}
            {RINGS.map((_, i) => {
              const radius = 34 - i * 8;
              return (
                <circle key={`t-${i}`} cx="50" cy="50" r={radius}
                  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              );
            })}
            {RINGS.map((r, i) => <Ring key={r.label} r={r} i={i} />)}
          </svg>
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ boxShadow: "inset 0 0 30px rgba(255,255,255,0.06)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Vitality Rings</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</span>
          </div>
          <div className="space-y-2">
            {RINGS.map((r) => {
              const pct = Math.min(100, Math.round((r.value / r.target) * 100));
              return (
                <div key={r.label} className="flex items-center gap-2">
                  <div className="p-1 rounded-md" style={{ background: `${r.color}22`, color: r.color }}>
                    <r.icon className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-10">{r.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}bb)`, boxShadow: `0 0 8px ${r.glow}` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground w-14 text-right tabular-nums">
                    {r.value}/{r.target}{r.unit ? ` ${r.unit}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VitalityRingsWidget;
