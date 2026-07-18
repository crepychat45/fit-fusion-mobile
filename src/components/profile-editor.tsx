import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { validateInput, nameSchema, bioSchema } from "@/utils/validation";
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
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEditorProps {
  onSave?: () => void;
}

interface FormState {
  name: string;
  goal: string;
  bio: string;
  level: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  avatar: string | null;
}

const EMPTY_FORM: FormState = {
  name: "",
  goal: "",
  bio: "",
  level: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  avatar: null,
};

export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initial, setInitial] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydratedKeyRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const isSavingRef = useRef(false);

  // Hydrate only when a *different* server record arrives, and never when the
  // user has unsaved edits or a save is in-flight. This prevents refetches
  // (window focus, react-query revalidation) from wiping the form.
  useEffect(() => {
    if (!profile) return;
    const key = `${profile.id}:${profile.updated_at}`;
    if (hydratedKeyRef.current === key) return;
    if (isDirtyRef.current || isSavingRef.current) return;

    const measurements = (profile.body_measurements || {}) as Record<string, unknown>;
    const next: FormState = {
      name: profile.name ?? "",
      goal: (profile.fitness_goals && profile.fitness_goals[0]) ?? "",
      bio: profile.bio ?? "",
      level: profile.fitness_level ?? "",
      age: profile.age != null ? String(profile.age) : "",
      gender: (measurements.gender as string) ?? "",
      height: profile.height_cm != null ? String(profile.height_cm) : "",
      weight: profile.weight_kg != null ? String(profile.weight_kg) : "",
      avatar: profile.avatar_url ?? null,
    };
    setForm(next);
    setInitial(next);
    setLastSaved(profile.updated_at ? new Date(profile.updated_at) : null);
    hydratedKeyRef.current = key;
  }, [profile]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  );

  const handleFieldChange = (field: keyof FormState, value: string) => {
    if (field === "name" && value.length > 0) {
      const v = validateInput(nameSchema, value);
      if (!v.success) {
        toast({ title: "Invalid name", description: v.error, variant: "destructive" });
        return;
      }
    }
    if (field === "bio" && value.length > 0) {
      const v = validateInput(bioSchema, value);
      if (!v.success) {
        toast({ title: "Invalid bio", description: v.error, variant: "destructive" });
        return;
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  };

  const handleImageUpdate = (image: string | null) => {
    setForm((prev) => ({ ...prev, avatar: image || null }));
  };

  const persist = useCallback(async () => {
    setSaveStatus("saving");
    const measurements = {
      ...((profile?.body_measurements as Record<string, unknown>) || {}),
      gender: form.gender || null,
    };
    const updates = {
      name: form.name || null,
      bio: form.bio || null,
      fitness_level: form.level || null,
      fitness_goals: form.goal ? [form.goal] : [],
      age: form.age ? Number(form.age) : null,
      height_cm: form.height ? Number(form.height) : null,
      weight_kg: form.weight ? Number(form.weight) : null,
      avatar_url: form.avatar || null,
      body_measurements: measurements,
    };
    try {
      await updateProfile.mutateAsync(updates as never);
      setSaveStatus("saved");
      setInitial(form);
      setLastSaved(new Date());
      // Homepage welcome message
      if (form.name) localStorage.setItem("user_display_name", form.name);
      window.dispatchEvent(new Event("profileUpdated"));
      onSave?.();
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  }, [form, profile, updateProfile, onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const t = setTimeout(() => { void persist(); }, 1500);
    return () => clearTimeout(t);
  }, [hasUnsavedChanges, persist]);

  const handleManualSave = async () => {
    setIsSaving(true);
    await persist();
    setIsSaving(false);
    toast({ title: "✅ Profile Saved", description: "Your profile has been saved to your account." });
  };

  const statusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving…</span>
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

  if (isLoading && !profile) {
    return (
      <Card>
        <CardContent className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your profile…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">Synced to your account — changes save automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveStatus && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                {statusIndicator()}
              </motion.div>
            )}
          </AnimatePresence>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">Unsaved</Badge>
          )}
          {lastSaved && (
            <span className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>Update your personal details and fitness profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex justify-center">
              <ProfilePhotoUpload
                name={form.name || "User"}
                initialImage={form.avatar}
                onImageUpdate={handleImageUpdate}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder="Your full name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" value={form.age} onChange={(e) => handleFieldChange("age", e.target.value)} type="number" min="13" max="100" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => handleFieldChange("gender", v)}>
                  <SelectTrigger id="gender" className="mt-1"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
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
          <CardDescription>Tell us about your fitness goals and experience level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goal">Primary Fitness Goal</Label>
            <Select value={form.goal} onValueChange={(v) => handleFieldChange("goal", v)}>
              <SelectTrigger id="goal" className="mt-1"><SelectValue placeholder="Select your main goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Build muscle & improve fitness">Build muscle & improve fitness</SelectItem>
                <SelectItem value="Lose weight">Lose weight</SelectItem>
                <SelectItem value="Increase strength">Increase strength</SelectItem>
                <SelectItem value="Improve endurance">Improve endurance</SelectItem>
                <SelectItem value="Maintain fitness">Maintain fitness</SelectItem>
                <SelectItem value="Improve flexibility">Improve flexibility</SelectItem>
                <SelectItem value="General health">General health & wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="level">Current Fitness Level</Label>
            <Select value={form.level} onValueChange={(v) => handleFieldChange("level", v)}>
              <SelectTrigger id="level" className="mt-1"><SelectValue placeholder="Select your level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner (Just starting out)</SelectItem>
                <SelectItem value="Intermediate">Intermediate (Some experience)</SelectItem>
                <SelectItem value="Advanced">Advanced (Very experienced)</SelectItem>
                <SelectItem value="Professional">Professional (Expert level)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">Bio & Motivation</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => handleFieldChange("bio", e.target.value)} placeholder="Tell us about yourself, your fitness journey, and what motivates you…" rows={4} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" value={form.height} onChange={(e) => handleFieldChange("height", e.target.value)} type="number" min="80" max="250" placeholder="175" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" value={form.weight} onChange={(e) => handleFieldChange("weight", e.target.value)} type="number" min="25" max="400" placeholder="70" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          {hasUnsavedChanges ? "Changes will be saved automatically" : "All changes saved"}
        </div>
        <Button size="lg" onClick={handleManualSave} disabled={isSaving || (!hasUnsavedChanges && saveStatus !== "error")} className="min-w-[140px]">
          {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>) : (<><Save className="mr-2 h-4 w-4" />{hasUnsavedChanges ? "Save Now" : "Saved"}</>)}
        </Button>
      </div>
    </div>
  );
}
