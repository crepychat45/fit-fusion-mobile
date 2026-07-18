import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Heart, Flame } from "lucide-react";

interface FitnessFusionLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  variant?: "default" | "glass" | "minimal";
}

export const FitnessFusionLogo: React.FC<FitnessFusionLogoProps> = ({ 
  size = "md", 
  animated = true,
  variant = "glass"
}) => {
  const sizeClasses = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-base", glow: "blur-sm" },
    md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-xl", glow: "blur-md" },
    lg: { container: "h-14 w-14", icon: "h-7 w-7", text: "text-2xl", glow: "blur-lg" },
    xl: { container: "h-20 w-20", icon: "h-10 w-10", text: "text-4xl", glow: "blur-xl" },
  };

  const sizes = sizeClasses[size];

  const GlassLogo = () => (
    <div className={`relative ${sizes.container}`}>
      {/* Outer glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40 ${sizes.glow}`}
        animate={animated ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Glass container */}
      <motion.div
        className={`relative ${sizes.container} rounded-2xl overflow-hidden`}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.1)
          `,
        }}
        whileHover={animated ? { scale: 1.05, rotate: 5 } : {}}
        whileTap={animated ? { scale: 0.95 } : {}}
      >
        {/* Inner gradient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/30"
          animate={animated ? {
            background: [
              "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.2) 50%, rgba(236,72,153,0.3) 100%)",
              "linear-gradient(225deg, rgba(236,72,153,0.3) 0%, rgba(59,130,246,0.2) 50%, rgba(147,51,234,0.3) 100%)",
              "linear-gradient(315deg, rgba(147,51,234,0.3) 0%, rgba(236,72,153,0.2) 50%, rgba(59,130,246,0.3) 100%)",
            ],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated particles */}
        {animated && (
          <>
            <motion.div
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              animate={{
                x: [5, 20, 5],
                y: [5, 15, 5],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute w-1 h-1 bg-blue-300/60 rounded-full"
              animate={{
                x: [25, 10, 25],
                y: [25, 8, 25],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}

        {/* Bespoke FitFusion mark — fused "F" + pulse wave */}
        <div className="relative flex items-center justify-center h-full">
          <motion.svg
            viewBox="0 0 48 48"
            className={`${sizes.icon} relative z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]`}
            animate={animated ? { rotate: [0, 3, -3, 0] } : {}}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="ff-mark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#fbcfe8" />
              </linearGradient>
              <linearGradient id="ff-pulse" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            {/* Stylized F — two fused bars */}
            <path
              d="M14 8h22a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H22v6h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H22v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
              fill="url(#ff-mark)"
              opacity="0.95"
            />
            {/* Pulse wave through the F */}
            <motion.path
              d="M6 30h6l3-8 6 16 4-10 3 6h14"
              stroke="url(#ff-pulse)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={animated ? { pathLength: [0, 1, 1], opacity: [0.4, 1, 0.6] } : { pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>

          {/* Halo pulse */}
          <motion.div
            className="absolute inset-2 rounded-xl border border-white/40"
            animate={animated ? { scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] } : {}}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Energy spark */}
          <motion.div
            className="absolute -top-0.5 -right-0.5"
            animate={animated ? { scale: [1, 1.4, 1], rotate: [0, 15, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className={`${size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-300 drop-shadow-[0_0_4px_rgba(253,224,71,0.9)]`} />
          </motion.div>
        </div>

        {/* Glass reflection */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
          }}
        />
      </motion.div>
    </div>
  );

  const LogoText = () => (
    <motion.span 
      className={`${sizes.text} font-bold relative`}
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--secondary)) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
      }}
    >
      <motion.span
        animate={animated ? {
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        } : {}}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      >
        FitFusion
      </motion.span>
    </motion.span>
  );

  if (animated) {
    return (
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {(variant === "glass" || variant === "minimal") && <GlassLogo />}
        {variant === "default" && <LogoText />}
        {variant === "glass" && <LogoText />}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {(variant === "glass" || variant === "minimal") && <GlassLogo />}
      {variant === "default" && <LogoText />}
      {variant === "glass" && <LogoText />}
    </div>
  );
};