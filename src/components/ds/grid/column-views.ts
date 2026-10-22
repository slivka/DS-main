/**
 * Uložené pohledy sloupců.
 * Vlastní: pojmenované snímky viditelnosti, pořadí a formátu.
 * Nesmí: ukládat mimo sdílené úložiště.
 */
import { useCallback, useEffect, useState } from "react";
import { getGridLayout, updateGridLayout } from "../../../lib/grid-prefs";
import type { GridColumnStyle } from "../../../lib/column-tones";
import { useGridLayoutChange } from "./use-grid-layout-change";
export type ColumnView = {
  id: string;
  name: string;
  visible: Record<string, boolean>;
  order?: string[];
  styles?: Record<string, GridColumnStyle>;
};

export type ColumnViewsApi = {
  views: ColumnView[];
  activeId: string | null;
  save: (name: string) => void;
  overwrite: (id: string) => void;
  apply: (id: string) => void;
  remove: (id: string) => void;
};

/**
 * Pojmenované pohledy (uložené sestavy sloupců) pro jeden grid.
 * Ukládá se do úložiště rozložení gridů (`updateGridLayout`).
 */
export function useColumnViews<Id extends string>(
  storageKey: string,
  visible: Record<Id, boolean>,
  applyVisible: (next: Record<Id, boolean>) => void,
  order: Id[] = [],
  applyOrder: (next: Id[]) => void = () => {},
  styles: Record<string, GridColumnStyle> = {},
  applyStyles: (next: Record<string, GridColumnStyle>) => void = () => {},
): ColumnViewsApi {
  const [views, setViews] = useState<ColumnView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const storedViews = useCallback(
    () => (getGridLayout(storageKey).views as ColumnView[] | undefined) ?? [],
    [storageKey],
  );

  useEffect(() => {
    setActiveId(null);
    setViews(storedViews());
  }, [storageKey, storedViews]);

  useGridLayoutChange(storageKey, () => {
    const next = storedViews();
    setViews((cur) => (JSON.stringify(cur) === JSON.stringify(next) ? cur : next));
  });

  const persistViews = useCallback(
    (next: ColumnView[]) => {
      setViews(next);
      updateGridLayout(storageKey, { views: next });
    },
    [storageKey],
  );

  const save = useCallback(
    (name: string) => {
      const label = name.trim();
      if (!label) return;
      const existing = views.find((v) => v.name.toLowerCase() === label.toLowerCase());
      const id =
        existing?.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const view: ColumnView = {
        id,
        name: label,
        visible: { ...visible },
        order: [...order],
        styles: { ...styles },
      };
      persistViews(existing ? views.map((v) => (v.id === id ? view : v)) : [...views, view]);
      setActiveId(id);
    },
    [views, visible, order, styles, persistViews],
  );

  const overwrite = useCallback(
    (id: string) => {
      persistViews(
        views.map((v) =>
          v.id === id
            ? { ...v, visible: { ...visible }, order: [...order], styles: { ...styles } }
            : v,
        ),
      );
      setActiveId(id);
    },
    [views, visible, order, styles, persistViews],
  );

  const apply = useCallback(
    (id: string) => {
      const view = views.find((v) => v.id === id);
      if (!view) return;
      const next = { ...visible };
      for (const key of Object.keys(next) as Id[]) {
        if (typeof view.visible[key] === "boolean") next[key] = view.visible[key];
      }
      applyVisible(next);
      applyStyles(view.styles ?? {});
      if (view.order?.length) applyOrder(view.order as Id[]);
      setActiveId(id);
    },
    [views, visible, applyVisible, applyOrder, applyStyles],
  );

  const remove = useCallback(
    (id: string) => {
      persistViews(views.filter((v) => v.id !== id));
      setActiveId((cur) => (cur === id ? null : cur));
    },
    [views, persistViews],
  );

  return { views, activeId, save, overwrite, apply, remove };
}
