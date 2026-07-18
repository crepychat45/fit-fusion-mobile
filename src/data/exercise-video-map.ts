/**
 * Exercise-specific demo video map.
 * Each exercise name maps to a curated YouTube demo video with proper form.
 * The `resolveExerciseVideo` function does case-insensitive keyword matching
 * so variants like "Push-ups", "PUSH UP", "Wide Push-Up" all resolve.
 */

export interface ExerciseVideoMatch {
  videoUrl: string; // YouTube nocookie embed URL (autoplay, muted, looped)
  thumbnailUrl: string; // YouTube thumbnail
  title: string;
  matchedKey: string;
  isYouTube: true;
}

const yt = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&modestbranding=1&rel=0&playsinline=1&controls=1`;

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// Ordered longer-keyword-first so "romanian deadlift" beats "deadlift".
// Each entry: [keyword(s), youtube id, display title]
const EXERCISE_LIBRARY: Array<[string[], string, string]> = [
  // Legs — barbell / compound
  [["romanian deadlift", "rdl"], "2SHsk9AzdjA", "Romanian Deadlift"],
  [["sumo deadlift"], "3EnW3JqDX6Y", "Sumo Deadlift"],
  [["deadlift"], "op9kVnSso6Q", "Deadlift"],
  [["front squat"], "tlfahNdNPPI", "Front Squat"],
  [["back squat", "barbell squat"], "SW_C1A-rejs", "Back Squat"],
  [["goblet squat"], "MeIiIdhvXT4", "Goblet Squat"],
  [["jump squat"], "CVaEhXotL7M", "Jump Squat"],
  [["bulgarian split squat", "split squat"], "2C-uNgKwPLE", "Bulgarian Split Squat"],
  [["squat"], "YaXPRqUwItQ", "Bodyweight Squat"],
  [["reverse lunge"], "xrPteyQlPvo", "Reverse Lunge"],
  [["walking lunge", "lunge"], "QOVaHwm-Q6U", "Lunge"],
  [["step up", "step-up"], "WCFCdxzFBa4", "Step Up"],
  [["hip thrust"], "SEdqd1n0cvg", "Hip Thrust"],
  [["glute bridge"], "m2Zx-57cSok", "Glute Bridge"],
  [["calf raise"], "-M4-G8p8fmc", "Calf Raise"],
  [["wall sit"], "y-wV4Venusw", "Wall Sit"],

  // Push — chest / shoulders / triceps
  [["incline bench"], "SrqOu55lrYU", "Incline Bench Press"],
  [["decline bench"], "LfyQBUKR8SE", "Decline Bench Press"],
  [["bench press", "chest press"], "rT7DgCr-3pg", "Bench Press"],
  [["dumbbell fly", "chest fly"], "eozdVDA78K0", "Chest Fly"],
  [["wide push", "wide-push"], "0F-6Bcr5oxo", "Wide Push-Up"],
  [["diamond push"], "J0DnG1_S92I", "Diamond Push-Up"],
  [["decline push"], "SKPab2YguwE", "Decline Push-Up"],
  [["incline push"], "4dF1DOWzf20", "Incline Push-Up"],
  [["push up", "pushup", "push-up"], "IODxDxX7oi4", "Push-Up"],
  [["overhead press", "shoulder press", "military press"], "qEwKCR5JCog", "Overhead Press"],
  [["arnold press"], "3ml7BH7mNwQ", "Arnold Press"],
  [["lateral raise", "side raise"], "3VcKaXpzqRo", "Lateral Raise"],
  [["front raise"], "-t7fuZ0KhDA", "Front Raise"],
  [["rear delt", "reverse fly"], "EA7u4Q_8HQ0", "Rear Delt Fly"],
  [["tricep dip", "triceps dip", "dip"], "6kALZikXxLc", "Tricep Dip"],
  [["skull crusher"], "d_KZxkY_0cM", "Skull Crusher"],
  [["tricep extension", "triceps extension"], "_gsUck-7M74", "Tricep Extension"],
  [["tricep kickback"], "6SS6K3lAwZ8", "Tricep Kickback"],

  // Pull — back / biceps
  [["chin up", "chin-up"], "brhRXlOhkAM", "Chin-Up"],
  [["pull up", "pull-up", "pullup"], "eGo4IYlbE5g", "Pull-Up"],
  [["lat pulldown"], "CAwf7n6Luuc", "Lat Pulldown"],
  [["seated row"], "GZbfZ033f74", "Seated Cable Row"],
  [["dumbbell row", "one arm row", "single arm row"], "pYcpY20QaE8", "Dumbbell Row"],
  [["bent over row", "barbell row", "row"], "FWJR5Ve8bnQ", "Bent-Over Row"],
  [["face pull"], "rep-qVOkqgk", "Face Pull"],
  [["shrug"], "cJRVVL7dcs4", "Shrug"],
  [["hammer curl"], "zC3nLlEvin4", "Hammer Curl"],
  [["preacher curl"], "fIWP-FRFNU0", "Preacher Curl"],
  [["bicep curl", "biceps curl", "curl"], "ykJmrZ5v0Oo", "Bicep Curl"],

  // Core
  [["side plank"], "K2VljzCC16g", "Side Plank"],
  [["plank"], "pSHjTRCQxIw", "Plank"],
  [["bicycle crunch"], "9FGilxCbdz8", "Bicycle Crunch"],
  [["reverse crunch"], "hyvJgqFhbSk", "Reverse Crunch"],
  [["crunch"], "Xyd_fa5zoEU", "Crunch"],
  [["sit up", "situp", "sit-up"], "1fbU_MkV7NE", "Sit-Up"],
  [["leg raise", "leg lift"], "JB2oyawG9KI", "Leg Raise"],
  [["russian twist"], "wkD8rjkodUI", "Russian Twist"],
  [["mountain climber"], "nmwgirgXLYM", "Mountain Climber"],
  [["v up", "v-up"], "iP_iPZDgVWs", "V-Up"],
  [["flutter kick"], "eEg-3fEJlMs", "Flutter Kick"],
  [["hollow hold", "hollow body"], "LlDNef_Ztsc", "Hollow Hold"],
  [["superman"], "cc6UVRS7PW4", "Superman"],
  [["dead bug", "deadbug"], "4XLEnwUr1d8", "Dead Bug"],
  [["bird dog"], "wiFNA3sqjCA", "Bird Dog"],

  // Cardio / HIIT / Plyo
  [["burpee"], "dZgVxmf6jkA", "Burpee"],
  [["jumping jack"], "c4DAnQ6DtF8", "Jumping Jacks"],
  [["high knee"], "oDdkytliOqE", "High Knees"],
  [["butt kick"], "hE-JVMhqNIw", "Butt Kicks"],
  [["jump rope", "skipping"], "1BZM2Vre5oc", "Jump Rope"],
  [["box jump"], "52r_Ul5k03g", "Box Jump"],
  [["kettlebell swing"], "YSxHifyI6s8", "Kettlebell Swing"],
  [["skater"], "2Lf6c-nCPP0", "Skater Jump"],
  [["sprint", "running"], "brFHyOtTwH4", "Sprint"],
  [["bear crawl"], "A1atsBmoM24", "Bear Crawl"],
  [["farmer walk", "farmer carry"], "p5g7f5LxUXU", "Farmer's Walk"],
  [["clamshell"], "aiJcSlmSl20", "Clamshell"],
  [["fire hydrant"], "G6-jSVfeSpM", "Fire Hydrant"],

  // Yoga / mobility
  [["downward dog"], "5MyN1YFdt8M", "Downward Dog"],
  [["child pose", "childs pose", "child's pose"], "kH_fs8fjBmE", "Child's Pose"],
  [["cobra pose", "cobra stretch"], "1PrEuj0EbbY", "Cobra Pose"],
  [["cat cow", "cat-cow"], "kqnua4rHVVA", "Cat-Cow"],
  [["pigeon pose"], "HdT6yBjBmI4", "Pigeon Pose"],
  [["warrior"], "Mn6RSIRCV3w", "Warrior Pose"],
];

// Generic fallback — proper-form full-body demo.
const GENERIC_FALLBACK_ID = "UBMk30rjy0o"; // Fitness Blender bodyweight workout

/**
 * Resolve an exercise name to a specific YouTube demo video.
 * Uses substring keyword matching (longer keys first).
 */
export function resolveExerciseVideo(name: string): ExerciseVideoMatch {
  const q = (name || "").toLowerCase().trim();

  if (q) {
    for (const [keys, id, title] of EXERCISE_LIBRARY) {
      if (keys.some((k) => q.includes(k))) {
        return {
          videoUrl: yt(id),
          thumbnailUrl: thumb(id),
          title,
          matchedKey: keys[0],
          isYouTube: true,
        };
      }
    }
  }

  return {
    videoUrl: yt(GENERIC_FALLBACK_ID),
    thumbnailUrl: thumb(GENERIC_FALLBACK_ID),
    title: name || "Exercise Demo",
    matchedKey: "generic",
    isYouTube: true,
  };
}

export const isYouTubeEmbed = (url: string) =>
  /(?:^|\/\/)(www\.)?(youtube(-nocookie)?\.com)\/embed\//i.test(url);
