// Apply appearance preferences (accent color, dark mode, font size) globally.
// Accent is written as an HSL triple to match shadcn's `--primary` token.

export function hexToHslTriple(hex: string): string | null {
  const m = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyAccent(hex: string) {
  const hsl = hexToHslTriple(hex);
  if (!hsl) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--sidebar-primary", hsl);
}

export function applyDarkMode(on: boolean) {
  document.documentElement.classList.toggle("dark", on);
}

export function applyFontSize(px: number) {
  document.documentElement.style.setProperty("font-size", `${px}px`);
}

export function applyAppearance(a: { accent?: string; darkMode?: boolean; fontSize?: number }) {
  if (a.accent) applyAccent(a.accent);
  if (typeof a.darkMode === "boolean") applyDarkMode(a.darkMode);
  if (typeof a.fontSize === "number") applyFontSize(a.fontSize);
}
