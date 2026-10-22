import { useCallback, useEffect, useMemo, useState } from "react";
import { getGridLayout, updateGridLayout } from "../../../lib/grid-prefs";
import { useGridLayoutChange } from "./use-grid-layout-change";

const keepVisibleState = <Id extends string>(value: Record<Id, boolean>) => value;

export type ColumnView = {
  id: string;
  name: string;
  visible: Record<string, boolean>;
  order?: string[];
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
      const view: ColumnView = { id, name: label, visible: { ...visible }, order: [...order] };
      persistViews(existing ? views.map((v) => (v.id === id ? view : v)) : [...views, view]);
      setActiveId(id);
    },
    [views, visible, order, persistViews],
  );

  const overwrite = useCallback(
    (id: string) => {
      persistViews(
        views.map((v) => (v.id === id ? { ...v, visible: { ...visible }, order: [...order] } : v)),
      );
      setActiveId(id);
    },
    [views, visible, order, persistViews],
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
      if (view.order?.length) applyOrder(view.order as Id[]);
      setActiveId(id);
    },
    [views, visible, applyVisible, applyOrder],
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

export type GridColumn<Id extends string = string> = {
  id: Id;
  label: string;
  /** Sloupec nelze skrýt. */
  locked?: boolean;
  /** Volitelný dynamický důvod, proč nyní nelze změnit viditelnost sloupce. */
  disableToggleReason?: string;
  /** Výchozí viditelnost (výchozí true). */
  defaultVisible?: boolean;
  /** Sekce pro spojený horní řádek hlavičky (např. „Smlouva“). */
  section?: string;
  /** Zarovnání obsahu buňky (výchozí vlevo). */
  align?: "left" | "right" | "center";
  /** Sloupec pobočky – při „Všechny pobočky" se posouvá vlevo a skrývá při jedné pobočce. */
  branchVisibility?: "auto" | "always";
  /** Dočasný systémový sloupec se neukládá do uživatelských pohledů ani nastavení. */
  transient?: boolean;
};

/** Spojená skupina sloupců v horním řádku hlavičky. */
export type GridColumnGroup = { section: string; span: number };

/**
 * Sdílená správa viditelnosti sloupců pro všechny gridy.
 * Nastavení se ukládá do prohlížeče pod `columns:<storageKey>`.
 * Vrací i `hiddenIndexes` pro `ZoomGrid`, takže grid nemusí podmiňovat jednotlivé buňky.
 */
export function useGridColumns<Id extends string>(
  storageKey: string,
  columns: GridColumn<Id>[],
  options: { normalizeVisible?: (visible: Record<Id, boolean>) => Record<Id, boolean> } = {},
) {
  const normalizeVisible = options.normalizeVisible ?? keepVisibleState;
  const persistentIds = useMemo(
    () => new Set(columns.filter((column) => !column.transient).map((column) => column.id)),
    [columns],
  );
  const persistentRecord = useCallback(
    <Value,>(record: Partial<Record<Id, Value>>) =>
      Object.fromEntries(Object.entries(record).filter(([id]) => persistentIds.has(id as Id))),
    [persistentIds],
  );
  const persistentOrder = useCallback(
    (ids: Id[]) => ids.filter((id) => persistentIds.has(id)),
    [persistentIds],
  );
  const defaults = useMemo(
    () =>
      normalizeVisible(
        Object.fromEntries(columns.map((c) => [c.id, c.defaultVisible !== false])) as Record<
          Id,
          boolean
        >,
      ),
    [columns, normalizeVisible],
  );

  const [visible, setVisible] = useState<Record<Id, boolean>>(defaults);
  const [explicitVisibility, setExplicitVisibility] = useState<Id[]>([]);

  // Aktuální stav; pokud chybí, použijeme uložené vlastní výchozí nastavení.
  const applyStoredVisible = useCallback(() => {
    const layout = getGridLayout(storageKey);
    const saved = layout.visible ?? layout.customDefault?.visible;
    setVisible((cur) => {
      const next = { ...cur };
      if (saved) {
        for (const c of columns) {
          if (typeof saved[c.id] === "boolean") next[c.id] = c.locked ? true : saved[c.id]!;
        }
      }
      const normalized = normalizeVisible(next);
      return JSON.stringify(normalized) === JSON.stringify(cur) ? cur : normalized;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, normalizeVisible]);

  useEffect(() => {
    applyStoredVisible();
  }, [applyStoredVisible]);

  const applyStoredOverrides = useCallback(() => {
    const saved = (getGridLayout(storageKey).visibilityOverrides ?? []).filter((id) =>
      persistentIds.has(id as Id),
    ) as Id[];
    // Stav nastavíme jen při skutečné změně obsahu – jinak by nestabilní
    // identita `persistentIds` (inline `columns` u volajícího) způsobila
    // nekonečný cyklus render → efekt → setState.
    setExplicitVisibility((cur) =>
      cur.length === saved.length && cur.every((id, i) => id === saved[i]) ? cur : saved,
    );
  }, [storageKey, persistentIds]);

  useEffect(() => {
    applyStoredOverrides();
  }, [applyStoredOverrides]);

  /** Nové (dynamické) sloupce doplníme do stavu s výchozí viditelností. */
  useEffect(() => {
    setVisible((cur) => {
      const missing = columns.filter((c) => cur[c.id] === undefined);
      if (!missing.length) return cur;
      const next = { ...cur };
      for (const c of missing) next[c.id] = defaults[c.id]!;
      return normalizeVisible(next);
    });
  }, [columns, defaults, normalizeVisible]);

  const persist = useCallback(
    (next: Record<Id, boolean>) => {
      const safe = normalizeVisible(next);
      setVisible(safe);
      updateGridLayout(storageKey, { visible: persistentRecord(safe) });
    },
    [storageKey, persistentRecord, normalizeVisible],
  );

  const toggle = useCallback(
    (id: Id) => {
      persist({ ...visible, [id]: !visible[id] });
      setExplicitVisibility((current) => {
        const next = current.includes(id) ? current : [...current, id];
        updateGridLayout(storageKey, { visibilityOverrides: next });
        return next;
      });
    },
    [persist, visible, storageKey],
  );

  // --- pořadí sloupců ---------------------------------------------------
  const defaultOrder = useMemo(() => columns.map((c) => c.id), [columns]);
  const orderKey = defaultOrder.join("|");
  const [order, setOrder] = useState<Id[]>(defaultOrder);

  // Bez uloženého pořadí použijeme pořadí z vlastního výchozího nastavení.
  const applyStoredOrder = useCallback(() => {
    const base = orderKey.split("|") as Id[];
    const layout = getGridLayout(storageKey);
    const saved = (layout.order ?? layout.customDefault?.order ?? []) as Id[];
    // zachováme uložené pořadí, nové sloupce doplníme na jejich původní místa
    const kept = saved.filter((id) => base.includes(id));
    const next = kept.length ? [...kept] : [...base];
    base.forEach((id, i) => {
      if (!next.includes(id)) next.splice(Math.min(i, next.length), 0, id);
    });
    setOrder((cur) => (cur.join("|") === next.join("|") ? cur : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, orderKey]);

  useEffect(() => {
    applyStoredOrder();
  }, [applyStoredOrder]);

  const persistOrder = useCallback(
    (next: Id[]) => {
      setOrder(next);
      updateGridLayout(storageKey, { order: persistentOrder(next) });
    },
    [storageKey, persistentOrder],
  );

  /** Posun sloupce o jednu pozici (-1 nahoru / +1 dolů). */
  const move = useCallback(
    (id: Id, delta: number) => {
      const from = order.indexOf(id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= order.length) return;
      const next = [...order];
      next.splice(to, 0, next.splice(from, 1)[0]!);
      persistOrder(next);
    },
    [order, persistOrder],
  );

  /** Přesun sloupce myší před/za jiný sloupec (drag & drop v záhlaví). */
  const reorder = useCallback(
    (id: Id, targetId: Id, position: "before" | "after" = "before") => {
      if (id === targetId) return;
      const from = order.indexOf(id);
      if (from < 0) return;
      const next = [...order];
      next.splice(from, 1);
      const at = next.indexOf(targetId);
      if (at < 0) return;
      next.splice(position === "after" ? at + 1 : at, 0, id);
      if (next.join("|") === order.join("|")) return;
      persistOrder(next);
    },
    [order, persistOrder],
  );

  // --- šířky sloupců -----------------------------------------------------
  // Šířky se sdílejí mezi všemi instancemi gridu se stejným storageKey
  // (např. vnořené podgridy ve stromovém zobrazení) – změna na jednom
  // se okamžitě projeví na všech (událost `grid-layout-change`).
  const [widths, setWidths] = useState<Partial<Record<Id, number>>>({});

  const applyStoredWidths = useCallback(() => {
    const saved = (getGridLayout(storageKey).widths ?? {}) as Partial<Record<Id, number>>;
    setWidths((cur) => (JSON.stringify(cur) === JSON.stringify(saved) ? cur : saved));
  }, [storageKey]);

  useEffect(() => {
    applyStoredWidths();
  }, [applyStoredWidths]);

  const storeWidths = useCallback(
    (next: Partial<Record<Id, number>>) => {
      updateGridLayout(storageKey, { widths: persistentRecord(next) });
    },
    [storageKey, persistentRecord],
  );

  const persistWidths = useCallback(
    (next: Partial<Record<Id, number>>) => {
      setWidths(next);
      storeWidths(next);
    },
    [storeWidths],
  );

  /** Nastaví ruční šířku sloupce v px. */
  const setWidth = useCallback(
    (id: Id, width: number) => {
      setWidths((cur) => {
        const next = { ...cur, [id]: Math.max(60, Math.round(width)) };
        storeWidths(next);
        return next;
      });
    },
    [storeWidths],
  );

  /** Zruší ruční šířku sloupce (vrátí automatickou). */
  const clearWidth = useCallback(
    (id: Id) => {
      setWidths((cur) => {
        if (cur[id] === undefined) return cur;
        const next = { ...cur };
        delete next[id];
        storeWidths(next);
        return next;
      });
    },
    [storeWidths],
  );

  // --- vlastní výchozí nastavení ----------------------------------------
  const [hasCustomDefault, setHasCustomDefault] = useState(false);

  const applyStoredDefault = useCallback(() => {
    setHasCustomDefault(!!getGridLayout(storageKey).customDefault);
  }, [storageKey]);

  useEffect(() => {
    applyStoredDefault();
  }, [applyStoredDefault]);

  /** Uloží aktuální viditelnost, pořadí i šířky jako výchozí zobrazení gridu. */
  const saveDefault = useCallback(() => {
    updateGridLayout(storageKey, {
      customDefault: {
        visible: persistentRecord(visible),
        order: persistentOrder(order),
        widths: persistentRecord(widths),
      },
    });
    setHasCustomDefault(true);
  }, [storageKey, visible, order, widths, persistentRecord, persistentOrder]);

  /** Zruší vlastní výchozí zobrazení (vrátí tovární). */
  const clearDefault = useCallback(() => {
    updateGridLayout(storageKey, { customDefault: undefined });
    setHasCustomDefault(false);
  }, [storageKey]);

  /** Obnoví výchozí zobrazení – vlastní, pokud je uložené, jinak tovární. */
  const reset = useCallback(() => {
    const saved = getGridLayout(storageKey).customDefault as
      | {
          visible?: Partial<Record<Id, boolean>>;
          order?: Id[];
          widths?: Partial<Record<Id, number>>;
        }
      | undefined;
    if (saved?.visible) {
      const next = { ...defaults };
      for (const c of columns) {
        if (typeof saved.visible[c.id] === "boolean")
          next[c.id] = c.locked ? true : saved.visible[c.id]!;
      }
      persist(next);
    } else {
      persist(defaults);
    }
    const savedOrder = saved?.order?.filter((id) => defaultOrder.includes(id)) ?? [];
    if (savedOrder.length) {
      const next = [...savedOrder];
      defaultOrder.forEach((id, i) => {
        if (!next.includes(id)) next.splice(Math.min(i, next.length), 0, id);
      });
      persistOrder(next);
    } else {
      persistOrder(defaultOrder);
    }
    persistWidths(saved?.widths ?? {});
    setExplicitVisibility([]);
    updateGridLayout(storageKey, { visibilityOverrides: undefined });
  }, [storageKey, defaults, columns, persist, persistOrder, persistWidths, defaultOrder]);

  const views = useColumnViews(
    storageKey,
    persistentRecord(visible) as Record<Id, boolean>,
    persist,
    persistentOrder(order),
    persistOrder,
  );

  // --- sekce sloupců -----------------------------------------------------
  const sections = useMemo(
    () => Array.from(new Set(columns.map((c) => c.section).filter(Boolean))) as string[],
    [columns],
  );
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  const applyStoredSections = useCallback(() => {
    const saved = getGridLayout(storageKey).sections ?? [];
    const known = saved.filter((s) => sections.includes(s));
    // Nikdy nesmí být skryté všechny sekce – grid by zůstal bez sloupců.
    const safe = sections.length > 0 && known.length >= sections.length ? [] : known;
    if (safe.length !== saved.length) updateGridLayout(storageKey, { sections: safe });
    setHiddenSections((cur) => (cur.join("|") === safe.join("|") ? cur : safe));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, sections.join("|")]);

  useEffect(() => {
    applyStoredSections();
  }, [applyStoredSections]);

  const toggleSection = useCallback(
    (section: string) => {
      setHiddenSections((cur) => {
        const hiding = !cur.includes(section);
        // poslední zapnutou sekci nelze vypnout
        if (hiding && cur.length + 1 >= sections.length) return cur;
        const next = hiding ? [...cur, section] : cur.filter((s) => s !== section);
        updateGridLayout(storageKey, { sections: next });
        return next;
      });
    },
    [storageKey, sections.length],
  );

  const sectionVisible = useCallback(
    (section?: string) => !section || !hiddenSections.includes(section),
    [hiddenSections],
  );

  /** Sloupce v uloženém pořadí. */
  const orderedColumns = useMemo(() => {
    const byId = new Map(columns.map((c) => [c.id, c]));
    const list = order.map((id) => byId.get(id)).filter(Boolean) as GridColumn<Id>[];
    columns.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [columns, order]);

  /** Výsledná viditelnost = nastavení sloupce a zapnutá sekce. */
  const effectiveVisible = useMemo(() => {
    const next = { ...visible };
    for (const c of columns) {
      if (c.locked) continue;
      if (!sectionVisible(c.section)) next[c.id] = false;
    }
    return next;
  }, [visible, columns, sectionVisible]);

  /** 1-based původní pozice sloupců v novém pořadí (pro ZoomGrid). */
  const columnOrder = useMemo(
    () => orderedColumns.map((c) => columns.findIndex((o) => o.id === c.id) + 1),
    [orderedColumns, columns],
  );

  /** 1-based indexy skrytých sloupců ve výsledném pořadí (pro nth-child). */
  const hiddenIndexes = useMemo(
    () => orderedColumns.map((c, i) => (effectiveVisible[c.id] ? -1 : i + 1)).filter((i) => i > 0),
    [orderedColumns, effectiveVisible],
  );

  /** Spojené skupiny pro horní řádek hlavičky (jen viditelné sloupce). */
  const groups = useMemo(() => {
    const out: GridColumnGroup[] = [];
    for (const c of orderedColumns) {
      if (!effectiveVisible[c.id]) continue;
      const section = c.section ?? "";
      const last = out[out.length - 1];
      if (last && last.section === section) last.span += 1;
      else out.push({ section, span: 1 });
    }
    return out;
  }, [orderedColumns, effectiveVisible]);

  /** ID sloupců, které začínají novou sekci (první viditelný sloupec sekce,
   *  kromě úplně prvního sloupce) — pro výraznější svislé oddělení v gridu. */
  const sectionSeparators = useMemo(() => {
    const sep = new Set<Id>();
    let prevSection: string | undefined;
    let first = true;
    for (const c of orderedColumns) {
      if (!effectiveVisible[c.id]) continue;
      const section = c.section ?? "";
      if (!first && section !== prevSection) sep.add(c.id);
      prevSection = section;
      first = false;
    }
    return sep;
  }, [orderedColumns, effectiveVisible]);

  const firstDataColumnIndex = useMemo(() => {
    for (let i = 0; i < orderedColumns.length; i++) {
      if (effectiveVisible[orderedColumns[i]!.id]) return i;
    }
    return 0;
  }, [orderedColumns, effectiveVisible]);

  // Synchronizace mezi instancemi gridu se stejným klíčem (událost grid-layout-change).
  useGridLayoutChange(storageKey, () => {
    applyStoredVisible();
    applyStoredOverrides();
    applyStoredOrder();
    applyStoredWidths();
    applyStoredDefault();
    applyStoredSections();
  });

  return {
    columns: orderedColumns,
    visible: effectiveVisible,
    /** Viditelnost sloupce bez ohledu na sekci (pro výběr sloupců). */
    columnVisible: visible,
    explicitVisibility,
    toggle,
    reset,
    move,
    reorder,
    widths,
    setWidth,
    clearWidth,
    order,
    columnOrder,
    hiddenIndexes,
    views,
    saveDefault,
    clearDefault,
    hasCustomDefault,
    sections,
    hiddenSections,
    toggleSection,
    sectionVisible,
    groups,
    sectionSeparators,
    firstDataColumnIndex,
  };
}
