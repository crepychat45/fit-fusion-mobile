/**
 * Canonical theme module — single source of truth.
 *
 * Storage key is strictly "theme". Legacy keys ("fitfusion-theme",
 * "fitfusion-theme-light-default") are migrated once and removed.
 * Default for every first-time visitor is LIGHT.
 */

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "theme";
export const THEME_EVENT = "themechange";
const LEGACY_KEYS = ["fitfusion-theme", "fitfusion-theme-light-default", "app-theme"];

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

/** Read stored theme, migrating legacy keys. Defaults to "light". */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (isTheme(raw)) return raw;

    // one-time migration from legacy key
    const legacy = localStorage.getItem("fitfusion-theme");
    const migrated: Theme = isTheme(legacy) && legacy !== "system" ? legacy : "light";
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(THEME_KEY, migrated);
    return migrated;
  } catch {
    return "light";
  }
}

/** Resolve "system" to a concrete mode. */
export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

/** Apply a theme to <html> without touching storage. */
export function applyTheme(theme: Theme): "light" | "dark" {
  const mode = resolveTheme(theme);
  if (typeof document === "undefined") return mode;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
  return mode;
}

/** Persist + apply a theme. Only call from explicit user interactions. */
export function setTheme(theme: Theme): "light" | "dark" {
  const mode = applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  }
  return mode;
}

/** Convenience for boolean dark-mode switches. */
export function setDarkMode(on: boolean) {
  return setTheme(on ? "dark" : "light");
}

export function isDarkMode(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

/** Subscribe to theme changes made anywhere in the app. */
export function onThemeChange(cb: (theme: Theme) => void): () => void {
  const handler = (e: Event) => cb(((e as CustomEvent).detail as Theme) ?? getStoredTheme());
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}
