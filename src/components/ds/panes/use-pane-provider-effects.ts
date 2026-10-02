/**
 * Vedlejší efekty poskytovatele panelových záložek.
 * Vlastní: ochranu zavření okna a globální klávesové zkratky panelů.
 * Nesmí: měnit stav záložek přímo ani vykreslovat uživatelské rozhraní.
 */
import { useEffect, type MutableRefObject } from "react";

import { findTab, type PaneLayoutCount, type PaneTabsState } from "./pane-state";
import { dirtyTabIds } from "./pane-tab-store";
import type { PaneTabsApi } from "./pane-context-types";

/** Parametry efektů poskytovatele panelů. */
export interface PaneProviderEffectsArgs {
  /** Aktuální řízený stav panelů. */
  state: PaneTabsState;
  /** Reference na nejnovější stav pro globální posluchače. */
  stateRef: MutableRefObject<PaneTabsState>;
  /** Reference na nejnovější veřejné rozhraní. */
  apiRef: MutableRefObject<PaneTabsApi>;
  /** Zapnutí globálních zkratek. */
  shortcuts: boolean;
  /** Index maximalizovaného panelu. */
  maximized: number | null;
  /** Obnova původního rozložení. */
  restoreMaximized: () => void;
}

/** Zapojí ochranu rozepsaných záložek a klávesové zkratky. */
export function usePaneProviderEffects({
  state,
  stateRef,
  apiRef,
  shortcuts,
  maximized,
  restoreMaximized,
}: PaneProviderEffectsArgs) {
  const hasDirty = dirtyTabIds().some((id) => findTab(state, id));
  useEffect(() => {
    if (!hasDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasDirty]);

  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.repeat && !event.code.startsWith("Arrow")) return;
      const current = stateRef.current;
      const api = apiRef.current;
      const pane = current.panes.find((item) => item.id === current.active) ?? current.panes[0];
      const digit = /^Digit([1-3])$/.exec(event.code);
      if (digit && !event.shiftKey) {
        const index = Number(digit[1]) - 1;
        const target = current.panes[index];
        if (!target) return;
        event.preventDefault();
        if (api.maximized !== null) api.maximizePane(index);
        else api.activatePane(target.id);
        return;
      }
      if (event.code === "KeyM" && !event.shiftKey) {
        event.preventDefault();
        api.toggleMaximize(Math.max(0, current.panes.indexOf(pane)));
        return;
      }
      if (event.code === "KeyT" && event.shiftKey) {
        event.preventDefault();
        api.reopenClosedTab();
        return;
      }
      if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && !event.shiftKey) {
        event.preventDefault();
        if (!pane.activeTab) return;
        if (event.code === "ArrowLeft") api.back(pane.activeTab);
        else api.forward(pane.activeTab);
        return;
      }
      if ((event.code === "ArrowUp" || event.code === "ArrowDown") && !event.shiftKey) {
        if (!pane.activeTab) return;
        const nav = api.getRecordNav(pane.activeTab);
        if (!nav) return;
        event.preventDefault();
        if (event.code === "ArrowUp") nav.prev();
        else nav.next();
        return;
      }
      if (event.code === "KeyW") {
        event.preventDefault();
        if (event.shiftKey) api.closePane(pane.id);
        else if (pane.activeTab) api.closeTab(pane.activeTab);
        return;
      }
      if (event.code === "KeyT" && !event.shiftKey) {
        event.preventDefault();
        api.requestNewTab();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apiRef, shortcuts, stateRef]);

  useEffect(() => {
    if (!shortcuts || maximized === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"]',
        )
      )
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="grid"], [data-own-escape]',
        )
      )
        return;
      event.preventDefault();
      restoreMaximized();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized, restoreMaximized, shortcuts]);
}

/** Typ rozložení používaný pouze pro kontrolu veřejné závislosti tohoto modulu. */
export type PaneProviderLayoutCount = PaneLayoutCount;