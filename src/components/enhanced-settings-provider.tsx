import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useToast } from "@/hooks/use-toast";

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
  // Enhanced settings features
  isAutoSaveEnabled: boolean;
  setIsAutoSaveEnabled: (enabled: boolean) => void;
  lastSaveTime: Date | null;
  hasUnsavedChanges: boolean;
  saveAllSettings: () => Promise<boolean>;
  resetAllSettings: () => Promise<boolean>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsData: string) => Promise<boolean>;
  settingsBackup: Record<string, any> | null;
  createBackup: () => void;
  restoreBackup: () => void;
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

export const EnhancedSettingsProvider = ({
  children,
}: SettingsProviderProps) => {
  const { toast } = useToast();

  // Auto-save functionality
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [settingsBackup, setSettingsBackup] = useState<Record<
    string,
    any
  > | null>(null);

  // Sound settings with enhanced persistence
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-sound-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [soundVolume, setSoundVolumeState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-sound-volume");
    return saved !== null ? parseInt(saved) : 80;
  });

  const [hapticEnabled, setHapticEnabledState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-haptic-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [hapticFeedback, setHapticFeedbackState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-haptic-feedback");
    return saved !== null ? saved === "true" : true;
  });

  const [soundPack, setSoundPackState] = useState(() => {
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
  const [compactView, setCompactViewState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-compact-view");
    return saved !== null ? saved === "true" : false;
  });

  const [showCalories, setShowCaloriesState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-show-calories");
    return saved !== null ? saved === "true" : true;
  });

  const [showHeartRate, setShowHeartRateState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-show-heart-rate");
    return saved !== null ? saved === "true" : true;
  });

  // Unit system settings
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
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
  const [exportFormat, setExportFormatState] = useState<
    "json" | "csv" | "pdf" | "html"
  >(() => {
    const saved = localStorage.getItem("fitfusion-export-format");
    return (saved as any) || "json";
  });

  const [exportAnonymized, setExportAnonymizedState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-export-anonymized");
    return saved !== null ? saved === "true" : false;
  });

  const [exportCategories, setExportCategoriesState] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("fitfusion-export-categories");
      return saved ? JSON.parse(saved) : ["workouts"];
    },
  );

  // Theme settings
  const [theme, setThemeState] = useState<"system" | "light" | "dark">(
    () => getStoredTheme(),
  );

  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">(
    () => {
      const saved = localStorage.getItem("fitfusion-font-size");
      return (saved as any) || "medium";
    },
  );

  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-language");
    return saved || "en";
  });

  // Sync settings
  const [autoSync, setAutoSyncState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-auto-sync");
    return saved !== null ? saved === "true" : true;
  });

  const [cloudBackup, setCloudBackupState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-cloud-backup");
    return saved !== null ? saved === "true" : true;
  });

  const [notifications, setNotificationsState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-notifications");
    return saved !== null ? saved === "true" : true;
  });

  // Developer settings
  const [codeEditorEnabled, setCCodeEditorEnabledState] = useState(() => {
    const saved = localStorage.getItem("fitfusion-code-editor-enabled");
    return saved !== null ? saved === "true" : false;
  });

  // Version info - sync with localStorage and listen for updates
  const [appVersion, setAppVersionState] = useState(() => {
    return localStorage.getItem("fitfusion-app-version") || "5.3.0";
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
    window.dispatchEvent(
      new CustomEvent("versionUpdated", { detail: version }),
    );
    markAsChanged();
  };

  // Subscription settings
  const [subscriptionPlan, setSubscriptionPlanState] =
    useState<SubscriptionPlan>(() => {
      const saved = localStorage.getItem("fitfusion-subscription-plan");
      return (saved as SubscriptionPlan) || "Free";
    });

  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>(() => {
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

  // Enhanced setter functions that trigger auto-save
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const persistSetting = useCallback(
    (key: string, value: any) => {
      try {
        if (typeof value === "object") {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, value.toString());
        }

        if (isAutoSaveEnabled) {
          setLastSaveTime(new Date());
          setHasUnsavedChanges(false);

          toast({
            title: "Settings Auto-Saved",
            description: "Your changes have been saved automatically.",
          });
        } else {
          markAsChanged();
        }
      } catch (error) {
        console.error("Failed to persist setting:", error);
        toast({
          title: "Save Error",
          description: "Failed to save setting. Please try again.",
          variant: "destructive",
        });
      }
    },
    [isAutoSaveEnabled, markAsChanged, toast],
  );

  // Enhanced setter functions
  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      setSoundEnabledState(enabled);
      persistSetting("fitfusion-sound-enabled", enabled);
    },
    [persistSetting],
  );

  const setSoundVolume = useCallback(
    (volume: number) => {
      setSoundVolumeState(volume);
      persistSetting("fitfusion-sound-volume", volume);
    },
    [persistSetting],
  );

  const setHapticEnabled = useCallback(
    (enabled: boolean) => {
      setHapticEnabledState(enabled);
      persistSetting("fitfusion-haptic-enabled", enabled);
    },
    [persistSetting],
  );

  const setHapticFeedback = useCallback(
    (enabled: boolean) => {
      setHapticFeedbackState(enabled);
      persistSetting("fitfusion-haptic-feedback", enabled);
    },
    [persistSetting],
  );

  const setSoundPack = useCallback(
    (pack: string) => {
      setSoundPackState(pack);
      persistSetting("fitfusion-sound-pack", pack);
    },
    [persistSetting],
  );

  const setCompactView = useCallback(
    (enabled: boolean) => {
      setCompactViewState(enabled);
      persistSetting("fitfusion-compact-view", enabled);
    },
    [persistSetting],
  );

  const setShowCalories = useCallback(
    (enabled: boolean) => {
      setShowCaloriesState(enabled);
      persistSetting("fitfusion-show-calories", enabled);
    },
    [persistSetting],
  );

  const setShowHeartRate = useCallback(
    (enabled: boolean) => {
      setShowHeartRateState(enabled);
      persistSetting("fitfusion-show-heart-rate", enabled);
    },
    [persistSetting],
  );

  const setUnitSystem = useCallback(
    (system: UnitSystem) => {
      setUnitSystemState(system);
      persistSetting("fitfusion-unit-system", system);
    },
    [persistSetting],
  );

  const setExportFormat = useCallback(
    (format: "json" | "csv" | "pdf" | "html") => {
      setExportFormatState(format);
      persistSetting("fitfusion-export-format", format);
    },
    [persistSetting],
  );

  const setExportAnonymized = useCallback(
    (anonymized: boolean) => {
      setExportAnonymizedState(anonymized);
      persistSetting("fitfusion-export-anonymized", anonymized);
    },
    [persistSetting],
  );

  const setExportCategories = useCallback(
    (categories: string[]) => {
      setExportCategoriesState(categories);
      persistSetting("fitfusion-export-categories", categories);
    },
    [persistSetting],
  );

  const setTheme = useCallback(
    (theme: "system" | "light" | "dark") => {
      setThemeState(theme);
      persistTheme(theme);
    },
    [persistSetting],
  );

  const setFontSize = useCallback(
    (size: "small" | "medium" | "large") => {
      setFontSizeState(size);
      persistSetting("fitfusion-font-size", size);
    },
    [persistSetting],
  );

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      persistSetting("fitfusion-language", lang);
    },
    [persistSetting],
  );

  const setAutoSync = useCallback(
    (sync: boolean) => {
      setAutoSyncState(sync);
      persistSetting("fitfusion-auto-sync", sync);
    },
    [persistSetting],
  );

  const setCloudBackup = useCallback(
    (backup: boolean) => {
      setCloudBackupState(backup);
      persistSetting("fitfusion-cloud-backup", backup);
    },
    [persistSetting],
  );

  const setNotifications = useCallback(
    (notifications: boolean) => {
      setNotificationsState(notifications);
      persistSetting("fitfusion-notifications", notifications);
    },
    [persistSetting],
  );

  const setCCodeEditorEnabled = useCallback(
    (enabled: boolean) => {
      setCCodeEditorEnabledState(enabled);
      persistSetting("fitfusion-code-editor-enabled", enabled);
    },
    [persistSetting],
  );

  const setSubscriptionPlan = useCallback(
    (plan: SubscriptionPlan) => {
      setSubscriptionPlanState(plan);
      persistSetting("fitfusion-subscription-plan", plan);
    },
    [persistSetting],
  );

  const setPaymentMethod = useCallback(
    (method: PaymentMethod) => {
      setPaymentMethodState(method);
      persistSetting("fitfusion-payment-method", method);
    },
    [persistSetting],
  );

  // Functions for managing custom sounds
  const addCustomSound = useCallback(
    (name: string, url: string) => {
      const newSounds = { ...customSounds, [name]: url };
      setCustomSounds(newSounds);
      persistSetting("fitfusion-custom-sounds", newSounds);
    },
    [customSounds, persistSetting],
  );

  const removeCustomSound = useCallback(
    (name: string) => {
      const newSounds = { ...customSounds };
      delete newSounds[name];
      setCustomSounds(newSounds);
      persistSetting("fitfusion-custom-sounds", newSounds);
    },
    [customSounds, persistSetting],
  );

  // Functions for programming languages
  const addProgrammingLanguage = useCallback(
    (language: string) => {
      const newLanguages = programmingLanguages.includes(language)
        ? programmingLanguages
        : [...programmingLanguages, language];
      setProgrammingLanguages(newLanguages);
      persistSetting("fitfusion-programming-languages", newLanguages);
    },
    [programmingLanguages, persistSetting],
  );

  const removeProgrammingLanguage = useCallback(
    (language: string) => {
      const newLanguages = programmingLanguages.filter(
        (lang) => lang !== language,
      );
      setProgrammingLanguages(newLanguages);
      persistSetting("fitfusion-programming-languages", newLanguages);
    },
    [programmingLanguages, persistSetting],
  );

  // Functions for developer options
  const setDeveloperOption = useCallback(
    (option: keyof typeof developerOptions, value: boolean) => {
      const newOptions = { ...developerOptions, [option]: value };
      setDeveloperOptions(newOptions);
      persistSetting("fitfusion-developer-options", newOptions);
    },
    [developerOptions, persistSetting],
  );

  // Functions for display options
  const setDisplayOption = useCallback(
    (option: keyof typeof displayOptions, value: boolean) => {
      const newOptions = { ...displayOptions, [option]: value };
      setDisplayOptions(newOptions);
      persistSetting("fitfusion-display-options", newOptions);
    },
    [displayOptions, persistSetting],
  );

  // Profile saving function
  const saveProfileInfo = useCallback(
    async (profileData: Record<string, any>): Promise<boolean> => {
      try {
        localStorage.setItem("fitfusion-profile", JSON.stringify(profileData));
        await new Promise((resolve) => setTimeout(resolve, 500));

        toast({
          title: "Profile Saved",
          description:
            "Your profile information has been updated successfully.",
        });

        return true;
      } catch (error) {
        console.error("Error saving profile data:", error);
        toast({
          title: "Save Error",
          description: "Failed to save profile data. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast],
  );

  // Enhanced settings management functions
  const saveAllSettings = useCallback(async (): Promise<boolean> => {
    try {
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);

      toast({
        title: "✅ All Settings Saved",
        description: "Your preferences have been saved successfully.",
      });

      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save all settings. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const resetAllSettings = useCallback(async (): Promise<boolean> => {
    try {
      const confirmReset = window.confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone.",
      );
      if (!confirmReset) return false;

      // Clear all settings from localStorage
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith("fitfusion-"),
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Reset all state to defaults
      setSoundEnabledState(true);
      setSoundVolumeState(80);
      setHapticEnabledState(true);
      setHapticFeedbackState(true);
      setSoundPackState("default");
      setCustomSounds({});
      setCompactViewState(false);
      setShowCaloriesState(true);
      setShowHeartRateState(true);
      setUnitSystemState("metric");
      setProgrammingLanguages(["JavaScript", "TypeScript", "Python"]);
      setExportFormatState("json");
      setExportAnonymizedState(false);
      setExportCategoriesState(["workouts"]);
      setThemeState("system");
      setFontSizeState("medium");
      setLanguageState("en");
      setAutoSyncState(true);
      setCloudBackupState(true);
      setNotificationsState(true);
      setCCodeEditorEnabledState(false);
      setSubscriptionPlanState("Free");
      setPaymentMethodState("CreditCard");
      setDeveloperOptions({
        debugMode: false,
        apiLogging: false,
        experimentalFeatures: false,
        performanceMonitoring: false,
        betaAccess: false,
        customScripting: false,
      });
      setDisplayOptions({
        animations: true,
        highContrast: false,
        compactView: false,
        showTips: true,
        darkModeSchedule: false,
        customFonts: false,
      });

      setHasUnsavedChanges(false);
      setLastSaveTime(new Date());

      toast({
        title: "🔄 Settings Reset",
        description: "All settings have been reset to default values.",
      });

      return true;
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const exportSettings = useCallback(async (): Promise<string> => {
    try {
      const allSettings = {
        soundEnabled,
        soundVolume,
        hapticEnabled,
        hapticFeedback,
        soundPack,
        customSounds,
        compactView,
        showCalories,
        showHeartRate,
        unitSystem,
        programmingLanguages,
        exportFormat,
        exportAnonymized,
        exportCategories,
        theme,
        fontSize,
        language,
        autoSync,
        cloudBackup,
        notifications,
        codeEditorEnabled,
        appVersion,
        subscriptionPlan,
        paymentMethod,
        developerOptions,
        displayOptions,
        exportedAt: new Date().toISOString(),
        version: appVersion,
      };

      const settingsJson = JSON.stringify(allSettings, null, 2);

      toast({
        title: "📤 Settings Exported",
        description: "Your settings have been exported successfully.",
      });

      return settingsJson;
    } catch (error) {
      console.error("Failed to export settings:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive",
      });
      return "";
    }
  }, [
    soundEnabled,
    soundVolume,
    hapticEnabled,
    hapticFeedback,
    soundPack,
    customSounds,
    compactView,
    showCalories,
    showHeartRate,
    unitSystem,
    programmingLanguages,
    exportFormat,
    exportAnonymized,
    exportCategories,
    theme,
    fontSize,
    language,
    autoSync,
    cloudBackup,
    notifications,
    codeEditorEnabled,
    appVersion,
    subscriptionPlan,
    paymentMethod,
    developerOptions,
    displayOptions,
    toast,
  ]);

  const importSettings = useCallback(
    async (settingsData: string): Promise<boolean> => {
      try {
        const parsedSettings = JSON.parse(settingsData);

        // Validate the settings structure
        if (!parsedSettings || typeof parsedSettings !== "object") {
          throw new Error("Invalid settings format");
        }

        const confirmImport = window.confirm(
          "Are you sure you want to import these settings? This will overwrite your current settings.",
        );
        if (!confirmImport) return false;

        // Import each setting with validation
        if (typeof parsedSettings.soundEnabled === "boolean")
          setSoundEnabled(parsedSettings.soundEnabled);
        if (typeof parsedSettings.soundVolume === "number")
          setSoundVolume(parsedSettings.soundVolume);
        if (typeof parsedSettings.hapticEnabled === "boolean")
          setHapticEnabled(parsedSettings.hapticEnabled);
        if (typeof parsedSettings.hapticFeedback === "boolean")
          setHapticFeedback(parsedSettings.hapticFeedback);
        if (typeof parsedSettings.soundPack === "string")
          setSoundPack(parsedSettings.soundPack);
        if (
          parsedSettings.customSounds &&
          typeof parsedSettings.customSounds === "object"
        ) {
          setCustomSounds(parsedSettings.customSounds);
        }
        if (typeof parsedSettings.compactView === "boolean")
          setCompactView(parsedSettings.compactView);
        if (typeof parsedSettings.showCalories === "boolean")
          setShowCalories(parsedSettings.showCalories);
        if (typeof parsedSettings.showHeartRate === "boolean")
          setShowHeartRate(parsedSettings.showHeartRate);
        if (parsedSettings.unitSystem) setUnitSystem(parsedSettings.unitSystem);
        if (Array.isArray(parsedSettings.programmingLanguages)) {
          setProgrammingLanguages(parsedSettings.programmingLanguages);
        }
        if (parsedSettings.exportFormat)
          setExportFormat(parsedSettings.exportFormat);
        if (typeof parsedSettings.exportAnonymized === "boolean")
          setExportAnonymized(parsedSettings.exportAnonymized);
        if (Array.isArray(parsedSettings.exportCategories))
          setExportCategories(parsedSettings.exportCategories);
        if (parsedSettings.theme) setTheme(parsedSettings.theme);
        if (parsedSettings.fontSize) setFontSize(parsedSettings.fontSize);
        if (parsedSettings.language) setLanguage(parsedSettings.language);
        if (typeof parsedSettings.autoSync === "boolean")
          setAutoSync(parsedSettings.autoSync);
        if (typeof parsedSettings.cloudBackup === "boolean")
          setCloudBackup(parsedSettings.cloudBackup);
        if (typeof parsedSettings.notifications === "boolean")
          setNotifications(parsedSettings.notifications);
        if (typeof parsedSettings.codeEditorEnabled === "boolean")
          setCCodeEditorEnabled(parsedSettings.codeEditorEnabled);
        if (parsedSettings.subscriptionPlan)
          setSubscriptionPlan(parsedSettings.subscriptionPlan);
        if (parsedSettings.paymentMethod)
          setPaymentMethod(parsedSettings.paymentMethod);

        if (
          parsedSettings.developerOptions &&
          typeof parsedSettings.developerOptions === "object"
        ) {
          setDeveloperOptions(parsedSettings.developerOptions);
        }

        if (
          parsedSettings.displayOptions &&
          typeof parsedSettings.displayOptions === "object"
        ) {
          setDisplayOptions(parsedSettings.displayOptions);
        }

        setHasUnsavedChanges(false);
        setLastSaveTime(new Date());

        toast({
          title: "📥 Settings Imported",
          description: "Your settings have been imported successfully.",
        });

        return true;
      } catch (error) {
        console.error("Failed to import settings:", error);
        toast({
          title: "Import Failed",
          description:
            "Failed to import settings. Please check the file format.",
          variant: "destructive",
        });
        return false;
      }
    },
    [
      setSoundEnabled,
      setSoundVolume,
      setHapticEnabled,
      setHapticFeedback,
      setSoundPack,
      setCompactView,
      setShowCalories,
      setShowHeartRate,
      setUnitSystem,
      setExportFormat,
      setExportAnonymized,
      setExportCategories,
      setTheme,
      setFontSize,
      setLanguage,
      setAutoSync,
      setCloudBackup,
      setNotifications,
      setCCodeEditorEnabled,
      setSubscriptionPlan,
      setPaymentMethod,
      toast,
    ],
  );

  const createBackup = useCallback(() => {
    const backup = {
      soundEnabled,
      soundVolume,
      hapticEnabled,
      hapticFeedback,
      soundPack,
      customSounds,
      compactView,
      showCalories,
      showHeartRate,
      unitSystem,
      programmingLanguages,
      exportFormat,
      exportAnonymized,
      exportCategories,
      theme,
      fontSize,
      language,
      autoSync,
      cloudBackup,
      notifications,
      codeEditorEnabled,
      appVersion,
      subscriptionPlan,
      paymentMethod,
      developerOptions,
      displayOptions,
      backupCreatedAt: new Date().toISOString(),
    };

    setSettingsBackup(backup);

    toast({
      title: "💾 Backup Created",
      description: "A backup of your current settings has been created.",
    });
  }, [
    soundEnabled,
    soundVolume,
    hapticEnabled,
    hapticFeedback,
    soundPack,
    customSounds,
    compactView,
    showCalories,
    showHeartRate,
    unitSystem,
    programmingLanguages,
    exportFormat,
    exportAnonymized,
    exportCategories,
    theme,
    fontSize,
    language,
    autoSync,
    cloudBackup,
    notifications,
    codeEditorEnabled,
    appVersion,
    subscriptionPlan,
    paymentMethod,
    developerOptions,
    displayOptions,
    toast,
  ]);

  const restoreBackup = useCallback(() => {
    if (!settingsBackup) {
      toast({
        title: "No Backup Found",
        description: "No backup is available to restore.",
        variant: "destructive",
      });
      return;
    }

    const confirmRestore = window.confirm(
      "Are you sure you want to restore from backup? This will overwrite your current settings.",
    );
    if (!confirmRestore) return;

    // Restore settings from backup
    setSoundEnabledState(settingsBackup.soundEnabled);
    setSoundVolumeState(settingsBackup.soundVolume);
    setHapticEnabledState(settingsBackup.hapticEnabled);
    setHapticFeedbackState(settingsBackup.hapticFeedback);
    setSoundPackState(settingsBackup.soundPack);
    setCustomSounds(settingsBackup.customSounds || {});
    setCompactViewState(settingsBackup.compactView);
    setShowCaloriesState(settingsBackup.showCalories);
    setShowHeartRateState(settingsBackup.showHeartRate);
    setUnitSystemState(settingsBackup.unitSystem);
    setProgrammingLanguages(settingsBackup.programmingLanguages || []);
    setExportFormatState(settingsBackup.exportFormat);
    setExportAnonymizedState(settingsBackup.exportAnonymized);
    setExportCategoriesState(settingsBackup.exportCategories || []);
    setThemeState(settingsBackup.theme);
    setFontSizeState(settingsBackup.fontSize);
    setLanguageState(settingsBackup.language);
    setAutoSyncState(settingsBackup.autoSync);
    setCloudBackupState(settingsBackup.cloudBackup);
    setNotificationsState(settingsBackup.notifications);
    setCCodeEditorEnabledState(settingsBackup.codeEditorEnabled);
    setSubscriptionPlanState(settingsBackup.subscriptionPlan);
    setPaymentMethodState(settingsBackup.paymentMethod);
    setDeveloperOptions(settingsBackup.developerOptions || {});
    setDisplayOptions(settingsBackup.displayOptions || {});

    setHasUnsavedChanges(false);
    setLastSaveTime(new Date());

    toast({
      title: "🔄 Backup Restored",
      description: "Your settings have been restored from backup.",
    });
  }, [settingsBackup, toast]);

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
        // Enhanced features
        isAutoSaveEnabled,
        setIsAutoSaveEnabled,
        lastSaveTime,
        hasUnsavedChanges,
        saveAllSettings,
        resetAllSettings,
        exportSettings,
        importSettings,
        settingsBackup,
        createBackup,
        restoreBackup,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
