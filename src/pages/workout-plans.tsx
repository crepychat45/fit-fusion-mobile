import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { WorkoutPlansCatalog } from "@/components/workout/workout-plans-catalog";

export default function WorkoutPlans() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Workout Plans — AI-Powered Training Programs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse personalized workout plans built for your goals, level, and schedule.
          </p>
        </header>
        <WorkoutPlansCatalog />
      </div>
    </MainLayout>
  );
}
