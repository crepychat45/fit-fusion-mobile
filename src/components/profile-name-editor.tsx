import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Save, X } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileNameEditorProps {
  onSave?: (name: string) => void;
  onClose?: () => void;
}

export function ProfileNameEditor({ onSave, onClose }: ProfileNameEditorProps) {
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load current profile name
    try {
      const customProfile = localStorage.getItem("fitfusion-custom-profile");
      if (customProfile) {
        const parsed = JSON.parse(customProfile);
        setDisplayName(parsed.displayName || "");
        setOriginalName(parsed.displayName || "");
      } else {
        // Check legacy profile
        const legacyProfile = localStorage.getItem("fitfusion-user-profile");
        if (legacyProfile) {
          const parsed = JSON.parse(legacyProfile);
          setDisplayName(parsed.name || "");
          setOriginalName(parsed.name || "");
        }
      }
    } catch (error) {
      console.error("Error loading profile name:", error);
    }
  }, []);

  const handleSave = () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to custom profile storage
      const customProfile = {
        displayName: displayName.trim(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "fitfusion-custom-profile",
        JSON.stringify(customProfile),
      );

      // Trigger profile update event
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: { name: displayName.trim() },
        }),
      );

      toast({
        title: "Profile Updated",
        description: "Your display name has been saved successfully.",
      });

      onSave?.(displayName.trim());
      onClose?.();
    } catch (error) {
      console.error("Error saving profile name:", error);
      toast({
        title: "Error",
        description: "Failed to save profile name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setDisplayName(originalName);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={
                !displayName.trim() || displayName.trim() === originalName
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
