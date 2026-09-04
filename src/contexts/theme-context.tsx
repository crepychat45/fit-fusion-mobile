import React, { createContext, useContext, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  onThemeChange,
  setTheme as persistTheme,
  type Theme,
} from "@/lib/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export type { Theme };

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  // Explicit user action only — persists and applies.
  const setTheme = (next: Theme) => {
    setThemeState(next);
    persistTheme(next);
  };

  // Keep in sync with theme changes triggered elsewhere (Appearance panel etc.)
  useEffect(() => onThemeChange((t) => setThemeState(t)), []);

  // Follow the OS only when the user explicitly chose "system".
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = () => applyTheme("system");
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
