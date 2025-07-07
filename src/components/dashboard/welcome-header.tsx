
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, User, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { motion } from "framer-motion";
import { EnhancedProfileDisplay } from "./enhanced-profile-display";

interface WelcomeHeaderProps {
  userName?: string;
  showCompactProfile?: boolean;
}

export function WelcomeHeader({ userName, showCompactProfile = false }: WelcomeHeaderProps) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("user@example.com");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useEnhancedAuth();
  
  useEffect(() => {
    // Enhanced user profile detection with better fallbacks
    const getUserProfile = () => {
      console.log("Getting user profile - checking all sources...");
      
      let profile = {
        name: "User",
        firstName: "",
        lastName: "",
        fullName: "User",
        email: "user@example.com",
        avatar: null
      };

      // Check for custom profile name first
      try {
        const customProfile = localStorage.getItem('fitfusion-custom-profile');
        if (customProfile) {
          const parsed = JSON.parse(customProfile);
          if (parsed.displayName && parsed.displayName.trim()) {
            profile.name = parsed.displayName.trim();
            profile.fullName = parsed.displayName.trim();
            console.log("Found custom profile name:", parsed.displayName);
          }
        }
      } catch (error) {
        console.error('Error loading custom profile:', error);
      }

      // Check userName prop next
      if (userName && userName.trim() && userName !== "John Smith") {
        console.log("Found userName prop:", userName);
        if (profile.name === "User") { // Only use if no custom profile
          profile.name = userName.trim();
          profile.fullName = userName.trim();
        }
      }

      // Check auth user data
      if (user) {
        console.log("Found auth user:", user);
        
        // Only use auth data if no custom profile exists
        if (profile.name === "User") {
          // Check for full name in metadata
          if (user.user_metadata?.full_name) {
            profile.fullName = user.user_metadata.full_name;
            profile.name = user.user_metadata.full_name;
          }
          
          // Check for display name
          if (user.user_metadata?.display_name) {
            profile.name = user.user_metadata.display_name;
            profile.fullName = user.user_metadata.display_name;
          }
          
          // Check for first and last name
          if (user.user_metadata?.first_name) {
            profile.firstName = user.user_metadata.first_name;
          }
          if (user.user_metadata?.last_name) {
            profile.lastName = user.user_metadata.last_name;
          }
          
          // Check for name field
          if (user.user_metadata?.name) {
            profile.name = user.user_metadata.name;
          }
        }
        
        // Always use email if available
        if (user.email) {
          profile.email = user.email;
          
          // If no name found anywhere, use email prefix as final fallback
          if (profile.name === "User") {
            const emailPrefix = user.email.split('@')[0];
            profile.name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            profile.fullName = profile.name;
          }
        }
        
        // Check for avatar
        if (user.user_metadata?.avatar_url) {
          profile.avatar = user.user_metadata.avatar_url;
        }
      }

      // Build full name if we have first and last
      if (profile.firstName && profile.lastName && profile.name === "User") {
        profile.fullName = `${profile.firstName} ${profile.lastName}`;
        profile.name = profile.fullName;
      }

      // Check localStorage for saved profile (legacy support)
      try {
        const savedProfile = localStorage.getItem('fitfusion-user-profile');
        if (savedProfile && profile.name === "User") {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name && parsed.name !== "John Smith") {
            profile.name = parsed.name;
            profile.fullName = parsed.fullName || parsed.name;
          }
          if (parsed.email && parsed.email !== "jkenterprise.email@gmail.com") {
            profile.email = parsed.email;
          }
          if (parsed.avatar) {
            profile.avatar = parsed.avatar;
          }
        }
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }

      console.log("Final user profile:", profile);
      return profile;
    };
    
    const profile = getUserProfile();
    setUserProfile(profile);
    setDisplayName(profile.fullName || profile.name);
    setUserEmail(profile.email);
    setUserAvatar(profile.avatar);
    
    // Save enhanced profile
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
    
    if (userProfile.name && userProfile.name !== "User") {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return userProfile.name[0].toUpperCase();
    }
    
    if (userProfile.email) {
      return userProfile.email[0].toUpperCase();
    }
    
    return "U";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fitness-gradient pt-12 pb-8 px-4 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {showCompactProfile ? (
          <div className="mb-6">
            <EnhancedProfileDisplay userName={displayName} />
          </div>
        ) : (
          <div className="flex items-start justify-between mb-6">
            {/* Enhanced User Profile Section */}
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Avatar className="w-16 h-16 border-3 border-white/30 shadow-lg">
                  <AvatarImage src={userAvatar || undefined} alt="Profile" />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xl backdrop-blur-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-sm" />
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white truncate">
                    {getGreeting()}, {displayName}
                  </h1>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Pro
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-white/90 text-sm font-medium">
                    {format(new Date(), "EEEE, MMMM d")}
                  </div>
                  <div className="text-white/80 text-sm truncate flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-full shadow-lg"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-full shadow-lg"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-full shadow-lg"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <div className="text-white font-bold text-2xl mb-1">12</div>
            <div className="text-white/80 text-sm font-medium">Workouts</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <div className="text-white font-bold text-2xl mb-1">5</div>
            <div className="text-white/80 text-sm font-medium">Day Streak</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <div className="text-white font-bold text-2xl mb-1">842</div>
            <div className="text-white/80 text-sm font-medium">Calories</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
