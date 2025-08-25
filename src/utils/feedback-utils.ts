export type SoundEffect =
  | "workout-start"
  | "workout-complete"
  | "notification"
  | "achievement"
  | "error"
  | "success"
  | "tap";

// Sound map with paths to sound files
const soundMap: Record<SoundEffect, string> = {
  "workout-start": "/sounds/workout-start.mp3",
  "workout-complete": "/sounds/workout-complete.mp3",
  notification: "/sounds/notification.mp3",
  achievement: "/sounds/achievement.mp3",
  error: "/sounds/error.mp3",
  success: "/sounds/success.mp3",
  tap: "/sounds/tap.mp3",
};

// Default sound paths (fallbacks)
const defaultSoundPaths: Record<SoundEffect, string> = {
  "workout-start": "/sounds/default-start.mp3",
  "workout-complete": "/sounds/default-complete.mp3",
  notification: "/sounds/default-notification.mp3",
  achievement: "/sounds/default-achievement.mp3",
  error: "/sounds/default-error.mp3",
  success: "/sounds/default-success.mp3",
  tap: "/sounds/default-tap.mp3",
};

// Play sound effect
export const playSound = (sound: SoundEffect, volume = 1.0): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if sound is enabled in settings
      const soundEnabled =
        localStorage.getItem("fitfusion-sound-enabled") !== "false";
      if (!soundEnabled) {
        resolve();
        return;
      }

      // Get volume from settings (or use default)
      const storedVolume = localStorage.getItem("fitfusion-sound-volume");
      const actualVolume = storedVolume
        ? (parseInt(storedVolume) / 100) * volume
        : volume;

      const audio = new Audio(soundMap[sound] || defaultSoundPaths[sound]);
      audio.volume = Math.min(Math.max(actualVolume, 0), 1); // Ensure volume is between 0 and 1

      audio.onended = () => resolve();
      audio.onerror = (error) => {
        console.error(`Error playing sound ${sound}:`, error);
        resolve(); // Resolve anyway to prevent blocking
      };

      audio.play().catch((error) => {
        console.warn(`Could not play sound ${sound}:`, error);
        resolve(); // Resolve anyway to prevent blocking
      });
    } catch (error) {
      console.error("Error in playSound:", error);
      resolve(); // Resolve anyway to prevent blocking
    }
  });
};

// Vibration patterns
export type VibrationPattern =
  | "short"
  | "medium"
  | "long"
  | "double"
  | "success"
  | "error"
  | "warning";

const vibrationPatterns: Record<VibrationPattern, number[]> = {
  short: [50],
  medium: [100],
  long: [300],
  double: [50, 30, 50],
  success: [50, 50, 150],
  error: [100, 50, 100, 50, 100],
  warning: [70, 50, 70],
};

// Provide haptic feedback
export const vibrate = (pattern: VibrationPattern = "short"): void => {
  try {
    // Check if haptic feedback is enabled in settings
    const hapticEnabled =
      localStorage.getItem("fitfusion-haptic-enabled") !== "false";
    if (!hapticEnabled) return;

    // Check if vibration API is available
    if (navigator.vibrate) {
      navigator.vibrate(vibrationPatterns[pattern]);
    }
  } catch (error) {
    console.error("Error in vibrate:", error);
  }
};

// Provide both sound and haptic feedback
export const provideFeedback = (
  sound: SoundEffect,
  vibration: VibrationPattern = "short",
  volume = 1.0,
): Promise<void> => {
  vibrate(vibration);
  return playSound(sound, volume);
};

// Test sound
export const testSound = async (): Promise<void> => {
  try {
    await playSound("notification", 1.0);
    return Promise.resolve();
  } catch (error) {
    console.error("Error testing sound:", error);
    return Promise.reject(error);
  }
};

// Test haptic feedback
export const testHapticFeedback = (): void => {
  try {
    vibrate("success");
  } catch (error) {
    console.error("Error testing haptic feedback:", error);
  }
};
