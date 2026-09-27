import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Virtualizace řádků tabulky.
 *
 * Vykresluje jen řádky viditelné ve scrollovacím kontejneru gridu
 * (`ZoomGrid`) plus rezervu nad/pod. Chybějící výška se doplní dvěma
 * prázdnými řádky (`VirtualPad`), takže scrollbar i ukotvená hlavička
 * a patička fungují stejně jako u nevirtualizované tabulky.
 *
 * Použití:
 * ```tsx
 * const v = useGridVirtual(rows.length, { zoom });
 * <ZoomGrid zoom={zoom} scrollRef={v.scrollRef}>
 *   <Table>
 *     <TableBody>
 *       <VirtualPad height={v.padTop} colSpan={cols} />
 *       {rows.slice(v.start, v.end).map(...)}
 *       <VirtualPad height={v.padBottom} colSpan={cols} />
 *     </TableBody>
 *   </Table>
 * </ZoomGrid>
 * ```
 */
export type GridVirtual = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
  /** Aktivní jen u dostatečně dlouhých seznamů. */
  enabled: boolean;
};

/** Odhad výšky řádku podle zoomu, než se změří skutečný řádek. */
const estimateRowHeight = (zoom: number, density: "compact" | "normal") =>
  Math.round((density === "compact" ? 20 : 36) * zoom);

export function useGridVirtual(
  count: number,
  options: {
    zoom?: number;
    density?: "compact" | "normal";
    /** Kolik řádků se vykreslí navíc nad a pod viditelnou oblastí. */
    overscan?: number;
    /** Pod tímto počtem řádků se virtualizace nepoužije. */
    threshold?: number;
  } = {},
): GridVirtual {
  const { zoom = 1, density = "normal", overscan = 12, threshold = 60 } = options;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = useState(() => estimateRowHeight(zoom, density));
  const [range, setRange] = useState({ start: 0, end: Math.min(count, threshold) });
  const enabled = count > threshold;

  // Skutečnou výšku řádku měříme z vykresjené tabulky – mění se se zoomem
  // i hustotou řádků.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const row = el.querySelector<HTMLElement>("tbody tr[data-virtual-row]");
      const h = row?.getBoundingClientRect().height ?? 0;
      if (h > 4) setRowHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom, density, count]);

  const recompute = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !enabled) {
      setRange((prev) =>
        prev.start === 0 && prev.end === count ? prev : { start: 0, end: count },
      );
      return;
    }
    const h = rowHeight > 4 ? rowHeight : estimateRowHeight(zoom, density);
    // Odečteme výšku hlavičky, která scrolluje spolu s obsahem.
    const head = el.querySelector<HTMLElement>("thead")?.getBoundingClientRect().height ?? 0;
    const top = Math.max(0, el.scrollTop - head);
    const visible = Math.ceil(el.clientHeight / h) + overscan * 2;
    const start = Math.max(0, Math.floor(top / h) - overscan);
    const end = Math.min(count, start + visible);
    setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [count, enabled, overscan, rowHeight, zoom, density]);

  useEffect(() => {
    recompute();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => recompute();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [recompute]);

  const h = rowHeight > 4 ? rowHeight : estimateRowHeight(zoom, density);
  const start = enabled ? range.start : 0;
  const end = enabled ? Math.min(range.end, count) : count;

  return {
    scrollRef,
    start,
    end,
    padTop: enabled ? start * h : 0,
    padBottom: enabled ? Math.max(0, count - end) * h : 0,
    enabled,
  };
}

/** Prázdný řádek nahrazující výšku nevykreslených řádků. */
export function VirtualPad({ height, colSpan }: { height: number; colSpan: number }) {
  if (height <= 0) return null;
  return (
    <tr aria-hidden style={{ height }}>
      <td colSpan={colSpan} style={{ height, padding: 0, border: 0 }} />
    </tr>
  );
}
