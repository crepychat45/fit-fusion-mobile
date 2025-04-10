
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { WorkoutCard } from "@/components/workout-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { workouts } from "@/data/workouts";

const categories = [
  { label: "All", value: "all" },
  { label: "Strength", value: "strength" },
  { label: "Cardio", value: "cardio" },
  { label: "HIIT", value: "hiit" },
  { label: "Flexibility", value: "flexibility" },
];

const Workouts = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesCategory = activeCategory === "all" || workout.category === activeCategory;
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold mb-4">Workouts</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search workouts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      {/* Categories */}
      <div className="px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={activeCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.value)}
              className="rounded-full whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Workouts Grid */}
      <div className="p-4">
        {filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout.id}
                id={workout.id}
                title={workout.title}
                category={workout.category}
                duration={workout.duration}
                exercises={workout.exercises.length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No workouts found.</p>
          </div>
        )}
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Workouts;
