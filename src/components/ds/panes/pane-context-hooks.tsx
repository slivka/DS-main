/**
 * Kontexty a základní hooky panelových záložek.
 * Vlastní: zpřístupnění panelu, lišty, posuvu a příznaku změn.
 * Nesmí: řídit přechody stavu panelů.
 */
import { createContext, useContext, useEffect } from "react";
import { setTabDirty } from "./pane-tab-store";
import type { PaneApi, PaneTabsApi } from "./pane-context-types";

export const PaneApiContext = createContext<PaneApi | null>(null);
export const PaneTabsContext = createContext<PaneTabsApi | null>(null);
export const PaneScrollContext = createContext<HTMLElement | null>(null);

/** Rozhraní záložky, ve které je komponenta vykresjená; mimo PaneLayout vrací null. */
export function usePane(): PaneApi | null {
  return useContext(PaneApiContext);
}

/** Rolovací oblast aktuální záložky pro výjimečné přesuny a měření. */
export function usePaneScrollElement(): HTMLElement | null {
  return useContext(PaneScrollContext);
}

/** Rozhraní záložek v panelech; mimo PaneTabsProvider vrací null. */
export function usePaneTabs(): PaneTabsApi | null {
  return useContext(PaneTabsContext);
}

/** True, pokud je komponenta v aktivním panelu; mimo PaneLayout vždy true. */
export function useIsActivePane(): boolean {
  const pane = useContext(PaneApiContext);
  return pane ? pane.isActive : true;
}

/**
 * Ohlásí neuložené změny záložky (nahrazuje usePaneDirty).
 * Zavření i nahrazení záložky pak vyžádá potvrzení, zavření okna prohlížeče varuje.
 * Příznak se při odpojení záložky na pozadí nemaže – smaže se až se zavřením záložky.
 */
export function useTabDirty(isDirty: boolean, key = "default") {
  const pane = usePane();
  const tabId = pane?.tabId;

  useEffect(() => {
    if (tabId) setTabDirty(tabId, isDirty, key);
  }, [tabId, isDirty, key]);

  useEffect(() => {
    if (tabId || !isDirty || typeof window === "undefined") return;
    // Mimo panely hlídá alespoň zavření okna.
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [tabId, isDirty]);
}

