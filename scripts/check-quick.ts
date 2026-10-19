/**
 * Průběžná kontrola: typecheck celku, eslint + prettier jen na změněných souborech,
 * unit testy jen pro měněné moduly. Build ani E2E nespouští.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const started = Date.now();
const results: string[] = [];
let failed = false;

function lines(cmd: string, args: string[]): string[] {
  return execFileSync(cmd, args, { encoding: "utf8" }).split("\n").filter(Boolean);
}

function run(label: string, cmd: string, args: string[]) {
  const t = Date.now();
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  const ok = r.status === 0;
  failed ||= !ok;
  results.push(`${ok ? "✓" : "✗"} ${label} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
}

const changed = [
  ...new Set([
    ...lines("git", ["diff", "--name-only", "HEAD"]),
    ...lines("git", ["ls-files", "--others", "--exclude-standard"]),
  ]),
].filter((f) => existsSync(f));

// Lovable kontroluje typy automaticky; CI a běžný lokální běh zachovávají celou kontrolu.
if (process.argv.includes("--harness")) results.push("– typecheck: automatická kontrola Lovable");
else run("typecheck", "bunx", ["tsgo", "--noEmit"]);
run("money-rounding", "bun", ["./scripts/check-money-rounding.ts"]);

const lintable = changed.filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f));
if (lintable.length)
  run(`eslint (${lintable.length} souborů)`, "bunx", [
    "eslint",
    "--cache",
    "--cache-location",
    "node_modules/.cache/eslint/",
    "--no-warn-ignored",
    ...lintable,
  ]);
else results.push("– eslint: žádné změněné soubory");

const formattable = changed.filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|ya?ml)$/.test(f));
if (formattable.length)
  run(`prettier (${formattable.length} souborů)`, "bunx", [
    "prettier",
    "--check",
    "--ignore-unknown",
    ...formattable,
  ]);
else results.push("– prettier: žádné změněné soubory");

/** Unit testy, které importují měněný modul, plus změněné testy samotné. */
function affectedTests(): string[] {
  const dir = "tests/unit";
  const all = readdirSync(dir, { recursive: true })
    .map(String)
    .filter((f) => /\.test\.tsx?$/.test(f))
    .map((f) => join(dir, f));
  const stems = changed
    .filter((f) => f.startsWith("src/") && /\.(ts|tsx)$/.test(f))
    .map((f) => basename(f, extname(f)))
    .map((s) => (s === "index" ? null : s))
    .filter((s): s is string => s !== null);
  return all.filter((test) => {
    if (changed.includes(test)) return true;
    const text = readFileSync(test, "utf8");
    return stems.some((s) => new RegExp(`/${s}["']`).test(text));
  });
}

const tests = affectedTests();
if (tests.length) {
  console.log(`Unit testy:\n  ${tests.join("\n  ")}`);
  run(`unit (${tests.length} souborů)`, "bun", ["test", ...tests.map((t) => `./${t}`)]);
} else results.push("– unit: žádný test nezasažen");

console.log(`\nZměněné soubory: ${changed.length}`);
console.log(results.join("\n"));
console.log(`Celkem ${((Date.now() - started) / 1000).toFixed(1)} s`);
process.exit(failed ? 1 : 0);
