import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";

interface FitnessFusionLogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const FitnessFusionLogo: React.FC<FitnessFusionLogoProps> = ({ 
  size = "md", 
  animated = true 
}) => {
  const sizeClasses = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-base" },
    md: { container: "h-10 w-10", icon: "h-6 w-6", text: "text-xl" },
    lg: { container: "h-16 w-16", icon: "h-10 w-10", text: "text-3xl" },
  };

  const sizes = sizeClasses[size];

  const LogoContent = () => (
    <>
      <div className={`flex ${sizes.container} items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary relative overflow-hidden shadow-lg`}>
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-accent/50"
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Icon composition */}
        <div className="relative">
          <Activity className={`${sizes.icon} text-white`} />
          <motion.div
            className="absolute -top-1 -right-1"
            animate={animated ? {
              scale: [1, 1.3, 1],
              rotate: [0, 10, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <Zap className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-300`} />
          </motion.div>
        </div>
      </div>
      <span className={`${sizes.text} font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent`}>
        FitFusion
      </span>
    </>
  );

  if (animated) {
    return (
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <LogoContent />
    </div>
  );
};
