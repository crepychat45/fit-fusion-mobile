import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { WorkoutPlansCatalog } from "@/components/workout/workout-plans-catalog";

export default function WorkoutPlans() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <WorkoutPlansCatalog />
      </div>
    </MainLayout>
  );
}
