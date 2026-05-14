export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

interface LanguageGroup {
  name: string;
  languages: Language[];
}

export const Languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
];

export const LanguageGroups: LanguageGroup[] = [
  {
    name: "Popular",
    languages: Languages.filter((lang) =>
      ["en", "es", "fr", "de", "zh", "ja", "ru", "ar", "pt", "hi"].includes(
        lang.code,
      ),
    ),
  },
  {
    name: "European",
    languages: Languages.filter((lang) =>
      [
        "en",
        "es",
        "fr",
        "de",
        "it",
        "nl",
        "sv",
        "fi",
        "da",
        "pl",
        "ru",
        "tr",
        "pt",
      ].includes(lang.code),
    ),
  },
  {
    name: "Asian",
    languages: Languages.filter((lang) =>
      ["zh", "ja", "ko", "hi", "bn", "th", "ar"].includes(lang.code),
    ),
  },
];

export const getLanguageByCode = (code: string): Language => {
  return (
    Languages.find((lang) => lang.code === code) || {
      code: "en",
      name: "English",
      nativeName: "English",
    }
  );
};

export const getFlagEmoji = (countryCode: string): string => {
  // Convert language code to country code for flag emoji
  const countryCodeMap: Record<string, string> = {
    en: "gb",
    ar: "sa",
    bn: "bd",
    zh: "cn",
    fr: "fr",
    de: "de",
    hi: "in",
    it: "it",
    ja: "jp",
    ko: "kr",
    nl: "nl",
    pl: "pl",
    pt: "pt",
    ru: "ru",
    es: "es",
    sv: "se",
    th: "th",
    tr: "tr",
    fi: "fi",
    da: "dk",
  };

  const code = countryCodeMap[countryCode] || countryCode;

  // Convert country code to flag emoji
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};
