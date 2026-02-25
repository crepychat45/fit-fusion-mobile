import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SubscriptionPlan = "Free" | "Basic" | "Super" | "Advance";
type PaymentMethod =
  | "Cash"
  | "GPay"
  | "PhonePe"
  | "NetBanking"
  | "CreditCard"
  | "DebitCard"
  | "UPI";
type UnitSystem = "metric" | "imperial";

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (enabled: boolean) => void;
  soundPack: string;
  setSoundPack: (pack: string) => void;
  customSounds: Record<string, string>;
  addCustomSound: (name: string, url: string) => void;
  removeCustomSound: (name: string) => void;
  exportFormat: "json" | "csv" | "pdf" | "html";
  setExportFormat: (format: "json" | "csv" | "pdf" | "html") => void;
  exportAnonymized: boolean;
  setExportAnonymized: (anonymized: boolean) => void;
  exportCategories: string[];
  setExportCategories: (categories: string[]) => void;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
  language: string;
  setLanguage: (lang: string) => void;
  autoSync: boolean;
  setAutoSync: (sync: boolean) => void;
  cloudBackup: boolean;
  setCloudBackup: (backup: boolean) => void;
  notifications: boolean;
  setNotifications: (notifications: boolean) => void;
  codeEditorEnabled: boolean;
  setCCodeEditorEnabled: (enabled: boolean) => void;
  appVersion: string;
  setAppVersion: (version: string) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  compactView: boolean;
  setCompactView: (enabled: boolean) => void;
  showCalories: boolean;
  setShowCalories: (enabled: boolean) => void;
  showHeartRate: boolean;
  setShowHeartRate: (enabled: boolean) => void;
  programmingLanguages: string[];
  addProgrammingLanguage: (language: string) => void;
  removeProgrammingLanguage: (language: string) => void;
  developerOptions: {
    debugMode: boolean;
    apiLogging: boolean;
    experimentalFeatures: boolean;
    performanceMonitoring: boolean;
    betaAccess: boolean;
    customScripting: boolean;
  };
  setDeveloperOption: (
    option: keyof SettingsContextType["developerOptions"],
    value: boolean,
  ) => void;
  displayOptions: {
    animations: boolean;
    highContrast: boolean;
    compactView: boolean;
    showTips: boolean;
    darkModeSchedule: boolean;
    customFonts: boolean;
  };
  setDisplayOption: (
    option: keyof SettingsContextType["displayOptions"],
    value: boolean,
  ) => void;
  saveProfileInfo: (profileData: Record<string, any>) => Promise<boolean>;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Safe localStorage helper
const safeLocalStorage = {
  getItem: (key: string, defaultValue: string = ""): string => {
    if (typeof window === "undefined") return defaultValue;
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  },
  getBoolItem: (key: string, defaultValue: boolean = false): boolean => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? saved === "true" : defaultValue;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  getJsonItem: (key: string, defaultValue: any = {}): any => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-sound-enabled", true)
  );

  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = safeLocalStorage.getItem("fitfusion-sound-volume", "80");
    return parseInt(saved) || 80;
  });

  const [hapticEnabled, setHapticEnabled] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-haptic-enabled", true)
  );

  const [hapticFeedback, setHapticFeedback] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-haptic-feedback", true)
  );

  const [soundPack, setSoundPack] = useState(() =>
    safeLocalStorage.getItem("fitfusion-sound-pack", "default")
  );

  const [customSounds, setCustomSounds] = useState<Record<string, string>>(() =>
    safeLocalStorage.getJsonItem("fitfusion-custom-sounds", {})
  );

  // Display settings
  const [compactView, setCompactView] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-compact-view", false)
  );

  const [showCalories, setShowCalories] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-show-calories", true)
  );

  const [showHeartRate, setShowHeartRate] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-show-heart-rate", true)
  );

  // Unit system settings
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = safeLocalStorage.getItem("fitfusion-unit-system", "metric");
    return (saved as UnitSystem) || "metric";
  });

  // Programming languages
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(() =>
    safeLocalStorage.getJsonItem("fitfusion-programming-languages", ["JavaScript", "TypeScript", "Python"])
  );

  // Export settings
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf" | "html">(() => {
    const saved = safeLocalStorage.getItem("fitfusion-export-format", "json");
    return (saved as any) || "json";
  });

  const [exportAnonymized, setExportAnonymized] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-export-anonymized", false)
  );

  const [exportCategories, setExportCategories] = useState<string[]>(() =>
    safeLocalStorage.getJsonItem("fitfusion-export-categories", ["workouts"])
  );

  // Theme settings
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    const saved = safeLocalStorage.getItem("fitfusion-theme", "system");
    return (saved as any) || "system";
  });

  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => {
    const saved = safeLocalStorage.getItem("fitfusion-font-size", "medium");
    return (saved as any) || "medium";
  });

  const [language, setLanguage] = useState(() =>
    safeLocalStorage.getItem("fitfusion-language", "en")
  );

  // Sync settings
  const [autoSync, setAutoSync] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-auto-sync", true)
  );

  const [cloudBackup, setCloudBackup] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-cloud-backup", true)
  );

  const [notifications, setNotifications] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-notifications", true)
  );

  // Developer settings
  const [codeEditorEnabled, setCCodeEditorEnabled] = useState(() =>
    safeLocalStorage.getBoolItem("fitfusion-code-editor-enabled", false)
  );

  // Version info
  const [appVersion, setAppVersionState] = useState(() =>
    safeLocalStorage.getItem("fitfusion-app-version", "6.2.0")
  );

  // Listen for version updates from other components
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVersionUpdate = (event: CustomEvent) => {
      setAppVersionState(event.detail);
    };

    window.addEventListener("versionUpdated", handleVersionUpdate as EventListener);

    return () => {
      window.removeEventListener("versionUpdated", handleVersionUpdate as EventListener);
    };
  }, []);

  const setAppVersion = (version: string) => {
    setAppVersionState(version);
    safeLocalStorage.setItem("fitfusion-app-version", version);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("versionUpdated", { detail: version }));
    }
  };

  // Subscription settings
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(() => {
    const saved = safeLocalStorage.getItem("fitfusion-subscription-plan", "Free");
    return (saved as SubscriptionPlan) || "Free";
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    const saved = safeLocalStorage.getItem("fitfusion-payment-method", "CreditCard");
    return (saved as PaymentMethod) || "CreditCard";
  });

  // Developer options
  const [developerOptions, setDeveloperOptions] = useState(() =>
    safeLocalStorage.getJsonItem("fitfusion-developer-options", {
      debugMode: false,
      apiLogging: false,
      experimentalFeatures: false,
      performanceMonitoring: false,
      betaAccess: false,
      customScripting: false,
    })
  );

  // Display options
  const [displayOptions, setDisplayOptions] = useState(() =>
    safeLocalStorage.getJsonItem("fitfusion-display-options", {
      animations: true,
      highContrast: false,
      compactView: false,
      showTips: true,
      darkModeSchedule: false,
      customFonts: false,
    })
  );

  // Save settings to localStorage when they change
  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-sound-volume", soundVolume.toString());
  }, [soundVolume]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-haptic-enabled", hapticEnabled.toString());
  }, [hapticEnabled]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-haptic-feedback", hapticFeedback.toString());
  }, [hapticFeedback]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-sound-pack", soundPack);
  }, [soundPack]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-custom-sounds", JSON.stringify(customSounds));
  }, [customSounds]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-export-format", exportFormat);
  }, [exportFormat]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-export-anonymized", exportAnonymized.toString());
  }, [exportAnonymized]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-export-categories", JSON.stringify(exportCategories));
  }, [exportCategories]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-theme", theme);
  }, [theme]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-font-size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-language", language);
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-auto-sync", autoSync.toString());
  }, [autoSync]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-cloud-backup", cloudBackup.toString());
  }, [cloudBackup]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-notifications", notifications.toString());
  }, [notifications]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-code-editor-enabled", codeEditorEnabled.toString());
  }, [codeEditorEnabled]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-subscription-plan", subscriptionPlan);
  }, [subscriptionPlan]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-payment-method", paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-developer-options", JSON.stringify(developerOptions));
  }, [developerOptions]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-display-options", JSON.stringify(displayOptions));
  }, [displayOptions]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-unit-system", unitSystem);
  }, [unitSystem]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-compact-view", compactView.toString());
  }, [compactView]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-show-calories", showCalories.toString());
  }, [showCalories]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-show-heart-rate", showHeartRate.toString());
  }, [showHeartRate]);

  useEffect(() => {
    safeLocalStorage.setItem("fitfusion-programming-languages", JSON.stringify(programmingLanguages));
  }, [programmingLanguages]);

  // Functions for managing custom sounds
  const addCustomSound = (name: string, url: string) => {
    setCustomSounds((prev) => ({
      ...prev,
      [name]: url,
    }));
  };

  const removeCustomSound = (name: string) => {
    setCustomSounds((prev) => {
      const newSounds = { ...prev };
      delete newSounds[name];
      return newSounds;
    });
  };

  // Functions for programming languages
  const addProgrammingLanguage = (language: string) => {
    setProgrammingLanguages((prev) => {
      if (prev.includes(language)) return prev;
      return [...prev, language];
    });
  };

  const removeProgrammingLanguage = (language: string) => {
    setProgrammingLanguages((prev) => prev.filter((lang) => lang !== language));
  };

  // Functions for developer options
  const setDeveloperOption = (
    option: keyof typeof developerOptions,
    value: boolean,
  ) => {
    setDeveloperOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  // Functions for display options
  const setDisplayOption = (
    option: keyof typeof displayOptions,
    value: boolean,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  // Profile saving function
  const saveProfileInfo = async (
    profileData: Record<string, any>,
  ): Promise<boolean> => {
    try {
      safeLocalStorage.setItem("fitfusion-profile", JSON.stringify(profileData));
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error("Error saving profile data:", error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        soundVolume,
        setSoundVolume,
        hapticEnabled,
        setHapticEnabled,
        hapticFeedback,
        setHapticFeedback,
        soundPack,
        setSoundPack,
        customSounds,
        addCustomSound,
        removeCustomSound,
        exportFormat,
        setExportFormat,
        exportAnonymized,
        setExportAnonymized,
        exportCategories,
        setExportCategories,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        language,
        setLanguage,
        autoSync,
        setAutoSync,
        cloudBackup,
        setCloudBackup,
        notifications,
        setNotifications,
        codeEditorEnabled,
        setCCodeEditorEnabled,
        appVersion,
        setAppVersion,
        subscriptionPlan,
        setSubscriptionPlan,
        paymentMethod,
        setPaymentMethod,
        compactView,
        setCompactView,
        showCalories,
        setShowCalories,
        showHeartRate,
        setShowHeartRate,
        programmingLanguages,
        addProgrammingLanguage,
        removeProgrammingLanguage,
        developerOptions,
        setDeveloperOption,
        displayOptions,
        setDisplayOption,
        saveProfileInfo,
        unitSystem,
        setUnitSystem,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};