
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
  const [displayName, setDisplayName] = useState<string>("Friend");
  
  useEffect(() => {
    // Enhanced user name detection from multiple sources
    const getUserName = () => {
      console.log("Getting user name - checking sources...");
      
      // First check if userName prop is provided
      if (userName && userName.trim()) {
        console.log("Found userName prop:", userName);
        return userName.trim();
      }
      
      // Check localStorage for saved user data with multiple possible keys
      const storageKeys = [
        'fitfusion-user-profile',
        'fitfusion-settings', 
        'user-profile',
        'userProfile',
        'currentUser',
        'auth-user'
      ];
      
      for (const key of storageKeys) {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            console.log(`Checking ${key}:`, data);
            
            // Check various name properties
            if (data.name && data.name.trim()) return data.name.trim();
            if (data.firstName && data.firstName.trim()) return data.firstName.trim();
            if (data.username && data.username.trim()) return data.username.trim();
            if (data.displayName && data.displayName.trim()) return data.displayName.trim();
            if (data.profile?.name && data.profile.name.trim()) return data.profile.name.trim();
            if (data.profile?.firstName && data.profile.firstName.trim()) return data.profile.firstName.trim();
            if (data.user?.name && data.user.name.trim()) return data.user.name.trim();
            if (data.user?.firstName && data.user.firstName.trim()) return data.user.firstName.trim();
          } catch (error) {
            console.error(`Error parsing ${key}:`, error);
          }
        }
      }
      
      // Check for Supabase auth data
      const authKeys = [
        'supabase.auth.token',
        'sb-auth-token',
        'auth_token'
      ];
      
      for (const key of authKeys) {
        const authData = localStorage.getItem(key);
        if (authData) {
          try {
            const auth = JSON.parse(authData);
            console.log(`Checking auth ${key}:`, auth);
            
            if (auth.user?.user_metadata?.name) return auth.user.user_metadata.name;
            if (auth.user?.user_metadata?.full_name) return auth.user.user_metadata.full_name;
            if (auth.user?.user_metadata?.first_name) return auth.user.user_metadata.first_name;
            if (auth.user?.name) return auth.user.name;
            if (auth.user?.email) {
              // Extract name from email (before @)
              const emailName = auth.user.email.split('@')[0];
              const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
              console.log("Using email-based name:", formattedName);
              return formattedName;
            }
          } catch (error) {
            console.error(`Error parsing auth ${key}:`, error);
          }
        }
      }
      
      // Check browser sessionStorage as fallback
      try {
        const sessionUser = sessionStorage.getItem('currentUser') || sessionStorage.getItem('user');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          if (userData.name) return userData.name;
          if (userData.firstName) return userData.firstName;
        }
      } catch (error) {
        console.error('Error checking sessionStorage:', error);
      }
      
      console.log("No user name found, using default");
      return "Friend";
    };
    
    const name = getUserName();
    console.log("Final display name:", name);
    setDisplayName(name);
    
    // Save the name for future use if it's not the default
    if (name !== "Friend") {
      try {
        const currentProfile = localStorage.getItem('fitfusion-user-profile');
        const profile = currentProfile ? JSON.parse(currentProfile) : {};
        profile.name = name;
        profile.lastUpdated = new Date().toISOString();
        localStorage.setItem('fitfusion-user-profile', JSON.stringify(profile));
        console.log("Saved profile name to localStorage:", name);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  }, [userName]);
  
  // Listen for storage changes to update name dynamically
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('user') || e.key.includes('profile') || e.key.includes('auth'))) {
        console.log("Storage changed, re-checking user name");
        // Trigger re-evaluation of user name
        const event = new Event('storage');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
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
