/** Fokus panelu · vlastní přesun a návrat · nesmí zavřít vnořený portál. */
import { useEffect, type KeyboardEvent, type RefObject } from "react";
import { trapTab } from "../focus-boundary";
/** Místní panel používá stejnou hranici DOM jako dialog v panelu. */
export function useRecordPanelFocus(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  modal: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [open, ref]);
  return (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      !(event.target instanceof Node) ||
      !event.currentTarget.contains(event.target)
    )
      return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key !== "Tab" || !modal) return;
    trapTab(event);
  };
}
