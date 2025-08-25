import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Activity,
  Heart,
  Scale,
  Ruler,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Camera,
  Shield,
  Settings,
  Award,
  Zap,
  Clock,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/contexts/settings-context";

interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    location: string;
    bio: string;
  };
  fitnessInfo: {
    height: string;
    weight: string;
    fitnessLevel: string;
    goals: string[];
    preferredWorkouts: string[];
    weeklyTarget: string;
  };
  preferences: {
    units: string;
    privacy: string;
    notifications: boolean;
    sharing: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  score: number;
}

export function EnhancedProfileForm() {
  const { toast } = useToast();
  const { saveProfileInfo, unitSystem } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setSaving] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      location: "",
      bio: "",
    },
    fitnessInfo: {
      height: "",
      weight: "",
      fitnessLevel: "beginner",
      goals: [],
      preferredWorkouts: [],
      weeklyTarget: "3",
    },
    preferences: {
      units: unitSystem,
      privacy: "friends",
      notifications: true,
      sharing: false,
    },
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const steps = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Basic details about you",
      icon: User,
      color: "text-blue-600",
    },
    {
      id: "fitness",
      title: "Fitness Profile",
      description: "Your fitness journey details",
      icon: Activity,
      color: "text-green-600",
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize your experience",
      icon: Settings,
      color: "text-purple-600",
    },
    {
      id: "review",
      title: "Review & Save",
      description: "Confirm your information",
      icon: CheckCircle,
      color: "text-orange-600",
    },
  ];

  const fitnessGoals = [
    { id: "weight_loss", label: "Weight Loss", icon: Scale },
    { id: "muscle_gain", label: "Muscle Gain", icon: TrendingUp },
    { id: "endurance", label: "Build Endurance", icon: Heart },
    { id: "strength", label: "Increase Strength", icon: Zap },
    { id: "flexibility", label: "Improve Flexibility", icon: Activity },
    { id: "general", label: "General Fitness", icon: Target },
  ];

  const workoutTypes = [
    { id: "cardio", label: "Cardio", icon: Heart },
    { id: "strength", label: "Strength Training", icon: Zap },
    { id: "yoga", label: "Yoga", icon: Activity },
    { id: "pilates", label: "Pilates", icon: User },
    { id: "hiit", label: "HIIT", icon: TrendingUp },
    { id: "swimming", label: "Swimming", icon: Activity },
    { id: "running", label: "Running", icon: Activity },
    { id: "cycling", label: "Cycling", icon: Activity },
  ];

  useEffect(() => {
    calculateCompletion();
    validateProfile();
  }, [profileData]);

  useEffect(() => {
    // Auto-save every 30 seconds if there are unsaved changes
    const interval = setInterval(() => {
      if (
        hasUnsavedChanges &&
        validationResult?.score &&
        validationResult.score > 50
      ) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, validationResult]);

  const calculateCompletion = () => {
    const allFields = [
      ...Object.values(profileData.personalInfo),
      ...Object.values(profileData.fitnessInfo).filter((v) =>
        Array.isArray(v) ? v.length > 0 : v,
      ),
      ...Object.values(profileData.preferences),
    ];

    const filledFields = allFields.filter(
      (field) =>
        field !== "" &&
        field !== false &&
        (Array.isArray(field) ? field.length > 0 : true),
    );

    const percentage = Math.round(
      (filledFields.length / allFields.length) * 100,
    );
    setCompletionPercentage(percentage);
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    let score = 0;

    // Personal Info Validation
    if (!profileData.personalInfo.firstName)
      errors.firstName = "First name is required";
    else score += 15;

    if (!profileData.personalInfo.lastName)
      errors.lastName = "Last name is required";
    else score += 15;

    if (!profileData.personalInfo.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.personalInfo.email)) {
      errors.email = "Please enter a valid email";
    } else {
      score += 20;
    }

    if (
      profileData.personalInfo.phone &&
      !/^\+?[\d\s\-\(\)]+$/.test(profileData.personalInfo.phone)
    ) {
      warnings.phone = "Phone number format may be invalid";
    } else if (profileData.personalInfo.phone) {
      score += 10;
    }

    // Fitness Info Validation
    if (profileData.fitnessInfo.goals.length === 0) {
      warnings.goals =
        "Setting fitness goals helps personalize your experience";
    } else {
      score += 20;
    }

    if (profileData.fitnessInfo.preferredWorkouts.length === 0) {
      warnings.workouts =
        "Select preferred workouts for better recommendations";
    } else {
      score += 10;
    }

    // Bonus points for optional fields
    if (profileData.personalInfo.bio) score += 5;
    if (profileData.personalInfo.location) score += 5;

    setValidationResult({
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      score: Math.min(score, 100),
    });
  };

  const updateProfileData = (
    section: keyof ProfileData,
    field: string,
    value: any,
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const toggleArrayValue = (
    section: keyof ProfileData,
    field: string,
    value: string,
  ) => {
    setProfileData((prev) => {
      const currentArray = (prev[section] as any)[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleAutoSave = async () => {
    try {
      const success = await saveProfileInfo(profileData);
      if (success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast({
          title: "💾 Auto-saved",
          description: "Your profile has been saved automatically.",
        });
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const handleSave = async () => {
    if (!validationResult?.isValid) {
      toast({
        title: "❌ Validation Failed",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const success = await saveProfileInfo(profileData);

      if (success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast({
          title: "✅ Profile Saved!",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      toast({
        title: "❌ Save Failed",
        description: "Unable to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return {
        label: "Excellent",
        variant: "default" as const,
        color: "bg-green-600",
      };
    if (score >= 70)
      return {
        label: "Good",
        variant: "secondary" as const,
        color: "bg-blue-600",
      };
    if (score >= 50)
      return {
        label: "Fair",
        variant: "outline" as const,
        color: "bg-yellow-600",
      };
    return {
      label: "Needs Work",
      variant: "destructive" as const,
      color: "bg-red-600",
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Enhanced Profile Setup
              </CardTitle>
              <CardDescription className="mt-1">
                Complete your profile to get personalized recommendations and
                track your progress
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {validationResult && (
                <Badge
                  variant={getScoreBadge(validationResult.score).variant}
                  className={`${getScoreBadge(validationResult.score).color} text-white`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {getScoreBadge(validationResult.score).label}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Validation Alerts */}
      <AnimatePresence>
        {validationResult &&
          (Object.keys(validationResult.errors).length > 0 ||
            Object.keys(validationResult.warnings).length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              {Object.keys(validationResult.errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Please fix these errors:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {Object.entries(validationResult.errors).map(
                        ([field, error]) => (
                          <li key={field}>{error}</li>
                        ),
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {Object.keys(validationResult.warnings).length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Suggestions:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {Object.entries(validationResult.warnings).map(
                        ([field, warning]) => (
                          <li key={field}>{warning}</li>
                        ),
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <Button
                  variant={
                    currentStep === index
                      ? "default"
                      : currentStep > index
                        ? "secondary"
                        : "outline"
                  }
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className="relative"
                >
                  <step.icon className={`h-4 w-4 mr-2 ${step.color}`} />
                  <span className="hidden md:inline">{step.title}</span>
                  <span className="md:hidden">{index + 1}</span>
                  {currentStep > index && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                  )}
                </Button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 ${currentStep > index ? "bg-green-500" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, {
              className: `h-5 w-5 ${steps[currentStep].color}`,
            })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Personal Information Step */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={profileData.personalInfo.firstName}
                        onChange={(e) =>
                          updateProfileData(
                            "personalInfo",
                            "firstName",
                            e.target.value,
                          )
                        }
                        className={
                          validationResult?.errors.firstName
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationResult?.errors.firstName && (
                        <p className="text-xs text-red-500">
                          {validationResult.errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={profileData.personalInfo.lastName}
                        onChange={(e) =>
                          updateProfileData(
                            "personalInfo",
                            "lastName",
                            e.target.value,
                          )
                        }
                        className={
                          validationResult?.errors.lastName
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationResult?.errors.lastName && (
                        <p className="text-xs text-red-500">
                          {validationResult.errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.personalInfo.email}
                      onChange={(e) =>
                        updateProfileData(
                          "personalInfo",
                          "email",
                          e.target.value,
                        )
                      }
                      className={
                        validationResult?.errors.email ? "border-red-500" : ""
                      }
                    />
                    {validationResult?.errors.email && (
                      <p className="text-xs text-red-500">
                        {validationResult.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.personalInfo.phone}
                        onChange={(e) =>
                          updateProfileData(
                            "personalInfo",
                            "phone",
                            e.target.value,
                          )
                        }
                        className={
                          validationResult?.warnings.phone
                            ? "border-yellow-500"
                            : ""
                        }
                      />
                      {validationResult?.warnings.phone && (
                        <p className="text-xs text-yellow-600">
                          {validationResult.warnings.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.personalInfo.dateOfBirth}
                        onChange={(e) =>
                          updateProfileData(
                            "personalInfo",
                            "dateOfBirth",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileData.personalInfo.location}
                      onChange={(e) =>
                        updateProfileData(
                          "personalInfo",
                          "location",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself and your fitness journey..."
                      rows={4}
                      value={profileData.personalInfo.bio}
                      onChange={(e) =>
                        updateProfileData("personalInfo", "bio", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {profileData.personalInfo.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Fitness Information Step */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">
                        Height ({unitSystem === "metric" ? "cm" : "ft/in"})
                      </Label>
                      <Input
                        id="height"
                        placeholder={unitSystem === "metric" ? "170" : "5'8\""}
                        value={profileData.fitnessInfo.height}
                        onChange={(e) =>
                          updateProfileData(
                            "fitnessInfo",
                            "height",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        Weight ({unitSystem === "metric" ? "kg" : "lbs"})
                      </Label>
                      <Input
                        id="weight"
                        placeholder={unitSystem === "metric" ? "70" : "155"}
                        value={profileData.fitnessInfo.weight}
                        onChange={(e) =>
                          updateProfileData(
                            "fitnessInfo",
                            "weight",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weeklyTarget">
                        Weekly Workout Target
                      </Label>
                      <select
                        id="weeklyTarget"
                        className="w-full p-2 border rounded-md"
                        value={profileData.fitnessInfo.weeklyTarget}
                        onChange={(e) =>
                          updateProfileData(
                            "fitnessInfo",
                            "weeklyTarget",
                            e.target.value,
                          )
                        }
                      >
                        <option value="1">1 workout per week</option>
                        <option value="2">2 workouts per week</option>
                        <option value="3">3 workouts per week</option>
                        <option value="4">4 workouts per week</option>
                        <option value="5">5 workouts per week</option>
                        <option value="6">6 workouts per week</option>
                        <option value="7">Daily workouts</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Fitness Goals
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select your primary fitness objectives (you can choose
                        multiple)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {fitnessGoals.map((goal) => (
                          <Button
                            key={goal.id}
                            variant={
                              profileData.fitnessInfo.goals.includes(goal.id)
                                ? "default"
                                : "outline"
                            }
                            className="h-auto p-3 flex flex-col items-center gap-2"
                            onClick={() =>
                              toggleArrayValue("fitnessInfo", "goals", goal.id)
                            }
                          >
                            <goal.icon className="h-5 w-5" />
                            <span className="text-sm">{goal.label}</span>
                          </Button>
                        ))}
                      </div>
                      {validationResult?.warnings.goals && (
                        <p className="text-xs text-yellow-600 mt-2">
                          {validationResult.warnings.goals}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        Preferred Workouts
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose the types of workouts you enjoy or want to try
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {workoutTypes.map((workout) => (
                          <Button
                            key={workout.id}
                            variant={
                              profileData.fitnessInfo.preferredWorkouts.includes(
                                workout.id,
                              )
                                ? "default"
                                : "outline"
                            }
                            className="h-auto p-3 flex flex-col items-center gap-2"
                            onClick={() =>
                              toggleArrayValue(
                                "fitnessInfo",
                                "preferredWorkouts",
                                workout.id,
                              )
                            }
                          >
                            <workout.icon className="h-4 w-4" />
                            <span className="text-xs">{workout.label}</span>
                          </Button>
                        ))}
                      </div>
                      {validationResult?.warnings.workouts && (
                        <p className="text-xs text-yellow-600 mt-2">
                          {validationResult.warnings.workouts}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Step */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          General Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Measurement Units</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={
                                profileData.preferences.units === "metric"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateProfileData(
                                  "preferences",
                                  "units",
                                  "metric",
                                )
                              }
                            >
                              Metric (kg, cm)
                            </Button>
                            <Button
                              variant={
                                profileData.preferences.units === "imperial"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateProfileData(
                                  "preferences",
                                  "units",
                                  "imperial",
                                )
                              }
                            >
                              Imperial (lbs, ft)
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Privacy Level</Label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={profileData.preferences.privacy}
                            onChange={(e) =>
                              updateProfileData(
                                "preferences",
                                "privacy",
                                e.target.value,
                              )
                            }
                          >
                            <option value="public">
                              Public - Anyone can see
                            </option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private - Only me</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Privacy & Sharing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Push Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                              Receive workout reminders and updates
                            </p>
                          </div>
                          <Button
                            variant={
                              profileData.preferences.notifications
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              updateProfileData(
                                "preferences",
                                "notifications",
                                !profileData.preferences.notifications,
                              )
                            }
                          >
                            {profileData.preferences.notifications
                              ? "On"
                              : "Off"}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Social Sharing</Label>
                            <p className="text-xs text-muted-foreground">
                              Share achievements with friends
                            </p>
                          </div>
                          <Button
                            variant={
                              profileData.preferences.sharing
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              updateProfileData(
                                "preferences",
                                "sharing",
                                !profileData.preferences.sharing,
                              )
                            }
                          >
                            {profileData.preferences.sharing ? "On" : "Off"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Profile Summary */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Profile Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2">
                            Personal Information
                          </h4>
                          <p>
                            <strong>Name:</strong>{" "}
                            {profileData.personalInfo.firstName}{" "}
                            {profileData.personalInfo.lastName}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {profileData.personalInfo.email}
                          </p>
                          {profileData.personalInfo.phone && (
                            <p>
                              <strong>Phone:</strong>{" "}
                              {profileData.personalInfo.phone}
                            </p>
                          )}
                          {profileData.personalInfo.location && (
                            <p>
                              <strong>Location:</strong>{" "}
                              {profileData.personalInfo.location}
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Fitness Profile</h4>
                          {profileData.fitnessInfo.height && (
                            <p>
                              <strong>Height:</strong>{" "}
                              {profileData.fitnessInfo.height}{" "}
                              {unitSystem === "metric" ? "cm" : "ft/in"}
                            </p>
                          )}
                          {profileData.fitnessInfo.weight && (
                            <p>
                              <strong>Weight:</strong>{" "}
                              {profileData.fitnessInfo.weight}{" "}
                              {unitSystem === "metric" ? "kg" : "lbs"}
                            </p>
                          )}
                          <p>
                            <strong>Weekly Target:</strong>{" "}
                            {profileData.fitnessInfo.weeklyTarget} workouts
                          </p>
                          <p>
                            <strong>Goals:</strong>{" "}
                            {profileData.fitnessInfo.goals.length} selected
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Score */}
                  {validationResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            Profile Completeness Score
                          </span>
                          <Badge
                            variant={
                              getScoreBadge(validationResult.score).variant
                            }
                            className="text-lg px-3 py-1"
                          >
                            {validationResult.score}/100
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress
                            value={validationResult.score}
                            className="h-3"
                          />
                          <p className="text-sm text-muted-foreground">
                            {validationResult.score >= 80
                              ? "Excellent! Your profile is comprehensive and ready."
                              : validationResult.score >= 60
                                ? "Good progress! Consider adding more details for better recommendations."
                                : "Your profile needs more information for optimal experience."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Navigation Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  Unsaved changes
                </div>
              )}
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSave}
                  disabled={!validationResult?.isValid || isLoading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
