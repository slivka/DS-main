/** Panelové záložky · vlastní přechody, potvrzení a obnovu · nesmí vykreslovat obsah panelů. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useDsTexts } from "../../../ds-texts";
import { PaneTabsContext } from "./pane-context-hooks";
import { PaneUnsavedController, type PendingUnsaved } from "./pane-unsaved-controller";
import {
  DEFAULT_PANE_TABS_TEXTS,
  type PaneTabsApi,
  type PaneTabsTexts,
  type RecordNavItem,
} from "./pane-context-types";
import {
  applyMaxLayout,
  findTab,
  pushClosedTab,
  type ClosedTabRecord,
  type PaneLayoutCount,
  type PaneTabsState,
} from "./pane-state";
import { registerLiveTabs, useTabDirtyVersion } from "./pane-tab-store";

import { usePaneProviderEffects } from "./use-pane-provider-effects";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { syncLinkedTabsInState, setLinkedSourceSelectionInState } from "./linked-tabs";
import { createPaneOpenActions } from "./pane-provider-open-actions";
import { createPaneCloseActions } from "./pane-provider-close-actions";
import { createPaneProviderApi } from "./pane-provider-api";
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
  /** Oznámení (např. otevření v nové záložce místo nahrazení rozepsané); výchozí toast. */
  onNotice?: (message: string) => void;
  children: ReactNode;
}
/** Stav a akce záložek v panelech. Obalte jím AppShell i PaneLayout, aby navigace otevírala záložky. */
export function PaneTabsProvider({
  state,
  onChange,
  onSaveTab,
  onNewTabRequest,
  shortcuts = true,
  texts,
  onNotice,
  children,
}: PaneTabsProviderProps) {
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_PANE_TABS_TEXTS, limitClosed: dsTexts.panes.limitClosed, ...texts };
  const p = dsTexts.panes;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [pending, setPending] = useState<PendingUnsaved | null>(null);
  const [maximized, setMaximized] = useState<number | null>(null);
  const [flashPaneId, setFlashPaneId] = useState<string | null>(null);
  const [closedStack, setClosedStack] = useState<ClosedTabRecord[]>([]);
  const closedRef = useRef(closedStack);
  closedRef.current = closedStack;
  const recordNavs = useRef(new Map<string, () => RecordNavItem[]>());
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useTabDirtyVersion();
  useEffect(() => {
    const tabs = state.panes.flatMap((pane) => pane.tabs);
    // Zároveň uklidí pozice rolování zavřených záložek a vypadlých kroků historie.
    registerLiveTabs(
      tabs.map((tab) => tab.id),
      Object.fromEntries(tabs.map((tab) => [tab.id, tab.history.length])),
    );
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
      if (found)
        stack = pushClosedTab(stack, {
          tab: found.tab,
          paneId: found.pane.id,
          index: found.tabIndex,
        });
    });
    closedRef.current = stack;
    setClosedStack(stack);
  };
  const { confirm, confirmDialog } = useConfirmDialog();
  const commit = useCallback(
    (next: PaneTabsState) => {
      // Navázané záložky se po každé změně přepnou podle zdroje (ne podle pozice panelu).
      const synced = syncLinkedTabsInState(next);
      stateRef.current = synced;
      onChange(synced);
    },
    [onChange],
  );
  const titleOf = (tabId: string) => findTab(stateRef.current, tabId)?.tab.title ?? t.untitled;
  const lastMax = useRef<PaneLayoutCount | null>(null);
  const reportMaxLayout = (maxLayout: PaneLayoutCount) => {
    if (lastMax.current === maxLayout) return;
    lastMax.current = maxLayout;
    const { state: next, notice } = applyMaxLayout(stateRef.current, maxLayout);
    if (!notice) return;
    toast.info(notice === "narrowed" ? t.narrowed : t.restored);
    commit(next);
  };
  const setLinkedSourceSelection = useCallback<PaneTabsApi["setLinkedSourceSelection"]>(
    (sourceTabId, record) => {
      const current = stateRef.current;
      const next = setLinkedSourceSelectionInState(current, sourceTabId, record);
      if (next !== current) commit(next);
    },
    [commit],
  );
  const context = {
    stateRef,
    closedRef,
    recordNavs,
    lastMax,
    commit,
    t,
    p,
    dsTexts,
    setPending,
    setMaximized,
    setClosedStack,
    maximized,
    confirm,
    titleOf,
    flash,
    rememberClosed,
    onNotice,
  };
  const close = createPaneCloseActions(context);
  const open = createPaneOpenActions(context);
  const api = createPaneProviderApi(context, open, close, {
    state,
    closedTabCount: closedStack.length,
    flashPaneId,
    attentionTabIds: pending?.tabIds ?? [],
    setLinkedSourceSelection,
    reportMaxLayout,
    requestNewTab: () => onNewTabRequest?.(),
    toggleMaximize: (index) => apiRef.current.maximizePane(index),
  });
  const apiRef = useRef(api);
  apiRef.current = api;
  usePaneProviderEffects({
    state,
    stateRef,
    apiRef,
    shortcuts,
    maximized,
    restoreMaximized: () => setMaximized(null),
  });
  return (
    <PaneTabsContext.Provider value={api}>
      {children}
      <PaneUnsavedController
        pending={pending}
        setPending={setPending}
        titleOf={titleOf}
        onSaveTab={onSaveTab}
      />
      {confirmDialog}
    </PaneTabsContext.Provider>
  );
}
