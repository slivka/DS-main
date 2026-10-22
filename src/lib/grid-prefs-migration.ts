/**
 * Přechod gridů ze starých klíčů localStorage (do 2.131.0) na jedno rozložení
 * GridLayout. Samostatný modul, aby grid-prefs.ts zůstal pod limitem řádků.
 */
import type { GridLayout } from "./grid-prefs";

/** Staré předpony klíčů nastavení gridů. */
export const LEGACY_GRID_PREFIXES = [
  "columns:",
  "columnsDefault:",
  "columnOrder:",
  "columnWidths:",
  "columnViews:",
  "columnSections:",
  "columnVisibilityOverrides:",
  "sort:",
  "grouping:",
  "page-size:",
] as const;

/** Patří klíč nastavení gridů (zrcadlo `gridLayout:` nebo staré předpony)? */
export function isGridPrefKey(key: string): boolean {
  return key.startsWith("gridLayout:") || LEGACY_GRID_PREFIXES.some((p) => key.startsWith(p));
}

const readJson = (raw: string | null): unknown => {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Sestaví GridLayout ze starých klíčů jednoho gridu; null, když nic není. */
export function readLegacyLayout(gridKey: string): GridLayout | null {
  if (typeof window === "undefined") return null;
  const ls = window.localStorage;
  const layout: GridLayout = {};
  let found = false;

  const visible = readJson(ls.getItem(`columns:${gridKey}`));
  if (isRecord(visible)) {
    layout.visible = visible as Record<string, boolean>;
    found = true;
  }
  const overrides = readJson(ls.getItem(`columnVisibilityOverrides:${gridKey}`));
  if (Array.isArray(overrides)) {
    layout.visibilityOverrides = overrides as string[];
    found = true;
  }
  const order = readJson(ls.getItem(`columnOrder:${gridKey}`));
  if (Array.isArray(order)) {
    layout.order = order as string[];
    found = true;
  }
  const widths = readJson(ls.getItem(`columnWidths:${gridKey}`));
  if (isRecord(widths)) {
    layout.widths = widths as Record<string, number>;
    found = true;
  }
  const sections = readJson(ls.getItem(`columnSections:${gridKey}`));
  if (Array.isArray(sections)) {
    layout.sections = sections as string[];
    found = true;
  }
  const views = readJson(ls.getItem(`columnViews:${gridKey}`));
  if (Array.isArray(views)) {
    layout.views = views as GridLayout["views"];
    found = true;
  }
  const customDefault = readJson(ls.getItem(`columnsDefault:${gridKey}`));
  if (isRecord(customDefault)) {
    layout.customDefault = customDefault as GridLayout["customDefault"];
    found = true;
  }
  const sort = readJson(ls.getItem(`sort:${gridKey}`));
  if (isRecord(sort)) {
    layout.sort = sort as GridLayout["sort"];
    found = true;
  }
  const grouping = readJson(ls.getItem(`grouping:${gridKey}`));
  if (isRecord(grouping)) {
    layout.grouping = grouping as GridLayout["grouping"];
    found = true;
  }
  const pageSize = ls.getItem(`page-size:${gridKey}`);
  if (pageSize !== null && Number.isFinite(Number(pageSize))) {
    layout.pageSize = Number(pageSize);
    found = true;
  }
  if (!found) return null;
  layout.version = 1;
  return layout;
}

/** Smaže všechny staré klíče jednoho gridu. */
export function deleteLegacyKeys(gridKey: string) {
  if (typeof window === "undefined") return;
  for (const prefix of LEGACY_GRID_PREFIXES) window.localStorage.removeItem(`${prefix}${gridKey}`);
}

/** Všechny klíče gridů, které mají alespoň jeden starý záznam. */
export function sweepLegacyGridKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys = new Set<string>();
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const storageKey = window.localStorage.key(i);
    if (!storageKey) continue;
    for (const prefix of LEGACY_GRID_PREFIXES) {
      if (storageKey.startsWith(prefix)) {
        keys.add(storageKey.slice(prefix.length));
        break;
      }
    }
  }
  return [...keys];
}
