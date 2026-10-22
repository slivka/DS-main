/**
 * Šířka levého menu rámu aplikace.
 * Vlastní: uloženou šířku (`app:menu-width`, rem), tažení a šipky na oddělovači, maximum podle
 * šířky panelů (`data-required-width`) a jeho přepočet při změně velikosti.
 * Nesmí: vykreslovat – vrací jen hodnoty a obsluhy pro AppShellSidebar.
 */
import {
  useLayoutEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import { isResizeLocked, RESIZE_END_EVENT, startPointerDrag } from "../../../lib/resize-lock";

/** Maximum šířky menu v rem: nesmí vzít místo panelům (`data-required-width`); rozsah 12,5–26,25 rem. */
export function resolveMenuMaximum(
  bodyWidthPx: number,
  requiredPaneWidthPx: number | undefined,
  rootPx: number,
) {
  if (!requiredPaneWidthPx) return 26.25;
  return Math.max(12.5, Math.min(26.25, (bodyWidthPx - requiredPaneWidthPx - 4) / (rootPx || 16)));
}

/** Šířka menu k vykreslení – uloženou hodnotu jen omezí, nikdy ji nepřepisuje. */
export function resolveMenuWidth(stored: number, maximum: number) {
  return Math.min(maximum, Math.max(12.5, stored));
}

/** Šířka v rem pro přístupný popis oddělovače (česky s desetinnou čárkou). */
export const formatMenuRem = (value: number) =>
  value.toLocaleString("cs-CZ", { maximumFractionDigits: 2 });

/** Vstup hooku šířky menu. */
export interface MenuWidthOptions {
  /** Tělo rámu, ve kterém se hledá rozložení panelů. */
  bodyRef: RefObject<HTMLDivElement | null>;
  /** Sbalené menu nemá šířku ani maximum. */
  collapsed: boolean;
  /** Obsah má rozložení panelů – změna přepočítá maximum. */
  hasPaneLayout: boolean;
  /** Zoom aplikace – tažení převádí px na rem. */
  zoom: number;
}

/** Šířka menu, maximum, stav tažení a obsluhy oddělovače. */
export function useAppShellMenuWidth({
  bodyRef,
  collapsed,
  hasPaneLayout,
  zoom,
}: MenuWidthOptions) {
  const [storedMenuWidth, setStoredMenuWidth] = useState(() => {
    try {
      return Number(localStorage.getItem("app:menu-width")) || 15;
    } catch {
      return 15;
    }
  });
  const [draftMenuWidth, setDraftMenuWidth] = useState<number | null>(null);
  const [menuMaximum, setMenuMaximum] = useState(26.25);
  const [menuDragging, setMenuDragging] = useState(false);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || collapsed) {
      setMenuMaximum(26.25);
      return;
    }
    const update = () => {
      if (isResizeLocked()) return;
      const required = Number(
        body.querySelector<HTMLElement>('[data-slot="pane-layout"]')?.dataset["requiredWidth"],
      );
      if (!required) {
        setMenuMaximum(26.25);
        return;
      }
      const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setMenuMaximum(resolveMenuMaximum(body.getBoundingClientRect().width, required, rootPx));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    window.addEventListener(RESIZE_END_EVENT, update);
    return () => {
      observer.disconnect();
      window.removeEventListener(RESIZE_END_EVENT, update);
    };
  }, [bodyRef, collapsed, hasPaneLayout, zoom]);

  const menuWidth = resolveMenuWidth(draftMenuWidth ?? storedMenuWidth, menuMaximum);
  const saveMenuWidth = (width: number) => {
    setStoredMenuWidth(width);
    try {
      localStorage.setItem("app:menu-width", String(width));
    } catch {
      /* úložiště nemusí být dostupné */
    }
  };
  const onDividerPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = menuWidth;
    let finalWidth = startWidth;
    setMenuDragging(true);
    startPointerDrag(event, {
      onMove: (moveEvent) => {
        finalWidth = Math.min(
          menuMaximum,
          Math.max(12.5, startWidth + (moveEvent.clientX - startX) / 16 / zoom),
        );
        setDraftMenuWidth(finalWidth);
      },
      onEnd: () => {
        setDraftMenuWidth(null);
        setMenuDragging(false);
        saveMenuWidth(finalWidth);
      },
    });
  };
  const onDividerKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    saveMenuWidth(
      Math.min(menuMaximum, Math.max(12.5, menuWidth + (event.key === "ArrowRight" ? 0.5 : -0.5))),
    );
  };
  return {
    menuWidth,
    menuMaximum,
    menuDragging,
    onDividerPointerDown,
    onDividerKeyDown,
    resetMenuWidth: () => saveMenuWidth(15),
  };
}
