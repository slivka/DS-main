/**
 * Úplná kontrola („uzavři kolo“, „připrav k vydání“, CI):
 * typecheck, lint celku (cache), všechny unit testy, format:check, build, check:catalog.
 */
import { spawnSync } from "node:child_process";

const steps: [string, string[]][] = [
  ["typecheck", ["bunx", "tsgo", "--noEmit"]],
  ["money-rounding", ["bun", "./scripts/check-money-rounding.ts"]],
  ["lint", ["bunx", "eslint", ".", "--cache", "--cache-location", "node_modules/.cache/eslint/"]],
  ["unit", ["bun", "test", "tests/unit"]],
  ["format:check", ["bunx", "prettier", "--check", "."]],
  ["build", ["bunx", "vite", "build"]],
  ["check:catalog", ["bun", "./scripts/check-catalog.ts", ...process.argv.slice(2)]],
];

const started = Date.now();
// Lovable provádí typecheck a build automaticky; lokální nástroje je nesmějí spouštět podruhé.
const harness = process.argv.includes("--harness");
const results: string[] = [];
let failed = false;
for (const [label, [cmd, ...args]] of steps) {
  if (harness && (label === "typecheck" || label === "build")) {
    results.push(`– ${label}: automatická kontrola Lovable (zde nespouštěno)`);
    continue;
  }
  const t = Date.now();
  const ok = spawnSync(cmd, args, { stdio: "inherit" }).status === 0;
  failed ||= !ok;
  results.push(`${ok ? "✓" : "✗"} ${label} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
}
console.log(`\n${results.join("\n")}\nCelkem ${((Date.now() - started) / 1000).toFixed(1)} s`);
process.exit(failed ? 1 : 0);
