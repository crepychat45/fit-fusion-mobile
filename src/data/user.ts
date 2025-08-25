export interface UserProfile {
  name: string;
  goal: string;
  memberSince: string;
  level: string;
  lastWorkout: string;
  isPro: boolean;
  avatar?: string; // Added avatar property as optional
  stats: {
    workoutsCompleted: number;
    streakDays: number;
    caloriesBurned: number;
    avgHeartRate: number;
  };
  weeklyProgress: Array<{
    name: string;
    value: number;
  }>;
  weightProgress: Array<{
    name: string;
    value: number;
  }>;
  dailyActivity: {
    [date: string]: {
      workoutsCompleted: number;
      caloriesBurned: number;
      avgHeartRate: number;
      workoutsDuration: number;
    };
  };
  monthlyActivity: {
    [month: string]: {
      workoutsCompleted: number;
      caloriesBurned: number;
      avgHeartRate: number;
      workoutsDuration: number;
    };
  };
  yearlyActivity: {
    [year: string]: {
      workoutsCompleted: number;
      caloriesBurned: number;
      avgHeartRate: number;
      workoutsDuration: number;
    };
  };
}

export const userProfile: UserProfile = {
  name: "John Smith",
  goal: "Build muscle & improve fitness",
  memberSince: "April 2025",
  level: "Intermediate",
  lastWorkout: "Upper Body",
  isPro: true,
  avatar: "/placeholder.svg", // Added default avatar
  stats: {
    workoutsCompleted: 27,
    streakDays: 5,
    caloriesBurned: 1240,
    avgHeartRate: 132,
  },
  weeklyProgress: [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 45 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 25 },
    { name: "Sat", value: 65 },
    { name: "Sun", value: 35 },
  ],
  weightProgress: [
    { name: "Week 1", value: 80 },
    { name: "Week 2", value: 79.5 },
    { name: "Week 3", value: 79 },
    { name: "Week 4", value: 78.3 },
    { name: "Week 5", value: 77.8 },
    { name: "Week 6", value: 77.2 },
  ],
  dailyActivity: {
    "2025-04-06": {
      workoutsCompleted: 1,
      caloriesBurned: 240,
      avgHeartRate: 135,
      workoutsDuration: 45,
    },
    "2025-04-07": {
      workoutsCompleted: 1,
      caloriesBurned: 180,
      avgHeartRate: 128,
      workoutsDuration: 30,
    },
    "2025-04-08": {
      workoutsCompleted: 1,
      caloriesBurned: 220,
      avgHeartRate: 130,
      workoutsDuration: 45,
    },
    "2025-04-09": {
      workoutsCompleted: 0,
      caloriesBurned: 0,
      avgHeartRate: 0,
      workoutsDuration: 0,
    },
    "2025-04-10": {
      workoutsCompleted: 1,
      caloriesBurned: 320,
      avgHeartRate: 142,
      workoutsDuration: 60,
    },
    "2025-04-11": {
      workoutsCompleted: 1,
      caloriesBurned: 100,
      avgHeartRate: 125,
      workoutsDuration: 25,
    },
    "2025-04-12": {
      workoutsCompleted: 1,
      caloriesBurned: 180,
      avgHeartRate: 138,
      workoutsDuration: 35,
    },
  },
  monthlyActivity: {
    "2025-01": {
      workoutsCompleted: 15,
      caloriesBurned: 3600,
      avgHeartRate: 130,
      workoutsDuration: 750,
    },
    "2025-02": {
      workoutsCompleted: 18,
      caloriesBurned: 4320,
      avgHeartRate: 132,
      workoutsDuration: 900,
    },
    "2025-03": {
      workoutsCompleted: 22,
      caloriesBurned: 5280,
      avgHeartRate: 134,
      workoutsDuration: 1100,
    },
    "2025-04": {
      workoutsCompleted: 12,
      caloriesBurned: 2880,
      avgHeartRate: 133,
      workoutsDuration: 600,
    },
  },
  yearlyActivity: {
    "2023": {
      workoutsCompleted: 180,
      caloriesBurned: 43200,
      avgHeartRate: 128,
      workoutsDuration: 9000,
    },
    "2024": {
      workoutsCompleted: 210,
      caloriesBurned: 50400,
      avgHeartRate: 130,
      workoutsDuration: 10500,
    },
    "2025": {
      workoutsCompleted: 67,
      caloriesBurned: 16080,
      avgHeartRate: 132,
      workoutsDuration: 3350,
    },
  },
};
