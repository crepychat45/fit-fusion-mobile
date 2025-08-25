import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Target,
  Clock,
  Dumbbell,
  Heart,
  Zap,
  Users,
  PlayCircle,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutCustomizerProps {
  workoutId: string;
  onSave: (customization: WorkoutCustomization) => void;
}

interface WorkoutCustomization {
  duration: number;
  intensity: "low" | "medium" | "high" | "extreme";
  equipment: string[];
  targetMuscles: string[];
  workoutType: string;
  restTime: number;
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
  modifications: string[];
}

export function EnhancedWorkoutCustomizer({
  workoutId,
  onSave,
}: WorkoutCustomizerProps) {
  const { toast } = useToast();
  const [customization, setCustomization] = useState<WorkoutCustomization>({
    duration: 30,
    intensity: "medium",
    equipment: [],
    targetMuscles: [],
    workoutType: "full-body",
    restTime: 60,
    warmupIncluded: true,
    cooldownIncluded: true,
    modifications: [],
  });

  const equipmentOptions = [
    "Dumbbells",
    "Barbell",
    "Resistance Bands",
    "Exercise Mat",
    "Pull-up Bar",
    "Kettlebell",
    "Medicine Ball",
    "Stability Ball",
    "Cable Machine",
    "Treadmill",
    "Stationary Bike",
    "None (Bodyweight)",
  ];

  const muscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Core",
    "Legs",
    "Glutes",
    "Calves",
    "Forearms",
    "Neck",
  ];

  const workoutTypes = [
    "Full Body",
    "Upper Body",
    "Lower Body",
    "Cardio",
    "HIIT",
    "Strength",
    "Endurance",
    "Flexibility",
    "Mobility",
    "Recovery",
  ];

  const modifications = [
    "Low Impact",
    "Beginner Friendly",
    "Advanced Variations",
    "Joint Friendly",
    "Senior Friendly",
    "Pregnancy Safe",
    "Injury Recovery",
    "High Intensity",
    "Time Efficient",
  ];

  const handleEquipmentToggle = (equipment: string) => {
    setCustomization((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleMuscleToggle = (muscle: string) => {
    setCustomization((prev) => ({
      ...prev,
      targetMuscles: prev.targetMuscles.includes(muscle)
        ? prev.targetMuscles.filter((m) => m !== muscle)
        : [...prev.targetMuscles, muscle],
    }));
  };

  const handleModificationToggle = (modification: string) => {
    setCustomization((prev) => ({
      ...prev,
      modifications: prev.modifications.includes(modification)
        ? prev.modifications.filter((m) => m !== modification)
        : [...prev.modifications, modification],
    }));
  };

  const handleSave = () => {
    onSave(customization);
    toast({
      title: "Workout Customized!",
      description:
        "Your personalized workout has been saved and is ready to start.",
    });
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "extreme":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Customize Your Workout</h2>
        <p className="text-muted-foreground">
          Tailor this workout to match your goals and preferences
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="muscles">Target</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Duration & Intensity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  Workout Duration: {customization.duration} minutes
                </Label>
                <Slider
                  value={[customization.duration]}
                  onValueChange={(value) =>
                    setCustomization((prev) => ({
                      ...prev,
                      duration: value[0],
                    }))
                  }
                  max={120}
                  min={15}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>15 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Intensity Level</Label>
                <Select
                  value={customization.intensity}
                  onValueChange={(value: any) =>
                    setCustomization((prev) => ({ ...prev, intensity: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Low - Gentle, Beginner Friendly
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        Medium - Moderate Challenge
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        High - Intense Training
                      </div>
                    </SelectItem>
                    <SelectItem value="extreme">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Extreme - Maximum Challenge
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Workout Type</Label>
                <Select
                  value={customization.workoutType}
                  onValueChange={(value) =>
                    setCustomization((prev) => ({
                      ...prev,
                      workoutType: value,
                    }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type.toLowerCase().replace(" ", "-")}
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Available Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <div
                    key={equipment}
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      customization.equipment.includes(equipment)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{equipment}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Selected: {customization.equipment.length} items
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Muscle Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {muscleGroups.map((muscle) => (
                  <div
                    key={muscle}
                    onClick={() => handleMuscleToggle(muscle)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      customization.targetMuscles.includes(muscle)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{muscle}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Targeting: {customization.targetMuscles.length} muscle groups
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Rest Time Between Sets: {customization.restTime}s
                </Label>
                <Slider
                  value={[customization.restTime]}
                  onValueChange={(value) =>
                    setCustomization((prev) => ({
                      ...prev,
                      restTime: value[0],
                    }))
                  }
                  max={180}
                  min={30}
                  step={15}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30s</span>
                  <span>3 min</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="warmup">Include Warm-up (5 minutes)</Label>
                <Switch
                  id="warmup"
                  checked={customization.warmupIncluded}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({
                      ...prev,
                      warmupIncluded: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cooldown">Include Cool-down (5 minutes)</Label>
                <Switch
                  id="cooldown"
                  checked={customization.cooldownIncluded}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({
                      ...prev,
                      cooldownIncluded: checked,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">
                  Modifications
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {modifications.map((modification) => (
                    <div
                      key={modification}
                      onClick={() => handleModificationToggle(modification)}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        customization.modifications.includes(modification)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm">{modification}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Customization
        </Button>
        <Button
          onClick={handleSave}
          variant="default"
          size="lg"
          className="flex-1"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Workout Summary</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Duration: {customization.duration} minutes</p>
          <p>
            Intensity:{" "}
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${getIntensityColor(customization.intensity)}`}
            ></span>
            {customization.intensity}
          </p>
          <p>
            Equipment:{" "}
            {customization.equipment.length > 0
              ? customization.equipment.join(", ")
              : "Bodyweight only"}
          </p>
          <p>
            Target:{" "}
            {customization.targetMuscles.length > 0
              ? customization.targetMuscles.join(", ")
              : "Full body"}
          </p>
        </div>
      </div>
    </div>
  );
}
