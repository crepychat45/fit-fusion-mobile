import React from "react";
import { OnboardingData } from "../onboarding-flow";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface ScheduleStepProps {
  data: OnboardingData;
  updateData: (data: OnboardingData) => void;
}

export function ScheduleStep({ data, updateData }: ScheduleStepProps) {
  const timeOptions = [
    { value: "morning", label: "Morning", icon: Sunrise },
    { value: "afternoon", label: "Afternoon", icon: Sun },
    { value: "evening", label: "Evening", icon: Sunset },
    { value: "night", label: "Night", icon: Moon },
  ];

  const updateSchedule = (field: string, value: any) => {
    updateData({
      ...data,
      schedule: { ...data.schedule, [field]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Plan your workout schedule</h2>
        <p className="text-muted-foreground">
          Tell us when and how often you'd like to work out.
        </p>
      </div>

      <div className="space-y-6 mt-8">
        {/* Days per week */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="text-base font-semibold">
              Days per week
            </Label>
            <span className="text-primary font-bold">
              {data.schedule.daysPerWeek} {data.schedule.daysPerWeek === 1 ? "day" : "days"}
            </span>
          </div>
          <Slider
            value={[data.schedule.daysPerWeek]}
            onValueChange={(value) => updateSchedule("daysPerWeek", value[0])}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />
        </div>

        {/* Session duration */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="text-base font-semibold">
              Session duration
            </Label>
            <span className="text-primary font-bold">
              {data.schedule.sessionDuration} minutes
            </span>
          </div>
          <Slider
            value={[data.schedule.sessionDuration]}
            onValueChange={(value) => updateSchedule("sessionDuration", value[0])}
            min={15}
            max={120}
            step={15}
            className="w-full"
          />
        </div>

        {/* Preferred time */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Preferred workout time
          </Label>
          <RadioGroup
            value={data.schedule.preferredTime}
            onValueChange={(value) => updateSchedule("preferredTime", value)}
            className="grid grid-cols-2 gap-3"
          >
            {timeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 font-medium">{option.label}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
