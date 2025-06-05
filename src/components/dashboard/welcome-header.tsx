
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { motion } from "framer-motion";

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("Friend");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useEnhancedAuth();
  
  useEffect(() => {
    // Enhanced user profile detection
    const getUserProfile = () => {
      console.log("Getting user profile - checking all sources...");
      
      let profile = {
        name: "Friend",
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        avatar: null
      };

      // Check userName prop first
      if (userName && userName.trim()) {
        console.log("Found userName prop:", userName);
        profile.name = userName.trim();
        profile.fullName = userName.trim();
      }

      // Check auth user data
      if (user) {
        console.log("Found auth user:", user);
        if (user.user_metadata?.full_name) {
          profile.fullName = user.user_metadata.full_name;
          profile.name = user.user_metadata.full_name;
        }
        if (user.user_metadata?.first_name) {
          profile.firstName = user.user_metadata.first_name;
        }
        if (user.user_metadata?.last_name) {
          profile.lastName = user.user_metadata.last_name;
        }
        if (user.user_metadata?.name) {
          profile.name = user.user_metadata.name;
        }
        if (user.email) {
          profile.email = user.email;
          // Fallback: create name from email if no other name found
          if (!profile.name || profile.name === "Friend") {
            const emailName = user.email.split('@')[0];
            const formattedName = emailName
              .split(/[._-]/)
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
            profile.name = formattedName;
          }
        }
        if (user.user_metadata?.avatar_url) {
          profile.avatar = user.user_metadata.avatar_url;
        }
      }

      // Build full name if we have first and last
      if (profile.firstName && profile.lastName) {
        profile.fullName = `${profile.firstName} ${profile.lastName}`;
        profile.name = profile.fullName;
      }

      // Check localStorage for enhanced profile data
      const storageKeys = [
        'fitfusion-user-profile',
        'user-profile',
        'currentUser',
        'auth-user'
      ];
      
      for (const key of storageKeys) {
        try {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            const data = JSON.parse(savedData);
            console.log(`Checking ${key}:`, data);
            
            if (data.fullName) profile.fullName = data.fullName;
            if (data.firstName) profile.firstName = data.firstName;
            if (data.lastName) profile.lastName = data.lastName;
            if (data.name) profile.name = data.name;
            if (data.email) profile.email = data.email;
            if (data.avatar) profile.avatar = data.avatar;
          }
        } catch (error) {
          console.error(`Error parsing ${key}:`, error);
        }
      }

      console.log("Final user profile:", profile);
      return profile;
    };
    
    const profile = getUserProfile();
    setUserProfile(profile);
    setDisplayName(profile.fullName || profile.name);
    
    // Save enhanced profile
    if (profile.name !== "Friend") {
      try {
        const enhancedProfile = {
          ...profile,
          lastUpdated: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };
        localStorage.setItem('fitfusion-user-profile', JSON.stringify(enhancedProfile));
      } catch (error) {
        console.error('Error saving enhanced profile:', error);
      }
    }
  }, [userName, user]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = () => {
    if (!userProfile) return "U";
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile.name && userProfile.name !== "Friend") {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return userProfile.name[0].toUpperCase();
    }
    return "U";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fitness-gradient pt-12 pb-6 px-4 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {userProfile?.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {getInitials()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {getGreeting()}, {displayName}
                </h1>
                {userProfile?.name !== "Friend" && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span>{format(new Date(), "EEEE, MMMM d")}</span>
                {userProfile?.email && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-32">{userProfile.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">12</div>
            <div className="text-white/70 text-xs">Workouts</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">5</div>
            <div className="text-white/70 text-xs">Day Streak</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">842</div>
            <div className="text-white/70 text-xs">Calories</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
