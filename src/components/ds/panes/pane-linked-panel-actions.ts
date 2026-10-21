/** Napojení panelového reduceru · bez dat aplikace a bez vlastního stavu. */
import type { MutableRefObject } from "react";
import type { PaneTabsApi } from "./pane-context-types";
import { activateTabInState, findTab, type PaneTabsState } from "./pane-state";
import {
  findLinkedPanel,
  openLinkedPanelInState,
  setLinkedPanelSectionInState,
  updateLinkedPanelRecordInState,
} from "./linked-panel";
import type { OpenLinkedTabResult } from "./linked-tabs";

export type LinkedPanelActions = Pick<PaneTabsApi,
  "openLinkedPanel" | "focusLinkedPanel" | "setLinkedPanelSection" |
  "updateLinkedPanelRecord" | "closeLinkedPanel"
>;

export interface LinkedPanelActionsOptions {
  stateRef: MutableRefObject<PaneTabsState>;
  commit: (state: PaneTabsState) => void;
  closeTab: (tabId: string) => void;
  panelLabel: string;
  isDirty: (tabId: string) => boolean;
  confirmReplace: (proceed: () => void) => void;
  accept: (result: OpenLinkedTabResult) => void;
  focusPane: (paneIndex: number) => void;
}

/** Všechny změny procházejí stávajícím commit/ochranou zavírání poskytovatele. */
export function createLinkedPanelActions(options: LinkedPanelActionsOptions): LinkedPanelActions {
  const { stateRef, commit, closeTab, panelLabel, isDirty, confirmReplace, accept, focusPane } = options;
  const focusLinkedPanel = (sourceTabId: string) => {
    const found = findLinkedPanel(stateRef.current, sourceTabId);
    if (!found) return;
    commit(activateTabInState(stateRef.current, found.tab.id));
    focusPane(found.paneIndex);
  };
  return {
    openLinkedPanel: ({ sourceTabId, recordKey, recordTitle, section, blockedReason }) => {
      if (blockedReason || !findTab(stateRef.current, sourceTabId)) return;
      const attempt = (confirmed: boolean) => {
        const current = updateLinkedPanelRecordInState(stateRef.current, sourceTabId, recordKey, recordTitle);
        const result = openLinkedPanelInState(current, sourceTabId, {
          label: panelLabel, activeSection: section, confirmed,
        }, Date.now(), isDirty);
        if (result.outcome === "needsConfirm") {
          confirmReplace(() => attempt(true));
          return;
        }
        if (result.outcome === "rejected") return;
        accept(result);
        const found = result.tabId ? findTab(result.state, result.tabId) : undefined;
        if (found) focusPane(found.paneIndex);
      };
      attempt(false);
    },
    focusLinkedPanel,
    setLinkedPanelSection: (tabId, section) => {
      const next = setLinkedPanelSectionInState(stateRef.current, tabId, section);
      if (next !== stateRef.current) commit(next);
    },
    updateLinkedPanelRecord: (sourceTabId, recordKey, recordTitle) => {
      const next = updateLinkedPanelRecordInState(stateRef.current, sourceTabId, recordKey, recordTitle);
      if (next !== stateRef.current) commit(next);
    },
    closeLinkedPanel: (sourceTabId) => {
      const found = findLinkedPanel(stateRef.current, sourceTabId);
      if (found) closeTab(found.tab.id);
    },
  };
}