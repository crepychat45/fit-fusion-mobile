
import React, { useState } from "react";
import { Camera, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ProfilePhotoUploadProps {
  name: string;
  initialImage?: string;
}

export function ProfilePhotoUpload({ name, initialImage }: ProfilePhotoUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (jpg, png, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Create URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setLoading(false);
        
        // Show success animation
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        
        toast({
          title: "Photo uploaded",
          description: "Your profile photo has been updated",
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const getInitials = (name: string) => {
    return name.split(" ").map(word => word[0]).join("");
  };
  
  return (
    <div className="relative">
      <Avatar className="h-20 w-20 border-4 border-background">
        <AvatarFallback className="bg-primary text-white text-xl">
          {getInitials(name)}
        </AvatarFallback>
        {image && <AvatarImage src={image} />}
      </Avatar>
      
      <div className="absolute bottom-0 right-0">
        <label htmlFor="profile-photo-upload" className="cursor-pointer">
          <div className={`
            rounded-full p-1.5 
            ${success ? 'bg-green-500' : 'bg-primary'}
            text-white shadow-md transition-all duration-300
          `}>
            {success ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </div>
          <input 
            id="profile-photo-upload" 
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={handleImageChange}
          />
        </label>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
}
