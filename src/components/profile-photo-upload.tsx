import React, { useState, useEffect } from "react";
import { Camera, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAvatarUpload } from "@/hooks/use-profile";

interface ProfilePhotoUploadProps {
  name: string;
  initialImage?: string | null;
  onImageUpdate?: (image: string) => void;
}

export function ProfilePhotoUpload({
  name,
  initialImage,
  onImageUpdate,
}: ProfilePhotoUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { uploadAvatar } = useAvatarUpload();

  useEffect(() => {
    setImage(initialImage || null);
  }, [initialImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Type validation
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (jpg, png, etc.)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
    try {
      const uploadedUrl = await uploadAvatar.mutateAsync(file);
      setImage(uploadedUrl);
      onImageUpdate?.(uploadedUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      toast({ title: "Photo uploaded", description: "Your profile photo has been updated" });
    } catch (error) {
      setImage(initialImage || null);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Avatar className="h-20 w-20 border-4 border-background shadow-md">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(name)}
          </AvatarFallback>
          {image && <AvatarImage src={image} alt={name} />}
        </Avatar>
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-0"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <label htmlFor="profile-photo-upload" className="cursor-pointer">
          <div
            className={`
            rounded-full p-1.5 
            ${success ? "bg-accent" : "bg-primary"}
            text-primary-foreground shadow-md transition-all duration-300
          `}
          >
            {success ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </motion.div>
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
      </motion.div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
}
