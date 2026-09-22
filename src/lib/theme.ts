import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const KEY = "theme";

/** Skript vložený do <head>, aby se motiv nastavil ještě před vykreslením. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(KEY)})||"light";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const prefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const dark = mode === "dark" || (mode === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

/** Volitelný tmavý režim uložený u uživatele v prohlížeči. */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const next: ThemeMode = raw === "dark" || raw === "system" ? raw : "light";
    setMode(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const update = useCallback((next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }, []);

  return { mode, setMode: update };
}
