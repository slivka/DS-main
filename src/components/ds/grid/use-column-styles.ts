/**
 * Formáty sloupců nad sdíleným úložištěm.
 * Vlastní: výchozí hodnoty, sanitaci, synchronizaci a zápis.
 * Nesmí: ukládat dočasné ani neformátovatelné sloupce.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getGridLayout, updateGridLayout } from "../../../lib/grid-prefs";
import { sanitizeColumnStyle, type GridColumnStyle } from "../../../lib/column-tones";
import { useGridLayoutChange } from "./use-grid-layout-change";

/** Minimální smlouva formátovatelného sloupce. */
export interface StyleableColumn {
  /** Klíč. */
  id: string;
  /** Povolení formátu. */
  styleable?: boolean;
  /** Dočasný sloupec. */
  transient?: boolean;
  /** Systémový typ. */
  type?: string;
  /** Výchozí formát od aplikace. */
  defaultStyle?: GridColumnStyle;
}
/** Systémové sloupce nemají vlastní formát. */
export function isStyleableColumn(column: StyleableColumn): boolean {
  return (
    column.styleable !== false &&
    !column.transient &&
    column.type !== "record-indicators" &&
    !["actions", "select", "selection", "__select"].includes(column.id)
  );
}
/** Odstraní nepovolené sloupce i tóny. Prázdný formát je explicitní vypnutí výchozího. */
export function sanitizeColumnStyles(
  columns: readonly StyleableColumn[],
  styles: Record<string, unknown>,
): Record<string, GridColumnStyle> {
  return Object.fromEntries(
    columns
      .filter(isStyleableColumn)
      .filter((c) => Object.hasOwn(styles, c.id))
      .map((c) => [c.id, sanitizeColumnStyle(styles[c.id])]),
  );
}
/** Sdílený stav formátů, včetně rychlého obnovení po změně pohledu. */
export function useColumnStyles(storageKey: string, columns: readonly StyleableColumn[]) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        columns
          .filter(isStyleableColumn)
          .filter((c) => c.defaultStyle)
          .map((c) => [c.id, sanitizeColumnStyle(c.defaultStyle)]),
      ),
    [columns],
  );
  const [styles, setStyles] = useState<Record<string, GridColumnStyle>>(defaults);
  const read = useCallback(() => {
    const layout = getGridLayout(storageKey);
    const next = {
      ...defaults,
      ...sanitizeColumnStyles(columns, layout.styles ?? layout.customDefault?.styles ?? {}),
    };
    setStyles((cur) => (JSON.stringify(cur) === JSON.stringify(next) ? cur : next));
  }, [storageKey, defaults, columns]);
  useEffect(read, [read]);
  useGridLayoutChange(storageKey, read);
  const applyStyles = useCallback(
    (next: Record<string, GridColumnStyle>) => {
      updateGridLayout(storageKey, { styles: sanitizeColumnStyles(columns, next) });
    },
    [storageKey, columns],
  );
  const setColumnStyle = useCallback(
    (id: string, style: GridColumnStyle | null) => {
      const column = columns.find((c) => c.id === id);
      if (!column || !isStyleableColumn(column)) return;
      applyStyles({ ...styles, [id]: sanitizeColumnStyle(style) });
    },
    [columns, styles, applyStyles],
  );
  const clearColumnStyles = useCallback(
    () => applyStyles(Object.fromEntries(columns.filter(isStyleableColumn).map((c) => [c.id, {}]))),
    [columns, applyStyles],
  );
  return { styles, setColumnStyle, clearColumnStyles, applyStyles, defaultStyles: defaults };
}
