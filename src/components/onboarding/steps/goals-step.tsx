import React from "react";
import { OnboardingData } from "../onboarding-flow";
import { Target, Flame, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalsStepProps {
  data: OnboardingData;
  updateData: (data: OnboardingData) => void;
}

export function GoalsStep({ data, updateData }: GoalsStepProps) {
  const goals = [
    { id: "lose-weight", label: "Lose Weight", icon: Flame },
    { id: "build-muscle", label: "Build Muscle", icon: Zap },
    { id: "improve-endurance", label: "Improve Endurance", icon: Heart },
    { id: "stay-active", label: "Stay Active", icon: Target },
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals;
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((g) => g !== goalId)
      : [...currentGoals, goalId];
    
    updateData({ ...data, goals: updatedGoals });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are your fitness goals?</h2>
        <p className="text-muted-foreground">
          Select all that apply. We'll personalize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {goals.map((goal) => {
          const isSelected = data.goals.includes(goal.id);
          const Icon = goal.icon;

          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg scale-105"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full mb-3",
                  isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-semibold">{goal.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
