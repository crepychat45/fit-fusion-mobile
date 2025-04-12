
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { WorkoutCard } from "@/components/workout-card";
import { UserStats } from "@/components/user-stats";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Check, Settings } from "lucide-react";
import { userProfile } from "@/data/user";
import { workouts } from "@/data/workouts";
import { Link } from "react-router-dom";
import { ActivitySummary } from "@/components/activity-summary";
import { motion } from "framer-motion";

const Index = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* App Header */}
      <header className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            <span className="text-gradient">FitFusion</span>
          </h1>
          <p className="text-sm text-muted-foreground">Welcome back, {userProfile.name}</p>
        </div>
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </header>
      
      {/* Today's Plan */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 mt-2"
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="font-medium">Today's Plan</h2>
        </div>
        
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-primary/10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">Full Body Strength</h3>
                <p className="text-sm text-muted-foreground">45 min • 5 exercises</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="flex mt-4 gap-3">
              <Button className="flex-1" size="sm">
                Start Workout
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Reschedule
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>
      
      {/* Activity Summary */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
        className="px-4 mt-6"
      >
        <motion.div variants={itemVariants}>
          <ActivitySummary />
        </motion.div>
      </motion.section>
      
      {/* Recent Achievements */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 mt-6"
      >
        <h2 className="font-medium mb-2">Recent Achievements</h2>
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">5-Day Streak</h3>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
      
      {/* Featured Workouts */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
        className="px-4 mt-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Featured Workouts</h2>
          <Link to="/workouts">
            <Button variant="link" className="text-primary p-0 h-auto text-sm">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {workouts.slice(0, 4).map((workout) => (
            <motion.div key={workout.id} variants={itemVariants}>
              <WorkoutCard
                id={workout.id}
                title={workout.title}
                category={workout.category}
                duration={workout.duration}
                exercises={workout.exercises.length}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* App Credit */}
      <motion.section
        variants={itemVariants} 
        className="px-4 mt-10 mb-16"
      >
        <p className="text-center text-xs text-muted-foreground">
          FitFusion © 2025 By Junedkhan
        </p>
      </motion.section>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Index;
