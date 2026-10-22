/**
 * Společné DOM prostředí jednotkových testů.
 * Vlastní: jedinou registraci happy-dom pro celý běh Bun testů a globální úklid po každém testu,
 * aby výsledek nezávisel na pořadí souborů (`bun test --randomize`).
 * Nesmí: odpojovat globální DOM mezi jednotlivými testovacími soubory.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, jest } from "bun:test";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 1000 });
}

// Bun může poskytovat vlastní úložiště bez DOM API; testy vždy používají úložiště happy-dom.
Object.defineProperties(globalThis, {
  localStorage: { configurable: true, value: window.localStorage },
  sessionStorage: { configurable: true, value: window.sessionStorage },
});

// Výchozí stav globálů, které jednotlivé testy smějí dočasně přepsat.
const pristine = {
  matchMedia: window.matchMedia,
};

const { cleanup } = await import("@testing-library/react");
const { configureGridPrefsStore, resetGridPrefs } = await import("../src/lib/grid-prefs");

afterEach(() => {
  // Odpojí všechny vykreslené stromy včetně Radix portálů (bubliny, nabídky, dialogy).
  cleanup();
  jest.useRealTimers();
  jest.restoreAllMocks();
  window.matchMedia = pristine.matchMedia;
  // Radix při otevřeném modálu zamyká tělo; zbytky by blokovaly klik a fokus v dalším souboru.
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  document.body.removeAttribute("data-scroll-locked");
  document.body.removeAttribute("aria-hidden");
  document.documentElement.removeAttribute("style");
  // Úložiště sdílí celý běh; zbytky (zoom, panely, preference) by ovlivnily další soubor.
  window.localStorage.clear();
  window.sessionStorage.clear();
  // Paměť rozložení gridů je modulová – bez resetu by přežila mezi soubory.
  configureGridPrefsStore(null);
  resetGridPrefs();
  const active = document.activeElement as HTMLElement | null;
  if (active && active !== document.body) active.blur?.();
});
