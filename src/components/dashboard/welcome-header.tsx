
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface WelcomeHeaderProps {
  userName: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="fitness-gradient pt-12 pb-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Welcome back, {userName}</h1>
          <p className="text-white/80 text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
