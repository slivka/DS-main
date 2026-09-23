import { createContext, useContext, useEffect, useId } from "react";

import type { PaneLayoutCount, PaneTarget } from "./pane-state";

/** Rozhraní jednoho panelu dostupné jeho obsahu. */
export type PaneApi = {
  paneId: string;
  isActive: boolean;
  navigate: (route: string, params?: Record<string, unknown>, title?: string) => void;
  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;
  setTitle: (title: string) => void;
  close: () => void;
};

/** Rozhraní rámu pro otevírání obsahu v panelech. */
export type PaneManagerApi = {
  activePaneId: string;
  layout: PaneLayoutCount;
  setLayout: (layout: PaneLayoutCount) => void;
  setActivePane: (paneId: string) => void;
  openInPane: (
    route: string,
    params?: Record<string, unknown>,
    options?: { target?: PaneTarget; title?: string; uniqueKey?: boolean },
  ) => void;
  closePane: (paneId: string) => void;
  /** Vrátí true, pokud žádný panel nemá neuložené změny (jinak zobrazí potvrzení). */
  confirmAllPanesClean: (onConfirmed: () => void) => void;
  registerDirty: (paneId: string, key: string, dirty: boolean) => void;
};

export const PaneApiContext = createContext<PaneApi | null>(null);
export const PaneManagerContext = createContext<PaneManagerApi | null>(null);

/** Rozhraní panelu, ve kterém je komponenta vykreslená; mimo PaneLayout vrací null. */
export function usePane(): PaneApi | null {
  return useContext(PaneApiContext);
}

/** Rozhraní rámu panelů; mimo PaneLayout vrací null. */
export function usePaneManager(): PaneManagerApi | null {
  return useContext(PaneManagerContext);
}

/** True, pokud je komponenta v aktivním panelu; mimo PaneLayout vždy true. */
export function useIsActivePane(): boolean {
  const pane = useContext(PaneApiContext);
  return pane ? pane.isActive : true;
}

/** Ohlásí neuložené změny panelu – zavření i navigace pak vyžádají potvrzení. */
export function usePaneDirty(isDirty: boolean) {
  const pane = usePane();
  const manager = usePaneManager();
  const key = useId();

  useEffect(() => {
    if (!pane || !manager) return;
    manager.registerDirty(pane.paneId, key, isDirty);
    return () => manager.registerDirty(pane.paneId, key, false);
  }, [pane?.paneId, manager, key, isDirty]);

  useEffect(() => {
    if (!isDirty || typeof window === "undefined") return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}
