/** Kategorie · vlastní kompatibilní vstup a stromové pomocníky · bez druhého výběru. */
import type { CategoryOption } from "../accounting/category-select";
export { CategorySelect } from "../accounting/category-select";
export type { CategoryOption, CategorySelectProps } from "../accounting/category-select";
type FlatOption = { id: string; name: string; level: number; path: string };

/** Seřadí kategorie do stromového pořadí (rodič, potom jeho potomci). */
export function flattenCategories(options: CategoryOption[]): FlatOption[] {
  const byParent = new Map<string | null, CategoryOption[]>();
  for (const o of options) {
    const key = o.parentId ?? o.parent_id ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), o]);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.name.localeCompare(b.name, "cs"));

  const out: FlatOption[] = [];
  const walk = (parent: string | null, level: number, prefix: string) => {
    for (const o of byParent.get(parent) ?? []) {
      const path = prefix ? `${prefix} / ${o.name}` : o.name;
      out.push({ id: o.id, name: o.name, level, path });
      walk(o.id, level + 1, path);
    }
  };
  walk(null, 0, "");
  // osirené položky (rodič mimo zoznamu) doplníme na konec
  const seen = new Set(out.map((o) => o.id));
  for (const o of options) {
    if (!seen.has(o.id)) out.push({ id: o.id, name: o.name, level: 0, path: o.name });
  }
  return out;
}

/** Název kategorie včetně cesty od kořene. */
export function categoryPath(options: CategoryOption[], id: string | null | undefined) {
  if (!id) return "";
  return flattenCategories(options).find((o) => o.id === id)?.path ?? "";
}

