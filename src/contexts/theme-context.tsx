import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export type { Theme }; // Export the Theme type

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if we're in browser environment before accessing localStorage
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("fitfusion-theme") as Theme;
        return savedTheme || "system";
      } catch (error) {
        console.warn("Failed to read theme from localStorage:", error);
      }
    }
    return "system";
  });

  // Apply theme effect
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const root = window.document.documentElement;

      // Remove existing theme classes
      root.classList.remove("light", "dark");

      // Apply theme based on selection
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        localStorage.setItem("fitfusion-theme", theme);
      } else {
        root.classList.add(theme);
        localStorage.setItem("fitfusion-theme", theme);
      }
    } catch (error) {
      console.warn("Failed to apply theme:", error);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      };

      // Initial call to handleChange to set the correct theme on mount
      handleChange();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (error) {
      console.warn("Failed to set up system theme listener:", error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
