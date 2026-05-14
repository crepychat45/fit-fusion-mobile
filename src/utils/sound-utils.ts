import { playSound as playSoundBase } from "./feedback-utils";

type SoundType =
  | "notification"
  | "achievement"
  | "workout-start"
  | "workout-complete"
  | "success"
  | "error"
  | "tap";

interface CustomSound {
  name: string;
  url: string;
  type: SoundType;
}

// Get custom sounds from localStorage
const getCustomSounds = (): Record<string, string> => {
  const saved = localStorage.getItem("fitfusion-custom-sounds");
  return saved ? JSON.parse(saved) : {};
};

// Upload a custom sound and save to localStorage
export const uploadCustomSound = async (
  file: File,
  name: string,
  type: SoundType,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // Check if file is an audio file
    if (!file.type.startsWith("audio/")) {
      reject(new Error("File must be an audio file"));
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("File size exceeds 2MB limit"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === "string") {
          const customSounds = getCustomSounds();
          customSounds[name] = reader.result;

          // Save to localStorage
          localStorage.setItem(
            "fitfusion-custom-sounds",
            JSON.stringify(customSounds),
          );

          // Return the data URL of the sound
          resolve(reader.result);
        } else {
          reject(new Error("Could not read file"));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
};

// Play a sound from the custom sounds or fallback to default
export const playSound = (
  soundType: SoundType,
  customName?: string,
  volume = 1.0,
): Promise<void> => {
  // If a custom sound name is provided, try to play it
  if (customName) {
    const customSounds = getCustomSounds();
    if (customSounds[customName]) {
      const audio = new Audio(customSounds[customName]);
      audio.volume = volume;
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (err) => {
          console.error("Error playing custom sound:", err);
          // Fallback to default sound
          playSoundBase(soundType, volume).then(resolve).catch(reject);
        };

        audio.play().catch((err) => {
          console.error("Could not play custom sound:", err);
          // Fallback to default sound
          playSoundBase(soundType, volume).then(resolve).catch(reject);
        });
      });
    }
  }

  // If no custom sound or custom sound not found, use the default
  return playSoundBase(soundType, volume);
};

// Delete a custom sound
export const deleteCustomSound = (name: string): boolean => {
  try {
    const customSounds = getCustomSounds();
    if (customSounds[name]) {
      delete customSounds[name];
      localStorage.setItem(
        "fitfusion-custom-sounds",
        JSON.stringify(customSounds),
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting custom sound:", error);
    return false;
  }
};

// Get all custom sounds
export const getAllCustomSounds = (): Array<{ name: string; url: string }> => {
  const customSounds = getCustomSounds();
  return Object.entries(customSounds).map(([name, url]) => ({
    name,
    url: url as string,
  }));
};
