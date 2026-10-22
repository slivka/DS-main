/** Panelové záložky · vlastní přechody, potvrzení a obnovu · nesmí vykreslovat obsah panelů. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { type UnsavedChangesAction, useDsTexts } from "../../../ds-texts";
import { PaneTabsContext } from "./pane-context-hooks";
import { PaneUnsavedController, type PendingUnsaved } from "./pane-unsaved-controller";
import {
  DEFAULT_PANE_TABS_TEXTS,
  type OpenTabOptions,
  type PaneTabsApi,
  type PaneTabsTexts,
  type RecordNavItem,
} from "./pane-context-types";
import {
  activateTabInState,
  applyLayoutInState,
  applyMaxLayout,
  closePaneInState,
  closeTabInState,
  duplicateTabInState,
  findRecordTab,
  findTab,
  moveTabInState,
  openFromHistoryInState,
  openRecordInState,
  openTabInState,
  otherTabIds,
  pushClosedTab,
  reopenClosedTabInState,
  resolveOpenMode,
  resolveTargetPaneIndex,
  serializeLayout,
  setLayoutWithLimitInState,
  setTabTitleInState,
  stepTabHistory,
  MAX_TABS_PER_PANE,
  type ClosedTabRecord,
  type OpenRecordModifiers,
  type PaneLayoutCount,
  type PaneTabsState,
} from "./pane-state";
import {
  clearTabState,
  getTabDraft,
  isTabDirty,
  registerLiveTabs,
  setTabDraft,
  useTabDirtyVersion,
} from "./pane-tab-store";
import { recordNavigation } from "./pane-record-navigation";
import { createLinkedPanelActions } from "./pane-linked-panel-actions";
import { usePaneProviderEffects } from "./use-pane-provider-effects";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import {
  openLinkedTabInState,
  returnLinkedTabInState,
  setLinkedTabPinnedInState,
  syncLinkedTabsInState,
  setLinkedSourceSelectionInState,
} from "./linked-tabs";
import type { PaneProviderActionContext } from "./pane-provider-action-context";
/** Otevírání a obnova používají původní přechody a úklid. */
export function createPaneOpenActions(context: PaneProviderActionContext) {
const { stateRef, closedRef, recordNavs, lastMax, commit, t, p, dsTexts, setPending, setMaximized, setClosedStack, maximized, confirm, titleOf, flash, rememberClosed, onNotice } = context;
  const doOpen = (
    route: string,
    params: Record<string, unknown> | undefined,
    options: OpenTabOptions,
  ) => {
    const current = stateRef.current;
    const mode = resolveOpenMode(current, options.target ?? "replace");
    const replacedId =
      mode === "replace"
        ? current.panes[resolveTargetPaneIndex(current, "replace")].activeTab
        : null;
    const result = openTabInState(current, { route, params, ...options }, isTabDirty);
    if (result.outcome === "rejected") {
      toast.warning(t.limitRejected.replace("{max}", String(MAX_TABS_PER_PANE)));
      return;
    }
    if (result.evictedTabId) {
      toast.info(
        t.limitEvicted
          .replace("{title}", titleOf(result.evictedTabId))
          .replace("{max}", String(MAX_TABS_PER_PANE)),
      );
      clearTabState(result.evictedTabId);
    }
    const clearedTabId = result.tabId ?? replacedId;
    if (result.outcome === "replaced" && clearedTabId) clearTabState(clearedTabId);
    result.closedTabIds?.forEach(clearTabState);
    if (options.target === "adjacentPane") setMaximized(null);
    commit(result.state);
  };
  const openTab: PaneTabsApi["openTab"] = (route, params, options = {}) => {
    const current = stateRef.current;
    const target = options.target ?? "replace";
    if (
      target === "replace" &&
      !findRecordTab(current, { route, params, ...options }) &&
      resolveOpenMode(current, target) === "replace"
    ) {
      const tabId = current.panes[resolveTargetPaneIndex(current, target)]?.activeTab;
      if (tabId && isTabDirty(tabId)) {
        const targetTitle = options.title ?? route;
        // Rozepsanou záložku nikdy nenahradíme: nová záložka v témže panelu bez dialogu.
        const trial = openTabInState(
          current,
          { route, params, ...options, target: "newTab" },
          isTabDirty,
        );
        if (trial.outcome !== "rejected") {
          doOpen(route, params, { ...options, target: "newTab" });
          (onNotice ?? toast.info)(p.openedInNewTab(targetTitle, titleOf(tabId)));
          return;
        }
        // Limit záložek: dialog; akce se vždy vztahuje k dotčené záložce, ne k aktivnímu panelu.
        setPending({
          tabIds: [tabId],
          intent: p.intentReplace(targetTitle),
          proceed: () => {
            commit(activateTabInState(stateRef.current, tabId));
            doOpen(route, params, { ...options, target: "replace" });
          },
          onOpenInNewTab: options.onOpenInNewTab,
        });
        return;
      }
    }
    doOpen(route, params, options);
  };
  const openRecord: PaneTabsApi["openRecord"] = (route, params, options = {}) => {
    const current = stateRef.current;
    const raw = (options.modifiers ?? {}) as Record<string, boolean | undefined>;
    const modifiers: OpenRecordModifiers = {
      mod: !!(raw.mod || raw.metaKey || raw.ctrlKey),
      shift: !!raw.shift || !!raw.shiftKey,
    };
    const fromPane = options.fromTabId
      ? findTab(current, options.fromTabId)?.pane.id
      : current.active;
    const result = openRecordInState(
      current,
      {
        route,
        params,
        recordKey: options.recordKey,
        title: options.title,
        shortTitle: options.shortTitle,
        icon: options.icon,
        kind: "record",
      },
      { fromTabId: options.fromTabId, isNew: options.isNew, modifiers, maximized },
      isTabDirty,
    );
    if (result.outcome === "rejected") {
      toast.warning(t.limitRejected.replace("{max}", String(MAX_TABS_PER_PANE)));
      return;
    }
    if (result.evictedTabId) {
      toast.info(
        t.limitEvicted
          .replace("{title}", titleOf(result.evictedTabId))
          .replace("{max}", String(MAX_TABS_PER_PANE)),
      );
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
  const getRecordNav = (tabId: string) =>
    recordNavigation(tabId, () => stateRef.current, recordNavs.current, commit, t.recordNavDirty);
  const openLinkedTab: PaneTabsApi["openLinkedTab"] = (sourceTabId, section, record) => {
    const attempt = (confirmed: boolean) => {
      const result = openLinkedTabInState(
        stateRef.current,
        sourceTabId,
        section,
        { confirmed, record },
        Date.now(),
        isTabDirty,
      );
      if (result.outcome === "rejected") {
        // Bez konkrétního záznamu se nic neotevře ani nehlásí limit.
        return;
      }
      if (result.outcome === "needsConfirm") {
        // Odmítnutí nic nemění – obsah zůstane ve vysouvacím panelu.
        confirm({
          title: p.linkedReplaceTitle,
          description: p.linkedReplaceDescription,
          confirmLabel: p.linkedReplaceConfirm,
          onConfirm: () => attempt(true),
        });
        return;
      }
      // Zpracování výsledku jako doOpen: vytlačené a zavřené záložky uklidit.
      if (result.evictedTabId) {
        toast.info(
          t.limitEvicted
            .replace("{title}", titleOf(result.evictedTabId))
            .replace("{max}", String(MAX_TABS_PER_PANE)),
        );
        clearTabState(result.evictedTabId);
      }
      result.closedTabIds?.forEach(clearTabState);
      commit(result.state);
    };
    attempt(false);
  };
return { openTab, openRecord, openFromHistory, reopenClosedTab, getRecordNav, openLinkedTab };
}
