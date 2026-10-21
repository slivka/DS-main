/** Napojení panelového reduceru · bez dat aplikace a bez vlastního stavu. */
import type { MutableRefObject } from "react";
import type { PaneTabsApi } from "./pane-context-types";
import { activateTabInState, findTab, type PaneTabsState } from "./pane-state";
import {
  findLinkedPanel,
  openLinkedPanelInState,
  setLinkedPanelSectionInState,
  resolveLinkedPanelRecord,
  updateLinkedPanelRecordInState,
} from "./linked-panel";
import { sourceRecord } from "./linked-tabs";
import type { OpenLinkedTabResult } from "./linked-tabs";

export type LinkedPanelActions = Pick<
  PaneTabsApi,
  | "openLinkedPanel"
  | "focusLinkedPanel"
  | "setLinkedPanelSection"
  | "updateLinkedPanelRecord"
  | "closeLinkedPanel"
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
  const { stateRef, commit, closeTab, panelLabel, isDirty, confirmReplace, accept, focusPane } =
    options;
  const focusLinkedPanel = (sourceTabId: string) => {
    const found = findLinkedPanel(stateRef.current, sourceTabId);
    if (!found) return;
    commit(activateTabInState(stateRef.current, found.tab.id));
    focusPane(found.paneIndex);
  };
  return {
    openLinkedPanel: ({ sourceTabId, recordKey, recordTitle, section, blockedReason, ...loc }) => {
      const source = findTab(stateRef.current, sourceTabId)?.tab;
      if (blockedReason || !source) return;
      const input = { recordKey, title: recordTitle, ...loc };
      const attempt = (confirmed: boolean) => {
        const current = updateLinkedPanelRecordInState(stateRef.current, sourceTabId, input);
        const record =
          source.kind === "list"
            ? undefined
            : resolveLinkedPanelRecord(input, sourceRecord(source), source.route);
        const result = openLinkedPanelInState(
          current,
          sourceTabId,
          {
            label: panelLabel,
            activeSection: section,
            confirmed,
            ...(record ? { record } : {}),
          },
          Date.now(),
          isDirty,
        );
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
    updateLinkedPanelRecord: (sourceTabId, recordKey, recordTitle, location) => {
      const next = updateLinkedPanelRecordInState(stateRef.current, sourceTabId, {
        recordKey,
        title: recordTitle,
        ...location,
      });
      if (next !== stateRef.current) commit(next);
    },
    closeLinkedPanel: (sourceTabId) => {
      const found = findLinkedPanel(stateRef.current, sourceTabId);
      if (found) closeTab(found.tab.id);
    },
  };
}
