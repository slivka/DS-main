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
  applyLayoutInState,
  keepTabInState,
  openFromHistoryInState,
  openRecordInState,
  paneKey,
  pushClosedTab,
  releaseTabInState,
  reopenClosedTabInState,
  replaceTabContentInState,
  serializeLayout,
  type ClosedTabRecord,
  type LayoutSnapshot,
  type OpenRecordModifiers,
  type PaneTab,
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
import { clearTabState, dirtyTabIds, getTabDraft, isTabDirty, registerLiveTabs, setTabDirty, setTabDraft, useTabDirtyVersion } from "./pane-tab-store";

export type OpenTabOptions = {
  target?: OpenTabTarget;
  kind?: TabKind;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
  /** Záložka, ze které se otevírá (pro návrat po zavření). */
  openerTabId?: string | null;
};

export type OpenRecordOptions = {
  /** Záložka seznamu, ze které se záznam otevírá (typicky usePane().tabId). */
  fromTabId?: string | null;
  /** Nový záznam – otevře se jako ponechaná záložka. */
  isNew?: boolean;
  /** Modifikátory kliknutí: mod = Cmd/Ctrl, shift = Shift. Lze předat přímo událost myši. */
  modifiers?: OpenRecordModifiers | { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean };
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
};

/** Položka pořadí záznamů pro listování ↑ ↓ (registerRecordNav). */
export type RecordNavItem = { route: string; params?: Record<string, unknown>; recordKey?: string; title?: string; shortTitle?: string; icon?: string };

export type RecordNav = { index: number; total: number; prev: () => void; next: () => void };

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
  /** Podíly šířek viditelných panelů. */
  setWidths: (widths: number[]) => void;
  isTabDirty: (tabId: string) => boolean;
  /** Žádost o novou záložku (Alt+T) – typicky otevře CommandPalette. */
  requestNewTab: () => void;
  /** Nejvyšší rozložení podle šířky – hlásí PaneLayout. */
  reportMaxLayout: (maxLayout: PaneLayoutCount) => void;
  /** Otevření záznamu ze seznamu podle pravidel a–f. */
  openRecord: (route: string, params?: Record<string, unknown>, options?: OpenRecordOptions) => void;
  /** Ponechá záložku (z dočasné udělá trvalou). */
  keepTab: (tabId: string) => void;
  /** Uvolní záložku na dočasnou; s neuloženými změnami odmítne a vrátí false. */
  releaseTab: (tabId: string) => boolean;
  /** Otevře krok historie jako novou ponechanou záložku. */
  openFromHistory: (tabId: string, index: number) => void;
  /** Přejde na krok historie v téže záložce. */
  goToHistory: (tabId: string, index: number) => void;
  /** Znovu otevře naposledy zavřenou záložku (zásobník posledních 10). */
  reopenClosedTab: () => void;
  closedTabCount: number;
  /** Index maximalizovaného panelu, nebo null. Neukládá se. */
  maximized: number | null;
  maximizePane: (index: number) => void;
  restoreLayout: () => void;
  toggleMaximize: (index: number) => void;
  /** Panel, který právě bliká (otevření záznamu v jiném panelu). */
  flashPaneId: string | null;
  /** Aplikace dodá pořadí záznamů pro listování ↑ ↓ v detailech otevřených ze záložky `tabId`. Vrací odregistraci. */
  registerRecordNav: (tabId: string, getOrderedItems: () => RecordNavItem[]) => () => void;
  getRecordNav: (tabId: string) => RecordNav | null;
  /** Snímek aktuálního rozložení (bez konceptů a nových záznamů). */
  serializeLayout: () => LayoutSnapshot;
  /** Použije uložené rozložení; vrací záložky s neuloženými změnami, které zůstaly. */
  applyLayout: (snapshot: LayoutSnapshot, options?: { keepDirty?: boolean }) => PaneTab[];
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
  releaseDirty: string;
  recordNavDirty: string;
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
  releaseDirty: "Záložku s neuloženými změnami nejde uvolnit",
  recordNavDirty: "Nejprve uložte nebo zahoďte neuložené změny",
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
  const tabs = usePaneTabs();
  const tabId = pane?.tabId;
  const keepRef = useRef(tabs?.keepTab);
  keepRef.current = tabs?.keepTab;

  useEffect(() => {
    if (tabId) setTabDirty(tabId, isDirty, key);
    // První neuložená změna záložku automaticky ponechá.
    if (tabId && isDirty) keepRef.current?.(tabId);
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
  const [maximized, setMaximized] = useState<number | null>(null);
  const [flashPaneId, setFlashPaneId] = useState<string | null>(null);
  const [closedStack, setClosedStack] = useState<ClosedTabRecord[]>([]);
  const closedRef = useRef(closedStack);
  closedRef.current = closedStack;
  const recordNavs = useRef(new Map<string, () => RecordNavItem[]>());
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useTabDirtyVersion();

  useEffect(() => {
    registerLiveTabs(state.panes.flatMap((pane) => pane.tabs.map((tab) => tab.id)));
  }, [state]);
  useEffect(() => {
    if (maximized !== null && maximized >= state.panes.length) setMaximized(null);
  }, [maximized, state.panes.length]);

  const flash = (paneId: string) => {
    clearTimeout(flashTimer.current);
    setFlashPaneId(paneId);
    flashTimer.current = setTimeout(() => setFlashPaneId(null), 700);
  };

  const rememberClosed = (tabIds: string[], from: PaneTabsState) => {
    let stack = closedRef.current;
    tabIds.forEach((id) => {
      const found = findTab(from, id);
      if (found) stack = pushClosedTab(stack, { tab: found.tab, paneId: found.pane.id, index: found.tabIndex });
    });
    closedRef.current = stack;
    setClosedStack(stack);
  };

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
    if (result.outcome === "replaced" && (result.tabId ?? replacedId)) clearTabState((result.tabId ?? replacedId)!);
    result.closedTabIds?.forEach(clearTabState);
    if (options.target === "adjacentPane") setMaximized(null);
    commit(result.state);
  };

  const openTab: PaneTabsApi["openTab"] = (route, params, options = {}) => {
    const current = stateRef.current;
    const target = options.target ?? "replace";
    if (target === "replace" && !findRecordTab(current, { route, params, ...options }) && resolveOpenMode(current, target) === "replace") {
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
      rememberClosed([tabId], stateRef.current);
      commit(closeTabInState(stateRef.current, tabId));
      clearTabState(tabId);
    });

  const closeOtherTabs = (tabId: string) => {
    const ids = otherTabIds(stateRef.current, tabId);
    guardDiscard(ids, () => {
      let next = stateRef.current;
      rememberClosed(ids, next);
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
    setMaximized(null);
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

  const keepTab = (tabId: string) => {
    const next = keepTabInState(stateRef.current, tabId);
    if (next !== stateRef.current) commit(next);
  };

  const releaseTab = (tabId: string) => {
    const result = releaseTabInState(stateRef.current, tabId, isTabDirty);
    if (!result) {
      if (isTabDirty(tabId)) toast.warning(t.releaseDirty);
      return false;
    }
    result.closedTabIds.forEach(clearTabState);
    commit(result.state);
    return true;
  };

  const openRecord: PaneTabsApi["openRecord"] = (route, params, options = {}) => {
    const current = stateRef.current;
    const raw = (options.modifiers ?? {}) as Record<string, boolean | undefined>;
    const modifiers: OpenRecordModifiers = { mod: !!(raw.mod || raw.metaKey || raw.ctrlKey), shift: !!raw.shift || !!raw.shiftKey };
    const fromPane = options.fromTabId ? findTab(current, options.fromTabId)?.pane.id : current.active;
    const result = openRecordInState(
      current,
      { route, params, recordKey: options.recordKey, title: options.title, shortTitle: options.shortTitle, icon: options.icon, kind: "record" },
      { fromTabId: options.fromTabId, isNew: options.isNew, modifiers, maximized },
      isTabDirty,
    );
    if (result.outcome === "rejected") {
      toast.warning(t.limitRejected.replace("{max}", String(MAX_TABS_PER_PANE)));
      return;
    }
    if (result.evictedTabId) {
      toast.info(t.limitEvicted.replace("{title}", titleOf(result.evictedTabId)).replace("{max}", String(MAX_TABS_PER_PANE)));
      clearTabState(result.evictedTabId);
    }
    if (result.outcome === "replaced" && result.tabId) clearTabState(result.tabId);
    result.closedTabIds?.forEach(clearTabState);
    if (result.cancelMaximize) setMaximized(null);
    commit(result.state);
    if (result.paneId && result.paneId !== fromPane) {
      flash(result.paneId);
      if (maximized !== null) {
        const index = result.state.panes.findIndex((pane) => pane.id === result.paneId);
        if (index >= 0 && index !== maximized) setMaximized(index);
      }
    }
  };

  const openFromHistory = (tabId: string, index: number) => {
    const result = openFromHistoryInState(stateRef.current, tabId, index, isTabDirty);
    if (result.outcome === "rejected") return;
    if (result.evictedTabId) clearTabState(result.evictedTabId);
    result.closedTabIds?.forEach(clearTabState);
    commit(result.state);
  };

  const reopenClosedTab = () => {
    const stack = closedRef.current;
    const record = stack[stack.length - 1];
    if (!record) return;
    const result = reopenClosedTabInState(stateRef.current, record, isTabDirty);
    if (result.outcome === "rejected") {
      toast.warning(t.limitRejected.replace("{max}", String(MAX_TABS_PER_PANE)));
      return;
    }
    closedRef.current = stack.slice(0, -1);
    setClosedStack(closedRef.current);
    if (result.evictedTabId) clearTabState(result.evictedTabId);
    commit(result.state);
  };

  const getRecordNav = (tabId: string): RecordNav | null => {
    const found = findTab(stateRef.current, tabId);
    if (!found || found.tab.kind !== "record") return null;
    const source = recordNavs.current.get(found.tab.openerTabId ?? "") ?? recordNavs.current.get(tabId);
    if (!source) return null;
    const items = source();
    const keyOf = (item: { route: string; params?: Record<string, unknown>; recordKey?: string }) => item.recordKey ?? paneKey(item);
    const index = items.findIndex((item) => keyOf(item) === keyOf(found.tab));
    if (index < 0) return null;
    const go = (delta: number) => {
      const item = items[index + delta];
      if (!item) return;
      if (isTabDirty(tabId)) {
        toast.warning(t.recordNavDirty);
        return;
      }
      const other = findRecordTab(stateRef.current, { ...item, kind: "record" });
      if (other) {
        commit(activateTabInState(stateRef.current, other.id));
        return;
      }
      clearTabState(tabId);
      commit(replaceTabContentInState(stateRef.current, tabId, { ...item, kind: "record" }));
    };
    return { index, total: items.length, prev: () => go(-1), next: () => go(1) };
  };

  const api: PaneTabsApi = {
    state,
    openRecord,
    keepTab,
    releaseTab,
    openFromHistory,
    goToHistory: (tabId, index) => {
      const found = findTab(stateRef.current, tabId);
      if (found) step(tabId, index - found.tab.historyIndex);
    },
    reopenClosedTab,
    closedTabCount: closedStack.length,
    maximized,
    maximizePane: (index) => {
      if (stateRef.current.panes.length > 1 && stateRef.current.panes[index]) {
        setMaximized(index);
        commit({ ...stateRef.current, active: stateRef.current.panes[index].id });
      }
    },
    restoreLayout: () => setMaximized(null),
    toggleMaximize: (index) => {
      if (maximized !== null) setMaximized(null);
      else apiRef.current.maximizePane(index);
    },
    flashPaneId,
    registerRecordNav: (tabId, getItems) => {
      recordNavs.current.set(tabId, getItems);
      return () => {
        if (recordNavs.current.get(tabId) === getItems) recordNavs.current.delete(tabId);
      };
    },
    getRecordNav,
    serializeLayout: () => serializeLayout(stateRef.current, (tabId) => getTabDraft(tabId, "grid")),
    applyLayout: (snapshot, options) => {
      const result = applyLayoutInState(stateRef.current, snapshot, options, isTabDirty);
      result.closedTabIds.forEach(clearTabState);
      result.gridStates.forEach(({ tabId, grid }) => setTabDraft(tabId, grid, "grid"));
      setMaximized(null);
      lastMax.current = null;
      commit(result.state);
      return result.skipped;
    },
    openTab,
    closeTab,
    closeOtherTabs,
    // Přesun záložku automaticky ponechá (moveTabInState nastaví pinned = true).
    moveTab: (tabId, toPaneId, index) => commit(moveTabInState(stateRef.current, tabId, toPaneId, index)),
    activateTab: (tabId) => commit(activateTabInState(stateRef.current, tabId)),
    activatePane: (paneId) => {
      if (stateRef.current.active !== paneId) commit({ ...stateRef.current, active: paneId });
    },
    duplicateTab: (tabId) => commit(duplicateTabInState(stateRef.current, tabId).state),
    setLayout: (layout) => {
      lastMax.current = null;
      setMaximized(null);
      commit(setLayoutInState(stateRef.current, layout));
    },
    closePane,
    back: (tabId) => step(tabId, -1),
    forward: (tabId) => step(tabId, 1),
    setTabTitle: (tabId, title, shortTitle) => commit(setTabTitleInState(stateRef.current, tabId, title, shortTitle)),
    setWidths: (widths) => commit({ ...stateRef.current, widths }),
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
        const index = Number(digit[1]) - 1;
        const target = current.panes[index];
        if (!target) return;
        event.preventDefault();
        if (a.maximized !== null) a.maximizePane(index);
        else a.activatePane(target.id);
        return;
      }
      if (event.code === "KeyM" && !event.shiftKey) {
        event.preventDefault();
        a.toggleMaximize(Math.max(0, current.panes.indexOf(pane)));
        return;
      }
      if (event.code === "KeyT" && event.shiftKey) {
        event.preventDefault();
        a.reopenClosedTab();
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

  // Esc obnoví rozložení – jen při maximalizaci, bez otevřeného dialogu a mimo editory s vlastním Esc.
  useEffect(() => {
    if (!shortcuts || maximized === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"]')) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="combobox"], [role="grid"], [data-own-escape]')) return;
      event.preventDefault();
      setMaximized(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts, maximized]);

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

// ---------------------------------------------------------------------------
// Záhlaví stránky v panelu

export type PaneChromeTexts = {
  back: string;
  forward: string;
  history: string;
  openAsKept: string;
  keep: string;
  release: string;
  unsaved: string;
  prevRecord: string;
  nextRecord: string;
  maximize: string;
  restore: string;
  more: string;
  closeTab: string;
  closeOthers: string;
  /** {index} se nahradí číslem panelu. */
  moveToPane: string;
  duplicate: string;
  reopenClosed: string;
  closePane: string;
  pinPage: string;
  unpinPage: string;
  untitled: string;
};

export const DEFAULT_PANE_CHROME_TEXTS: PaneChromeTexts = {
  back: "Zpět",
  forward: "Vpřed",
  history: "Historie záložky",
  openAsKept: "Otevřít jako ponechanou záložku",
  keep: "Ponechat záložku",
  release: "Uvolnit záložku",
  unsaved: "Neuložené změny",
  prevRecord: "Předchozí záznam",
  nextRecord: "Další záznam",
  maximize: "Maximalizovat panel (Alt+M)",
  restore: "Obnovit rozložení (Esc)",
  more: "Další akce záložky",
  closeTab: "Zavřít záložku",
  closeOthers: "Zavřít ostatní",
  moveToPane: "Přesunout do panelu {index}",
  duplicate: "Duplikovat",
  reopenClosed: "Znovu otevřít zavřenou záložku",
  closePane: "Zavřít panel",
  pinPage: "Připnout do lišty",
  unpinPage: "Odepnout z lišty",
  untitled: "Bez názvu",
};

/** Položka menu záložky (⋯ v záhlaví i kontextové menu záložky). */
export type PaneMenuAction = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
  separatorBefore?: boolean;
};

/** Sestaví menu záložky – stejné pro ⋯ v PageHeader i kontextové menu v PaneTabBar. */
export function buildTabMenuActions(
  api: PaneTabsApi,
  tabId: string,
  texts: Partial<PaneChromeTexts> = {},
  extra?: { pinned?: boolean; onTogglePin?: () => void },
): PaneMenuAction[] {
  const t = { ...DEFAULT_PANE_CHROME_TEXTS, ...texts };
  const found = findTab(api.state, tabId);
  if (!found) return [];
  const { tab, pane, paneIndex } = found;
  const count = api.state.panes.length;
  const actions: PaneMenuAction[] = [
    tab.pinned
      ? { id: "release", label: t.release, onSelect: () => api.releaseTab(tabId) }
      : { id: "keep", label: t.keep, onSelect: () => api.keepTab(tabId) },
    { id: "close", label: t.closeTab, shortcut: "Alt+W", onSelect: () => api.closeTab(tabId), separatorBefore: true },
    { id: "closeOthers", label: t.closeOthers, disabled: pane.tabs.length < 2, onSelect: () => api.closeOtherTabs(tabId) },
  ];
  Array.from({ length: count }, (_, index) => index)
    .filter((index) => index !== paneIndex)
    .forEach((index, order) =>
      actions.push({
        id: `move-${index}`,
        label: t.moveToPane.replace("{index}", String(index + 1)),
        onSelect: () => api.moveTab(tabId, api.state.panes[index].id),
        separatorBefore: order === 0,
      }),
    );
  if (tab.kind === "list") actions.push({ id: "duplicate", label: t.duplicate, onSelect: () => api.duplicateTab(tabId) });
  if (extra?.onTogglePin) actions.push({ id: "pinPage", label: extra.pinned ? t.unpinPage : t.pinPage, onSelect: extra.onTogglePin });
  if (count > 1) {
    actions.push({
      id: "maximize",
      label: api.maximized !== null ? t.restore.replace(" (Esc)", "") : t.maximize.replace(" (Alt+M)", ""),
      shortcut: api.maximized !== null ? "Esc" : "Alt+M",
      onSelect: () => api.toggleMaximize(paneIndex),
      separatorBefore: true,
    });
  }
  actions.push({ id: "reopen", label: t.reopenClosed, shortcut: "Alt+Shift+T", disabled: api.closedTabCount === 0, onSelect: api.reopenClosedTab, separatorBefore: count < 2 });
  actions.push({ id: "closePane", label: t.closePane, shortcut: "Alt+Shift+W", onSelect: () => api.closePane(pane.id), separatorBefore: true });
  return actions;
}

/** Kontext panelu pro záhlaví stránky (usePaneChrome). */
export type PaneChrome = {
  tabId: string;
  paneIndex: number;
  title: string;
  canBack: boolean;
  canForward: boolean;
  back: () => void;
  forward: () => void;
  /** Kroky historie záložky. */
  history: { index: number; title: string; icon?: string; current: boolean }[];
  /** Přejde na krok historie v téže záložce. */
  goToHistory: (index: number) => void;
  /** Otevře krok historie jako novou ponechanou záložku. */
  openFromHistory: (index: number) => void;
  dirty: boolean;
  pinned: boolean;
  keep: () => void;
  release: () => boolean;
  recordNav: RecordNav | null;
  canMaximize: boolean;
  maximized: boolean;
  toggleMaximize: () => void;
  menuActions: PaneMenuAction[];
  /** Vlastnosti úchytu pro přetažení záložky (nadpis stránky). */
  dragHandleProps: Record<string, unknown> & { ref?: (element: HTMLElement | null) => void };
  getIcon?: (icon: string | undefined) => React.ComponentType<{ className?: string }> | undefined;
};

export const PaneChromeContext = createContext<PaneChrome | null>(null);

/** Kontext záhlaví stránky v panelu; mimo PaneLayout vrací null. */
export function usePaneChrome(): PaneChrome | null {
  return useContext(PaneChromeContext);
}

/** Aktivní záložka aktivního panelu (pro zvýraznění v navigaci). */
export function useActivePaneTab() {
  const tabs = usePaneTabs();
  return tabs ? activeTabOf(tabs.state) : null;
}
