/**
 * Měření a rozložení mřížky editoru řádků.
 * Vlastní: měření vnitřní šířky gridu a velikosti rem, uložené sloupce, kaskádu → auto zoom → rolování.
 * Nesmí: měnit řádky dokladu; nesmí ukládat do localStorage nic mimo sloupce a zoom gridu.
 */
import * as React from "react";

import { APP_ZOOM_EVENT } from "../../../lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT } from "../../../lib/resize-lock";
import { useGridColumns, type GridColumn } from "../grid/grid-columns";
import { useGridZoom } from "../grid/grid-zoom";
import {
  journalColumnWidthsRem,
  normalizeJournalAccountVisibility,
  resolveJournalZoomLayout,
  type JournalLinesMode,
} from "./journal-column-layout";
import type { ColumnId } from "./journal-lines-model";

/** Vstup hooku rozložení. */
export interface JournalLayoutInput {
  /** Ref předaný editoru zvenku. */
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  /** Klíč uložení sloupců a zoomu. */
  storageKey: string;
  /** Definice sloupců. */
  columnDefs: GridColumn<ColumnId>[];
  /** Režim editoru. */
  mode: JournalLinesMode;
  /** Režim polí stran. */
  sideFields: "shared" | "split";
  /** V režimu s DPH je sloupec s DPH chráněný před skrytím. */
  grossProtected: boolean;
  /** Počet řádků pro pružnou šířku sloupce Ř. */
  rowCount: number;
}

/** Sleduje šířku gridu (ResizeObserver, změna zoomu aplikace, konec tažení) a velikost rem. */
function useMeasuredWidth(rootRef: React.RefObject<HTMLDivElement | null>) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [rootRemPx, setRootRemPx] = React.useState(16);
  React.useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      if (isResizeLocked()) return;
      const grid = node.querySelector<HTMLElement>(".journal-lines-grid");
      const width = grid?.clientWidth ?? node.clientWidth;
      if (width <= 0) return;
      setContainerWidth(width);
      setRootRemPx(Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    };
    const delayed = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(update, 150);
    };
    update();
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(delayed);
    observer.observe(node);
    observer.observe(document.documentElement);
    window.addEventListener("resize", delayed);
    window.addEventListener(APP_ZOOM_EVENT, delayed);
    window.addEventListener(RESIZE_END_EVENT, update);
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", delayed);
      window.removeEventListener(APP_ZOOM_EVENT, delayed);
      window.removeEventListener(RESIZE_END_EVENT, update);
    };
  }, [rootRef]);
  return { containerWidth, rootRemPx };
}

/** Rozložení mřížky: viditelné sloupce, šířky v rem a efektivní zoom. */
export function useJournalLayout(input: JournalLayoutInput) {
  const { forwardedRef, storageKey, mode, sideFields } = input;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { setZoom, manualZoom, setAutoZoom, density, setDensity, isAuto } = useGridZoom(
    storageKey,
    { auto: true },
  );
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const { containerWidth, rootRemPx } = useMeasuredWidth(rootRef);
  const normalizeAccountVisibility = React.useCallback(
    (visible: Record<ColumnId, boolean>) => normalizeJournalAccountVisibility(visible, mode),
    [mode],
  );
  const columns = useGridColumns(`${storageKey}:v4`, input.columnDefs, {
    normalizeVisible: normalizeAccountVisibility,
  });
  const protectedColumns = columns.columns
    .filter(
      (column) =>
        columns.visible[column.id] &&
        (column.defaultVisible === false ||
          columns.explicitVisibility.includes(column.id) ||
          (input.grossProtected && column.id === "grossAmount")),
    )
    .map((column) => column.id);
  const effectiveWidthRem = containerWidth / rootRemPx;
  const requestedColumnIds = columns.columns
    .filter((column) => columns.visible[column.id])
    .map((column) => column.id);
  const widthsRem = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(columns.widths).map(([id, width]) => [
          id,
          typeof width === "number" ? width / 16 : undefined,
        ]),
      ),
    [columns.widths],
  );
  const availableWidthPx16 = containerWidth / 16;
  const appZoomFactor = rootRemPx / 16;
  const zoomLayout = React.useMemo(
    () =>
      resolveJournalZoomLayout({
        availableWidthRem: availableWidthPx16,
        appZoom: appZoomFactor,
        manualZoom,
        mode,
        visibleColumnIds: requestedColumnIds,
        protectedColumnIds: protectedColumns,
        sharedSideFields: sideFields === "shared",
        widths: widthsRem,
        rowCount: input.rowCount,
      }),
    [
      availableWidthPx16,
      appZoomFactor,
      manualZoom,
      mode,
      requestedColumnIds,
      protectedColumns,
      sideFields,
      widthsRem,
      input.rowCount,
    ],
  );
  const automaticZoom = zoomLayout.autoZoom;
  // Jeden efektivní zoom pro písmo, šířky sloupců i kaskádu: ruční hodnota, jinak vypočtená.
  const zoom = zoomLayout.zoom;
  const columnLayout = zoomLayout.layout;
  // Auto zoom a rušení ručního zoomu závisí jen na šířce v px a sloupcích; kaskáda (zoomLayout) se přepočítá i po změně zoomu aplikace.
  const autoInputsKey = `${Math.round(containerWidth)}|${requestedColumnIds.join(",")}|${zoomLayout.fullRequiredWidthRem}`;
  const autoInitialized = React.useRef(false);
  React.useLayoutEffect(() => {
    if (effectiveWidthRem <= 0) return;
    // První výpočet po připojení ruční zoom ponechá (přepnutí záložky); každá další změna šířky v px nebo sloupců jej zruší, zoom aplikace ne.
    setAutoZoom(automaticZoom, autoInitialized.current);
    autoInitialized.current = true;
  }, [autoInputsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- spouští jen změna šířky v px nebo sloupců
  const autoHidden = new Set<ColumnId>(columnLayout.hiddenColumnIds);
  const compactAccountIds = React.useMemo(
    () => new Set<ColumnId>(columnLayout.compactAccountIds),
    [columnLayout.compactAccountIds],
  );
  const visibleColumns = columns.columns
    .filter((column) => columns.visible[column.id] && !autoHidden.has(column.id))
    .sort((a, b) => (a.id === "actions" ? 1 : b.id === "actions" ? -1 : 0));
  const colWidthsRem = journalColumnWidthsRem({
    columnIds: visibleColumns.map((column) => column.id),
    savedWidths: columns.widths,
    compactAccountIds,
    layout: columnLayout,
    zoom,
    effectiveWidthRem,
    rowCount: input.rowCount,
  });
  return {
    rootRef,
    setRootRef,
    rootRemPx,
    zoom,
    setZoom,
    density,
    setDensity,
    isAuto,
    columns,
    zoomLayout,
    columnLayout,
    autoHidden,
    compactAccountIds,
    visibleColumns,
    colWidthsRem,
  };
}

/** Výsledek `useJournalLayout`. */
export type JournalLayout = ReturnType<typeof useJournalLayout>;
