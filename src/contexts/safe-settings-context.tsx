import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchRemoteSettings,
  createDebouncedPush,
  type SettingsSnapshot,
  type SettingsSyncStatus,
  changedSettings,
  unpackRow,
  pushRemoteSettings,
} from "@/utils/settings-sync";
import { readJson } from "@/lib/safe-storage";
import { logger } from "@/lib/logger";
import { APP_VERSION } from "@/lib/app-version";
import { getStoredTheme, onThemeChange, setTheme as persistTheme } from "@/lib/theme";

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
  settingsSnapshot: SettingsSnapshot;
  restorePreferences: (values: Partial<SettingsSnapshot>) => Promise<boolean>;
  syncStatus: SettingsSyncStatus;
  syncNow: () => Promise<void>;
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
      logger.warn(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.warn(`Failed to save ${key} to localStorage:`, error);
    }
  },
  getBoolItem: (key: string, defaultValue: boolean = false): boolean => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? saved === "true" : defaultValue;
    } catch (error) {
      logger.warn(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  getJsonItem: (key: string, defaultValue: any = {}): any => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return readJson(key, defaultValue);
    } catch (error) {
      logger.warn(`Failed to read ${key} from localStorage:`, error);
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
    const volume = Number(saved);
    return Number.isFinite(volume) ? Math.min(100, Math.max(0, volume)) : 80;
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
  const [theme, setThemeState] = useState<"system" | "light" | "dark">(
    () => getStoredTheme(),
  );
  const setTheme = (t: "system" | "light" | "dark") => {
    setThemeState(t);
    persistTheme(t);
  };

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

  // Installed version is bundled code, never an editable preference.
  const appVersion = APP_VERSION;
  const setAppVersion = (_version: string) => {};

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

  useEffect(() => onThemeChange((t) => setThemeState(t)), []);

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
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) return false;
      const info = profileData.personalInfo ?? profileData;
      const { error } = await supabase.from("profiles").upsert({
        user_id: data.user.id,
        name: info.fullName ?? info.name ?? [info.firstName, info.lastName].filter(Boolean).join(" ") ?? null,
        bio: info.bio ?? null,
        fitness_goals: profileData.fitnessInfo?.goals ?? profileData.fitnessGoals?.primaryGoals ?? [],
        fitness_level: profileData.fitnessInfo?.fitnessLevel ?? null,
        body_measurements: profileData.bodyMeasurements ?? {},
      }, { onConflict: "user_id" });
      if (error) throw error;
      return true;
    } catch (error) {
      logger.error("Error saving profile data:", error);
      return false;
    }
  };

  const [syncStatus, setSyncStatus] = useState<SettingsSyncStatus>("loading");
  const [readyUser, setReadyUser] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const baseline = useRef<Partial<SettingsSnapshot>>({});
  const pushRef = useRef(createDebouncedPush(900, setSyncStatus));
  const snapshot: SettingsSnapshot = {
    theme, fontSize, language, unitSystem, autoSync, cloudBackup, notifications,
    soundEnabled, soundVolume, soundPack, hapticEnabled, hapticFeedback,
    compactView, showCalories, showHeartRate, exportFormat, exportAnonymized,
    exportCategories, displayOptions, developerOptions, codeEditorEnabled,
    programmingLanguages, customSounds, subscriptionPlan, paymentMethod,
  };
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const applyRemote = (remote: Partial<SettingsSnapshot>) => {
        if (remote.theme === "light" || remote.theme === "dark" || remote.theme === "system") setTheme(remote.theme);
        if (typeof remote.fontSize === "string") setFontSize(remote.fontSize as any);
        if (typeof remote.language === "string") setLanguage(remote.language);
        if (typeof remote.unitSystem === "string") setUnitSystem(remote.unitSystem as UnitSystem);
        if (typeof remote.autoSync === "boolean") setAutoSync(remote.autoSync);
        if (typeof remote.cloudBackup === "boolean") setCloudBackup(remote.cloudBackup);
        if (typeof remote.notifications === "boolean") setNotifications(remote.notifications);
        if (typeof remote.soundEnabled === "boolean") setSoundEnabled(remote.soundEnabled);
        if (typeof remote.soundVolume === "number") setSoundVolume(remote.soundVolume);
        if (typeof remote.soundPack === "string") setSoundPack(remote.soundPack);
        if (typeof remote.hapticEnabled === "boolean") setHapticEnabled(remote.hapticEnabled);
        if (typeof remote.hapticFeedback === "boolean") setHapticFeedback(remote.hapticFeedback);
        if (typeof remote.compactView === "boolean") setCompactView(remote.compactView);
        if (typeof remote.showCalories === "boolean") setShowCalories(remote.showCalories);
        if (typeof remote.showHeartRate === "boolean") setShowHeartRate(remote.showHeartRate);
        if (typeof remote.exportFormat === "string") setExportFormat(remote.exportFormat as any);
        if (typeof remote.exportAnonymized === "boolean") setExportAnonymized(remote.exportAnonymized);
        if (Array.isArray(remote.exportCategories)) setExportCategories(remote.exportCategories);
        if (remote.displayOptions && typeof remote.displayOptions === "object") setDisplayOptions((p: any) => ({ ...p, ...remote.displayOptions }));
        if (remote.developerOptions && typeof remote.developerOptions === "object") setDeveloperOptions((p: any) => ({ ...p, ...remote.developerOptions }));
        if (typeof remote.codeEditorEnabled === "boolean") setCCodeEditorEnabled(remote.codeEditorEnabled);
        if (Array.isArray(remote.programmingLanguages)) setProgrammingLanguages(remote.programmingLanguages);
        if (remote.customSounds && typeof remote.customSounds === "object") setCustomSounds(remote.customSounds);
        if (typeof remote.subscriptionPlan === "string") setSubscriptionPlan(remote.subscriptionPlan as any);
        if (typeof remote.paymentMethod === "string") setPaymentMethod(remote.paymentMethod as any);

  };
  const applyRef = useRef(applyRemote);
  applyRef.current = applyRemote;

  useEffect(() => {
    let disposed = false;
    let generation = 0;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const initialize = async (uid: string | null) => {
      if (disposed) return;
      const epoch = ++generation;
      userIdRef.current = uid;
      setReadyUser(null);
      pushRef.current.cancel();
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      if (!uid) { setSyncStatus("signed-out"); return; }
      setSyncStatus("loading");
      const start = snapshotRef.current;
      try {
        const remote = await fetchRemoteSettings(uid);
        if (disposed || epoch !== generation || userIdRef.current !== uid) return;
        const edits = changedSettings(start, snapshotRef.current);
        const merged = { ...snapshotRef.current, ...remote, ...edits };
        baseline.current = remote ? { ...merged, ...remote } : {};
        applyRef.current(merged);
        setReadyUser(uid);
        setSyncStatus("saved");
        channel = supabase.channel(`settings-provider-${uid}-${crypto.randomUUID()}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${uid}` }, payload => {
            if (disposed || userIdRef.current !== uid) return;
            const remoteValues = unpackRow(payload.new as Record<string, unknown>);
            const local = { ...changedSettings(baseline.current, snapshotRef.current), ...pushRef.current.pending() };
            const next = { ...snapshotRef.current, ...remoteValues, ...local };
            baseline.current = { ...baseline.current, ...remoteValues };
            applyRef.current(next);
          }).subscribe();
      } catch (error) { if (!disposed && epoch === generation) { logger.warn("Settings load failed", error); setSyncStatus("error"); } }
    };
    void supabase.auth.getSession().then(({ data }) => initialize(data.session?.user.id ?? null));
    const { data: auth } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || session?.user.id === userIdRef.current && event !== "SIGNED_OUT") return;
      // Leave the auth callback before making database requests.
      void Promise.resolve().then(() => initialize(session?.user.id ?? null));
    });
    const online = () => {
      if (Object.keys(pushRef.current.pending()).length) void pushRef.current.flush();
      else if (userIdRef.current) void initialize(userIdRef.current);
    };
    window.addEventListener("online", online);
    return () => { disposed = true; generation++; pushRef.current.cancel(); auth.subscription.unsubscribe(); window.removeEventListener("online", online); if (channel) void supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!readyUser || readyUser !== userIdRef.current) return;
    if (!autoSync) { pushRef.current.cancel(); setSyncStatus("paused"); return; }
    const patch = changedSettings(baseline.current, snapshotRef.current);
    if (!Object.keys(patch).length) return;
    baseline.current = snapshotRef.current;
    pushRef.current(readyUser, patch);
  }, [readyUser, theme, fontSize, language, unitSystem, autoSync, cloudBackup, notifications,
    soundEnabled, soundVolume, soundPack, hapticEnabled, hapticFeedback, compactView,
    showCalories, showHeartRate, exportFormat, exportAnonymized, exportCategories,
    displayOptions, developerOptions, codeEditorEnabled, programmingLanguages, customSounds,
    subscriptionPlan, paymentMethod]);

  const restorePreferences = async (values: Partial<SettingsSnapshot>) => {
    const uid = userIdRef.current;
    if (!uid) return false;
    setSyncStatus("saving");
    const ok = await pushRemoteSettings(uid, values);
    if (ok) {
      const next = { ...snapshotRef.current, ...values };
      baseline.current = next;
      applyRef.current(next);
    }
    setSyncStatus(ok ? "saved" : "error");
    return ok;
  };

  const syncNow = async () => {
    if (!readyUser) { setSyncStatus("error"); return; }
    pushRef.current(readyUser, changedSettings(baseline.current, snapshotRef.current));
    await pushRef.current.flush();
  };

  return (
    <SettingsContext.Provider
      value={{
        settingsSnapshot: snapshot, restorePreferences, syncStatus, syncNow,
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