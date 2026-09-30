import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const KEY = "theme";
const THEME_EVENT = "slivka-theme-change";

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const next: ThemeMode = raw === "dark" || raw === "system" ? raw : "light";
    setMode(next);
    applyTheme(next);
    setIsDark(next === "dark" || (next === "system" && prefersDark()));
  }, []);

  useEffect(() => {
    const sync = (event: Event) => {
      const next = event instanceof CustomEvent ? event.detail : localStorage.getItem(KEY);
      const mode: ThemeMode = next === "dark" || next === "system" ? next : "light";
      setMode(mode);
      applyTheme(mode);
      setIsDark(mode === "dark" || (mode === "system" && prefersDark()));
    };
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark")),
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setIsDark(prefersDark());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const update = useCallback((next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
    setIsDark(next === "dark" || (next === "system" && prefersDark()));
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }, []);

  return { mode, isDark, setMode: update };
}
