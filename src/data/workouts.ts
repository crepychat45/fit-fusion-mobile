import { extraWorkouts } from "./workouts-extra";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  instructions: string;
  muscles: string[];
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  category: "strength" | "cardio" | "flexibility" | "hiit";
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  exercises: Exercise[];
  popularity: number;
  createdAt: number;
  /** Optional media + metadata (used by newer library entries). */
  videoUrl?: string;
  thumbnailUrl?: string;
  calories?: number;
  equipment?: string[];
  tags?: string[];
}

const baseWorkouts: Workout[] = [
  {
    id: "1",
    title: "Full Body Strength",
    description:
      "A complete full body workout targeting all major muscle groups",
    category: "strength",
    level: "beginner",
    duration: 45,
    popularity: 95,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    exercises: [
      {
        id: "e1",
        name: "Push-ups",
        sets: 3,
        reps: 10,
        instructions:
          "Start in a plank position with your hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.",
        muscles: ["chest", "shoulders", "triceps"],
      },
      {
        id: "e2",
        name: "Bodyweight Squats",
        sets: 3,
        reps: 15,
        instructions:
          "Stand with feet shoulder-width apart. Lower your body as if sitting in a chair, keeping your chest up and knees over toes.",
        muscles: ["quadriceps", "hamstrings", "glutes"],
      },
      {
        id: "e3",
        name: "Plank",
        sets: 3,
        duration: 30,
        reps: 1,
        instructions:
          "Assume a push-up position but with your weight on your forearms. Keep your body in a straight line from head to heels.",
        muscles: ["core", "shoulders"],
      },
      {
        id: "e4",
        name: "Lunges",
        sets: 3,
        reps: 10,
        instructions:
          "Take a step forward and lower your body until both knees form 90-degree angles. Push back to starting position and repeat with the other leg.",
        muscles: ["quadriceps", "hamstrings", "glutes"],
      },
      {
        id: "e5",
        name: "Dumbbell Rows",
        sets: 3,
        reps: 12,
        instructions:
          "Bend at the waist with a flat back, holding weights with arms extended. Pull the weights to your hips, squeezing your shoulder blades together.",
        muscles: ["back", "biceps"],
      },
    ],
  },
  {
    id: "2",
    title: "HIIT Cardio Blast",
    description:
      "High-intensity interval training to maximize calorie burn and improve cardiovascular fitness",
    category: "hiit",
    level: "intermediate",
    duration: 30,
    popularity: 87,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    exercises: [
      {
        id: "e6",
        name: "Jumping Jacks",
        sets: 4,
        reps: 30,
        instructions:
          "Start with feet together and arms at sides. Jump feet apart while raising arms overhead, then return to starting position.",
        muscles: ["full body"],
      },
      {
        id: "e7",
        name: "Burpees",
        sets: 4,
        reps: 10,
        instructions:
          "Begin standing, drop to a squat, kick feet back to a plank, do a push-up, jump feet back to squat, then explode upward with a jump.",
        muscles: ["full body"],
      },
      {
        id: "e8",
        name: "Mountain Climbers",
        sets: 4,
        duration: 30,
        reps: 1,
        instructions:
          "Start in a plank position. Rapidly alternate bringing knees toward chest in a running motion.",
        muscles: ["core", "shoulders", "legs"],
      },
      {
        id: "e9",
        name: "High Knees",
        sets: 4,
        duration: 30,
        reps: 1,
        instructions:
          "Run in place, bringing knees up toward chest as high as possible with each step.",
        muscles: ["core", "hip flexors", "quadriceps"],
      },
    ],
  },
  {
    id: "3",
    title: "Core Crusher",
    description:
      "Focused abdominal workout to strengthen your core and build definition",
    category: "strength",
    level: "beginner",
    duration: 20,
    popularity: 92,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    exercises: [
      {
        id: "e10",
        name: "Crunches",
        sets: 3,
        reps: 15,
        instructions:
          "Lie on your back with knees bent, feet flat. Place hands behind head and lift shoulders off the floor, then lower back down.",
        muscles: ["abdominals"],
      },
      {
        id: "e11",
        name: "Russian Twists",
        sets: 3,
        reps: 20,
        instructions:
          "Sit with knees bent and feet elevated. Lean back slightly and rotate torso from side to side.",
        muscles: ["obliques", "abdominals"],
      },
      {
        id: "e12",
        name: "Leg Raises",
        sets: 3,
        reps: 12,
        instructions:
          "Lie on your back with legs straight. Keeping legs together, lift them toward the ceiling, then lower back down without touching the floor.",
        muscles: ["lower abdominals", "hip flexors"],
      },
      {
        id: "e13",
        name: "Plank Shoulder Taps",
        sets: 3,
        reps: 10,
        instructions:
          "Start in a plank position. Keeping hips stable, tap each shoulder with the opposite hand.",
        muscles: ["core", "shoulders"],
      },
    ],
  },
  {
    id: "4",
    title: "Flexibility Flow",
    description:
      "Improve mobility and reduce muscle tension with this stretching routine",
    category: "flexibility",
    level: "beginner",
    duration: 25,
    popularity: 78,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    exercises: [
      {
        id: "e14",
        name: "Standing Hamstring Stretch",
        sets: 2,
        duration: 30,
        reps: 1,
        instructions:
          "Stand with one foot forward, toe up. Hinge at hips with straight back until you feel a stretch in the back of your leg.",
        muscles: ["hamstrings"],
      },
      {
        id: "e15",
        name: "Hip Flexor Stretch",
        sets: 2,
        duration: 30,
        reps: 1,
        instructions:
          "Kneel on one knee with other foot forward. Gently push hips forward until you feel a stretch in front of back leg.",
        muscles: ["hip flexors"],
      },
      {
        id: "e16",
        name: "Child's Pose",
        sets: 2,
        duration: 60,
        reps: 1,
        instructions:
          "Kneel with toes together, knees apart. Extend arms forward and lower torso between knees, resting forehead on floor.",
        muscles: ["back", "shoulders"],
      },
      {
        id: "e17",
        name: "Chest Opener",
        sets: 2,
        duration: 30,
        reps: 1,
        instructions:
          "Stand in a doorway with elbows bent at 90 degrees against doorframe. Step forward with one foot and lean forward gently.",
        muscles: ["chest", "shoulders"],
      },
    ],
  },
  // --- Expanded Library (15 new workouts) ---
  {
    id: "w-hiit-tabata", title: "Tabata Torch",
    description: "8 rounds of 20s all-out, 10s rest. Maximum calorie burn.",
    category: "hiit", level: "advanced", duration: 24, popularity: 92,
    createdAt: Date.now() - 86400000,
    exercises: [
      { id: "tb1", name: "Burpees", sets: 8, reps: 12, duration: 20, instructions: "Full burpee with jump.", muscles: ["full body"] },
      { id: "tb2", name: "Mountain Climbers", sets: 8, reps: 30, duration: 20, instructions: "Sprint knees to chest in plank.", muscles: ["core"] },
      { id: "tb3", name: "Jump Squats", sets: 8, reps: 15, duration: 20, instructions: "Explode up from squat.", muscles: ["legs"] },
    ],
  },
  {
    id: "w-upper-power", title: "Upper Body Power",
    description: "Sculpt chest, back and arms with progressive dumbbell circuits.",
    category: "strength", level: "intermediate", duration: 40, popularity: 88, createdAt: Date.now() - 172800000,
    exercises: [
      { id: "up1", name: "Bench Press", sets: 4, reps: 10, instructions: "Lower bar to chest, drive up.", muscles: ["chest"] },
      { id: "up2", name: "Bent-Over Rows", sets: 4, reps: 10, instructions: "Row weight to hips.", muscles: ["back"] },
      { id: "up3", name: "Overhead Press", sets: 3, reps: 12, instructions: "Press dumbbells overhead.", muscles: ["shoulders"] },
      { id: "up4", name: "Bicep Curls", sets: 3, reps: 12, instructions: "Curl weights to shoulder.", muscles: ["biceps"] },
    ],
  },
  {
    id: "w-lower-legs", title: "Leg Day Domination",
    description: "Heavy compound lifts for stronger legs and glutes.",
    category: "strength", level: "advanced", duration: 55, popularity: 90, createdAt: Date.now() - 259200000,
    exercises: [
      { id: "lg1", name: "Back Squats", sets: 5, reps: 5, instructions: "Squat below parallel.", muscles: ["quads", "glutes"] },
      { id: "lg2", name: "Romanian Deadlift", sets: 4, reps: 8, instructions: "Hinge at hips.", muscles: ["hamstrings"] },
      { id: "lg3", name: "Bulgarian Split Squat", sets: 3, reps: 10, instructions: "Rear foot elevated.", muscles: ["quads"] },
      { id: "lg4", name: "Calf Raises", sets: 4, reps: 20, instructions: "Rise onto toes.", muscles: ["calves"] },
    ],
  },
  {
    id: "w-core-abs", title: "6-Pack Abs Circuit",
    description: "Targeted core work for a stronger midsection.",
    category: "strength", level: "intermediate", duration: 20, popularity: 87, createdAt: Date.now() - 345600000,
    exercises: [
      { id: "ab1", name: "Hanging Leg Raise", sets: 3, reps: 12, instructions: "Hang, raise legs to 90°.", muscles: ["abs"] },
      { id: "ab2", name: "Russian Twists", sets: 3, reps: 30, instructions: "Rotate torso side to side.", muscles: ["obliques"] },
      { id: "ab3", name: "Dead Bug", sets: 3, reps: 12, instructions: "Opposite arm/leg extend.", muscles: ["core"] },
      { id: "ab4", name: "Cable Crunch", sets: 3, reps: 15, instructions: "Kneel, crunch against cable.", muscles: ["abs"] },
    ],
  },
  {
    id: "w-run-5k", title: "5K Run Builder",
    description: "Progressive interval run to build your first sub-30 5K.",
    category: "cardio", level: "beginner", duration: 35, popularity: 85, createdAt: Date.now() - 432000000,
    exercises: [
      { id: "rn1", name: "Dynamic Warmup", sets: 1, reps: 1, duration: 300, instructions: "Leg swings, high knees.", muscles: ["full body"] },
      { id: "rn2", name: "Run Intervals", sets: 5, reps: 1, duration: 300, instructions: "3 min easy, 2 min tempo.", muscles: ["legs"] },
      { id: "rn3", name: "Cool Down Walk", sets: 1, reps: 1, duration: 300, instructions: "Slow walk, deep breathing.", muscles: ["legs"] },
    ],
  },
  {
    id: "w-mobility", title: "Full Body Mobility",
    description: "Restore range of motion in hips, shoulders and spine.",
    category: "flexibility", level: "beginner", duration: 25, popularity: 80, createdAt: Date.now() - 518400000,
    exercises: [
      { id: "mo1", name: "Cat-Cow", sets: 2, reps: 10, instructions: "Alternate spine flexion.", muscles: ["spine"] },
      { id: "mo2", name: "World's Greatest Stretch", sets: 2, reps: 8, instructions: "Lunge + rotation.", muscles: ["hips"] },
      { id: "mo3", name: "90/90 Hip Switch", sets: 2, reps: 10, instructions: "Sit and switch hips.", muscles: ["hips"] },
      { id: "mo4", name: "Shoulder CARs", sets: 2, reps: 8, instructions: "Controlled shoulder circles.", muscles: ["shoulders"] },
    ],
  },
  {
    id: "w-kb-flow", title: "Kettlebell Flow",
    description: "Explosive kettlebell complex for power and conditioning.",
    category: "hiit", level: "intermediate", duration: 30, popularity: 84, createdAt: Date.now() - 604800000,
    exercises: [
      { id: "kb1", name: "KB Swings", sets: 5, reps: 20, instructions: "Hinge and swing to shoulder.", muscles: ["glutes"] },
      { id: "kb2", name: "Goblet Squat", sets: 4, reps: 12, instructions: "Squat holding KB at chest.", muscles: ["legs"] },
      { id: "kb3", name: "KB Clean & Press", sets: 4, reps: 8, instructions: "Clean to rack, press up.", muscles: ["full body"] },
      { id: "kb4", name: "Turkish Get-Up", sets: 3, reps: 3, instructions: "Rise with KB overhead.", muscles: ["full body"] },
    ],
  },
  {
    id: "w-yoga-power", title: "Power Yoga Flow",
    description: "Vinyasa flow to build strength and flexibility together.",
    category: "flexibility", level: "intermediate", duration: 40, popularity: 82, createdAt: Date.now() - 691200000,
    exercises: [
      { id: "yg1", name: "Sun Salutation A", sets: 5, reps: 1, duration: 60, instructions: "Full flow sequence.", muscles: ["full body"] },
      { id: "yg2", name: "Warrior Sequence", sets: 3, reps: 1, duration: 90, instructions: "Warrior 1, 2, 3.", muscles: ["legs"] },
      { id: "yg3", name: "Crow Pose", sets: 3, reps: 1, duration: 30, instructions: "Balance on hands.", muscles: ["arms"] },
    ],
  },
  {
    id: "w-cycle", title: "Cycling Endurance",
    description: "Steady-state ride to build aerobic base.",
    category: "cardio", level: "intermediate", duration: 60, popularity: 78, createdAt: Date.now() - 777600000,
    exercises: [
      { id: "cy1", name: "Warmup Spin", sets: 1, reps: 1, duration: 600, instructions: "Easy cadence.", muscles: ["legs"] },
      { id: "cy2", name: "Zone 2 Ride", sets: 1, reps: 1, duration: 2400, instructions: "Steady 65-75% HR.", muscles: ["legs"] },
      { id: "cy3", name: "Cool Down", sets: 1, reps: 1, duration: 600, instructions: "Easy spin.", muscles: ["legs"] },
    ],
  },
  {
    id: "w-boxing", title: "Boxing Conditioning",
    description: "Shadow-boxing rounds mixed with calisthenics.",
    category: "cardio", level: "intermediate", duration: 35, popularity: 86, createdAt: Date.now() - 864000000,
    exercises: [
      { id: "bx1", name: "Jab-Cross Combos", sets: 5, reps: 1, duration: 180, instructions: "3-min rounds.", muscles: ["arms"] },
      { id: "bx2", name: "Slip Squats", sets: 4, reps: 20, instructions: "Slip side to side.", muscles: ["legs"] },
      { id: "bx3", name: "Speed Bag", sets: 4, reps: 1, duration: 120, instructions: "Rhythm punches.", muscles: ["shoulders"] },
    ],
  },
  {
    id: "w-glutes", title: "Glute Builder",
    description: "Resistance band circuit to activate and grow the glutes.",
    category: "strength", level: "beginner", duration: 25, popularity: 89, createdAt: Date.now() - 950400000,
    exercises: [
      { id: "gl1", name: "Hip Thrust", sets: 4, reps: 12, instructions: "Bridge hips with band.", muscles: ["glutes"] },
      { id: "gl2", name: "Clamshells", sets: 3, reps: 15, instructions: "Open knees against band.", muscles: ["glutes"] },
      { id: "gl3", name: "Banded Walks", sets: 3, reps: 20, instructions: "Side steps with band.", muscles: ["glutes"] },
      { id: "gl4", name: "Kickbacks", sets: 3, reps: 15, instructions: "Kick heel to ceiling.", muscles: ["glutes"] },
    ],
  },
  {
    id: "w-swim", title: "Pool Swim Set",
    description: "Structured swim for cardio and joint-friendly conditioning.",
    category: "cardio", level: "intermediate", duration: 45, popularity: 74, createdAt: Date.now() - 1036800000,
    exercises: [
      { id: "sw1", name: "Warmup Freestyle", sets: 1, reps: 1, duration: 300, instructions: "400m easy.", muscles: ["full body"] },
      { id: "sw2", name: "Interval Set", sets: 8, reps: 1, duration: 90, instructions: "50m fast, 30s rest.", muscles: ["cardio"] },
      { id: "sw3", name: "Kick Board", sets: 4, reps: 1, duration: 60, instructions: "50m kick only.", muscles: ["legs"] },
    ],
  },
  {
    id: "w-back-pull", title: "Back & Pull Day",
    description: "Pulls for a wider, thicker back.",
    category: "strength", level: "intermediate", duration: 50, popularity: 83, createdAt: Date.now() - 1123200000,
    exercises: [
      { id: "bk1", name: "Pull-Ups", sets: 4, reps: 8, instructions: "Full ROM.", muscles: ["back"] },
      { id: "bk2", name: "Seated Cable Row", sets: 4, reps: 10, instructions: "Row to belly.", muscles: ["back"] },
      { id: "bk3", name: "Face Pulls", sets: 3, reps: 15, instructions: "Rope to face.", muscles: ["rear delts"] },
      { id: "bk4", name: "Hammer Curls", sets: 3, reps: 12, instructions: "Neutral grip curl.", muscles: ["biceps"] },
    ],
  },
  {
    id: "w-desk", title: "Desk Recovery",
    description: "10-minute reset for neck, shoulders and back.",
    category: "flexibility", level: "beginner", duration: 10, popularity: 91, createdAt: Date.now() - 1209600000,
    exercises: [
      { id: "dr1", name: "Neck Rolls", sets: 2, reps: 8, instructions: "Slow circles.", muscles: ["neck"] },
      { id: "dr2", name: "Thoracic Extensions", sets: 2, reps: 10, instructions: "Arch over chair.", muscles: ["upper back"] },
      { id: "dr3", name: "Hip Flexor Stretch", sets: 2, reps: 1, duration: 30, instructions: "Kneeling lunge.", muscles: ["hips"] },
    ],
  },
  {
    id: "w-emom", title: "EMOM 30 Challenge",
    description: "Every Minute on the Minute for 30 minutes. Test your grit.",
    category: "hiit", level: "advanced", duration: 30, popularity: 79, createdAt: Date.now() - 1296000000,
    exercises: [
      { id: "em1", name: "Pull-Ups", sets: 10, reps: 5, instructions: "Every odd minute.", muscles: ["back"] },
      { id: "em2", name: "Push-Ups", sets: 10, reps: 10, instructions: "Every even minute.", muscles: ["chest"] },
      { id: "em3", name: "Air Squats", sets: 10, reps: 15, instructions: "Every third minute.", muscles: ["legs"] },
    ],
  },
];

export const workouts: Workout[] = [...baseWorkouts, ...extraWorkouts];
