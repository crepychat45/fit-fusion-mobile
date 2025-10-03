import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WelcomeStep } from "./steps/welcome-step";
import { GoalsStep } from "./steps/goals-step";
import { FitnessLevelStep } from "./steps/fitness-level-step";
import { EquipmentStep } from "./steps/equipment-step";
import { ScheduleStep } from "./steps/schedule-step";
import { CompletionStep } from "./steps/completion-step";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface OnboardingData {
  goals: string[];
  fitnessLevel: string;
  equipment: string[];
  schedule: {
    daysPerWeek: number;
    sessionDuration: number;
    preferredTime: string;
  };
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    fitnessLevel: "",
    equipment: [],
    schedule: {
      daysPerWeek: 3,
      sessionDuration: 30,
      preferredTime: "morning",
    },
  });

  const steps = [
    { component: WelcomeStep, title: "Welcome", requiresData: false },
    { component: GoalsStep, title: "Your Goals", requiresData: true },
    { component: FitnessLevelStep, title: "Fitness Level", requiresData: true },
    { component: EquipmentStep, title: "Equipment", requiresData: true },
    { component: ScheduleStep, title: "Schedule", requiresData: true },
    { component: CompletionStep, title: "Complete", requiresData: false },
  ];

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data to localStorage or database
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("onboardingData", JSON.stringify(data));
    navigate("/");
  };

  const canProceed = () => {
    if (!steps[currentStep].requiresData) return true;

    switch (currentStep) {
      case 1:
        return data.goals.length > 0;
      case 2:
        return data.fitnessLevel !== "";
      case 3:
        return data.equipment.length > 0;
      case 4:
        return data.schedule.daysPerWeek > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={data}
                updateData={setData}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
              {currentStep !== steps.length - 1 && (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
