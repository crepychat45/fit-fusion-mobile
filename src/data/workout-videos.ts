export interface WorkoutVideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: string;
  level: string;
  description: string;
  workoutId?: string;
  exerciseId?: string;
}

// Using public domain sample videos for demonstrations
const SAMPLE_VIDEOS = {
  main: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  exercise1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  exercise2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  exercise3: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  exercise4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  exercise5: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};

export const workoutVideos: WorkoutVideoData[] = [
  {
    id: "v1",
    title: "Full Body Strength - Complete Guide",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.main,
    duration: "15:30",
    category: "Strength",
    level: "Beginner",
    description: "Complete full body strength workout demonstration with proper form guidance.",
    workoutId: "1",
  },
  {
    id: "v2",
    title: "HIIT Cardio Blast - Full Workout",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise1,
    duration: "25:15",
    category: "HIIT",
    level: "Intermediate",
    description: "High-intensity interval training for maximum calorie burn.",
    workoutId: "2",
  },
  {
    id: "v3",
    title: "Core Crusher - Ab Workout",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise2,
    duration: "20:45",
    category: "Strength",
    level: "Beginner",
    description: "Focused abdominal workout to strengthen your core.",
    workoutId: "3",
  },
  {
    id: "v4",
    title: "Flexibility Flow - Stretching",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise3,
    duration: "12:00",
    category: "Flexibility",
    level: "Beginner",
    description: "Improve mobility and reduce tension with stretching.",
    workoutId: "4",
  },
  // Exercise-specific videos
  {
    id: "v5",
    title: "Push-ups - Proper Form",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise4,
    duration: "3:30",
    category: "Strength",
    level: "Beginner",
    description: "Learn proper push-up form and variations.",
    workoutId: "1",
    exerciseId: "e1",
  },
  {
    id: "v6",
    title: "Squats - Technique Guide",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise5,
    duration: "4:00",
    category: "Strength",
    level: "Beginner",
    description: "Master bodyweight squat technique.",
    workoutId: "1",
    exerciseId: "e2",
  },
  {
    id: "v7",
    title: "Burpees - Full Demo",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise4,
    duration: "2:45",
    category: "HIIT",
    level: "Intermediate",
    description: "Complete burpee demonstration with modifications.",
    workoutId: "2",
    exerciseId: "e7",
  },
  {
    id: "v8",
    title: "Crunches - Core Technique",
    thumbnailUrl: "/placeholder.svg",
    videoUrl: SAMPLE_VIDEOS.exercise5,
    duration: "3:00",
    category: "Core",
    level: "Beginner",
    description: "Proper crunch form for effective ab training.",
    workoutId: "3",
    exerciseId: "e10",
  },
];
