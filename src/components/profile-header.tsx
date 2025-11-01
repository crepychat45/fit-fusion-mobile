import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Edit2, Settings } from "lucide-react";
import { useProfile, useAvatarUpload } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ProfileHeader() {
  const [user, setUser] = React.useState<any>(null);
  const { profile, isLoading } = useProfile(user?.id);
  const { uploadAvatar } = useAvatarUpload();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
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
    } catch (error) {
      console.error("Avatar upload error:", error);
    }
  };

  if (isLoading || !profile) {
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
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {profile.bio || "Fitness enthusiast"}
        </p>
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
