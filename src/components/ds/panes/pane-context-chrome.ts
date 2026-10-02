/**
 * Veřejné rozhraní záhlaví stránky v panelu.
 * Vlastní: kontext záhlaví a sestavení nabídky záložky.
 * Nesmí: spravovat stav poskytovatele panelů.
 */
import { createContext, useContext, type ComponentType } from "react";
import { DS_TEXTS_CS } from "../../../ds-texts";
import { activeTabOf, findTab } from "./pane-state";
import { usePaneTabs } from "./pane-context-hooks";
import type { PaneTabsApi, RecordNav } from "./pane-context-types";

export type PaneChromeTexts = {
  back: string;
  forward: string;
  history: string;
  openInNewTab: string;
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
  pageActions: string;
  untitled: string;
};

/** Výchozí (české) texty – jediný zdroj je DS_TEXTS_CS.paneChrome. */
export const DEFAULT_PANE_CHROME_TEXTS: PaneChromeTexts = DS_TEXTS_CS.paneChrome as PaneChromeTexts;

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
type TabMenuApi = Pick<
  PaneTabsApi,
  "state" | "closeTab" | "moveTab" | "duplicateTab" | "closePane"
>;

export function buildTabMenuActions(
  api: TabMenuApi,
  tabId: string,
  texts: Partial<PaneChromeTexts> = {},
): PaneMenuAction[] {
  const t = { ...DEFAULT_PANE_CHROME_TEXTS, ...texts };
  const found = findTab(api.state, tabId);
  if (!found) return [];
  const { tab, pane, paneIndex } = found;
  const count = api.state.panes.length;
  const groups: PaneMenuAction[][] = [
    [{ id: "close", label: t.closeTab, shortcut: "Alt+W", onSelect: () => api.closeTab(tabId) }],
  ];
  const tabActions: PaneMenuAction[] = [];
  Array.from({ length: count }, (_, index) => index)
    .filter((index) => index !== paneIndex)
    .forEach((index) =>
      tabActions.push({
        id: `move-${index}`,
        label: t.moveToPane.replace("{index}", String(index + 1)),
        onSelect: () => api.moveTab(tabId, api.state.panes[index].id),
      }),
    );
  if (tab.kind === "list")
    tabActions.push({
      id: "duplicate",
      label: t.duplicate,
      onSelect: () => api.duplicateTab(tabId),
    });
  if (tabActions.length) groups.push(tabActions);
  groups.push([
    {
      id: "closePane",
      label: t.closePane,
      shortcut: "Alt+Shift+W",
      onSelect: () => api.closePane(pane.id),
    },
  ]);
  return groups.flatMap((group, groupIndex) =>
    group.map((action, actionIndex) => ({
      ...action,
      separatorBefore: groupIndex > 0 && actionIndex === 0,
    })),
  );
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
  /** Otevře krok historie jako novou záložku. */
  openFromHistory: (index: number) => void;
  dirty: boolean;
  recordNav: RecordNav | null;
  canMaximize: boolean;
  maximized: boolean;
  toggleMaximize: () => void;
  menuActions: PaneMenuAction[];
  /** Vlastnosti úchytu pro přetažení záložky (nadpis stránky). */
  dragHandleProps: Record<string, unknown> & { ref?: (element: HTMLElement | null) => void };
  getIcon?: (icon: string | undefined) => ComponentType<{ className?: string }> | undefined;
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
