
import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, availableLanguages } from "@/components/language-selector";

// Type for translations
export type Translations = Record<string, Record<string, string>>;

// Sample translations - in a real app, these would be more extensive and loaded from separate files
const translations: Translations = {
  en: {
    "workout.start": "Start Workout",
    "workout.finish": "Finish Workout",
    "tips.title": "Fitness Tip of the Day",
    "settings.theme": "Theme",
    "settings.sound": "Sound",
    "settings.device": "Device",
    "settings.about": "About",
    "privacy.title": "Privacy & Data",
    "privacy.status": "Privacy Status",
  },
  hi: {
    "workout.start": "वर्कआउट शुरू करें",
    "workout.finish": "वर्कआउट समाप्त करें",
    "tips.title": "आज का फिटनेस टिप",
    "settings.theme": "थीम",
    "settings.sound": "ध्वनि",
    "settings.device": "डिवाइस",
    "settings.about": "के बारे में",
    "privacy.title": "गोपनीयता और डेटा",
    "privacy.status": "गोपनीयता स्थिति",
  },
  gu: {
    "workout.start": "વર્કઆઉટ શરૂ કરો",
    "workout.finish": "વર્કઆઉટ સમાપ્ત કરો",
    "tips.title": "આજનો ફિટનેસ ટિપ",
    "settings.theme": "થીમ",
    "settings.sound": "ધ્વની",
    "settings.device": "ઉપકરણ",
    "settings.about": "વિશે",
    "privacy.title": "ગોપનીયતા અને ડેટા",
    "privacy.status": "ગોપનીયતા સ્થિતિ",
  },
  // Add more languages as needed
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage = availableLanguages[0];

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const savedLang = localStorage.getItem("fitfusion-language");
    if (savedLang) {
      const lang = availableLanguages.find(l => l.code === savedLang);
      return lang || defaultLanguage;
    }
    return defaultLanguage;
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("fitfusion-language", currentLanguage.code);
  }, [currentLanguage]);

  // Translation function
  const t = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations.en[key] || key;
  };

  // Set language function
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
