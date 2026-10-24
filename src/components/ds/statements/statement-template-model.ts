/** Šablona výkazu · čisté úpravy pořadí a stromu · nesmí validovat ani ukládat. */
import type { StatementTemplateRow } from "./statement-types";

/** Hloubka řádku podle řetězu rodičů. */
export function templateRowDepth(rows: StatementTemplateRow[], row: StatementTemplateRow): number {
  let depth = 0;
  let parent = row.parentId;
  const seen = new Set<string>();
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    depth += 1;
    parent = rows.find((item) => item.id === parent)?.parentId;
  }
  return depth;
}

/** Přesune řádek z indexu na index; ostatní pořadí zachová. */
export function moveTemplateRow(
  rows: StatementTemplateRow[],
  from: number,
  to: number,
): StatementTemplateRow[] {
  if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return rows;
  const next = rows.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Odebere řádek; jeho potomci převezmou rodiče odebraného řádku. */
export function removeTemplateRow(rows: StatementTemplateRow[], id: string): StatementTemplateRow[] {
  const removed = rows.find((row) => row.id === id);
  return rows
    .filter((row) => row.id !== id)
    .map((row) => (row.parentId === id ? { ...row, parentId: removed?.parentId ?? null } : row));
}
