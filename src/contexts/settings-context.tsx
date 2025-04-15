
import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  // Display settings
  compactView: boolean;
  setCompactView: (value: boolean) => void;
  showCalories: boolean;
  setShowCalories: (value: boolean) => void;
  showHeartRate: boolean;
  setShowHeartRate: (value: boolean) => void;
  textSize: number;
  setTextSize: (value: number) => void;
  
  // Sound settings
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  workoutSounds: boolean;
  setWorkoutSounds: (value: boolean) => void;
  notificationSounds: boolean;
  setNotificationSounds: (value: boolean) => void;
  voiceGuidance: boolean;
  setVoiceGuidance: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (value: boolean) => void;
  
  // Device settings
  heartRateMonitoring: boolean;
  setHeartRateMonitoring: (value: boolean) => void;
  sleepTracking: boolean;
  setSleepTracking: (value: boolean) => void;
  stepCounting: boolean;
  setStepCounting: (value: boolean) => void;
  
  // Programming languages settings
  codeEditorEnabled: boolean;
  setCCodeEditorEnabled: (value: boolean) => void;
  programmingLanguages: string[];
  addProgrammingLanguage: (language: string) => void;
  removeProgrammingLanguage: (language: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Display settings
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem("fitfusion-compact-view") === "true";
  });
  
  const [showCalories, setShowCalories] = useState(() => {
    return localStorage.getItem("fitfusion-show-calories") !== "false";
  });
  
  const [showHeartRate, setShowHeartRate] = useState(() => {
    return localStorage.getItem("fitfusion-show-heart-rate") !== "false";
  });
  
  const [textSize, setTextSize] = useState(() => {
    const savedSize = localStorage.getItem("fitfusion-text-size");
    return savedSize ? parseInt(savedSize) : 16;
  });
  
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("fitfusion-sound-enabled") !== "false";
  });
  
  const [workoutSounds, setWorkoutSounds] = useState(() => {
    return localStorage.getItem("fitfusion-workout-sounds") !== "false";
  });
  
  const [notificationSounds, setNotificationSounds] = useState(() => {
    return localStorage.getItem("fitfusion-notification-sounds") !== "false";
  });
  
  const [voiceGuidance, setVoiceGuidance] = useState(() => {
    return localStorage.getItem("fitfusion-voice-guidance") === "true";
  });
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("fitfusion-sound-volume");
    return savedVolume ? parseInt(savedVolume) : 70;
  });
  
  const [hapticFeedback, setHapticFeedback] = useState(() => {
    return localStorage.getItem("fitfusion-haptic-enabled") !== "false";
  });
  
  // Device settings
  const [heartRateMonitoring, setHeartRateMonitoring] = useState(() => {
    return localStorage.getItem("fitfusion-heart-rate-monitoring") !== "false";
  });
  
  const [sleepTracking, setSleepTracking] = useState(() => {
    return localStorage.getItem("fitfusion-sleep-tracking") === "true";
  });
  
  const [stepCounting, setStepCounting] = useState(() => {
    return localStorage.getItem("fitfusion-step-counting") !== "false";
  });
  
  // Programming languages settings
  const [codeEditorEnabled, setCCodeEditorEnabled] = useState(() => {
    return localStorage.getItem("fitfusion-code-editor-enabled") === "true";
  });
  
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(() => {
    const savedLanguages = localStorage.getItem("fitfusion-programming-languages");
    return savedLanguages ? JSON.parse(savedLanguages) : ["JavaScript", "HTML", "CSS"];
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("fitfusion-compact-view", compactView.toString());
  }, [compactView]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-show-calories", showCalories.toString());
  }, [showCalories]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-show-heart-rate", showHeartRate.toString());
  }, [showHeartRate]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-text-size", textSize.toString());
    document.documentElement.style.fontSize = `${textSize}px`;
  }, [textSize]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-workout-sounds", workoutSounds.toString());
  }, [workoutSounds]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-notification-sounds", notificationSounds.toString());
  }, [notificationSounds]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-voice-guidance", voiceGuidance.toString());
  }, [voiceGuidance]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sound-volume", volume.toString());
  }, [volume]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-haptic-enabled", hapticFeedback.toString());
  }, [hapticFeedback]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-heart-rate-monitoring", heartRateMonitoring.toString());
  }, [heartRateMonitoring]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sleep-tracking", sleepTracking.toString());
  }, [sleepTracking]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-step-counting", stepCounting.toString());
  }, [stepCounting]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-code-editor-enabled", codeEditorEnabled.toString());
  }, [codeEditorEnabled]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-programming-languages", JSON.stringify(programmingLanguages));
  }, [programmingLanguages]);
  
  // Function to add a programming language
  const addProgrammingLanguage = (language: string) => {
    if (!programmingLanguages.includes(language)) {
      setProgrammingLanguages([...programmingLanguages, language]);
    }
  };
  
  // Function to remove a programming language
  const removeProgrammingLanguage = (language: string) => {
    setProgrammingLanguages(programmingLanguages.filter(lang => lang !== language));
  };
  
  return (
    <SettingsContext.Provider value={{
      compactView,
      setCompactView,
      showCalories,
      setShowCalories,
      showHeartRate,
      setShowHeartRate,
      textSize,
      setTextSize,
      soundEnabled,
      setSoundEnabled,
      workoutSounds,
      setWorkoutSounds,
      notificationSounds,
      setNotificationSounds,
      voiceGuidance,
      setVoiceGuidance,
      volume,
      setVolume,
      hapticFeedback,
      setHapticFeedback,
      heartRateMonitoring,
      setHeartRateMonitoring,
      sleepTracking,
      setSleepTracking,
      stepCounting,
      setStepCounting,
      codeEditorEnabled,
      setCCodeEditorEnabled,
      programmingLanguages,
      addProgrammingLanguage,
      removeProgrammingLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
