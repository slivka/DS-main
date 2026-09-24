import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import {
  activateTabInState,
  activeTabOf,
  applyMaxLayout,
  closePaneInState,
  closeTabInState,
  duplicateTabInState,
  findRecordTab,
  findTab,
  moveTabInState,
  openTabInState,
  otherTabIds,
  resolveOpenMode,
  resolveTargetPaneIndex,
  setLayoutInState,
  setTabTitleInState,
  stepTabHistory,
  MAX_TABS_PER_PANE,
  type OpenTabTarget,
  type PaneLayoutCount,
  type PaneTabsState,
  type TabKind,
} from "./pane-state";
import { clearTabState, dirtyTabIds, isTabDirty, setTabDirty, useTabDirtyVersion } from "./pane-tab-store";

export type OpenTabOptions = {
  target?: OpenTabTarget;
  kind?: TabKind;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
};

/** Rozhraní záložky dostupné jejímu obsahu (usePane). */
export type PaneApi = {
  paneId: string;
  tabId: string;
  isActive: boolean;
  /** Nahradí obsah této záložky (přidá krok historie). */
  navigate: (route: string, params?: Record<string, unknown>, title?: string) => void;
  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;
  setTitle: (title: string, shortTitle?: string) => void;
  /** Zavře tuto záložku. */
  close: () => void;
};

/** Rozhraní záložek v panelech (usePaneTabs). */
export type PaneTabsApi = {
  state: PaneTabsState;
  openTab: (route: string, params?: Record<string, unknown>, options?: OpenTabOptions) => void;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  moveTab: (tabId: string, toPaneId: string, index?: number) => void;
  activateTab: (tabId: string) => void;
  activatePane: (paneId: string) => void;
  duplicateTab: (tabId: string) => void;
  setLayout: (layout: PaneLayoutCount) => void;
  closePane: (paneId: string) => void;
  back: (tabId: string) => void;
  forward: (tabId: string) => void;
  setTabTitle: (tabId: string, title: string, shortTitle?: string) => void;
  isTabDirty: (tabId: string) => boolean;
  /** Žádost o novou záložku (Alt+T) – typicky otevře CommandPalette. */
  requestNewTab: () => void;
  /** Nejvyšší rozložení podle šířky – hlásí PaneLayout. */
  reportMaxLayout: (maxLayout: PaneLayoutCount) => void;
};

export type PaneTabsTexts = {
  unsavedTitle: string;
  unsavedDescription: string;
  save: string;
  discard: string;
  openInNewTab: string;
  cancel: string;
  closeTitle: string;
  closeDescription: string;
  closeConfirm: string;
  /** {title} a {max} se nahradí. */
  limitEvicted: string;
  /** {max} se nahradí. */
  limitRejected: string;
  narrowed: string;
  restored: string;
  untitled: string;
};

export const DEFAULT_PANE_TABS_TEXTS: PaneTabsTexts = {
  unsavedTitle: "Neuložené změny",
  unsavedDescription: "Záložka obsahuje neuložené změny. Co s nimi?",
  save: "Uložit",
  discard: "Zahodit",
  openInNewTab: "Otevřít v nové záložce",
  cancel: "Zrušit",
  closeTitle: "Zavřít s neuloženými změnami?",
  closeDescription: "Neuložené změny budou ztraceny.",
  closeConfirm: "Zahodit změny",
  limitEvicted: "Záložka „{title}“ byla zavřena – v panelu může být nejvýše {max} záložek.",
  limitRejected: "V panelu je {max} rozepsaných záložek. Nejprve některou uložte nebo zavřete.",
  narrowed: "Málo místa – panely byly sloučeny. Po zvětšení okna se rozdělení obnoví.",
  restored: "Rozdělení panelů obnoveno.",
  untitled: "Bez názvu",
};

export const PaneApiContext = createContext<PaneApi | null>(null);
export const PaneTabsContext = createContext<PaneTabsApi | null>(null);

/** Rozhraní záložky, ve které je komponenta vykreslená; mimo PaneLayout vrací null. */
export function usePane(): PaneApi | null {
  return useContext(PaneApiContext);
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

type PendingReplace = { tabId: string; route: string; params?: Record<string, unknown>; options: OpenTabOptions };

export interface PaneTabsProviderProps {
  state: PaneTabsState;
  onChange: (state: PaneTabsState) => void;
  /** Uloží záložku z dialogu neuložených změn; vrací true při úspěchu. Bez něj se tlačítko Uložit nezobrazí. */
  onSaveTab?: (tabId: string) => boolean | Promise<boolean>;
  /** Alt+T – typicky otevře CommandPalette, jejíž výběr zavolá openTab s target 'newTab'. */
  onNewTabRequest?: () => void;
  /** Klávesové zkratky Alt+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T. Výchozí true. */
  shortcuts?: boolean;
  texts?: Partial<PaneTabsTexts>;
  children: ReactNode;
}

/** Stav a akce záložek v panelech. Obalte jím AppShell i PaneLayout, aby navigace otevírala záložky. */
export function PaneTabsProvider({ state, onChange, onSaveTab, onNewTabRequest, shortcuts = true, texts, children }: PaneTabsProviderProps) {
  const t = { ...DEFAULT_PANE_TABS_TEXTS, ...texts };
  const stateRef = useRef(state);
  stateRef.current = state;
  const { confirm, confirmDialog } = useConfirmDialog();
  const [pending, setPending] = useState<PendingReplace | null>(null);
  const [saving, setSaving] = useState(false);
  useTabDirtyVersion();

  const commit = useCallback(
    (next: PaneTabsState) => {
      stateRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const titleOf = (tabId: string) => findTab(stateRef.current, tabId)?.tab.title ?? t.untitled;

  const doOpen = (route: string, params: Record<string, unknown> | undefined, options: OpenTabOptions) => {
    const current = stateRef.current;
    const mode = resolveOpenMode(current, options.target ?? "replace");
    const replacedId = mode === "replace" ? current.panes[resolveTargetPaneIndex(current, "replace")].activeTab : null;
    const result = openTabInState(current, { route, params, ...options }, isTabDirty);
    if (result.outcome === "rejected") {
      toast.warning(t.limitRejected.replace("{max}", String(MAX_TABS_PER_PANE)));
      return;
    }
    if (result.evictedTabId) {
      toast.info(t.limitEvicted.replace("{title}", titleOf(result.evictedTabId)).replace("{max}", String(MAX_TABS_PER_PANE)));
      clearTabState(result.evictedTabId);
    }
    if (result.outcome === "replaced" && replacedId) clearTabState(replacedId);
    commit(result.state);
  };

  const openTab: PaneTabsApi["openTab"] = (route, params, options = {}) => {
    const current = stateRef.current;
    const target = options.target ?? "replace";
    if (!findRecordTab(current, { route, params, ...options }) && resolveOpenMode(current, target) === "replace") {
      const tabId = current.panes[resolveTargetPaneIndex(current, target)].activeTab!;
      if (isTabDirty(tabId)) {
        setPending({ tabId, route, params, options });
        return;
      }
    }
    doOpen(route, params, options);
  };

  const guardDiscard = (tabIds: string[], action: () => void) => {
    if (!tabIds.some(isTabDirty)) {
      action();
      return;
    }
    confirm({
      title: t.closeTitle,
      description: t.closeDescription,
      confirmLabel: t.closeConfirm,
      cancelLabel: t.cancel,
      destructive: true,
      onConfirm: action,
    });
  };

  const closeTab = (tabId: string) =>
    guardDiscard([tabId], () => {
      commit(closeTabInState(stateRef.current, tabId));
      clearTabState(tabId);
    });

  const closeOtherTabs = (tabId: string) => {
    const ids = otherTabIds(stateRef.current, tabId);
    guardDiscard(ids, () => {
      let next = stateRef.current;
      ids.forEach((id) => {
        next = closeTabInState(next, id);
        clearTabState(id);
      });
      commit(activateTabInState(next, tabId));
    });
  };

  const closePane = (paneId: string) => {
    const current = stateRef.current;
    const pane = current.panes.find((item) => item.id === paneId);
    if (!pane) return;
    if (current.panes.length > 1) {
      commit(closePaneInState(current, paneId));
      return;
    }
    const ids = pane.tabs.map((tab) => tab.id);
    guardDiscard(ids, () => {
      commit(closePaneInState(stateRef.current, paneId));
      ids.forEach(clearTabState);
    });
  };

  const step = (tabId: string, delta: number) =>
    guardDiscard([tabId], () => {
      const next = stepTabHistory(stateRef.current, tabId, delta);
      if (next !== stateRef.current) clearTabState(tabId);
      commit(next);
    });

  const lastMax = useRef<PaneLayoutCount | null>(null);
  const reportMaxLayout = (maxLayout: PaneLayoutCount) => {
    if (lastMax.current === maxLayout) return;
    lastMax.current = maxLayout;
    const { state: next, notice } = applyMaxLayout(stateRef.current, maxLayout);
    if (!notice) return;
    toast.info(notice === "narrowed" ? t.narrowed : t.restored);
    commit(next);
  };

  const api: PaneTabsApi = {
    state,
    openTab,
    closeTab,
    closeOtherTabs,
    moveTab: (tabId, toPaneId, index) => commit(moveTabInState(stateRef.current, tabId, toPaneId, index)),
    activateTab: (tabId) => commit(activateTabInState(stateRef.current, tabId)),
    activatePane: (paneId) => {
      if (stateRef.current.active !== paneId) commit({ ...stateRef.current, active: paneId });
    },
    duplicateTab: (tabId) => commit(duplicateTabInState(stateRef.current, tabId).state),
    setLayout: (layout) => {
      lastMax.current = null;
      commit(setLayoutInState(stateRef.current, layout));
    },
    closePane,
    back: (tabId) => step(tabId, -1),
    forward: (tabId) => step(tabId, 1),
    setTabTitle: (tabId, title, shortTitle) => commit(setTabTitleInState(stateRef.current, tabId, title, shortTitle)),
    isTabDirty,
    requestNewTab: () => onNewTabRequest?.(),
    reportMaxLayout,
  };
  const apiRef = useRef(api);
  apiRef.current = api;

  // Zavření okna prohlížeče s rozepsanými záložkami.
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

  // Zkratky Alt/Option + … (kontrola event.code kvůli Macu a rozložení klávesnice).
  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      const current = stateRef.current;
      const a = apiRef.current;
      const pane = current.panes.find((item) => item.id === current.active) ?? current.panes[0];
      const digit = /^Digit([1-3])$/.exec(event.code);
      if (digit && !event.shiftKey) {
        const target = current.panes[Number(digit[1]) - 1];
        if (!target) return;
        event.preventDefault();
        a.activatePane(target.id);
        return;
      }
      if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && !event.shiftKey) {
        event.preventDefault();
        if (!pane.tabs.length) return;
        const index = pane.tabs.findIndex((tab) => tab.id === pane.activeTab);
        const delta = event.code === "ArrowLeft" ? -1 : 1;
        const next = pane.tabs[(index + delta + pane.tabs.length) % pane.tabs.length];
        a.activateTab(next.id);
        return;
      }
      if (event.code === "KeyW") {
        event.preventDefault();
        if (event.shiftKey) a.closePane(pane.id);
        else if (pane.activeTab) a.closeTab(pane.activeTab);
        return;
      }
      if (event.code === "KeyT" && !event.shiftKey) {
        event.preventDefault();
        a.requestNewTab();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts]);

  const resolvePending = async (choice: "save" | "discard" | "newTab") => {
    if (!pending) return;
    const { tabId, route, params, options } = pending;
    if (choice === "save") {
      if (!onSaveTab) return;
      setSaving(true);
      try {
        if (!(await onSaveTab(tabId))) return;
      } finally {
        setSaving(false);
      }
      setTabDirty(tabId, false);
      clearTabState(tabId);
      doOpen(route, params, options);
    } else if (choice === "discard") {
      clearTabState(tabId);
      doOpen(route, params, options);
    } else {
      doOpen(route, params, { ...options, target: "newTab" });
    }
    setPending(null);
  };

  return (
    <PaneTabsContext.Provider value={api}>
      {children}
      {confirmDialog}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.unsavedTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.unsavedDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between">
            <Button type="button" variant="destructive" onClick={() => resolvePending("discard")}>
              {t.discard}
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setPending(null)}>
                {t.cancel}
              </Button>
              <Button type="button" variant="outline" onClick={() => resolvePending("newTab")}>
                {t.openInNewTab}
              </Button>
              {onSaveTab ? (
                <Button type="button" disabled={saving} onClick={() => resolvePending("save")}>
                  {t.save}
                </Button>
              ) : null}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PaneTabsContext.Provider>
  );
}

/** Aktivní záložka aktivního panelu (pro zvýraznění v navigaci). */
export function useActivePaneTab() {
  const tabs = usePaneTabs();
  return tabs ? activeTabOf(tabs.state) : null;
}
