/**
 * Kontrola izolace jednotkových testů.
 * Vlastní: zákaz `mock.module` na moduly knihovny – v Bunu platí náhrada pro celý běh
 * a podle pořadí souborů by rozbila ostatní testy. Povolené jsou jen výjimky níže.
 * Nesmí: kontrolovat chování komponent; to patří do testů.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Vnější moduly, jejichž náhrada je ve všech souborech shodná nebo zachová reálné API. */
const ALLOWED: Record<string, string> = {
  "@radix-ui/react-use-layout-effect": "shodná náhrada React.useLayoutEffect ve všech souborech",
  "@tanstack/react-router": "náhrada rozšiřuje reálný modul (...realRouter)",
};

const dir = "tests/unit";
const problems: string[] = [];
for (const name of readdirSync(dir, { recursive: true }).map(String)) {
  if (!/\.test\.tsx?$/.test(name)) continue;
  const file = join(dir, name);
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/mock\.module\(\s*["'`]([^"'`]+)["'`]/g)) {
    const target = match[1];
    if (!(target in ALLOWED))
      problems.push(`${file}: mock.module("${target}") platí pro celý běh testů`);
  }
}

const setup = readFileSync("tests/setup.ts", "utf8");
for (const reset of [
  "resetAppZoomCacheForTests()",
  "resetGridPrefs()",
  "localStorage.clear()",
  "restoreNavigator()",
  "window.innerWidth = 1440",
  "window.innerHeight = 1000",
])
  if (!setup.includes(reset)) problems.push(`tests/setup.ts: chybí globální úklid ${reset}`);

if (problems.length) {
  console.error(`Izolace testů: ${problems.length} problém(ů)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("Izolace testů: bez globálních náhrad modulů knihovny");
