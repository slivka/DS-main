export const RESIZE_END_EVENT = "app:resize-end";

let locks = 0;

export function isResizeLocked() {
  return typeof document !== "undefined" && document.documentElement.dataset["resizing"] === "true";
}

export function beginResize() {
  locks += 1;
  if (typeof document !== "undefined") document.documentElement.dataset["resizing"] = "true";
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    locks = Math.max(0, locks - 1);
    if (locks > 0 || typeof document === "undefined") return;
    delete document.documentElement.dataset["resizing"];
    window.dispatchEvent(new CustomEvent(RESIZE_END_EVENT));
  };
}
/**
 * Tažení úchytu se zámkem přepočtů. Zachytí ukazatel na úchytu a tažení ukončí
 * na pointerup, pointercancel, lostpointercapture i při ztrátě fokusu okna – zámek se tak
 * nikdy nezasekne. `onEnd` i uvolnění zámku proběhnou právě jednou.
 */
export function startPointerDrag(
  event: { pointerId: number; currentTarget: EventTarget | null },
  handlers: { onMove: (event: PointerEvent) => void; onEnd?: () => void },
) {
  const release = beginResize();
  const target = event.currentTarget instanceof Element ? event.currentTarget : null;
  try { target?.setPointerCapture?.(event.pointerId); } catch { /* ukazatel už nemusí existovat */ }
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    window.removeEventListener("pointermove", handlers.onMove);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    window.removeEventListener("blur", end);
    target?.removeEventListener("lostpointercapture", end);
    try { if (target?.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch { /* noop */ }
    handlers.onEnd?.();
    release();
  };
  window.addEventListener("pointermove", handlers.onMove);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  window.addEventListener("blur", end);
  target?.addEventListener("lostpointercapture", end);
  return end;
}
