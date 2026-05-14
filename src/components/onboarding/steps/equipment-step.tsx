import React from "react";
import { OnboardingData } from "../onboarding-flow";
import { Dumbbell, Home, Building2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipmentStepProps {
  data: OnboardingData;
  updateData: (data: OnboardingData) => void;
}

export function EquipmentStep({ data, updateData }: EquipmentStepProps) {
  const equipment = [
    { id: "none", label: "No Equipment", icon: Home },
    { id: "basic", label: "Basic (Dumbbells, Bands)", icon: Dumbbell },
    { id: "full-gym", label: "Full Gym Access", icon: Building2 },
    { id: "minimal-time", label: "Minimal Time Equipment", icon: Timer },
  ];

  const toggleEquipment = (equipmentId: string) => {
    const currentEquipment = data.equipment;
    
    // If selecting "none", clear all others
    if (equipmentId === "none") {
      updateData({ ...data, equipment: ["none"] });
      return;
    }
    
    // If selecting something else, remove "none"
    let updatedEquipment = currentEquipment.filter((e) => e !== "none");
    
    if (updatedEquipment.includes(equipmentId)) {
      updatedEquipment = updatedEquipment.filter((e) => e !== equipmentId);
    } else {
      updatedEquipment = [...updatedEquipment, equipmentId];
    }
    
    updateData({ ...data, equipment: updatedEquipment });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What equipment do you have?</h2>
        <p className="text-muted-foreground">
          Select all that apply. We'll match workouts to your setup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {equipment.map((item) => {
          const isSelected = data.equipment.includes(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => toggleEquipment(item.id)}
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
              <span className="font-semibold text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
