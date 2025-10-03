import React from "react";
import { Dumbbell, Target, TrendingUp, Users } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Target,
      title: "Personalized Plans",
      description: "Custom workout plans tailored to your goals",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your fitness journey with detailed analytics",
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with fellow fitness enthusiasts",
    },
    {
      icon: Dumbbell,
      title: "Expert Workouts",
      description: "Access professional workout programs",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
          <Dumbbell className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to FitFusion
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's personalize your fitness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        This will only take 2 minutes to complete
      </p>
    </div>
  );
}
