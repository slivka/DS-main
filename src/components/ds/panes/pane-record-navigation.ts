/** Navigace mezi záznamy stejného seznamu; chrání rozepsanou záložku. */
import { toast } from "sonner";
import type { RecordNav, RecordNavItem } from "./pane-context-types";
import {
  activateTabInState,
  findRecordTab,
  findTab,
  paneKey,
  replaceTabContentInState,
  type PaneTabsState,
} from "./pane-state";
import { clearTabState, isTabDirty } from "./pane-tab-store";
export function recordNavigation(
  tabId: string,
  getState: () => PaneTabsState,
  recordNavs: Map<string, () => RecordNavItem[]>,
  commit: (state: PaneTabsState) => void,
  dirtyMessage: string,
): RecordNav | null {
  const found = findTab(getState(), tabId);
  if (!found || found.tab.kind !== "record") return null;
  const source = recordNavs.get(found.tab.openerTabId ?? "") ?? recordNavs.get(tabId);
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
      toast.warning(dirtyMessage);
      return;
    }
    const other = findRecordTab(getState(), { ...item, kind: "record" });
    if (other) {
      commit(activateTabInState(getState(), other.id));
      return;
    }
    clearTabState(tabId);
    commit(replaceTabContentInState(getState(), tabId, { ...item, kind: "record" }));
  };
  return { index, total: items.length, prev: () => go(-1), next: () => go(1) };
}
