/** Panelové záložky · vlastní přechody, potvrzení a obnovu · nesmí vykreslovat obsah panelů. */

import { type UnsavedChangesAction } from "../../../ds-texts";
import {
  activateTabInState,
  closePaneInState,
  closeTabInState,
  otherTabIds,
  stepTabHistory,
} from "./pane-state";
import { clearTabState, isTabDirty } from "./pane-tab-store";
import type { PaneProviderActionContext } from "./pane-provider-action-context";
/** Zavření i historie sdílejí ochranu neuložených změn. */
export function createPaneCloseActions(context: PaneProviderActionContext) {
  const { stateRef, commit, p, setPending, setMaximized, rememberClosed } = context;
  const guardDiscard = (
    tabIds: string[],
    intent: string,
    action: () => void,
    actionType: UnsavedChangesAction = "navigate",
  ) => {
    const dirty = tabIds.filter(isTabDirty);
    if (!dirty.length) {
      action();
      return;
    }
    setPending({ tabIds: dirty, intent, action: actionType, proceed: action });
  };
  const closeTab = (tabId: string) =>
    guardDiscard(
      [tabId],
      p.intentCloseTab,
      () => {
        rememberClosed([tabId], stateRef.current);
        commit(closeTabInState(stateRef.current, tabId));
        clearTabState(tabId);
      },
      "close",
    );
  const closeOtherTabs = (tabId: string) => {
    const ids = otherTabIds(stateRef.current, tabId);
    guardDiscard(
      ids,
      p.intentCloseTab,
      () => {
        let next = stateRef.current;
        rememberClosed(ids, next);
        ids.forEach((id) => {
          next = closeTabInState(next, id);
          clearTabState(id);
        });
        commit(activateTabInState(next, tabId));
      },
      "close",
    );
  };
  const closePane = (paneId: string) => {
    const pane = stateRef.current.panes.find((item) => item.id === paneId);
    if (!pane) return;
    guardDiscard(
      pane.tabs.map((tab) => tab.id),
      p.intentClosePane,
      () => {
        const before = stateRef.current;
        const current = before.panes.find((item) => item.id === paneId);
        if (!current) return;
        const ids = current.tabs.map((tab) => tab.id);
        rememberClosed(ids, before);
        setMaximized(null);
        commit(closePaneInState(before, paneId));
        ids.forEach(clearTabState);
      },
      "close",
    );
  };
  const step = (tabId: string, delta: number) =>
    guardDiscard([tabId], p.intentHistory, () => {
      const next = stepTabHistory(stateRef.current, tabId, delta);
      if (next !== stateRef.current) clearTabState(tabId);
      commit(next);
    });
  return { guardDiscard, closeTab, closeOtherTabs, closePane, step };
}
