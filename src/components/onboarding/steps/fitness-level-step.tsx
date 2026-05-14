import React from "react";
import { OnboardingData } from "../onboarding-flow";
import { Sprout, Users, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface FitnessLevelStepProps {
  data: OnboardingData;
  updateData: (data: OnboardingData) => void;
}

export function FitnessLevelStep({ data, updateData }: FitnessLevelStepProps) {
  const levels = [
    {
      id: "beginner",
      label: "Beginner",
      icon: Sprout,
      description: "Just starting out or returning after a break",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      icon: Users,
      description: "Work out regularly, comfortable with basics",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: Rocket,
      description: "Experienced athlete with consistent training",
    },
  ];

  const selectLevel = (levelId: string) => {
    updateData({ ...data, fitnessLevel: levelId });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your fitness level?</h2>
        <p className="text-muted-foreground">
          This helps us recommend the right workouts for you.
        </p>
      </div>

      <div className="space-y-3 mt-8">
        {levels.map((level) => {
          const isSelected = data.fitnessLevel === level.id;
          const Icon = level.icon;

          return (
            <button
              key={level.id}
              onClick={() => selectLevel(level.id)}
              className={cn(
                "w-full flex items-start p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full mr-4",
                  isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{level.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {level.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
