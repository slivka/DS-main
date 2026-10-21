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
/** Myš, dotyk a klávesnice používají stejné meze. */
export function PanelResize({ size, defaultSize, min, max, onSizeChange, onSizeCommit }: PanelResizeProps) {
  const drag = useRef<{ x: number; size: number } | null>(null);
  const latest = useRef(size);
  const t = useDsTexts().recordPanel;
  const change = (next: number) => {
    latest.current = clampPanelSize(next, min, max);
    onSizeChange(latest.current);
  };
  const finish = (next: number) => {
    change(next);
    onSizeCommit?.(latest.current);
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
      onDoubleClick={() => finish(defaultSize)}
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
        if (drag.current) onSizeCommit?.(latest.current);
        drag.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        const next =
          event.key === "ArrowLeft"
            ? size + 16
            : event.key === "ArrowRight"
              ? size - 16
              : event.key === "Home"
                ? min
                : event.key === "End"
                  ? max
                  : null;
        if (next !== null) {
          event.preventDefault();
          finish(next);
        }
      }}
    />
  );
}
