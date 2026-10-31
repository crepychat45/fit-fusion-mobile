import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SafeSettingsWrapper } from "@/components/safe-settings-wrapper";
import { SettingsContainer } from "@/components/settings/settings-container";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { APP_VERSION } from "@/lib/app-version";
import { SettingsOverview } from "@/components/settings/settings-overview";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16 relative overflow-hidden">
      <div className="pb-24 relative z-10">
        <SafeSettingsWrapper>
          <SettingsOverview />
          <SettingsContainer />
        </SafeSettingsWrapper>
      </div>

      <MobileNav />
    </div>
  );
};

export default Settings;
