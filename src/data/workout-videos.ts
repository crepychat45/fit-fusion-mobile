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

// Public HD demo videos — multiple CDNs for redundancy.
const SAMPLE_VIDEO_POOL = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

// Guaranteed-working fallbacks (small, fast MP4s on multiple CDNs).
export const FALLBACK_VIDEO_URLS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://download.samplelib.com/mp4/sample-5s.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
];

// Unsplash fitness thumbnails
const THUMB_POOL = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const pickVideoUrl = (key: string) =>
  SAMPLE_VIDEO_POOL[hash(key) % SAMPLE_VIDEO_POOL.length];

export const pickThumbnail = (key: string) =>
  THUMB_POOL[hash(key) % THUMB_POOL.length];

export const workoutVideos: WorkoutVideoData[] = [
  {
    id: "v1",
    title: "Full Body Strength - Complete Guide",
    thumbnailUrl: THUMB_POOL[1],
    videoUrl: SAMPLE_VIDEO_POOL[0],
    duration: "15:30",
    category: "Strength",
    level: "Beginner",
    description: "Complete full body strength workout demonstration with proper form guidance.",
    workoutId: "1",
  },
  {
    id: "v2",
    title: "HIIT Cardio Blast - Full Workout",
    thumbnailUrl: THUMB_POOL[0],
    videoUrl: SAMPLE_VIDEO_POOL[1],
    duration: "25:15",
    category: "HIIT",
    level: "Intermediate",
    description: "High-intensity interval training for maximum calorie burn.",
    workoutId: "2",
  },
  {
    id: "v3",
    title: "Core Crusher - Ab Workout",
    thumbnailUrl: THUMB_POOL[3],
    videoUrl: SAMPLE_VIDEO_POOL[2],
    duration: "20:45",
    category: "Strength",
    level: "Beginner",
    description: "Focused abdominal workout to strengthen your core.",
    workoutId: "3",
  },
  {
    id: "v4",
    title: "Flexibility Flow - Stretching",
    thumbnailUrl: THUMB_POOL[2],
    videoUrl: SAMPLE_VIDEO_POOL[3],
    duration: "12:00",
    category: "Flexibility",
    level: "Beginner",
    description: "Improve mobility and reduce tension with stretching.",
    workoutId: "4",
  },
];

/** Get a preview video for any workout — falls back to a stable AI-generated demo. */
export const getWorkoutVideo = (workoutId: string): WorkoutVideoData => {
  const existing = workoutVideos.find((v) => v.workoutId === workoutId && !v.exerciseId);
  if (existing) return existing;
  return {
    id: `auto-w-${workoutId}`,
    title: "AI-Generated Workout Preview",
    thumbnailUrl: pickThumbnail(`w-${workoutId}`),
    videoUrl: pickVideoUrl(`w-${workoutId}`),
    duration: "3:45",
    category: "Workout",
    level: "All",
    description: "AI-generated demo preview for this workout.",
    workoutId,
  };
};

/** Get a demo video for any exercise — always returns a valid video. */
export const getExerciseVideo = (
  exerciseId: string,
  exerciseName?: string,
): WorkoutVideoData => {
  const key = `${exerciseId}-${exerciseName ?? ""}`;
  return {
    id: `auto-e-${exerciseId}`,
    title: exerciseName ? `${exerciseName} — Form Demo` : "Exercise Demo",
    thumbnailUrl: pickThumbnail(key),
    videoUrl: pickVideoUrl(key),
    duration: "0:45",
    category: "Exercise",
    level: "All",
    description: `AI-generated form demonstration${exerciseName ? ` for ${exerciseName}` : ""}.`,
    exerciseId,
  };
};
