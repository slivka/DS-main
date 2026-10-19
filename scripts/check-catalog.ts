/**
 * Kontrola katalogu knihovny proti poslední vydané verzi.
 * Vlastní: aditivitu katalogu, exportů a sekcí, shodu verzí a sekce „(nevydáno)“.
 * Nesmí: nic měnit; úmyslné odebrání povoluje jen .lovable/catalog-removals.json.
 *
 * Použití: bun run check:catalog [--base <sha>]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

type Prop = { name: string; values?: unknown[] };
type Example = { label?: string; code?: string };
type Component = {
  name: string;
  props?: Prop[];
  examples?: Example[];
  antipatterns?: string[];
};
type Catalog = { meta: { version: string }; components: Component[] };
/** Záznam úmyslného odebrání. */
type Removal = { name: string; what: string; reason: string; version: string };

const CATALOG = ".lovable/design-system.json";
const BARRELS = ["src/index.ts", "src/components/ds/index.ts"];
const SECTION_FILES = [
  "components.md",
  ".lovable/rules/components.md",
  ".lovable/rules/library-guidelines.md",
];

const errors: string[] = [];
const removed: string[] = [];
const added: string[] = [];

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });
}

function atBase(base: string, path: string): string | null {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return null;
  }
}

function versionAt(sha: string): string | null {
  const text = atBase(sha, "package.json");
  return text ? (JSON.parse(text) as { version: string }).version : null;
}

/**
 * Commit, kde se version v package.json naposledy změnila na `released`.
 * Výjimka: když se commit vydání do větve nepromítl, určuje ho
 * .lovable/release-base.json ({ version, sha }) – platí jen pro shodnou verzi.
 */
function findBase(released: string): string {
  const pinFile = ".lovable/release-base.json";
  if (existsSync(pinFile)) {
    const pin = JSON.parse(readFileSync(pinFile, "utf8")) as { version: string; sha: string };
    if (pin.version === released) return pin.sha;
  }
  const commits = git("log", "--format=%H", "-G", '"version"', "--", "package.json")
    .split("\n")
    .filter(Boolean);
  for (const sha of commits) {
    if (versionAt(sha) === released && versionAt(`${sha}^`) !== released) return sha;
  }
  throw new Error(`Nenalezen commit s verzí ${released}; použij --base <sha>.`);
}

function parseStrict(text: string, label: string): Catalog {
  const dup = (pairs: [string, unknown][]) => {
    const seen = new Set<string>();
    for (const [key] of pairs) {
      if (seen.has(key)) errors.push(`${label}: duplicitní JSON klíč „${key}“`);
      seen.add(key);
    }
  };
  // JSON.parse nehlásí duplicitní klíče – kontrola přes reviver nejde, proto regex po objektech.
  const objects = text.match(/\{[^{}]*\}/g) ?? [];
  for (const obj of objects) {
    const keys = [...obj.matchAll(/"((?:[^"\\]|\\.)*)"\s*:/g)].map((m) => [m[1], null]);
    dup(keys as [string, unknown][]);
  }
  return JSON.parse(text) as Catalog;
}

function allowed(removals: Removal[], name: string, what: string): boolean {
  return removals.some((r) => r.name === name && r.what === what);
}

function lose(removals: Removal[], name: string, what: string) {
  if (allowed(removals, name, what)) removed.push(`${name}: ${what} (úmyslně)`);
  else errors.push(`Ubylo bez záznamu v catalog-removals.json – ${name}: ${what}`);
}

function compareCatalog(old: Catalog, cur: Catalog, removals: Removal[]) {
  const names = cur.components.map((c) => c.name);
  for (const n of new Set(names.filter((n, i) => names.indexOf(n) !== i)))
    errors.push(`Duplicitní komponenta: ${n}`);
  const byName = new Map(cur.components.map((c) => [c.name, c]));
  const oldNames = new Set(old.components.map((c) => c.name));
  for (const c of cur.components) {
    if (oldNames.has(c.name)) continue;
    added.push(`komponenta ${c.name}`);
    for (const prop of c.props ?? []) added.push(`prop ${c.name}.${prop.name}`);
  }
  for (const o of old.components) {
    const c = byName.get(o.name);
    if (!c) {
      lose(removals, o.name, "component");
      continue;
    }
    const props = new Map((c.props ?? []).map((p) => [p.name, p]));
    const oldProps = new Set((o.props ?? []).map((p) => p.name));
    for (const p of c.props ?? [])
      if (!oldProps.has(p.name)) added.push(`prop ${o.name}.${p.name}`);
    for (const p of o.props ?? []) {
      const np = props.get(p.name);
      if (!np) {
        lose(removals, o.name, `prop ${p.name}`);
        continue;
      }
      const values = new Set((np.values ?? []).map((v) => JSON.stringify(v)));
      for (const v of p.values ?? [])
        if (!values.has(JSON.stringify(v))) lose(removals, o.name, `value ${p.name}=${String(v)}`);
    }
    const examples = new Set((c.examples ?? []).map((e) => JSON.stringify(e)));
    for (const e of o.examples ?? [])
      if (!examples.has(JSON.stringify(e))) lose(removals, o.name, `example ${e.label ?? ""}`);
    const anti = new Set(c.antipatterns ?? []);
    for (const a of o.antipatterns ?? [])
      if (!anti.has(a)) lose(removals, o.name, `antipattern ${a}`);
  }
}

function exportsOf(text: string): Set<string> {
  const result = new Set<string>();
  for (const m of text.matchAll(/export\s+(\*[^;]*|\{[^;]*?\}[^;]*);/gs))
    result.add(m[1].replace(/[\s,]+/g, ""));
  for (const m of text.matchAll(/export\s+\{([^}]*)\}/gs))
    for (const part of m[1].split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.replace(/^type\s+/, "");
      if (name) result.add(`name:${name}`);
    }
  return result;
}

function headings(text: string): Set<string> {
  return new Set(text.match(/^#{2,3} .+$/gm) ?? []);
}

function checkTopSection(path: string, version: string) {
  if (!existsSync(path)) return errors.push(`${path} neexistuje`);
  const first = readFileSync(path, "utf8").match(/^##\s+.+$/m)?.[0] ?? "";
  if (!first.includes(version) || !first.includes("(nevydáno)"))
    errors.push(`${path}: první sekce má být ${version} (nevydáno), je „${first}“`);
}

function nextMinor(version: string): string {
  const [major, minor] = version.split(".").map(Number);
  return `${major}.${minor + 1}.0`;
}

function main() {
  const argBase = process.argv.indexOf("--base");
  const cur = parseStrict(readFileSync(CATALOG, "utf8"), "teď");
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
  const released = cur.meta.version;
  const base = argBase > 0 ? process.argv[argBase + 1] : findBase(released);
  const baseText = atBase(base, CATALOG);
  if (!baseText) throw new Error(`V ${base} chybí ${CATALOG}`);
  const old = JSON.parse(baseText) as Catalog;
  const removals: Removal[] = existsSync(".lovable/catalog-removals.json")
    ? (JSON.parse(readFileSync(".lovable/catalog-removals.json", "utf8")) as Removal[])
    : [];

  if (pkg.version !== released)
    errors.push(`package.json ${pkg.version} ≠ meta.version ${released}`);
  compareCatalog(old, cur, removals);

  for (const path of BARRELS) {
    const before = atBase(base, path);
    if (!before) continue;
    const now = exportsOf(readFileSync(path, "utf8"));
    for (const e of exportsOf(before)) if (!now.has(e)) lose(removals, path, `export ${e}`);
  }
  for (const path of SECTION_FILES) {
    const before = atBase(base, path);
    if (!before || !existsSync(path)) continue;
    const now = headings(readFileSync(path, "utf8"));
    for (const h of headings(before)) if (!now.has(h)) lose(removals, path, `section ${h}`);
  }
  const upcoming = nextMinor(released);
  checkTopSection("CHANGELOG.md", upcoming);
  checkTopSection("roadmap.md", upcoming);

  const count = (c: Catalog) => c.components.reduce((n, x) => n + (x.props?.length ?? 0), 0);
  console.log(`Základ: ${base.slice(0, 8)} (vydaná ${released}), připravovaná ${upcoming}`);
  console.log(`Komponenty: ${old.components.length} → ${cur.components.length}`);
  console.log(`Props: ${count(old)} → ${count(cur)}`);
  console.log(`Přidané (${added.length}):${added.map((a) => `\n  + ${a}`).join("")}`);
  console.log(`Odebrané (${removed.length}):${removed.map((r) => `\n  - ${r}`).join("")}`);
  if (errors.length) {
    console.error(`CHYBY (${errors.length}):${errors.map((e) => `\n  ✗ ${e}`).join("")}`);
    process.exit(1);
  }
  console.log("Katalog bez ztrát.");
}

main();
