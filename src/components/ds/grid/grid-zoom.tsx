import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Rows2, Rows3 } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { GridProgress } from "./grid-states";
import { useGridKeyboardNav } from "../../../hooks/use-grid-keyboard-nav";
import { useResolvedGridTexts, type GridTexts } from "./grid-texts";
import { usePane } from "../panes/pane-context";
import { useTabDraft } from "../panes/pane-tab-store";
import { usePageLayoutVariant } from "../layout/page-layout";

const MIN = 0.6;
const MAX = 1.4;
const STEP = 0.1;

const clamp = (v: number) => Math.round(Math.min(MAX, Math.max(MIN, v)) * 100) / 100;

const wheelZoom = (current: number, event: WheelEvent) => {
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
  return clamp(current * Math.exp(-delta * 0.0015));
};

/** Ctrl/Cmd + kolečko myši zoomuje nad libovolnou oblastí (nejen nad tabulkou). */
export function useWheelZoom(
  ref: React.RefObject<HTMLElement | null>,
  setZoom?: (v: number) => void,
  zoom = 1,
  enabled = true,
) {
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  // Klávesové ovládání (šipky, Home/End, PageUp/PageDown) pro všechny gridy.
  useGridKeyboardNav(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el || !setZoom || !enabled) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      // Vnorený grid už udalosť spracoval; nadradený strom ju nesmie započítať druhýkrát.
      if (e.defaultPrevented) return;
      e.preventDefault();
      setZoom(wheelZoom(zoomRef.current, e));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, setZoom, enabled]);
}

/** Základní velikost písma gridu při zoomu 100 %. */
export const GRID_BASE_FONT_REM = 0.8125;

/** Velikost písma odpovídající aktuálnímu zoomu gridu (px string). */
export const gridFontSize = (zoom = 1) => `${(GRID_BASE_FONT_REM * clamp(zoom)).toFixed(4)}rem`;

/** Určuje, zda pod pravým ukotveným sloupcem zůstává skrytý obsah tabulky. */
export function hasOverflowRight({
  scrollLeft,
  clientWidth,
  scrollWidth,
}: Pick<HTMLElement, "scrollLeft" | "clientWidth" | "scrollWidth">) {
  return scrollLeft + clientWidth < scrollWidth - 1;
}

/** Zoom tabulky uložený v prohlížeči pod vlastním klíčem. */
export type GridDensity = "compact" | "normal";

type GridZoomContextValue = {
  zoom: number;
  setZoom: (v: number) => void;
  density: GridDensity;
};

export const GridZoomContext = createContext<GridZoomContextValue | null>(null);

export function useGridZoomContext() {
  return useContext(GridZoomContext);
}

type GridPreferenceMap = Record<string, { zoom: number; density: GridDensity }>;

export function useGridZoom(storageKey: string, options: { auto?: boolean } = {}) {
  const pane = usePane();
  const initial = useCallback(() => ({ zoom: 1, density: "normal" as GridDensity }), []);
  const [tabPreferences, setTabPreferences] = useTabDraft<GridPreferenceMap>(options.auto ? undefined : pane?.tabId, () => ({ [storageKey]: initial() }), "gridPreferences");
  const [localValue, setLocalValue] = useState(initial);
  const current = options.auto ? localValue : pane?.tabId ? tabPreferences[storageKey] ?? initial() : localValue;

  const save = useCallback((next: Required<GridPreferenceValues>) => {
    const tabId = options.auto ? undefined : pane?.tabId;
    if (tabId) setTabPreferences((latest) => ({ ...latest, [storageKey]: next }));
    else setLocalValue(next);
  }, [options.auto, pane?.tabId, setTabPreferences, storageKey]);

  const updateDensity = useCallback(
    (next: GridDensity) => {
      save({ zoom: current.zoom, density: next });
    },
    [current.zoom, save],
  );

  const update = useCallback(
    (next: number) => {
      const v = clamp(next);
      save({ zoom: v, density: current.density });
    },
    [current.density, save],
  );

  return {
    zoom: current.zoom,
    setZoom: update,
    density: current.density,
    setDensity: updateDensity,
    setAutoZoom: (next: number) => setLocalValue((value) => ({ ...value, zoom: clamp(next) })),
    auto: options.auto === true,
    min: MIN,
    max: MAX,
    step: STEP,
  };
}

export function ZoomControl({
  zoom,
  setZoom,
  density,
  setDensity,
  auto = false,
  texts: textOverrides,
}: {
  zoom: number;
  setZoom: (v: number) => void;
  density?: GridDensity;
  setDensity?: (v: GridDensity) => void;
  auto?: boolean;
  texts?: Partial<GridTexts>;
}) {
  const texts = useResolvedGridTexts(textOverrides);
  return (
    <div className="grid-toolbar-control grid-toolbar-group zoom-control flex shrink-0 items-center rounded-md border border-border bg-card">
      {density && setDensity && (
        <Button
          variant="ghost"
          size="icon"
          className="grid-toolbar-icon-control"
          aria-label={density === "compact" ? texts.normalDensity : texts.compactDensity}
          title={density === "compact" ? texts.normalDensity : texts.compactDensity}
          onClick={() => setDensity(density === "compact" ? "normal" : "compact")}
        >
          {density === "compact" ? <Rows2 className="size-3.5" /> : <Rows3 className="size-3.5" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="grid-toolbar-icon-control"
        aria-label={texts.zoomOut}
        disabled={zoom <= MIN}
        onClick={() => setZoom(zoom - STEP)}
      >
        <Minus className="size-3.5" />
      </Button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        title={texts.zoomReset}
        className="zoom-value num min-w-[1.3em] px-[0.05em] text-[0.9em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="whitespace-nowrap">{auto ? "Auto " : ""}{Math.round(zoom * 100)}&nbsp;%</span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="grid-toolbar-icon-control"
        aria-label={texts.zoomIn}
        disabled={zoom >= MAX}
        onClick={() => setZoom(zoom + STEP)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}

/** Obal tabulky – mění velikost písma i šířku sloupců (padding v em).
 *  Ctrl/Cmd + kolečko myši zoomuje přímo nad tabulkou. */
export function ZoomGrid({
  zoom,
  setZoom,
  className = "",
  maxHeight,
  height,
  noFit = false,
  stickyHeader,
  overflowFallback = false,
  hiddenColumns,
  columnOrder,
  columnOffset = 0,
  density,
  scrollRef,
  loading,
  children,
}: {
  zoom: number;
  setZoom?: (v: number) => void;
  className?: string;
  maxHeight?: string;
  /** Výška podle rodiče (fill) nebo podle obsahu (auto). */
  height?: "fill" | "auto";
  /** @deprecated Výšku řídí `height`; ponecháno kvůli kompatibilitě volání. */
  noFit?: boolean;
  /**
   * Přilepení záhlaví: "grid" = k horní hraně gridu (výchozí u fill),
   * "pane" = pod pruh akcí v rolovací oblasti panelu (--pane-sticky-top; opt-in, jen grid bez vlastního rolování),
   * "none" = nepřilepené (výchozí u auto).
   */
  stickyHeader?: "grid" | "pane" | "none";
  /** Záloha: grid, který se ani po sbalení sloupců nevejde, smí vodorovně rolovat. */
  overflowFallback?: boolean;
  /** 1-based indexy sloupců, které se mají skrýt (z `useGridColumns`). */
  hiddenColumns?: number[];
  /** 1-based původní pozice sloupců v požadovaném pořadí (z `useGridColumns`). */
  columnOrder?: number[];
  /** Počet buněk před datovými sloupci (např. zaškrtávátko multiselectu). */
  columnOffset?: number;
  /** Hustota řádků (kompaktní / normální) – ukládá se ke gridu. */
  density?: GridDensity;
  /** Scrollovací kontejner gridu – pro virtualizaci řádků (`useGridVirtual`). */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Probíhá načítání dat – zobrazí indikátor průběhu nad tabulkou. */
  loading?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Stabilní ref callback (React 19 jinak při každém commitu odpojí a znovu připojí).
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    if (scrollRef) scrollRef.current = node;
  }, [scrollRef]);
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = height ?? (pageVariant === "list" ? "fill" : "auto");
  const resolvedSticky = stickyHeader ?? (resolvedHeight === "fill" ? "grid" : "none");
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gridId = `zg-${uid}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !setZoom) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
       setZoom(wheelZoom(zoomRef.current, e));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.dataset["overflowRight"] = hasOverflowRight(el) ? "true" : "false";
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const table = el.querySelector("table");
    if (table) observer.observe(table);
    return () => { el.removeEventListener("scroll", update); observer.disconnect(); };
  }, [children, zoom]);

  // Přeuspořádání sloupců podle uživatelského nastavení – tabulky renderují
  // buňky v původním pořadí, proto je po každém renderu srovnáme v DOM.
  // Každou buňku si jednou označíme její původní pozicí (`data-colpos`),
  // aby opakované průchody nepermutovaly už seřazený DOM.
  useEffect(() => {
    const el = ref.current;
    const ord = columnOrder;
    if (!el || !ord || ord.length === 0) return;
    el.querySelectorAll("tr").forEach((row) => {
      let cells = Array.from(row.children) as HTMLElement[];
      // Buňky výběru (zaškrtávátka) patří vždy na začátek řádku a nikdy se neřadí.
      const selects = cells.filter((c) => c.hasAttribute("data-grid-select"));
      if (selects.length > 0 && cells.indexOf(selects[0]!) !== 0) {
        selects.forEach((c, i) => row.insertBefore(c, row.children[i] ?? null));
        cells = Array.from(row.children) as HTMLElement[];
      }
      let lead = 0;
      while (
        cells[lead]?.hasAttribute("data-grid-select") ||
        cells[lead]?.hasAttribute("data-grid-lead")
      ) {
        delete cells[lead]!.dataset["colpos"];
        lead++;
      }
      const offset = lead > 0 ? lead : columnOffset;

      // řádek může mít navíc koncový sloupec s akcemi – ten necháme na místě
      if (cells.length < offset + ord.length) return;
      const scope = cells.slice(offset, offset + ord.length);
      if (scope.some((c) => c.hasAttribute("colspan"))) return;
      // Zapamatovaná pozice musí tvořit úplnou permutaci 1..n; jinak jde
      // o zbytek po jiné sadě sloupců a značky se zahodí a nastaví znovu.
      const marks = scope.map((c) => Number(c.dataset["colpos"]));
      const marksValid =
        marks.every((v) => Number.isInteger(v) && v >= 1 && v <= scope.length) &&
        new Set(marks).size === scope.length;
      if (!marksValid) {
        scope.forEach((c, i) => {
          c.dataset["colpos"] = String(i + 1);
        });
      }

      const byPos = new Map(scope.map((c) => [Number(c.dataset["colpos"]), c]));
      const anchor = cells[offset + ord.length] ?? null;
      const target = ord.map((idx) => byPos.get(idx)).filter(Boolean) as HTMLElement[];
      if (target.length !== scope.length) return;
      // pořadí už sedí – nic neděláme
      if (target.every((c, i) => c === scope[i])) return;
      target.forEach((cell) => row.insertBefore(cell, anchor));
    });
  });

  // --- ukotvení (pin) sloupců vlevo ------------------------------------
  // Buňky označené atributem `data-pin` zůstávají viditelné při horizontálním
  // rolování. Běží až po přeuspořádání sloupců, aby měřilo finální DOM.
  // Kontejner rolování je vnější .zoom-grid; šířky dopočítáme v px ze skutečných
  // rozměrů, protože tabulka používá automatické rozložení (neznáme je dopředu).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const table = el.querySelector("table");
    if (!table) return;

    const apply = () => {
      // nejprve zrušíme předchozí ukotčení (např. po skrytí/přesunu sloupce)
      table.querySelectorAll<HTMLElement>(".grid-pin-cell").forEach((c) => {
        c.style.position = "";
        c.style.left = "";
        c.classList.remove("grid-pin-cell", "grid-pin-last");
      });
      table.querySelectorAll<HTMLElement>(".grid-pin-right-cell").forEach((c) => {
        c.style.position = "";
        c.style.right = "";
        c.classList.remove("grid-pin-right-cell", "grid-pin-right-first");
      });
      const rows = Array.from(table.querySelectorAll("tr"));
      const hasActions = !!table.querySelector('[data-slot="grid-actions"]');

      // --- ukotvení vlevo ---
      // referenční řádek = první bez colspan, který má pinované buňky (hlavička)
      const refRow = rows.find(
        (r) =>
          r.querySelector("[data-pin]") &&
          !Array.from(r.children).some((c) => c.hasAttribute("colspan")),
      );
      if (refRow) {
        let acc = 0;
        const offsets: number[] = [];
        Array.from(refRow.children).forEach((cell) => {
          const html = cell as HTMLElement;
          if (html.hasAttribute("data-pin")) offsets.push(acc);
          acc += html.getBoundingClientRect().width;
        });
        if (offsets.length) {
          const lastIdx = offsets.length - 1;
          rows.forEach((row) => {
            const pins = Array.from(row.querySelectorAll<HTMLElement>("[data-pin]"));
            pins.forEach((cell, i) => {
              cell.style.position = "sticky";
              cell.style.left = `${offsets[i] ?? 0}px`;
              cell.classList.add("grid-pin-cell");
              if (i === lastIdx) cell.classList.add("grid-pin-last");
            });
          });
        }
      }

      // --- ukotvení vpravo ---
      // Odsazení od pravého okraje: každé ukotvené buňce nastavíme `right` =
      // součet šířek všech ukotvených buněk (včetně akčního sloupce) napravo.
      const refRowR = rows.find(
        (r) =>
          r.querySelector("[data-pin-right]") &&
          !Array.from(r.children).some((c) => c.hasAttribute("colspan")),
      );
      if (refRowR) {
        const children = Array.from(refRowR.children) as HTMLElement[];
        let acc = 0;
        const offsets: number[] = [];
        for (let i = children.length - 1; i >= 0; i--) {
          const cell = children[i]!;
          // akční sloupec (poslední, pokud existuje) je ukotvený přes CSS –
          // jeho šířku musíme započítat do odsazení buněk nalevo od něj.
          if (hasActions && i === children.length - 1) {
            acc += cell.getBoundingClientRect().width;
            continue;
          }
          if (cell.hasAttribute("data-pin-right")) {
            offsets.unshift(acc);
            acc += cell.getBoundingClientRect().width;
          }
        }
        if (offsets.length) {
          rows.forEach((row) => {
            const pins = Array.from(row.querySelectorAll<HTMLElement>("[data-pin-right]"));
            pins.forEach((cell, i) => {
              cell.style.position = "sticky";
              cell.style.right = `${offsets[i] ?? 0}px`;
              cell.classList.add("grid-pin-right-cell");
              // levý stín na prvním (nejlevějším) ukotveném sloupci zprava
              if (i === 0) cell.classList.add("grid-pin-right-first");
            });
          });
        }
      }
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(table);
    return () => ro.disconnect();
  });

  const hideCss = (hiddenColumns ?? [])
    .map((i) => i + columnOffset)
    .map(
      (i) =>
        `#${gridId} tr > th:nth-child(${i}):not([colspan]),#${gridId} tr > td:nth-child(${i}):not([colspan]){display:none}`,
    )
    .join("");

  return (
    <div
      ref={setRootRef}
      id={gridId}

      data-density={density ?? "normal"}
      data-grid-height={resolvedHeight}
      data-sticky-header={resolvedSticky}
      data-overflow={overflowFallback ? "true" : undefined}
      className={
        cn("zoom-grid rounded-lg border border-border bg-card shadow-panel", resolvedHeight === "fill" ? "min-h-0 flex-1 overflow-auto overscroll-contain" : "overflow-x-auto overflow-y-visible", className)
      }
      style={{ fontSize: gridFontSize(zoom), ...(maxHeight ? { maxHeight } : {}) }}
    >
      {hideCss && <style>{hideCss}</style>}
      <GridProgress show={loading} />
      {children}
    </div>
  );
}

/** Obal pro netabulková zobrazení (např. strom kontaktů) – škáluje celý obsah
 *  stejným zoomem jako grid, včetně Ctrl/Cmd + kolečko myši. */
export function ZoomPane({
  zoom,
  setZoom,
  className = "",
  maxHeight,
  height,
  children,
}: {
  zoom: number;
  setZoom?: (v: number) => void;
  className?: string;
  maxHeight?: string;
  height?: "fill" | "auto";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = height ?? (pageVariant === "list" ? "fill" : "auto");
  useWheelZoom(ref, setZoom, zoom);

  return (
    <div ref={ref} data-grid-height={resolvedHeight} className={cn(resolvedHeight === "fill" ? "min-h-0 flex-1 overflow-auto overscroll-contain" : "overflow-x-auto overflow-y-visible", className)} style={maxHeight ? { maxHeight } : undefined}>
      <div style={{ zoom: clamp(zoom) }}>{children}</div>
    </div>
  );
}
