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
// Testy mění platformu (Mac / Windows); vlastní vlastnost na navigator se po testu odstraní nebo vrátí.
const NAVIGATOR_KEYS = ["platform", "userAgentData"] as const;
const navigatorOwn = new Map(
  NAVIGATOR_KEYS.map((key) => [key, Object.getOwnPropertyDescriptor(navigator, key)]),
);
function restoreNavigator() {
  for (const key of NAVIGATOR_KEYS) {
    const original = navigatorOwn.get(key);
    if (original) Object.defineProperty(navigator, key, original);
    else if (Object.prototype.hasOwnProperty.call(navigator, key))
      Reflect.deleteProperty(navigator, key);
  }
}

const { cleanup } = await import("@testing-library/react");
const { configureGridPrefsStore, resetGridPrefs } = await import("../src/lib/grid-prefs");
const { resetAppZoomCacheForTests } = await import("../src/lib/app-zoom");

afterEach(async () => {
  // Odpojí všechny vykreslené stromy včetně Radix portálů (bubliny, nabídky, dialogy).
  cleanup();
  jest.useRealTimers();
  jest.restoreAllMocks();
  window.matchMedia = pristine.matchMedia;
  window.innerWidth = 1440;
  window.innerHeight = 1000;
  restoreNavigator();
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
  await resetGridPrefs();
  // Zoom aplikace má modulovou paměť; bez resetu by další soubor startoval s cizím zoomem.
  resetAppZoomCacheForTests();
  const active = document.activeElement as HTMLElement | null;
  if (active && active !== document.body) active.blur?.();
});
