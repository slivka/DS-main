/**
 * Zakotvené sloupce editoru řádků (2.118.0, DPH 5 B).
 * Vlastní: množinu zakotvených sloupců otevřeného dokladu (nic se neukládá), převzetí hodnot
 *   do nového řádku a značku „převzato“, dokud uživatel hodnotu nezmění.
 * Nesmí: měnit existující řádky – změna zakotvené hodnoty platí až od dalšího nového řádku.
 */
import * as React from "react";

import type { JournalLine } from "./journal-lines";
import { dataColumnOf, type ColumnId } from "./journal-lines-model";

/** Hodnoty, které nový řádek vždy převezme z předchozího při Enteru na konci řádku. */
export const ENTER_INHERITED_FIELDS = [
  "vatCodeId",
  "vatRate",
  "debitAccount",
  "creditAccount",
  "counterAccount",
] as const satisfies readonly (keyof JournalLine)[];

/** Hodnoty převzaté do nového řádku: vždy kód DPH a účty (Enter), navíc zakotvené sloupce. */
export function inheritedLineValues(
  previous: JournalLine | undefined,
  pinned: ReadonlySet<ColumnId>,
  withEnterFields: boolean,
): { values: Partial<JournalLine>; pinnedFields: string[] } {
  if (!previous) return { values: {}, pinnedFields: [] };
  const values: Record<string, unknown> = {};
  if (withEnterFields)
    for (const field of ENTER_INHERITED_FIELDS)
      if (previous[field] != null) values[field] = previous[field];
  const pinnedFields: string[] = [];
  for (const column of pinned) {
    const field = dataColumnOf(column) as keyof JournalLine;
    const value = previous[field];
    if (value == null || value === "") continue;
    values[field] = value;
    pinnedFields.push(field);
  }
  return { values: values as Partial<JournalLine>, pinnedFields };
}

/** Stav zakotvení a převzatých hodnot. */
export function useJournalPins() {
  const [pinned, setPinned] = React.useState<ReadonlySet<ColumnId>>(() => new Set());
  const [inherited, setInherited] = React.useState<ReadonlyMap<string, ReadonlySet<string>>>(
    () => new Map(),
  );
  const togglePin = React.useCallback((column: ColumnId) => {
    setPinned((current) => {
      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  }, []);
  const markInherited = React.useCallback((lineId: string, fields: string[]) => {
    if (!fields.length) return;
    setInherited((current) => new Map(current).set(lineId, new Set(fields)));
  }, []);
  /** Uživatel změnil hodnotu – převzetí končí jen u změněných polí. */
  const releaseInherited = React.useCallback(
    (line: JournalLine, values: Partial<JournalLine>) => {
      const fields = inherited.get(line.id);
      if (!fields) return;
      const changed = [...fields].filter(
        (field) =>
          field in values &&
          values[field as keyof JournalLine] !== line[field as keyof JournalLine],
      );
      if (!changed.length) return;
      setInherited((current) => {
        const next = new Map(current);
        const rest = new Set(fields);
        for (const field of changed) rest.delete(field);
        if (rest.size) next.set(line.id, rest);
        else next.delete(line.id);
        return next;
      });
    },
    [inherited],
  );
  const isInherited = (lineId: string, column: ColumnId) =>
    Boolean(inherited.get(lineId)?.has(dataColumnOf(column)));
  return { pinned, togglePin, markInherited, releaseInherited, isInherited };
}

/** Výsledek `useJournalPins`. */
export type JournalPins = ReturnType<typeof useJournalPins>;
