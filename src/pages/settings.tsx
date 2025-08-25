import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingsContainer } from "@/components/settings/settings-container";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Settings</h1>
        </div>
      </header>

      <div className="pb-24">
        <SettingsContainer />
      </div>

      <MobileNav />
    </div>
  );
};

export default Settings;
