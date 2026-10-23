/** Bublina s akcí · vlastní odložené zavření po odjetí · nesmí řídit obsah ani fokus. */
import { useEffect, useRef, useState } from "react";

/** Najetí otevírá dočasně; klik ponechá původní ovládání bubliny. */
export function useHoverPopover() {
  const [open, setOpen] = useState(false);
  const hovered = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelClose = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    open,
    hovered,
    onOpenChange: (next: boolean) => {
      cancelClose();
      if (!next) hovered.current = false;
      setOpen(next);
    },
    onMouseEnter: () => {
      cancelClose();
      if (!open) {
        hovered.current = true;
        setOpen(true);
      }
    },
    onMouseLeave: () => {
      cancelClose();
      if (hovered.current)
        timer.current = setTimeout(() => {
          hovered.current = false;
          setOpen(false);
        }, 250);
    },
    onClick: () => {
      cancelClose();
      hovered.current = false;
    },
  };
}
