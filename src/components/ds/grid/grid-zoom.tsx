import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Rows2, Rows3 } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { GridProgress } from "./grid-states";
import { useGridKeyboardNav } from "../../../hooks/use-grid-keyboard-nav";

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
export const GRID_BASE_FONT_PX = 13;

/** Velikost písma odpovídající aktuálnímu zoomu gridu (px string). */
export const gridFontSize = (zoom = 1) => `${(GRID_BASE_FONT_PX * clamp(zoom)).toFixed(2)}px`;

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

export function useGridZoom(storageKey: string) {
  const [zoom, setZoom] = useState(1);
  const [density, setDensity] = useState<GridDensity>("normal");

  useEffect(() => {
    const raw = localStorage.getItem(`zoom:${storageKey}`);
    if (raw) setZoom(clamp(Number(raw) || 1));
    const d = localStorage.getItem(`density:${storageKey}`);
    setDensity(d === "compact" ? "compact" : "normal");
  }, [storageKey]);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey: string; zoom?: number; density?: GridDensity }>).detail;
      if (detail?.storageKey !== storageKey) return;
      if (detail.zoom !== undefined) setZoom(clamp(detail.zoom));
      if (detail.density) setDensity(detail.density);
    };
    window.addEventListener("grid-zoom-change", sync);
    return () => window.removeEventListener("grid-zoom-change", sync);
  }, [storageKey]);

  const updateDensity = useCallback(
    (next: GridDensity) => {
      setDensity(next);
      localStorage.setItem(`density:${storageKey}`, next);
      window.dispatchEvent(new CustomEvent("grid-zoom-change", { detail: { storageKey, density: next } }));
    },
    [storageKey],
  );

  const update = useCallback(
    (next: number) => {
      const v = clamp(next);
      setZoom(v);
      localStorage.setItem(`zoom:${storageKey}`, String(v));
      window.dispatchEvent(new CustomEvent("grid-zoom-change", { detail: { storageKey, zoom: v } }));
    },
    [storageKey],
  );

  return {
    zoom,
    setZoom: update,
    density,
    setDensity: updateDensity,
    min: MIN,
    max: MAX,
    step: STEP,
  };
}

/** Svislý oddělovač v toolbarech gridů – jednotný vzhled napříč aplikací. */
/** Svislý oddělovač skupin ovládacích prvků v liště gridu.
 *  Výška i okraje se odvozují od velikosti písma lišty (zoom) a zvolené hustoty. */
export function GridToolbarSeparator({ density = "normal" }: { density?: GridDensity }) {
  return (
    <span
      aria-hidden
      className={cn(
        "w-px shrink-0 self-center bg-border",
        density === "compact" ? "mx-0.5 h-[1.1em]" : "mx-1 h-[1.4em]",
      )}
    />
  );
}

export function ZoomControl({
  zoom,
  setZoom,
  density,
  setDensity,
}: {
  zoom: number;
  setZoom: (v: number) => void;
  density?: GridDensity;
  setDensity?: (v: GridDensity) => void;
}) {
  return (
    <div className="grid-toolbar-control grid-toolbar-group zoom-control flex shrink-0 items-center rounded-md border border-border bg-card">
      {density && setDensity && (
        <Button
          variant="ghost"
          size="icon"
          className="grid-toolbar-icon-control"
          aria-label={density === "compact" ? "Normální hustota řádků" : "Kompaktní hustota řádků"}
          title={density === "compact" ? "Normální hustota řádků" : "Kompaktní hustota řádků"}
          onClick={() => setDensity(density === "compact" ? "normal" : "compact")}
        >
          {density === "compact" ? <Rows2 className="size-3.5" /> : <Rows3 className="size-3.5" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="grid-toolbar-icon-control"
        aria-label="Zmenšit tabulku"
        disabled={zoom <= MIN}
        onClick={() => setZoom(zoom - STEP)}
      >
        <Minus className="size-3.5" />
      </Button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        title="Výchozí velikost"
        className="zoom-value num min-w-[1.3em] px-[0.05em] text-[0.9em] text-muted-foreground transition-colors hover:text-foreground"
      >
        {Math.round(zoom * 100)} %
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="grid-toolbar-icon-control"
        aria-label="Zvětšit tabulku"
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
  maxHeight = "calc(100vh - 20rem)",
  noFit = false,
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
  /** Vypnout automatickou výšku podle patičky – grid se roztáhne podle obsahu. */
  noFit?: boolean;
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
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gridId = `zg-${uid}`;

  // Má-li tabulka patičku se součty, dopočítáme výšku tak, aby patička
  // seděla na spodku okna a scrollovaly jen řádky.
  const [fitHeight, setFitHeight] = useState<string | null>(null);

  useEffect(() => {
    if (noFit) {
      setFitHeight(null);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (!el.querySelector("tfoot")) {
      setFitHeight(null);
      return;
    }
    const measure = () => {
      const top = el.getBoundingClientRect().top;
      // Prostor pod gridem (např. připojené stránkování) necháme viditelný.
      let below = 0;
      const sumBelow = (start: HTMLElement | null) => {
        let sib = start;
        while (sib) {
          // Postranný panel (poznámky) je vedľa gridu vo flex riadku, nie pod ním –
          // jeho výška nesmie zmenšiť výšku gridu.
          if (!sib.hasAttribute("data-grid-side-panel")) {
            below += sib.getBoundingClientRect().height;
          }
          sib = sib.nextElementSibling as HTMLElement | null;
        }
      };
      sumBelow(el.nextElementSibling as HTMLElement | null);
      // Grid bývá zabalený ve flex řádku s postranným panelem – stránkování
      // je pak sourozenec tohoto obalu, nikoli samotného gridu.
      const parent = el.parentElement;
      if (parent && parent !== el) {
        sumBelow(parent.nextElementSibling as HTMLElement | null);
      }
      const h = Math.max(200, window.innerHeight - top - below - 16);
      setFitHeight(`${Math.round(h)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [noFit, zoom, children]);

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
      ref={(node) => {
        ref.current = node;
        if (scrollRef) scrollRef.current = node;
      }}
      id={gridId}

      data-density={density ?? "normal"}
      className={
        "zoom-grid overflow-auto rounded-lg border border-border bg-card shadow-panel " + className
      }
      style={{ fontSize: gridFontSize(zoom), maxHeight: fitHeight ?? maxHeight }}
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
  maxHeight = "calc(100vh - 20rem)",
  children,
}: {
  zoom: number;
  setZoom?: (v: number) => void;
  className?: string;
  maxHeight?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = ref.current;
    if (!el || !setZoom) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(clamp(zoomRef.current + (e.deltaY < 0 ? 0.05 : -0.05)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  return (
    <div ref={ref} className={"overflow-auto " + className} style={{ maxHeight }}>
      <div style={{ zoom: clamp(zoom) }}>{children}</div>
    </div>
  );
}
