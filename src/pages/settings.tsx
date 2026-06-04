import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SafeSettingsWrapper } from "@/components/safe-settings-wrapper";
import { SettingsContainer } from "@/components/settings/settings-container";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16 relative overflow-hidden">
      {/* Ambient glass orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Liquid Glass Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent-foreground" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-6 px-4 text-primary-foreground"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-primary-foreground/10 backdrop-blur-sm transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="ml-2 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <h1 className="text-xl font-bold">Settings</h1>
              </div>
            </div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">
              v6.3.0 Signed Update
            </Badge>
          </div>
        </motion.div>
      </div>

      <div className="pb-24 relative z-10">
        <SafeSettingsWrapper>
          <SettingsContainer />
        </SafeSettingsWrapper>
      </div>

      <MobileNav />
    </div>
  );
};

export default Settings;
