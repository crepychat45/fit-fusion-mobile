import React, { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle, Trash2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatarUpload } from "@/hooks/use-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfilePhotoUploadProps {
  name: string;
  initialImage?: string | null;
  onImageUpdate?: (image: string | null) => void;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export function ProfilePhotoUpload({
  name,
  initialImage,
  onImageUpdate,
  size = "md",
}: ProfilePhotoUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadAvatar, removeAvatar } = useAvatarUpload();

  useEffect(() => {
    setImage(initialImage || null);
  }, [initialImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

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
    } catch (error) {
      setImage(initialImage || null);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeAvatar.mutateAsync();
      setImage(null);
      onImageUpdate?.(null);
    } catch {
      // handled in mutation
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent-foreground to-primary blur-md opacity-40" />
        <Avatar className={`${SIZE_MAP[size]} relative border-4 border-background shadow-xl ring-2 ring-primary/30`}>
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xl font-bold">
            {getInitials(name || "U")}
          </AvatarFallback>
          {image && <AvatarImage src={image} alt={name} />}
        </Avatar>
      </motion.div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            type="button"
            className="absolute bottom-0 right-0 rounded-full p-1.5 bg-primary text-primary-foreground shadow-lg border-2 border-background transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
            aria-label="Change profile photo"
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle className="h-3.5 w-3.5" />
                </motion.span>
              ) : (
                <motion.span key="cam" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Camera className="h-3.5 w-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 backdrop-blur-xl bg-background/90 border-border/40">
          <DropdownMenuItem onClick={() => inputRef.current?.click()} className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload photo
          </DropdownMenuItem>
          {image && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleRemove}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove photo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={inputRef}
        id="profile-photo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-sm">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
