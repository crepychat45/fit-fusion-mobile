import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import { Loader2, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";
import { userProfile } from "@/data/user";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEditorProps {
  onSave?: () => void;
}

export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const [name, setName] = useState(userProfile.name);
  const [goal, setGoal] = useState(userProfile.goal);
  const [bio, setBio] = useState(
    "Fitness enthusiast focused on consistent progress",
  );
  const [level, setLevel] = useState(userProfile.level);
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("78");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { saveProfileInfo } = useSettings();
  const { toast } = useToast();

  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setName(profileData.name || userProfile.name);
        setGoal(profileData.goal || userProfile.goal);
        setBio(
          profileData.bio ||
            "Fitness enthusiast focused on consistent progress",
        );
        setLevel(profileData.level || userProfile.level);
        setAge(profileData.age || "35");
        setGender(profileData.gender || "Male");
        setHeight(profileData.height || "175");
        setWeight(profileData.weight || "78");
        setProfileImage(profileData.profileImage || null);
        setLastSaved(
          profileData.lastSaved ? new Date(profileData.lastSaved) : null,
        );
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    }
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setSaveStatus("saving");

    const profileData = {
      name,
      goal,
      bio,
      level,
      age,
      gender,
      height,
      weight,
      profileImage,
      lastSaved: new Date().toISOString(),
    };

    try {
      const success = await saveProfileInfo(profileData);

      if (success) {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setLastSaved(new Date());

        // Update the welcome message on homepage by storing in localStorage
        localStorage.setItem("user_display_name", name);

        if (onSave) {
          onSave();
        }
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      setSaveStatus("error");
    }

    setTimeout(() => setSaveStatus(null), 3000);
  }, [
    name,
    goal,
    bio,
    level,
    age,
    gender,
    height,
    weight,
    profileImage,
    hasUnsavedChanges,
    saveProfileInfo,
    onSave,
  ]);

  // Auto-save when changes occur
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, autoSave]);

  // Mark as having unsaved changes when any field changes
  const handleFieldChange = (field: string, value: string) => {
    setHasUnsavedChanges(true);
    setSaveStatus(null);

    switch (field) {
      case "name":
        setName(value);
        break;
      case "goal":
        setGoal(value);
        break;
      case "bio":
        setBio(value);
        break;
      case "level":
        setLevel(value);
        break;
      case "age":
        setAge(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "height":
        setHeight(value);
        break;
      case "weight":
        setWeight(value);
        break;
    }
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    await autoSave();
    setIsSaving(false);

    toast({
      title: "✅ Profile Saved",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleImageUpdate = (image: string) => {
    setProfileImage(image);
    setHasUnsavedChanges(true);
  };

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Save failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Your changes are automatically saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {getSaveStatusIndicator()}
              </motion.div>
            )}
          </AnimatePresence>

          {hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-200"
            >
              Unsaved changes
            </Badge>
          )}

          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>
            Update your personal details and fitness profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex justify-center">
              <ProfilePhotoUpload
                name={name}
                initialImage={profileImage}
                onImageUpdate={handleImageUpdate}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                    type="number"
                    min="16"
                    max="100"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(value) => handleFieldChange("gender", value)}
                >
                  <SelectTrigger id="gender" className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fitness Profile</CardTitle>
          <CardDescription>
            Tell us about your fitness goals and experience level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goal">Primary Fitness Goal</Label>
            <Select
              value={goal}
              onValueChange={(value) => handleFieldChange("goal", value)}
            >
              <SelectTrigger id="goal" className="mt-1">
                <SelectValue placeholder="Select your main goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Build muscle & improve fitness">
                  Build muscle & improve fitness
                </SelectItem>
                <SelectItem value="Lose weight">Lose weight</SelectItem>
                <SelectItem value="Increase strength">
                  Increase strength
                </SelectItem>
                <SelectItem value="Improve endurance">
                  Improve endurance
                </SelectItem>
                <SelectItem value="Maintain fitness">
                  Maintain fitness
                </SelectItem>
                <SelectItem value="Improve flexibility">
                  Improve flexibility
                </SelectItem>
                <SelectItem value="General health">
                  General health & wellness
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="level">Current Fitness Level</Label>
            <Select
              value={level}
              onValueChange={(value) => handleFieldChange("level", value)}
            >
              <SelectTrigger id="level" className="mt-1">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">
                  Beginner (Just starting out)
                </SelectItem>
                <SelectItem value="Intermediate">
                  Intermediate (Some experience)
                </SelectItem>
                <SelectItem value="Advanced">
                  Advanced (Very experienced)
                </SelectItem>
                <SelectItem value="Professional">
                  Professional (Expert level)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">Bio & Motivation</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              placeholder="Tell us about yourself, your fitness journey, and what motivates you..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => handleFieldChange("height", e.target.value)}
                type="number"
                min="100"
                max="250"
                placeholder="175"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                value={weight}
                onChange={(e) => handleFieldChange("weight", e.target.value)}
                type="number"
                min="30"
                max="300"
                placeholder="70"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          {hasUnsavedChanges
            ? "Changes will be saved automatically"
            : "All changes saved"}
        </div>

        <Button
          size="lg"
          onClick={handleManualSave}
          disabled={isSaving || (!hasUnsavedChanges && saveStatus !== "error")}
          className="min-w-[140px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {hasUnsavedChanges ? "Save Now" : "Saved"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
