import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Typ dat při přetahování záhlaví sloupce (změna pořadí). */
const COLUMN_MIME = "application/x-grid-column";
import {
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { GridSearch } from "./grid-search";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";

import { GridPagination, useGridPagination } from "./grid-pagination";
import { SortHead, useGridSort, useSortedRows } from "./grid-sort";
import { GridBody, GridErrorRow } from "./grid-states";
import { GridExport, type GridExportData } from "./grid-export";
import { GridZoomContext, ZoomControl, ZoomGrid, useGridZoom } from "./grid-zoom";
import { useGridColumns } from "./grid-columns";
import { ColumnResizeHandle } from "./grid-column-resize";
import { ColumnPicker } from "./column-picker";
import { GridFilterPanel, GridFilterToggle } from "./grid-filters";
import { ColumnFilter } from "./ColumnFilter";
import {
  GroupBar,
  GroupControl,
  GroupHeaderRow,
  detectDateColumns,
  groupDragProps,
  useGridGrouping,
  useGroupedRows,
} from "./grid-grouping";
import { GridTitleBar } from "./grid-title";
import { GridAction, GridActions } from "./grid-action";
import { Pencil, Trash2 } from "lucide-react";
import { fmtAmount } from "../../../lib/format";
import {
  formatUserDate,
  formatUserDateTime,
  useDateTimePreferences,
} from "../../../lib/date-time-preferences";
import { IcoLink } from "../form/ico-link";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

/** Sloupec pobočky řídí explicitně branchVisibility; zobrazuje se jen v režimu „Všechny pobočky“, vždy jako první. */
const isBranchColumn = (c: { branchVisibility?: "auto" | "always" }) =>
  c.branchVisibility !== undefined;

/** Pevná minimální šířka sloupce pobočky — kódy poboček jsou krátké, proto zabírá co nejméně místa. */
const BRANCH_COLUMN_WIDTH = 78;

/** Sloupce pripnuté vľavo – vždy na prvom mieste, minimálna šírka s miestom pre filter. */
const PINNED_COLUMN_IDS = new Set(["status", "is_active", "is_system", "source"]);
const PINNED_COLUMN_WIDTH = 84;
export const isPinnedColumn = (id: string) => PINNED_COLUMN_IDS.has(id);
const pinnedColumnWidth = (id: string) => (id === "is_system" ? 118 : PINNED_COLUMN_WIDTH);

export type DataGridColumn<Row> = {
  /** Jednoznačný kľúč sloupce. */
  id: string;
  label: string;
  align?: "left" | "right" | "center" | undefined;
  /** Hodnota použitá na hľadanie, radenie aj export. */
  value?: ((row: Row) => string | number | null | undefined) | undefined;
  /** Vlastné vykreslenie bunky. */
  render?: ((row: Row) => ReactNode) | undefined;
  /** Číselný stĺpec – zarovnanie vpravo a oddeľovanie tisícov. */
  numeric?: boolean | undefined;
  decimals?: number | undefined;
  /**
   * Súčtový riadok: „sum" (predvolené pri číselných stĺpcoch), „avg", „count",
   * "none" pre vypnutie alebo vlastná funkcia nad filtrovanými riadkami.
   */
  total?: "sum" | "avg" | "count" | "none" | ((rows: Row[]) => ReactNode) | undefined;
  /** Vypnúť radenie sloupce. */
  sortable?: boolean | undefined;
  /** Sloupec sa nedá skryť. */
  locked?: boolean | undefined;
  /** Predvolene skrytý stĺpec. */
  defaultVisible?: boolean | undefined;
  /** Pevná šírka sloupce v px – použije sa ako minimum aj maximum. */
  width?: number | undefined;
  /** Minimálna šírka podľa obsahu (nezalamovať, stĺpec sa zúži na najmenšiu možnú šírku). */
  fitContent?: boolean | undefined;
  /** Ukotviť stĺpec k pravému okraju pri horizontálnom rolovaní. */
  pinRight?: boolean | undefined;
  /** Sekcia sloupce (spojené záhlavie, napr. „Zmluva“). */
  section?: string | undefined;
  /** Sloupec pobočky: „auto" skryje pri jednej pobočke, „always" zobrazí vždy. */
  branchVisibility?: "auto" | "always" | undefined;
  className?: string | undefined;
  /** Vlastný filter v záhlaví sloupce (nahrádza automatický autofilter). */
  filter?: ReactNode | undefined;
  /** Príznak aktívneho vlastného filtra (pre indikáciu a tlačidlo Vymazat filtre). */
  filterActive?: boolean | undefined;
  /** Text vlastného filtra pre prehľad aktívnych filtrovaní. */
  filterLabel?: string | undefined;
  /**
   * Viac hodnot riadku pre autofilter (napr. zložený riadok skupiny, ktorý
   * zastupuje aj skryté pohyby). Ponuka aj porovnanie použije tieto hodnoty.
   */
  filterValues?: ((row: Row) => string[]) | undefined;
};

export type DataGridFilterChip = { id: string; label: string; onRemove?: () => void };

type Props<Row> = {
  /** Kľúč pre uloženie nastavení gridu v prehliadači. */
  storageKey: string;
  /** Nadpis gridu (môže byť ReactNode s vlastnou hlavičkou). Keď chýba, hlavička sa nezobrazí. */
  title?: ReactNode;
  /** Skryje ozdobný pruh pred nadpisom (napr. pri vlastnej hlavičke s mesiacom). */
  hideTitleMark?: boolean;
  /** Textový nadpis použitý v exportoch (PDF/Excel). Ak nie je zadaný, použije sa string hodnota title. */
  exportTitle?: string;
  rows: Row[];
  columns: DataGridColumn<Row>[];
  rowKey: (row: Row) => string;
  loading?: boolean | undefined;
  error?: unknown;
  onRetry?: (() => void) | undefined;
  onRowClick?: ((row: Row) => void) | undefined;
  /** Hlavné akcie vpravo v lište (napr. „Přidat záznam“). */
  actions?: ReactNode | undefined;
  /** Vlastné ovládacie prvky vľavo v lište (prepínače, dátum a pod.). */
  toolbarLeft?: ReactNode | undefined;
  /** Obsah rozbaliteľného panelu filtrov. */
  filters?: ReactNode | undefined;
  /** Popisy aktívnych filtrov pre tooltip a chipy. */
  filterChips?: DataGridFilterChip[] | undefined;
  onClearFilters?: (() => void) | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyActionLabel?: string | undefined;
  onEmptyAction?: (() => void) | undefined;
  /** Názov súboru exportu (bez prípony). */
  exportName?: string | undefined;
  defaultSort?: string | undefined;
  /** Úprava riadku – ikona v ukotvenom stĺpci akcií vpravo. */
  onEditRow?: ((row: Row) => void) | undefined;
  /** Odstránenie riadku – ikona v ukotvenom stĺpci akcií vpravo. */
  onDeleteRow?: ((row: Row) => void) | undefined;
  /** Text potvrdenia pred odstránením riadku. */
  deleteConfirm?: ((row: Row) => string) | undefined;
  /** Ďalšie akcie riadku (pred úpravou a odstránením). */
  rowActions?: ((row: Row) => ReactNode) | undefined;
  /** Popis sloupce akcií v hlavičke (predvolene bez textu). */
  actionsLabel?: string | undefined;
  /** Skryje filtre priamo v záhlaviach stĺpcov. */
  columnFilters?: boolean | undefined;
  /** Povolí seskupovanie riadkov podľa stĺpcov. */
  groupable?: boolean | undefined;
  /** Skryje spodnú lištu so stránkovaním. */
  paginated?: boolean | undefined;
  /** Zjednodušený vzhľad bez modrého akcentu vľavo a so zaobleným vrchom – pre vnorené gridy bez nadpisu. */
  plain?: boolean | undefined;
  /** Skryje ovládaciu lištu pri gridoch vložených priamo do rozbaleného riadku. */
  hideToolbar?: boolean | undefined;
  /** Skryje predvolené tlačidlá Upravit / Odstranit. Dvojklik na riadku stále funguje, ak je onEditRow. */
  hideDefaultActions?: boolean | undefined;
  /** Povolenie úpravy pre konkrétny riadok (ikona sa inak nezobrazí). */
  canEditRow?: ((row: Row) => boolean) | undefined;
  /** Povolenie odstránenia pre konkrétny riadok (ikona sa inak nezobrazí). */
  canDeleteRow?: ((row: Row) => boolean) | undefined;
  /** Povolí režim hromadného výberu riadkov (tlačidlo v lište gridu). */
  selectable?: boolean | undefined;
  /** Hromadné akcie v lište – dostanú vybrané riadky a funkciu na zrušenie výberu. */
  selectionActions?: ((rows: Row[], clear: () => void) => ReactNode) | undefined;
  /** Riadený režim výberu pre viac vnorených gridov s jednou spoločnou lištou. */
  selectMode?: boolean | undefined;
  /** Oznámi nadradenému stromu vybrané riadky. */
  onSelectedRowsChange?: ((rows: Row[]) => void) | undefined;
  /** Skryje lokálne tlačidlo, ak výber ovláda nadradená lišta. */
  hideSelectionToggle?: boolean | undefined;
  /** Obsah bočného panelu patriaceho ku gridu. */
  sidePanel?: ReactNode | undefined;
  /** Kľúč riadku, ku ktorému je otvorený bočný panel. */
  activeRowKey?: string | null | undefined;
  /** Zobrazí spodný súčtový riadok (predvolene true). */
  showTotalRow?: boolean | undefined;
  /** Oznámi zmenu stĺpcových filtrov (id sloupce → vybrané hodnoty). */
  onColumnFiltersChange?: ((filters: Record<string, string[]>) => void) | undefined;
  /** Zmena textového hľadania (napr. pre rozpad zoskupených riadkov). */
  onSearchChange?: ((search: string) => void) | undefined;
  /** Dodatočná CSS trieda pre vonkajší obal gridu. */
  className?: string | undefined;
  /** Přepis výchozích českých textů, například pro slovenskou verzi aplikace. */
  texts?: Partial<GridTexts>;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

/** Textová podoba bunky – dátumy vždy podľa centrálneho nastavenia firmy. */
const cellText = (v: unknown) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return formatUserDateTime(v);
  if (typeof v === "string") {
    if (ISO_DATE.test(v)) return formatUserDate(v);
    if (ISO_DATE_TIME.test(v)) return formatUserDateTime(v);
  }
  return String(v);
};

/**
 * Zdieľaný grid celej aplikácie – jednotná hlavička a lišta nástrojov
 * (hľadanie, filtre, export, výber stĺpcov, zoskupovanie, zoom a hustota),
 * radenie, stránkovanie a jednotné prázdne aj chybové stavy.
 */
export function DataGrid<Row>({
  storageKey,
  title,
  hideTitleMark,
  exportTitle,
  rows,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  onRowClick,
  actions,
  toolbarLeft,
  filters,
  filterChips = [],
  onClearFilters,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  exportName,
  defaultSort,
  onEditRow,
  onDeleteRow,
  deleteConfirm,
  rowActions,
  actionsLabel,
  columnFilters = true,
  groupable = true,
  paginated = true,
  hideDefaultActions,
  canEditRow,
  canDeleteRow,
  selectable,
  selectionActions,
  selectMode: controlledSelectMode,
  onSelectedRowsChange,
  hideSelectionToggle,
  sidePanel,
  activeRowKey,
  plain,
  hideToolbar,
  showTotalRow = true,
  onColumnFiltersChange,
  onSearchChange,
  className,
  texts: textOverrides,
}: Props<Row>) {
  const texts = useMemo(() => resolveGridTexts(textOverrides), [textOverrides]);
  const { confirm, confirmDialog } = useConfirmDialog();
  const [ownSelectMode, setOwnSelectMode] = useState(false);
  const selectMode = controlledSelectMode ?? ownSelectMode;
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const hasRowActions =
    Boolean(
      (onEditRow && !hideDefaultActions) ||
        (onDeleteRow && !hideDefaultActions) ||
        rowActions,
    ) && !selectMode;
  useDateTimePreferences();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { zoom, setZoom, density, setDensity } = useGridZoom(storageKey);

  const allBranches = true;

  const colDefs = useMemo(
    () =>
      columns
        // Sloupec pobočky sa pri výbere jednej pobočky automaticky skryje.
        .filter((c) => allBranches || !isBranchColumn(c) || c.branchVisibility === "always")
        .map((c) => ({
          id: c.id,
          label: c.label,
          // Sloupec akcií sa nikdy nesmie dať skryť; stĺpec pobočky riadi prepínač pobočiek.
          locked:
            isPinnedColumn(c.id) || c.id === "actions" || c.label === "Akcie" || isBranchColumn(c)
              ? true
              : c.locked,
          ...(c.defaultVisible !== undefined ? { defaultVisible: c.defaultVisible } : {}),
          ...(c.section !== undefined ? { section: c.section } : {}),
          ...(c.branchVisibility !== undefined ? { branchVisibility: c.branchVisibility } : {}),
          align: (c.align ?? (c.numeric ? "right" : "left")) as "left" | "right" | "center",
        })),
    [columns, allBranches],
  );

  const cols = useGridColumns(storageKey, colDefs);
  const grouping = useGridGrouping(storageKey, { disabled: !groupable });

  // Při výběru jedné pobočky nemá seskupení podle pobočky význam – odstraníme ho.
  const branchColIds = useMemo(
    () => columns.filter(isBranchColumn).map((c) => c.id),
    [columns],
  );
  useEffect(() => {
    if (allBranches) return;
    const present = grouping.groups.find((g) => branchColIds.includes(g.id));
    if (present) grouping.remove(present.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBranches, branchColIds, grouping.groups]);


  const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  /** Sloupce v uloženom poradí a len viditeľné. */
  const shown = useMemo(() => {
    const list = cols.columns
      .filter((c) => cols.visible[c.id] || isBranchColumn(c))
      .map((c) => byId.get(c.id)!);
    // Sloupec pobočky je pri „Všetky pobočky“ vždy viditeľný a úplne vľavo.
    const branch = list.filter((c) => isBranchColumn(c));
    const rest = list.filter((c) => !isBranchColumn(c));
    // Pripnuté stĺpce držíme hneď za stĺpcom pobočky.
    const pinned = rest.filter((c) => isPinnedColumn(c.id));
    const middle = rest.filter((c) => !isPinnedColumn(c.id) && !c.pinRight);
    const pinnedRight = rest.filter((c) => !isPinnedColumn(c.id) && c.pinRight);
    return [...branch, ...pinned, ...middle, ...pinnedRight];
  }, [cols.columns, cols.visible, byId]);

  const sort = useGridSort<string>(storageKey, defaultSort ?? columns[0]?.id ?? null);

  const valueOf = (row: Row, id: string) => {
    const col = byId.get(id);
    if (!col) return null;
    return col.value ? col.value(row) : null;
  };

  useEffect(() => {
    onSearchChange?.(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);


  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((c) => {
        // Skupinový riadok zastupuje aj svoje skryté položky.
        const many = c.filterValues?.(row);
        if (many && many.length) return many.some((v) => String(v).toLowerCase().includes(q));
        return cellText(c.value?.(row)).toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, search]);

  // --- filtre jednotlivých stĺpcov (autofilter v záhlaví) -----------------
  const [colFilters, setColFilters] = useState<Record<string, string[]>>({});
  const setColFilter = (id: string, next: Set<string>) =>
    setColFilters((cur) => {
      const copy = { ...cur };
      if (next.size === 0) delete copy[id];
      else copy[id] = [...next];
      return copy;
    });
  useEffect(() => {
    onColumnFiltersChange?.(colFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colFilters]);
  const textOf = (row: Row, id: string) => {
    const c = byId.get(id);
    const v = c?.value?.(row);
    return c?.numeric && typeof v === "number" ? fmtAmount(v, c.decimals ?? 0) : cellText(v);
  };
  /** Všetky hodnoty riadku v stĺpci (skupinový riadok môže zastupovať viac hodnot). */
  const valuesOf = (row: Row, id: string) => {
    const c = byId.get(id);
    const many = c?.filterValues?.(row);
    return many && many.length ? many : [textOf(row, id)];
  };
  /** Riadky prefiltrované všetkými stĺpcovými filtrami okrem zadaného. */
  const rowsExcept = (skipId: string | null) => {
    const entries = Object.entries(colFilters).filter(([id]) => id !== skipId);
    if (!entries.length) return searched;
    return searched.filter((row) =>
      entries.every(([id, vals]) => valuesOf(row, id).some((v) => vals.includes(v))),
    );
  };
  const filtered = useMemo(
    () => rowsExcept(null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, colFilters],
  );
  const columnFilterCount = Object.keys(colFilters).length;

  const sorted = useSortedRows(filtered, sort, valueOf);
  const pagination = useGridPagination(storageKey, sorted, { defaultPageSize: 50 });

  // --- hromadný výber riadkov --------------------------------------------
  const selectedRows = useMemo(
    () => sorted.filter((r) => selectedKeys.has(rowKey(r))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, selectedKeys],
  );
  const selectedRowsChangeRef = useRef(onSelectedRowsChange);
  selectedRowsChangeRef.current = onSelectedRowsChange;
  useEffect(() => selectedRowsChangeRef.current?.(selectedRows), [selectedRows]);
  useEffect(() => {
    if (!selectMode) setSelectedKeys(new Set());
  }, [selectMode]);
  const clearSelection = () => setSelectedKeys(new Set());
  const toggleRowKey = (key: string) =>
    setSelectedKeys((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const allSelected = sorted.length > 0 && sorted.every((r) => selectedKeys.has(rowKey(r)));
  const toggleAll = () =>
    setSelectedKeys(allSelected ? new Set() : new Set(sorted.map((r) => rowKey(r))));
  const exitSelectMode = () => {
    setOwnSelectMode(false);
    clearSelection();
  };
  const selectColSpan = selectMode ? 1 : 0;

  const groupColumns = useMemo(() => shown.map((c) => ({ id: c.id, label: c.label })), [shown]);
  const dateColumns = useMemo(
    () => detectDateColumns(pagination.rows, groupColumns, valueOf),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.rows, groupColumns],
  );
  const grouped = useGroupedRows(pagination.rows, grouping, groupColumns, valueOf);

  const exportData = (): GridExportData => ({
    columns: shown.map((c) => c.label),
    rows: sorted.map((row) =>
      shown.map((c) => {
        const v = c.value?.(row) ?? null;
        if (c.numeric && typeof v === "number") return v;
        return v === null || v === undefined ? "" : String(v);
      }),
    ),
  });

  /** Ponuka hodnot pre autofilter v záhlaví každého sloupce. */
  const filterOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }[]>();
    for (const c of shown) {
      const values = new Set<string>();
      for (const row of rowsExcept(c.id)) for (const v of valuesOf(row, c.id)) values.add(v);
      map.set(
        c.id,
        [...values]
          .sort((a, b) => a.localeCompare(b, texts.locale))
          .map((v) => ({ value: v, label: v === "" ? texts.emptyValue : v })),
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, searched, colFilters]);

  const activeFilterLabels = [
    ...filterChips.map((c) => c.label),
    ...Object.entries(colFilters).map(
      ([id, vals]) => `${byId.get(id)?.label ?? id}: ${texts.valuesCount(vals.length)}`,
    ),
    ...shown.filter((c) => c.filterActive && c.filterLabel).map((c) => c.filterLabel!),
  ];
  const clearAll = () => {
    setSearch("");
    setColFilters({});
    onClearFilters?.();
  };

  // --- presun stĺpcov myšou v záhlaví ------------------------------------
  const dragId = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const sideOf = (e: React.DragEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX > rect.left + rect.width / 2;
  };
  const headerDragProps = (id: string) => {
    const group = groupDragProps(id, grouping.enabled) as {
      onDragStart?: (e: React.DragEvent<HTMLElement>) => void;
    };
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        group.onDragStart?.(e);
        dragId.current = id;
        e.dataTransfer.setData(COLUMN_MIME, id);
        e.dataTransfer.effectAllowed = "copyMove";
      },
      onDragEnd: () => {
        dragId.current = null;
        setDropTarget(null);
      },
      onDragOver: (e: React.DragEvent<HTMLElement>) => {
        if (!dragId.current || dragId.current === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const after = sideOf(e);
        setDropTarget((cur) => (cur && cur.id === id && cur.after === after ? cur : { id, after }));
      },
      onDragLeave: () => setDropTarget((cur) => (cur?.id === id ? null : cur)),
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        const dragged = dragId.current;
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
        cols.reorder(dragged, id, sideOf(e) ? "after" : "before");
        dragId.current = null;
        setDropTarget(null);
      },
    };
  };
  const dropClass = (id: string) =>
    dropTarget?.id === id
      ? dropTarget.after
        ? "border-r-2 border-r-primary"
        : "border-l-2 border-l-primary"
      : "";

  // --- ukotvený riadok so súčtami ----------------------------------------
  /** Súčty počítame zo všetkých filtrovaných riadkov, nie len z aktuálnej strany. */
  const totalCells = useMemo(
    () =>
      shown.map((c) => {
        const mode = c.total ?? (c.numeric ? "sum" : "none");
        if (mode === "none") return null;
        if (typeof mode === "function") return mode(sorted);
        if (mode === "count") return fmtAmount(sorted.length, 0);
        const nums: number[] = [];
        for (const row of sorted) {
          const v = c.value?.(row);
          if (typeof v === "number" && Number.isFinite(v)) nums.push(v);
        }
        if (!nums.length) return null;
        const sum = nums.reduce((a, b) => a + b, 0);
        const value = mode === "avg" ? sum / nums.length : sum;
        return fmtAmount(value, c.decimals ?? 2);

      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown, sorted],
  );
  const hasTotals = totalCells.some((v) => v !== null && v !== undefined && v !== "");
  /** Prvý stĺpec bez spolu – sem dáme popis „Spolu“. */
  const totalLabelIndex = totalCells.findIndex((v) => v === null);

  return (
    <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
      <div className={`flex w-full min-w-0 flex-col ${plain ? "max-w-full overflow-hidden" : ""}`}>
        {title ? (
          <GridTitleBar title={title} zoom={zoom} hideMark={hideTitleMark} />
        ) : null}
        {!hideToolbar ? <div
          className={`zoom-filters grid-toolbar-row flex flex-wrap items-center gap-2 border border-b-0 p-2 ${plain ? "rounded-t-lg shadow-none" : "border-t-0 shadow-none"}`}
          style={{ fontSize: `${(13 * zoom).toFixed(2)}px` }}
        >
          {toolbarLeft}

          {filters ? (
            <GridFilterPanel open={filtersOpen} zoom={zoom}>
              {filters}
            </GridFilterPanel>
          ) : null}

          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
            <GridSearch value={search} onChange={setSearch} zoom={zoom} texts={texts} />

            {filters ? (
              <GridFilterToggle
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                {...(onClearFilters ? { onClear: onClearFilters } : {})}
                activeCount={filterChips.length + columnFilterCount}
                activeFilters={activeFilterLabels}
                zoom={zoom}
                texts={texts}
              />
            ) : null}

            <GridExport
              getData={exportData}
              filename={exportName ?? storageKey}
              title={exportTitle ?? (typeof title === "string" ? title : "")}
              zoom={zoom}
              texts={texts}
            />

            <ColumnPicker
              columns={cols.columns.map((c) => ({
                id: c.id,
                label: c.label,
                ...(c.locked !== undefined ? { locked: c.locked } : {}),
                ...(isPinnedColumn(c.id) ? { pinned: true } : {}),
                ...(c.section !== undefined ? { section: c.section } : {}),
              }))}
              visible={cols.columnVisible}
              onToggle={cols.toggle}
              onReorder={cols.reorder}
              onReset={cols.reset}
              onSaveDefault={cols.saveDefault}
              onClearDefault={cols.clearDefault}
              hasCustomDefault={cols.hasCustomDefault}
              hiddenSections={cols.hiddenSections}
              onToggleSection={cols.toggleSection}
              views={cols.views}
              zoom={zoom}
              title={texts.columnsTitle}
              texts={texts}
            />

            {groupable ? <GroupControl grouping={grouping} texts={texts} /> : null}

            <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} texts={texts} />

            {selectable && !hideSelectionToggle ? (
              <Button
                type="button"
                variant={selectMode ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => (selectMode ? exitSelectMode() : setOwnSelectMode(true))}
              >
                {selectMode ? texts.cancelSelection : texts.selectMore}
              </Button>
            ) : null}

            {actions}
          </div>
        </div> : null}

        {selectMode ? (
          <div className="flex flex-wrap items-center gap-2 border border-t-0 border-l-4 border-l-primary bg-secondary/50 px-2 py-1.5 text-sm">
            <span className="text-muted-foreground">
              {texts.selectedRecords(fmtAmount(selectedRows.length, 0))}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {selectionActions?.(selectedRows, clearSelection)}
            </div>
          </div>
        ) : null}

        {groupable ? (
          <GroupBar
            grouping={grouping}
            columns={groupColumns}
            dateColumns={dateColumns}
            zoom={zoom}
            texts={texts}
          />
        ) : null}

        <div className="flex min-h-0 w-full min-w-0 max-w-full items-stretch">
          <ZoomGrid
            zoom={zoom}
            setZoom={setZoom}
            density={density}
              className={`grid-table-surface min-w-0 max-w-full flex-1 ${hideToolbar ? "rounded-none border-t-0 !shadow-none" : "rounded-t-none border-t-0"} ${plain ? "rounded-b-lg !shadow-none" : paginated ? "rounded-b-none! border-b-0" : "rounded-b-none!"} ${className ?? ""}`}
            {...(loading !== undefined ? { loading } : {})}
          >
            <Table className="w-full">
              <colgroup>
                {selectMode ? <col style={{ width: "40px" }} /> : null}
                {shown.map((c) => {
                  const w = isBranchColumn(c)
                    ? BRANCH_COLUMN_WIDTH
                    : isPinnedColumn(c.id)
                      ? pinnedColumnWidth(c.id)
                      : c.fitContent
                        ? 1
                        : (cols.widths[c.id] ?? c.width);
                  return c.fitContent ? (
                    <col key={c.id} style={{ width: "1px", whiteSpace: "nowrap" }} />
                  ) : (
                    <col key={c.id} {...(w ? { style: { width: `${w}px` } } : {})} />
                  );
                })}
                {hasRowActions ? <col style={{ width: "auto", whiteSpace: "nowrap" }} /> : null}
              </colgroup>
              <TableHeader className={`grid-column-header sticky top-0 z-10 [&_th]:uppercase ${plain ? "[&_th]:border-t-0" : ""}`}>
                {cols.groups.some((g) => g.section) && (
                  <TableRow>
                    {selectMode ? <TableHead className="w-10" /> : null}
                    {cols.groups.map((g, i) => (
                      <TableHead
                        key={`${g.section}-${i}`}
                        colSpan={g.span}
                        className="border-l text-center font-semibold text-muted-foreground first:border-l-0"
                      >
                        {g.section?.toLocaleUpperCase(texts.locale)}
                      </TableHead>
                    ))}
                    {hasRowActions ? (
                      <TableHead className="grid-actions-header sticky right-0 z-20 w-px border-l px-px py-0" />
                    ) : null}
                  </TableRow>
                )}
                <TableRow>
                  {selectMode ? (
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleAll()}
                        aria-label={texts.selectAllRows}
                      />
                    </TableHead>
                  ) : null}
                  {shown.map((c) => {
                    const isPinned = isPinnedColumn(c.id);
                    const isBranch = isBranchColumn(c);
                    const width = isBranch
                      ? BRANCH_COLUMN_WIDTH
                      : isPinned
                        ? pinnedColumnWidth(c.id)
                        : c.fitContent
                          ? 1
                          : (cols.widths[c.id] ?? c.width);
                    const headStyle = c.fitContent
                      ? { width: "1px", whiteSpace: "nowrap" as const }
                      : width
                        ? {
                            width: `${width}px`,
                            maxWidth: `${width}px`,
                            minWidth: `${width}px`,
                            boxSizing: "border-box" as const,
                          }
                        : undefined;
                    const resize =
                      isPinned || isBranch || c.fitContent ? null : (
                        <ColumnResizeHandle
                          onResize={(w) => cols.setWidth(c.id, w)}
                          onReset={() => cols.clearWidth(c.id)}
                        />
                      );
                    const headClass = `relative ${isPinned ? (c.align === "left" ? "" : "text-center") : c.align === "center" ? "text-center" : "cursor-grab"} select-none ${dropClass(c.id)} ${c.className ?? ""}`;
                    const filter = c.filter ?? (
                      <ColumnFilter
                        options={filterOptions.get(c.id) ?? []}
                        selected={new Set(colFilters[c.id] ?? [])}
                        onChange={(next) => setColFilter(c.id, next)}
                        label={c.label}
                        texts={texts}
                      />
                    );
                    return c.sortable === false ? (
                      <TableHead
                        key={c.id}
                        data-pin-right={c.pinRight || undefined}
                        className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right" : c.align === "center" ? "text-center" : ""} ${headClass}`}
                        {...(headStyle ? { style: headStyle } : {})}
                        {...(isPinned ? {} : headerDragProps(c.id))}
                      >
                        <span
                          className={
                            c.align === "right" || (c.numeric && !c.align)
                              ? "flex w-full items-center justify-end"
                              : c.align === "center"
                                ? "flex w-full items-center justify-center"
                                : "inline-flex items-center gap-1"
                          }
                        >
                          {c.label.toLocaleUpperCase(texts.locale)}
                          {columnFilters ? filter : null}
                        </span>
                        {resize}
                      </TableHead>
                    ) : (
                      <SortHead
                        key={c.id}
                        id={c.id}
                        label={c.label}
                        sort={sort}
                        align={c.align ?? (c.numeric ? "right" : "left")}
                        className={headClass}
                        pinRight={c.pinRight}
                        {...(headStyle ? { style: headStyle } : {})}
                        dragProps={isPinned ? {} : headerDragProps(c.id)}
                        texts={texts}
                      >
                        {columnFilters ? filter : null}
                        {resize}
                      </SortHead>
                    );
                  })}
                  {hasRowActions ? (
                    <TableHead
                      className="grid-actions-header sticky right-0 z-20 !min-w-0 whitespace-nowrap border-l !px-0.5 py-0 text-right"
                      aria-label={actionsLabel ?? texts.actions}
                      title={actionsLabel ?? texts.actions}
                    />
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <GridErrorRow
                    colSpan={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                    error={error}
                    onRetry={onRetry}
                    texts={texts}
                  />
                ) : (
                  <GridBody
                    loading={loading}
                    empty={sorted.length === 0}
                    cols={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                    title={search ? texts.searchEmptyTitle : (emptyTitle ?? texts.emptyTitle)}
                    description={search ? undefined : emptyDescription}
                    filtered={Boolean(search) || filterChips.length > 0 || columnFilterCount > 0}
                    onClearFilter={clearAll}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                    texts={texts}
                  >
                    {grouped.map((item, i) =>
                      item.type === "group" ? (
                        <GroupHeaderRow
                          key={`g-${item.key}-${i}`}
                          item={item}
                          colSpan={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                          onToggle={grouping.toggleKey}
                        />
                      ) : (
                        <TableRow
                          key={rowKey(item.row)}
                          onDoubleClick={
                            !selectMode && (onEditRow || onRowClick)
                              ? () => {
                                  if (onEditRow && (canEditRow?.(item.row) ?? true))
                                    onEditRow(item.row);
                                  else onRowClick?.(item.row);
                                }
                              : undefined
                          }
                          onClick={
                            selectMode
                              ? () => toggleRowKey(rowKey(item.row))
                              : onRowClick
                                ? () => onRowClick(item.row)
                                : undefined
                          }
                          data-state={
                            selectMode && selectedKeys.has(rowKey(item.row))
                              ? "selected"
                              : undefined
                          }
                          aria-current={activeRowKey === rowKey(item.row) ? "true" : undefined}
                          className={`group/row ${onEditRow || onRowClick || selectMode ? "cursor-pointer" : ""} ${
                            activeRowKey === rowKey(item.row)
                              ? "border-l-2 border-l-primary/60 bg-primary/[0.04] [&>td]:bg-primary/[0.02]"
                              : ""
                          }`}
                        >
                          {selectMode ? (
                            <TableCell className="text-center">
                              <Checkbox
                                checked={selectedKeys.has(rowKey(item.row))}
                                onCheckedChange={() => toggleRowKey(rowKey(item.row))}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={texts.selectRow}
                              />
                            </TableCell>
                          ) : null}
                          {shown.map((c) => {
                            const v = c.value?.(item.row);
                            const cellStyle = c.fitContent
                              ? { whiteSpace: "nowrap" as const }
                              : c.width
                                ? {
                                    width: `${c.width}px`,
                                    maxWidth: `${c.width}px`,
                                    minWidth: `${c.width}px`,
                                    boxSizing: "border-box" as const,
                                  }
                                : undefined;
                            return (
                              <TableCell
                                key={c.id}
                                data-pin-right={c.pinRight || undefined}
                                className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right num" : c.align === "center" ? "text-center" : "text-left"} ${
                                  isPinnedColumn(c.id)
                                    ? c.align === "left"
                                      ? "text-left"
                                      : "text-center"
                                    : ""
                                } ${cols.sectionSeparators.has(c.id) ? "border-l" : ""} ${c.className ?? ""}`}
                                {...(cellStyle ? { style: cellStyle } : {})}
                              >
                                {c.render ? (
                                  c.render(item.row)
                                ) : c.id === "ico" &&
                                  v !== null &&
                                  v !== undefined &&
                                  cellText(v).trim() !== "" ? (
                                  <IcoLink value={cellText(v)} />
                                ) : c.numeric && typeof v === "number" ? (
                                  fmtAmount(v, c.decimals ?? 0)
                                ) : (
                                  cellText(v)
                                )}
                              </TableCell>
                            );
                          })}
                          {hasRowActions ? (
                            <TableCell className="sticky right-0 z-[1] !min-w-0 whitespace-nowrap border-l bg-card px-0.5 py-0">
                              <GridActions>
                                {rowActions?.(item.row)}
                                {!hideDefaultActions && onEditRow && (canEditRow?.(item.row) ?? true) ? (
                                  <GridAction
                                    title={texts.edit}
                                    aria-label={texts.edit}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditRow(item.row);
                                    }}
                                  >
                                    <Pencil className="size-3.5" />
                                  </GridAction>
                                ) : null}
                                {!hideDefaultActions && onDeleteRow && (canDeleteRow?.(item.row) ?? true) ? (
                                  <GridAction
                                    tone="destructive"
                                    title={texts.remove}
                                    aria-label={texts.remove}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const msg =
                                        deleteConfirm?.(item.row) ??
                                        texts.removeConfirm;
                                      confirm({
                                        title: msg,
                                        confirmLabel: texts.remove,
                                        destructive: true,
                                        onConfirm: () => onDeleteRow(item.row),
                                      });
                                    }}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </GridAction>
                                ) : null}
                              </GridActions>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ),
                    )}
                  </GridBody>
                )}
              </TableBody>
              {showTotalRow && hasTotals && !error && sorted.length > 0 ? (
                <TableFooter className="sticky bottom-0 z-10 font-semibold backdrop-blur">
                  <TableRow className="hover:bg-transparent">
                    {selectMode ? <TableCell /> : null}
                    {shown.map((c, i) => (
                      <TableCell
                        key={c.id}
                        data-pin-right={c.pinRight || undefined}
                        className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right num" : c.align === "center" ? "text-center" : ""} ${
                          cols.sectionSeparators.has(c.id) ? "border-l" : ""
                        } ${c.className ?? ""}`}
                      >
                        {totalCells[i] ??
                          (i === totalLabelIndex ? (
                            <span className="text-muted-foreground">
                               {texts.total.toLocaleUpperCase(texts.locale)}
                            </span>
                          ) : null)}
                      </TableCell>
                    ))}
                    {hasRowActions ? (
                      <TableCell className="grid-actions-footer sticky right-0 z-[9] !min-w-0 whitespace-nowrap border-l px-0.5 py-2" />
                    ) : null}
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </ZoomGrid>
          {sidePanel ? (
            <aside
              data-grid-side-panel
              className="w-[24rem] shrink-0 overflow-y-auto border border-l-0 border-t-0 bg-card p-4"
              aria-label={texts.sidePanelLabel}
            >
              {sidePanel}
            </aside>
          ) : null}
        </div>

        {paginated ? (
          <GridPagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            pageSize={pagination.pageSize}
            total={pagination.total}
            setPage={pagination.setPage}
            setPageSize={pagination.setPageSize}
            zoom={zoom}
            texts={texts}
          />
        ) : null}
        {confirmDialog}
      </div>
    </GridZoomContext.Provider>
  );
}
