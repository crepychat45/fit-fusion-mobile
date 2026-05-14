import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Clock, Zap, Target } from "lucide-react";
import { WorkoutCard } from "./workout-card-item";

export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  equipment: string[];
  caloriesBurn: number;
  exercises: number;
  image?: string;
}

const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: "1",
    title: "HIIT Cardio Blast",
    description: "High-intensity interval training to boost your metabolism",
    duration: 30,
    difficulty: "intermediate",
    category: "Cardio",
    equipment: ["none"],
    caloriesBurn: 350,
    exercises: 8,
  },
  {
    id: "2",
    title: "Full Body Strength",
    description: "Build muscle and strength across all major muscle groups",
    duration: 45,
    difficulty: "intermediate",
    category: "Strength",
    equipment: ["dumbbells", "bench"],
    caloriesBurn: 280,
    exercises: 10,
  },
  {
    id: "3",
    title: "Yoga Flow",
    description: "Gentle stretching and flexibility work",
    duration: 20,
    difficulty: "beginner",
    category: "Flexibility",
    equipment: ["mat"],
    caloriesBurn: 120,
    exercises: 12,
  },
  {
    id: "4",
    title: "Core Crusher",
    description: "Intense ab and core workout for a stronger midsection",
    duration: 15,
    difficulty: "advanced",
    category: "Core",
    equipment: ["none"],
    caloriesBurn: 150,
    exercises: 6,
  },
];

export function WorkoutLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [workouts] = useState<Workout[]>(SAMPLE_WORKOUTS);

  const categories = ["all", "Cardio", "Strength", "Flexibility", "Core"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || workout.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || workout.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workout Library</h1>
        <p className="text-muted-foreground mt-2">
          Browse our collection of expert-designed workouts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Target className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty === "all" ? "All Levels" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredWorkouts.length} {filteredWorkouts.length === 1 ? "workout" : "workouts"}
        </p>
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workouts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
