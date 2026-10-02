/**
 * Poskytovatel stavu a akcí panelových záložek.
 * Vlastní: přechody stavu, potvrzení změn, zkratky a obnovu rozložení.
 * Nesmí: vykreslovat lištu záložek ani obsah panelů.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useDsTexts } from "../../../ds-texts";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { PaneTabsContext } from "./pane-context-hooks";
import { DEFAULT_PANE_TABS_TEXTS, type OpenTabOptions, type PaneTabsApi, type PaneTabsTexts, type RecordNav, type RecordNavItem } from "./pane-context-types";
import { activateTabInState, applyLayoutInState, applyMaxLayout, closePaneInState, closeTabInState, duplicateTabInState, findRecordTab, findTab, moveTabInState, openFromHistoryInState, openRecordInState, openTabInState, otherTabIds, paneKey, pushClosedTab, reopenClosedTabInState, replaceTabContentInState, resolveOpenMode, resolveTargetPaneIndex, serializeLayout, setLayoutWithLimitInState, setTabTitleInState, stepTabHistory, MAX_TABS_PER_PANE, type ClosedTabRecord, type OpenRecordModifiers, type PaneLayoutCount, type PaneTab, type PaneTabsState } from "./pane-state";
import { clearTabState, dirtyTabIds, getTabDraft, isTabDirty, registerLiveTabs, setTabDirty, setTabDraft, useTabDirtyVersion } from "./pane-tab-store";

/** Čekající akce nad záložkami s neuloženými změnami. */
type PendingUnsaved = {
  tabIds: string[];
  intent: string;
  proceed: () => void;
};

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

  const commit = useCallback(
    (next: PaneTabsState) => {
      stateRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const titleOf = (tabId: string) => findTab(stateRef.current, tabId)?.tab.title ?? t.untitled;

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
        });
        return;
      }
    }
    doOpen(route, params, options);
  };

  const guardDiscard = (tabIds: string[], intent: string, action: () => void) => {
    const dirty = tabIds.filter(isTabDirty);
    if (!dirty.length) {
      action();
      return;
    }
    setPending({ tabIds: dirty, intent, proceed: action });
  };

  const closeTab = (tabId: string) =>
    guardDiscard([tabId], p.intentCloseTab, () => {
      rememberClosed([tabId], stateRef.current);
      commit(closeTabInState(stateRef.current, tabId));
      clearTabState(tabId);
    });

  const closeOtherTabs = (tabId: string) => {
    const ids = otherTabIds(stateRef.current, tabId);
    guardDiscard(ids, p.intentCloseTab, () => {
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
    );
  };

  const step = (tabId: string, delta: number) =>
    guardDiscard([tabId], p.intentHistory, () => {
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

  const getRecordNav = (tabId: string): RecordNav | null => {
    const found = findTab(stateRef.current, tabId);
    if (!found || found.tab.kind !== "record") return null;
    const source =
      recordNavs.current.get(found.tab.openerTabId ?? "") ?? recordNavs.current.get(tabId);
    if (!source) return null;
    const items = source();
    const keyOf = (item: { route: string; params?: Record<string, unknown>; recordKey?: string }) =>
      item.recordKey ?? paneKey(item);
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
    attentionTabIds: pending?.tabIds ?? [],
    guardUnsaved: (action) =>
      guardDiscard(
        stateRef.current.panes.flatMap((pane) => pane.tabs.map((tab) => tab.id)),
        p.intentLogout,
        action,
      ),
    registerRecordNav: (tabId, getItems) => {
      recordNavs.current.set(tabId, getItems);
      return () => {
        if (recordNavs.current.get(tabId) === getItems) recordNavs.current.delete(tabId);
      };
    },
    getRecordNav,
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
      // Držená klávesa nesmí opakovat akce (zavírání, obnova, maximalizace); šipky opakování potřebují.
      if (event.repeat && !event.code.startsWith("Arrow")) return;
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
        if (!pane.activeTab) return;
        if (event.code === "ArrowLeft") a.back(pane.activeTab);
        else a.forward(pane.activeTab);
        return;
      }
      if ((event.code === "ArrowUp" || event.code === "ArrowDown") && !event.shiftKey) {
        if (!pane.activeTab) return;
        const nav = a.getRecordNav(pane.activeTab);
        if (!nav) return;
        event.preventDefault();
        if (event.code === "ArrowUp") nav.prev();
        else nav.next();
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
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"]',
        )
      )
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="grid"], [data-own-escape]',
        )
      )
        return;
      event.preventDefault();
      setMaximized(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts, maximized]);

  const resolvePending = async (choice: "save" | "discard") => {
    if (!pending) return;
    const { tabIds, proceed } = pending;
    if (choice === "save") {
      if (!onSaveTab) return;
      setSaving(true);
      try {
        for (const tabId of tabIds) {
          // Ukládá se vždy dotčená záložka; neúspěch dialog zavře a nic nezahodí.
          if (!(await onSaveTab(tabId))) {
            setPending(null);
            return;
          }
          setTabDirty(tabId, false);
        }
      } catch {
        setPending(null);
        return;
      } finally {
        setSaving(false);
      }
    }
    tabIds.forEach(clearTabState);
    setPending(null);
    proceed();
  };

  return (
    <PaneTabsContext.Provider value={api}>
      {children}
      <UnsavedChangesDialog
        open={!!pending}
        tabTitle={pending ? pending.tabIds.map(titleOf).join(", ") : ""}
        intent={pending?.intent ?? ""}
        saving={saving}
        onSave={onSaveTab ? () => void resolvePending("save") : undefined}
        onDiscard={() => void resolvePending("discard")}
        onBack={() => setPending(null)}
      />
    </PaneTabsContext.Provider>
  );
}

