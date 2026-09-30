/** Pomocné funkce výběru řádků a součtů skupin v DataGrid (bez DOM závislostí). */

/** Vybrané řádky z CELÉ množiny řádků – výběr skrytý filtrem zůstává. */
export function resolveSelectedRows<Row>(
  rows: Row[],
  keys: ReadonlySet<string>,
  rowKey: (row: Row) => string,
): Row[] {
  if (keys.size === 0) return [];
  return rows.filter((row) => keys.has(rowKey(row)));
}

/** „Vybrat vše“ – přidá nebo odebere jen viditelné (filtrované) řádky, ostatní výběr ponechá. */
export function toggleVisibleSelection(
  current: ReadonlySet<string>,
  visibleKeys: string[],
): Set<string> {
  const allVisible = visibleKeys.length > 0 && visibleKeys.every((key) => current.has(key));
  const next = new Set(current);
  for (const key of visibleKeys) {
    if (allVisible) next.delete(key);
    else next.add(key);
  }
  return next;
}

/** Selektor prvků v buňce, jejichž klepnutí nemá přepínat výběr řádku. */
export const GRID_INTERACTIVE_SELECTOR =
  "input, button, textarea, select, a, [role=combobox], [contenteditable=true], [data-grid-interactive]";

/** True, když klepnutí vzniklo v interaktivním prvku uvnitř řádku (ne na řádku samotném). */
export function isInteractiveTarget(
  target: { closest?: (selector: string) => unknown } | null | undefined,
  row?: unknown,
): boolean {
  if (!target || typeof target.closest !== "function") return false;
  const hit = target.closest(GRID_INTERACTIVE_SELECTOR);
  return Boolean(hit) && hit !== row;
}

/** Index dalšího editoru pro Tab / Shift+Tab; null = mimo seznam (nechat výchozí chování). */
export function nextEditorIndex(current: number, count: number, backwards: boolean): number | null {
  if (current < 0) return null;
  const next = current + (backwards ? -1 : 1);
  return next >= 0 && next < count ? next : null;
}

type GroupLike = {
  type: "group";
  key: string;
  label: string;
  level: number;
  collapsed: boolean;
  sums: { id: string; total: number }[];
};
type RowLike<Row> = { type: "row"; row: Row };
export type GroupTotalItem = {
  type: "groupTotal";
  key: string;
  label: string;
  level: number;
  sums: { id: string; total: number }[];
};

/**
 * Vloží za poslední řádek každé rozbalené skupiny řádek součtů (DataGrid `groupTotals="row"`).
 * Sbalené skupiny řádek součtů nemají – skrývá se s řádky.
 */
export function insertGroupTotalRows<Row, G extends GroupLike>(
  items: (G | RowLike<Row>)[],
): (G | RowLike<Row> | GroupTotalItem)[] {
  const out: (G | RowLike<Row> | GroupTotalItem)[] = [];
  const stack: G[] = [];
  const close = (level: number) => {
    while (stack.length && stack[stack.length - 1]!.level >= level) {
      const group = stack.pop()!;
      if (!group.collapsed)
        out.push({
          type: "groupTotal",
          key: group.key,
          label: group.label,
          level: group.level,
          sums: group.sums,
        });
    }
  };
  for (const item of items) {
    if (item.type === "group") {
      close(item.level);
      out.push(item);
      stack.push(item);
    } else out.push(item);
  }
  close(0);
  return out;
}
