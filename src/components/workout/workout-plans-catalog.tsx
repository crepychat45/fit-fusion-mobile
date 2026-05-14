import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Dumbbell, Search, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  equipment: string[];
  goals: string[];
  popularity: number;
}

const SAMPLE_PLANS: WorkoutPlan[] = [
  {
    id: "plan-1",
    name: "30-Day Full Body Transform",
    description: "Complete body transformation with progressive overload",
    duration: 4,
    workoutsPerWeek: 5,
    level: "intermediate",
    category: "Strength",
    equipment: ["dumbbells", "resistance bands"],
    goals: ["muscle building", "fat loss"],
    popularity: 95,
  },
  {
    id: "plan-2",
    name: "Beginner Fitness Starter",
    description: "Perfect introduction to fitness for newcomers",
    duration: 8,
    workoutsPerWeek: 3,
    level: "beginner",
    category: "General Fitness",
    equipment: ["none"],
    goals: ["general fitness", "weight loss"],
    popularity: 88,
  },
  {
    id: "plan-3",
    name: "Advanced HIIT Challenge",
    description: "High-intensity training for maximum results",
    duration: 6,
    workoutsPerWeek: 4,
    level: "advanced",
    category: "HIIT",
    equipment: ["none", "jump rope"],
    goals: ["fat loss", "endurance"],
    popularity: 82,
  },
  {
    id: "plan-4",
    name: "Strength & Conditioning Pro",
    description: "Build serious strength and athletic performance",
    duration: 12,
    workoutsPerWeek: 4,
    level: "advanced",
    category: "Strength",
    equipment: ["barbell", "dumbbells", "bench"],
    goals: ["muscle building", "strength"],
    popularity: 90,
  },
];

export function WorkoutPlansCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPlans = SAMPLE_PLANS.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "all" || plan.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || plan.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const levelColors = {
    beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
    intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Training Plans</h2>
        <p className="text-muted-foreground mt-1">
          Structured programs to help you reach your fitness goals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Strength">Strength</SelectItem>
            <SelectItem value="HIIT">HIIT</SelectItem>
            <SelectItem value="General Fitness">General Fitness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={levelColors[plan.level]}>{plan.level}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{plan.popularity}% popular</span>
                </div>
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.duration} weeks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.workoutsPerWeek}x/week</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.category}</span>
                </div>
              </div>

              {plan.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {plan.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/workout-plan/${plan.id}`}>View Plan</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/workout-plan/${plan.id}/preview`}>Preview</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
