import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Droplets, Wind, Brain, Sparkles } from "lucide-react";

interface Boost {
  id: string;
  icon: React.ElementType;
  label: string;
  hint: string;
  tone: string;
  done: boolean;
}

const initial: Boost[] = [
  { id: "hydrate", icon: Droplets, label: "Sip 250ml water", hint: "Hydration boost", tone: "from-sky-500/30 to-cyan-500/20", done: false },
  { id: "breathe", icon: Wind, label: "60-sec box breathing", hint: "Calm + focus", tone: "from-emerald-500/30 to-teal-500/20", done: false },
  { id: "stretch", icon: Zap, label: "2-min mobility flow", hint: "Joint primer", tone: "from-amber-500/30 to-orange-500/20", done: false },
  { id: "focus", icon: Brain, label: "Set 1 micro-goal", hint: "Mental edge", tone: "from-violet-500/30 to-fuchsia-500/20", done: false },
];

/**
 * QuickBoostWidget — gamified 4-step daily micro-routine card for the Home page.
 * Live ring shows completion %, taps toggle each boost with a haptic-style spring.
 */
export const QuickBoostWidget: React.FC = () => {
  const [items, setItems] = useState<Boost[]>(initial);
  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-2xl p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/15 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Quick Boost</h3>
            <p className="text-[11px] text-muted-foreground">4 micro-actions · 5 min total</p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative h-12 w-12">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <circle cx="18" cy="18" r="15" className="fill-none stroke-muted/40" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15"
              className="fill-none stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 94.25} 94.25`}
              initial={false}
              animate={{ strokeDasharray: `${(pct / 100) * 94.25} 94.25` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
            {pct}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 relative">
        {items.map((b) => {
          const Icon = b.icon;
          return (
            <motion.button
              key={b.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(b.id)}
              className={`relative rounded-2xl p-3 text-left border transition-all duration-300 ${
                b.done
                  ? "border-primary/40 bg-gradient-to-br " + b.tone
                  : "border-white/10 bg-muted/20 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${b.done ? "text-foreground" : "text-muted-foreground"}`} />
                {b.done && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                    Done
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight">{b.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{b.hint}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickBoostWidget;
