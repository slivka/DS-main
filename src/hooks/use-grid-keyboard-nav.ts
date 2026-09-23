import { useCallback, useEffect } from "react";

import { useIsActivePane } from "../components/ds/panes/pane-context";

/**
 * Klávesové ovládání gridu: šipky nahoru/dolů, Home/End a PageUp/PageDown
 * přesouvají fokus mezi řádky označenými `data-grid-row`.
 * Esc fokus opustí (a zavře případnou inline editaci).
 *
 * Řádky si držíme jako `tabIndex={-1}`, takže nezasahují do běžného tabování.
 */
export function useGridKeyboardNav(ref: React.RefObject<HTMLElement | null>) {
  const paneActive = useIsActivePane();
  const rows = useCallback(() => {
    const el = ref.current;
    if (!el) return [] as HTMLElement[];
    return Array.from(el.querySelectorAll<HTMLElement>("[data-grid-row]"));
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prepare = () => {
      for (const r of rows()) if (!r.hasAttribute("tabindex")) r.tabIndex = -1;
    };
    prepare();
    const observer = new MutationObserver(prepare);
    observer.observe(el, { childList: true, subtree: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!paneActive) return;
      const key = event.key;
      if (
        key !== "ArrowDown" &&
        key !== "ArrowUp" &&
        key !== "Home" &&
        key !== "End" &&
        key !== "PageDown" &&
        key !== "PageUp" &&
        key !== "Escape"
      )
        return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const editing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable === true;

      if (key === "Escape") {
        if (editing) return; // Esc si řeší samotná editace
        (document.activeElement as HTMLElement | null)?.blur?.();
        return;
      }
      if (editing) return;

      const list = rows();
      if (!list.length) return;
      const current = list.findIndex((r) => r.contains(target));
      let next = current;
      const step = 10;
      if (key === "ArrowDown") next = current < 0 ? 0 : Math.min(list.length - 1, current + 1);
      else if (key === "ArrowUp") next = current < 0 ? 0 : Math.max(0, current - 1);
      else if (key === "PageDown")
        next = current < 0 ? 0 : Math.min(list.length - 1, current + step);
      else if (key === "PageUp") next = current < 0 ? 0 : Math.max(0, current - step);
      else if (key === "Home") next = 0;
      else if (key === "End") next = list.length - 1;

      const row = list[next];
      if (!row) return;
      event.preventDefault();
      row.focus();
      row.scrollIntoView({ block: "nearest" });
    };

    el.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, rows]);
}
