import { useCallback, useEffect, useState } from "react";

export const THEMES = [
  { id: "mint", label: "Mint Fresh", dark: false },
  { id: "midnight", label: "Midnight Gold", dark: true },
] as const;

export type Theme = (typeof THEMES)[number]["id"];

const KEY = "theme";

// Themes that used to exist map onto their replacements
const LEGACY: Record<string, Theme> = { light: "mint", dark: "midnight" };

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((t) => t.id === value);
}

function initialTheme(): Theme {
  const stored = (() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  })();
  if (isTheme(stored)) return stored;
  if (stored && LEGACY[stored]) return LEGACY[stored];
  if (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "midnight";
  }
  return "mint";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "midnight" ? "mint" : "midnight"),
    [theme, setTheme]
  );

  return { theme, setTheme, toggle };
}

/** True while a dark theme (Dark or Midnight Gold) is active; follows changes anywhere. */
const readDark = () =>
  THEMES.some((t) => t.dark && t.id === document.documentElement.dataset.theme);

export function useIsDark() {
  const [dark, setDark] = useState(readDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(readDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}
