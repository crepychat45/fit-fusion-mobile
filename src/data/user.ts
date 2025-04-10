
export interface UserProfile {
  name: string;
  goal: string;
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
}

export const userProfile: UserProfile = {
  name: "John Smith",
  goal: "Build muscle & improve fitness",
  stats: {
    workoutsCompleted: 27,
    streakDays: 5,
    caloriesBurned: 1240,
    avgHeartRate: 132
  },
  weeklyProgress: [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 45 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 25 },
    { name: "Sat", value: 65 },
    { name: "Sun", value: 35 }
  ],
  weightProgress: [
    { name: "Week 1", value: 80 },
    { name: "Week 2", value: 79.5 },
    { name: "Week 3", value: 79 },
    { name: "Week 4", value: 78.3 },
    { name: "Week 5", value: 77.8 },
    { name: "Week 6", value: 77.2 }
  ]
};
