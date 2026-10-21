/** Táhlo panelu · vlastní meze a zachycení ukazatele · nesmí ukládat šířku. */
import { useRef, type RefObject } from "react";
import { useDsTexts } from "../../../../ds-texts";
/** Meze velikosti v pixelech odvozené od hostitele a jeho písma. */
export function panelSizeBounds(hostWidth: number, fontSize: number) {
  const min = 20 * fontSize;
  return { min, max: Math.max(min, hostWidth * 0.75) };
}
/** Omezení řízené šířky. */
export function clampPanelSize(size: number, min: number, max: number) {
  return Math.min(max, Math.max(min, size));
}
/** Vnitřní táhlo bez vlastního trvalého stavu. */
export interface PanelResizeProps {
  /** Hostitel panelu. */
  host: RefObject<HTMLDivElement | null>;
  /** Aktuální velikost. */
  size: number;
  /** Výchozí velikost aplikace. */
  defaultSize: number;
  /** Minimum. */
  min: number;
  /** Maximum. */
  max: number;
  /** Žádost o změnu. */
  onSizeChange: (size: number) => void;
  /** Dokončené gesto pro uložení šířky aplikací. */
  onSizeCommit?: (size: number) => void;
}
/** Myš, dotyk a klávesnice používají stejné meze; onSizeCommit jednou po gestu a jen při změně. */
export function PanelResize({
  size,
  defaultSize,
  min,
  max,
  onSizeChange,
  onSizeCommit,
}: PanelResizeProps) {
  const drag = useRef<{ x: number; size: number } | null>(null);
  const keyStart = useRef<number | null>(null);
  const latest = useRef(size);
  const t = useDsTexts().recordPanel;
  const change = (next: number) => {
    latest.current = clampPanelSize(next, min, max);
    if (latest.current !== size) onSizeChange(latest.current);
  };
  /** Commit jen při skutečné změně proti začátku gesta. */
  const commitFrom = (start: number) => {
    if (latest.current !== start) onSizeCommit?.(latest.current);
  };
  const endDrag = () => {
    const current = drag.current;
    drag.current = null;
    if (current) commitFrom(current.size);
  };
  return (
    <div
      role="separator"
      aria-label={t.resize}
      aria-orientation="vertical"
      tabIndex={0}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(size)}
      className="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize touch-none hover:bg-primary/30 focus-visible:bg-primary/30 focus-visible:outline-2 focus-visible:outline-ring"
      onDoubleClick={() => {
        latest.current = size;
        change(defaultSize);
        commitFrom(size);
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { x: event.clientX, size };
        latest.current = size;
      }}
      onPointerMove={(event) => {
        if (drag.current) change(drag.current.size + drag.current.x - event.clientX);
      }}
      onPointerUp={(event) => {
        endDrag();
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={(event) => {
        const base = keyStart.current === null ? size : latest.current;
        const next =
          event.key === "ArrowLeft"
            ? base + 16
            : event.key === "ArrowRight"
              ? base - 16
              : event.key === "Home"
                ? min
                : event.key === "End"
                  ? max
                  : null;
        if (next === null) return;
        event.preventDefault();
        if (keyStart.current === null) {
          keyStart.current = size;
          latest.current = size;
        }
        change(next);
      }}
      onKeyUp={() => {
        const start = keyStart.current;
        keyStart.current = null;
        if (start !== null) commitFrom(start);
      }}
      onBlur={() => {
        const start = keyStart.current;
        keyStart.current = null;
        if (start !== null) commitFrom(start);
      }}
    />
  );
}
