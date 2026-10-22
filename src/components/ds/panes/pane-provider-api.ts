/** Panelové záložky · vlastní přechody, potvrzení a obnovu · nesmí vykreslovat obsah panelů. */

import { toast } from "sonner";
import { type PaneTabsApi } from "./pane-context-types";
import {
  activateTabInState,
  applyLayoutInState,
  duplicateTabInState,
  findTab,
  moveTabInState,
  serializeLayout,
  setLayoutWithLimitInState,
  setTabTitleInState,
  MAX_TABS_PER_PANE,
} from "./pane-state";
import { clearTabState, getTabDraft, isTabDirty, setTabDraft } from "./pane-tab-store";
import { createLinkedPanelActions } from "./pane-linked-panel-actions";
import { returnLinkedTabInState, setLinkedTabPinnedInState } from "./linked-tabs";
import type { PaneProviderActionContext } from "./pane-provider-action-context";
import type { createPaneOpenActions } from "./pane-provider-open-actions";
import type { createPaneCloseActions } from "./pane-provider-close-actions";
/** Složí veřejné akce z jediné instance přechodů. */
export function createPaneProviderApi(
  context: PaneProviderActionContext,
  open: ReturnType<typeof createPaneOpenActions>,
  close: ReturnType<typeof createPaneCloseActions>,
  view: Pick<
    PaneTabsApi,
    | "state"
    | "closedTabCount"
    | "flashPaneId"
    | "attentionTabIds"
    | "setLinkedSourceSelection"
    | "reportMaxLayout"
    | "requestNewTab"
  > & { toggleMaximize: (index: number) => void },
) {
  const {
    stateRef,
    recordNavs,
    lastMax,
    commit,
    t,
    p,
    dsTexts,
    setMaximized,
    maximized,
    confirm,
    rememberClosed,
  } = context;
  const { openRecord, openFromHistory, reopenClosedTab, getRecordNav, openLinkedTab, openTab } =
    open;
  const { guardDiscard, closeTab, closeOtherTabs, closePane, step } = close;
  const { state, flashPaneId, attentionTabIds, setLinkedSourceSelection, reportMaxLayout } = view;
  const closedStack = { length: view.closedTabCount };
  const api: PaneTabsApi = {
    ...createLinkedPanelActions({
      stateRef,
      commit,
      closeTab,
      panelLabel: dsTexts.recordPanel.panel,
      isDirty: isTabDirty,
      confirmReplace: (proceed) =>
        confirm({
          title: p.linkedReplaceTitle,
          description: p.linkedReplaceDescription,
          confirmLabel: p.linkedReplaceConfirm,
          onConfirm: proceed,
        }),
      accept: (result) => {
        if (result.evictedTabId) clearTabState(result.evictedTabId);
        result.closedTabIds?.forEach(clearTabState);
        commit(result.state);
      },
      focusPane: (index) => {
        if (maximized !== null) setMaximized(index);
      },
    }),
    state,
    openRecord,
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
      else view.toggleMaximize(index);
    },
    flashPaneId,
    attentionTabIds: attentionTabIds,
    guardUnsaved: (action, actionType = "navigate") =>
      guardDiscard(
        stateRef.current.panes.flatMap((pane) => pane.tabs.map((tab) => tab.id)),
        p.intentLogout,
        action,
        actionType,
      ),
    registerRecordNav: (tabId, getItems) => {
      recordNavs.current.set(tabId, getItems);
      return () => {
        if (recordNavs.current.get(tabId) === getItems) recordNavs.current.delete(tabId);
      };
    },
    getRecordNav,
    setLinkedSourceSelection,
    openLinkedTab,
    setLinkedPinned: (tabId, pinned) =>
      commit(setLinkedTabPinnedInState(stateRef.current, tabId, pinned)),
    returnLinkedTab: (tabId) => commit(returnLinkedTabInState(stateRef.current, tabId)),
    serializeLayout: () =>
      serializeLayout(stateRef.current, (tabId) => ({
        state: getTabDraft(tabId, "grid"),
      })),
    applyLayout: (snapshot, options) => {
      const result = applyLayoutInState(stateRef.current, snapshot, options, isTabDirty);
      result.closedTabIds.forEach(clearTabState);
      result.gridStates.forEach(({ tabId, grid }) => {
        const stored = grid as { state?: unknown; preferences?: unknown } | undefined;
        if (stored && ("state" in stored || "preferences" in stored)) {
          if (stored.state !== undefined) setTabDraft(tabId, stored.state, "grid");
        } else setTabDraft(tabId, grid, "grid");
      });
      setMaximized(null);
      lastMax.current = null;
      commit(result.state);
      return result.skipped;
    },
    openTab,
    closeTab,
    closeOtherTabs,
    moveTab: (tabId, toPaneId, index) =>
      commit(moveTabInState(stateRef.current, tabId, toPaneId, index)),
    activateTab: (tabId) => commit(activateTabInState(stateRef.current, tabId)),
    activatePane: (paneId) => {
      if (stateRef.current.active !== paneId) commit({ ...stateRef.current, active: paneId });
    },
    duplicateTab: (tabId) => commit(duplicateTabInState(stateRef.current, tabId).state),
    setLayout: (layout) => {
      lastMax.current = null;
      setMaximized(null);
      const before = stateRef.current;
      const result = setLayoutWithLimitInState(before, layout, isTabDirty);
      if (result.closedTabIds.length) {
        rememberClosed(result.closedTabIds, before);
        result.closedTabIds.forEach(clearTabState);
        toast.info(
          t.limitClosed
            .replace("{count}", String(result.closedTabIds.length))
            .replace("{max}", String(MAX_TABS_PER_PANE)),
        );
      }
      commit(result.state);
    },
    closePane,
    back: (tabId) => step(tabId, -1),
    forward: (tabId) => step(tabId, 1),
    setTabTitle: (tabId, title, shortTitle) =>
      commit(setTabTitleInState(stateRef.current, tabId, title, shortTitle)),
    setWidths: (widths) => commit({ ...stateRef.current, widths }),
    isTabDirty,
    requestNewTab: view.requestNewTab,
    reportMaxLayout,
  };
  return api;
}
