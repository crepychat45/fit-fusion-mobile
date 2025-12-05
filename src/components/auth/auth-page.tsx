import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedAuthForm } from "./enhanced-auth-form";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";
import { Activity, Shield, Zap, Heart } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useEnhancedAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <EnhancedErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* Mobile Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden p-4 pt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-primary rounded-xl">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">FitFusion</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your Personal Fitness Journey</p>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">
            {/* Desktop Left Side - Branding */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex flex-col flex-1 space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary rounded-2xl shadow-lg">
                    <Activity className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground">FitFusion</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-md">
                  Transform your fitness journey with AI-powered workouts, smart tracking, and personalized coaching.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: "Secure", desc: "256-bit encryption" },
                  { icon: Zap, title: "Smart AI", desc: "Personalized plans" },
                  { icon: Heart, title: "Health", desc: "Complete tracking" },
                  { icon: Activity, title: "Progress", desc: "Real-time sync" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-xl bg-card/50 border border-border/50"
                  >
                    <feature.icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Auth Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full md:flex-1"
            >
              <EnhancedAuthForm onSuccess={handleAuthSuccess} />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 text-center text-xs text-muted-foreground"
        >
          <p>© 2024 FitFusion. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/help" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </motion.footer>
      </div>
    </EnhancedErrorBoundary>
  );
}
