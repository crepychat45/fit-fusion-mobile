
export interface WorkoutVideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: string;
  level: string;
  description: string;
}

export const workoutVideos: WorkoutVideoData[] = [
  {
    id: "v1",
    title: "Full Body HIIT Workout",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/full-body-hiit.mp4", // This would be a real video URL in production
    duration: "15:30",
    category: "HIIT",
    level: "Intermediate",
    description: "A high-intensity interval training workout targeting all major muscle groups for maximum calorie burn."
  },
  {
    id: "v2",
    title: "Beginner Yoga Flow",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/beginner-yoga.mp4",
    duration: "25:15",
    category: "Yoga",
    level: "Beginner",
    description: "A gentle introduction to yoga poses and breathing techniques perfect for beginners."
  },
  {
    id: "v3",
    title: "Upper Body Strength",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/upper-body.mp4",
    duration: "20:45",
    category: "Strength",
    level: "Intermediate",
    description: "Focus on building upper body strength with this comprehensive dumbbell workout."
  },
  {
    id: "v4",
    title: "Core Crusher",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/core-crusher.mp4",
    duration: "12:00",
    category: "Core",
    level: "All Levels",
    description: "Strengthen your core with this intense ab workout that targets all areas of your midsection."
  },
  {
    id: "v5",
    title: "Lower Body Blast",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/lower-body.mp4",
    duration: "18:30",
    category: "Strength",
    level: "Advanced",
    description: "Build stronger legs and glutes with this challenging lower body workout."
  },
  {
    id: "v6",
    title: "Relaxing Stretching Routine",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: "https://example.com/videos/stretching.mp4",
    duration: "15:00",
    category: "Flexibility",
    level: "All Levels",
    description: "Improve flexibility and reduce muscle tension with this full-body stretching routine."
  }
];
