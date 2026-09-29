import { useRef } from "react";
import { useResolvedGridTexts, type GridTexts } from "./grid-texts";
import { startPointerDrag } from "../../../lib/resize-lock";

/**
 * Úchyt na pravém okraji záhlaví sloupce – tažením myší mění šířku sloupce,
 * dvojklik šířku vrátí na automatickou. Používá se ve sdíjeném gridu.
 */
export function ColumnResizeHandle({
  onResize,
  onReset,
  scale = 1,
  texts: textOverrides,
}: {
  /** Nová šířka v px (průběžně během tažení). */
  onResize: (width: number) => void;
  /** Zrušení ruční šířky (dvojklik). */
  onReset?: () => void;
  /** Poměr vykreslené šířky k veřejné jednotce px při 100 %. */
  scale?: number;
  texts?: Partial<GridTexts>;
}) {
  const texts = useResolvedGridTexts(textOverrides);
  const ref = useRef<HTMLSpanElement>(null);

  const start = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const head = ref.current?.closest("th") as HTMLElement | null;
    if (!head) return;
    const startX = e.clientX;
    const startWidth = head.getBoundingClientRect().width;
    const move = (ev: PointerEvent) => {
      onResize(Math.max(60, Math.round((startWidth + ev.clientX - startX) / Math.max(scale, 0.01))));
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    startPointerDrag(e, {
      onMove: move,
      onEnd: () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      },
    });
  };

  return (
    <span
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={texts.resizeColumn}
      title={texts.resizeColumnHint}
      onPointerDown={start}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onReset?.();
      }}
      // tažení za úchyt nesmí spustit přesun sloupce (HTML5 drag na <th>)
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute inset-y-0 right-0 z-20 w-[6px] cursor-col-resize touch-none select-none hover:bg-primary/40"
    />
  );
}
