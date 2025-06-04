
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  
  useEffect(() => {
    // Try to get user name from multiple sources
    const getUserName = () => {
      // First check if userName prop is provided
      if (userName) {
        return userName;
      }
      
      // Check localStorage for saved user data
      const savedProfile = localStorage.getItem('fitfusion-user-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.name) return profile.name;
          if (profile.firstName) return profile.firstName;
          if (profile.username) return profile.username;
        } catch (error) {
          console.error('Error parsing saved profile:', error);
        }
      }
      
      // Check for user settings
      const savedSettings = localStorage.getItem('fitfusion-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.profile?.name) return settings.profile.name;
          if (settings.user?.name) return settings.user.name;
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      
      // Check for auth data
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          if (auth.user?.user_metadata?.name) return auth.user.user_metadata.name;
          if (auth.user?.user_metadata?.full_name) return auth.user.user_metadata.full_name;
          if (auth.user?.email) {
            // Extract name from email (before @)
            const emailName = auth.user.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
          }
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }
      
      // Default fallback
      return "Friend";
    };
    
    const name = getUserName();
    setDisplayName(name);
    
    // Save the name for future use if it's not "Friend"
    if (name !== "Friend") {
      const currentProfile = localStorage.getItem('fitfusion-user-profile');
      try {
        const profile = currentProfile ? JSON.parse(currentProfile) : {};
        profile.name = name;
        localStorage.setItem('fitfusion-user-profile', JSON.stringify(profile));
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  }, [userName]);
  
  return (
    <div className="fitness-gradient pt-12 pb-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">
            Welcome back, {displayName}
          </h1>
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
