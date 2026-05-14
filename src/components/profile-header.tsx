import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Edit2 } from "lucide-react";
import { useProfile, useAvatarUpload } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function ProfileHeader() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { profile, isLoading, error } = useProfile(user?.id);
  const { uploadAvatar } = useAvatarUpload();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for profile updates
    const handleProfileUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
      // Trigger profile update event
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  const fallbackName = user?.email?.split("@")[0] || "FitFusion User";
  const fallbackInitials = fallbackName.slice(0, 2).toUpperCase();

  if (!user) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <Avatar className="h-10 w-10 ring-2 ring-primary/30">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">U</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">Guest</p>
          <p className="text-xs text-muted-foreground truncate">Explore FitFusion</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted rounded mb-1" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <Avatar className="h-10 w-10 ring-2 ring-primary/30">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">{fallbackInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-sm truncate">{fallbackName}</p>
            <p className="text-xs text-muted-foreground truncate">Profile syncing</p>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5 shrink-0">
            Online
          </Badge>
        </div>
      </div>
    );
  }

  const displayName = profile.name || profile.username || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <div className="relative group">
        <Avatar className="h-10 w-10 ring-2 ring-primary/30 cursor-pointer transition-transform hover:scale-105">
          <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={handleAvatarClick}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="h-4 w-4 text-white" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-sm truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {profile.bio || "Fitness enthusiast"}
          </p>
        </div>

        {/* Edit Profile Badge */}
        <Badge 
          variant="outline" 
          className="bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors text-xs px-2 py-0.5 shrink-0"
          onClick={() => navigate("/profile")}
        >
          Edit
        </Badge>
      </div>
    </div>
  );
}
