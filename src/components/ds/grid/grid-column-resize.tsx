import { useRef } from "react";

/**
 * Úchyt na pravém okraji záhlaví sloupce – tažením myší mění šířku sloupce,
 * dvojklik šířku vrátí na automatickou. Používá se ve sdíleném gridu.
 */
export function ColumnResizeHandle({
  onResize,
  onReset,
}: {
  /** Nová šířka v px (průběžně během tažení). */
  onResize: (width: number) => void;
  /** Zrušení ruční šířky (dvojklik). */
  onReset?: () => void;
}) {
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
      onResize(Math.max(60, Math.round(startWidth + ev.clientX - startX)));
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  return (
    <span
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label="Změnit šířku sloupce"
      title="Ťahaním zmeníte šírku, dvojklik vráti automatickú"
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
