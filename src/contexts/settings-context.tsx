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

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("fitfusion-sound-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem("fitfusion-sound-volume");
    return saved !== null ? parseInt(saved) : 80;
  });

  const [hapticEnabled, setHapticEnabled] = useState(() => {
    const saved = localStorage.getItem("fitfusion-haptic-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [hapticFeedback, setHapticFeedback] = useState(() => {
    const saved = localStorage.getItem("fitfusion-haptic-feedback");
    return saved !== null ? saved === "true" : true;
  });

  const [soundPack, setSoundPack] = useState(() => {
    const saved = localStorage.getItem("fitfusion-sound-pack");
    return saved || "default";
  });

  const [customSounds, setCustomSounds] = useState<Record<string, string>>(
    () => {
      const saved = localStorage.getItem("fitfusion-custom-sounds");
      return saved ? JSON.parse(saved) : {};
    },
  );

  // Display settings
  const [compactView, setCompactView] = useState(() => {
    const saved = localStorage.getItem("fitfusion-compact-view");
    return saved !== null ? saved === "true" : false;
  });

  const [showCalories, setShowCalories] = useState(() => {
    const saved = localStorage.getItem("fitfusion-show-calories");
    return saved !== null ? saved === "true" : true;
  });

  const [showHeartRate, setShowHeartRate] = useState(() => {
    const saved = localStorage.getItem("fitfusion-show-heart-rate");
    return saved !== null ? saved === "true" : true;
  });

  // Unit system settings
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem("fitfusion-unit-system");
    return (saved as UnitSystem) || "metric";
  });

  // Programming languages
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("fitfusion-programming-languages");
      return saved ? JSON.parse(saved) : ["JavaScript", "TypeScript", "Python"];
    },
  );

  // Export settings
  const [exportFormat, setExportFormat] = useState<
    "json" | "csv" | "pdf" | "html"
  >(() => {
    const saved = localStorage.getItem("fitfusion-export-format");
    return (saved as any) || "json";
  });

  const [exportAnonymized, setExportAnonymized] = useState(() => {
    const saved = localStorage.getItem("fitfusion-export-anonymized");
    return saved !== null ? saved === "true" : false;
  });

  const [exportCategories, setExportCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("fitfusion-export-categories");
    return saved ? JSON.parse(saved) : ["workouts"];
  });

  // Theme settings
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    const saved = localStorage.getItem("fitfusion-theme");
    return (saved as any) || "light";
  });

  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => {
    const saved = localStorage.getItem("fitfusion-font-size");
    return (saved as any) || "medium";
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("fitfusion-language");
    return saved || "en";
  });

  // Sync settings
  const [autoSync, setAutoSync] = useState(() => {
    const saved = localStorage.getItem("fitfusion-auto-sync");
    return saved !== null ? saved === "true" : true;
  });

  const [cloudBackup, setCloudBackup] = useState(() => {
    const saved = localStorage.getItem("fitfusion-cloud-backup");
    return saved !== null ? saved === "true" : true;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("fitfusion-notifications");
    return saved !== null ? saved === "true" : true;
  });

  // Developer settings
  const [codeEditorEnabled, setCCodeEditorEnabled] = useState(() => {
    const saved = localStorage.getItem("fitfusion-code-editor-enabled");
    return saved !== null ? saved === "true" : false;
  });

  // Version info - sync with localStorage and listen for updates
  const [appVersion, setAppVersionState] = useState(() => {
    return localStorage.getItem("fitfusion-app-version") || "6.2.0";
  });

  // Listen for version updates from other components
  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setAppVersionState(event.detail);
    };

    window.addEventListener(
      "versionUpdated",
      handleVersionUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "versionUpdated",
        handleVersionUpdate as EventListener,
      );
    };
  }, []);

  const setAppVersion = (version: string) => {
    setAppVersionState(version);
    localStorage.setItem("fitfusion-app-version", version);
    // Trigger version update event for other components
    window.dispatchEvent(
      new CustomEvent("versionUpdated", { detail: version }),
    );
  };

  // Subscription settings
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(
    () => {
      const saved = localStorage.getItem("fitfusion-subscription-plan");
      return (saved as SubscriptionPlan) || "Free";
    },
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    const saved = localStorage.getItem("fitfusion-payment-method");
    return (saved as PaymentMethod) || "CreditCard";
  });

  // Developer options
  const [developerOptions, setDeveloperOptions] = useState(() => {
    const saved = localStorage.getItem("fitfusion-developer-options");
    return saved
      ? JSON.parse(saved)
      : {
          debugMode: false,
          apiLogging: false,
          experimentalFeatures: false,
          performanceMonitoring: false,
          betaAccess: false,
          customScripting: false,
        };
  });

  // Display options
  const [displayOptions, setDisplayOptions] = useState(() => {
    const saved = localStorage.getItem("fitfusion-display-options");
    return saved
      ? JSON.parse(saved)
      : {
          animations: true,
          highContrast: false,
          compactView: false,
          showTips: true,
          darkModeSchedule: false,
          customFonts: false,
        };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("fitfusion-sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("fitfusion-sound-volume", soundVolume.toString());
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem("fitfusion-haptic-enabled", hapticEnabled.toString());
  }, [hapticEnabled]);

  useEffect(() => {
    localStorage.setItem("fitfusion-sound-pack", soundPack);
  }, [soundPack]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-custom-sounds",
      JSON.stringify(customSounds),
    );
  }, [customSounds]);

  useEffect(() => {
    localStorage.setItem("fitfusion-export-format", exportFormat);
  }, [exportFormat]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-export-anonymized",
      exportAnonymized.toString(),
    );
  }, [exportAnonymized]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-export-categories",
      JSON.stringify(exportCategories),
    );
  }, [exportCategories]);

  useEffect(() => {
    localStorage.setItem("fitfusion-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("fitfusion-font-size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("fitfusion-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("fitfusion-auto-sync", autoSync.toString());
  }, [autoSync]);

  useEffect(() => {
    localStorage.setItem("fitfusion-cloud-backup", cloudBackup.toString());
  }, [cloudBackup]);

  useEffect(() => {
    localStorage.setItem("fitfusion-notifications", notifications.toString());
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-code-editor-enabled",
      codeEditorEnabled.toString(),
    );
  }, [codeEditorEnabled]);

  useEffect(() => {
    localStorage.setItem("fitfusion-subscription-plan", subscriptionPlan);
  }, [subscriptionPlan]);

  useEffect(() => {
    localStorage.setItem("fitfusion-payment-method", paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-developer-options",
      JSON.stringify(developerOptions),
    );
  }, [developerOptions]);

  useEffect(() => {
    localStorage.setItem(
      "fitfusion-display-options",
      JSON.stringify(displayOptions),
    );
  }, [displayOptions]);

  useEffect(() => {
    localStorage.setItem("fitfusion-unit-system", unitSystem);
  }, [unitSystem]);

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
      // Save profile data to localStorage
      localStorage.setItem("fitfusion-profile", JSON.stringify(profileData));

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error("Error saving profile data:", error);
      return false;
    }
  };

  // Add effects to save new state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "fitfusion-haptic-feedback",
      hapticFeedback.toString(),
    );
  }, [hapticFeedback]);

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
    localStorage.setItem(
      "fitfusion-programming-languages",
      JSON.stringify(programmingLanguages),
    );
  }, [programmingLanguages]);

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
