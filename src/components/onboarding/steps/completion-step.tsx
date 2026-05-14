import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

export function CompletionStep() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="h-24 w-24 rounded-full bg-primary/20" />
        </div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">You're all set!</h2>
        <p className="text-muted-foreground text-lg">
          We've created a personalized fitness plan just for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
        <div className="flex flex-col items-center p-4 rounded-lg bg-accent/50 text-center">
          <Sparkles className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold">Custom Workouts</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tailored to your goals
          </p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-accent/50 text-center">
          <Sparkles className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold">Progress Tracking</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor your achievements
          </p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-accent/50 text-center">
          <Sparkles className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold">Community Support</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Connect with others
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Click "Get Started" to begin your fitness journey!
      </p>
    </div>
  );
}
