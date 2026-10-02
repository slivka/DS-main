/**
 * Veřejné typy a texty panelových záložek.
 * Vlastní: datové kontrakty kontextu a výchozí texty.
 * Nesmí: obsahovat React stav ani měnit záložky.
 */
import type { ComponentType } from "react";
import type {
  LayoutSnapshot,
  OpenRecordModifiers,
  PaneTab,
  PaneLayoutCount,
  PaneTabsState,
  OpenTabTarget,
  TabKind,
} from "./pane-state";

export type OpenTabOptions = {
  target?: OpenTabTarget;
  kind?: TabKind;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
  /** Záložka, ze které se otevírá (pro návrat po zavření). */
  openerTabId?: string | null;
  /** Nabídne v dialogu limitu otevření odkazu jako další záložky. */
  onOpenInNewTab?: () => void;
};

export type OpenRecordOptions = {
  /** Záložka seznamu, ze které se záznam otevírá (typicky usePane().tabId). */
  fromTabId?: string | null;
  /** Nový záznam – vždy otevře novou záložku. */
  isNew?: boolean;
  /** Modifikátory kliknutí: mod = Cmd/Ctrl, shift = Shift. Lze předat přímo událost myši. */
  modifiers?: OpenRecordModifiers | { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean };
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
};

/** Položka pořadí záznamů pro listování ↑ ↓ (registerRecordNav). */
export type RecordNavItem = {
  route: string;
  params?: Record<string, unknown>;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
};

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
  openRecord: (
    route: string,
    params?: Record<string, unknown>,
    options?: OpenRecordOptions,
  ) => void;
  /** Otevře krok historie jako novou záložku. */
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
  /** Záložky dotčené otevřeným dialogem neuložených změn (zvýrazní se). */
  attentionTabIds: string[];
  /** Spustí akci (typicky odhlášení), rozepsané záložky nejprve potvrdí dialogem. */
  guardUnsaved: (action: () => void) => void;
  /** Aplikace dodá pořadí záznamů pro listování ↑ ↓ v detailech otevřených ze záložky `tabId`. Vrací odregistraci. */
  registerRecordNav: (tabId: string, getOrderedItems: () => RecordNavItem[]) => () => void;
  getRecordNav: (tabId: string) => RecordNav | null;
  /** Snímek aktuálního rozložení (bez konceptů a nových záznamů). */
  serializeLayout: () => LayoutSnapshot;
  /** Použije uložené rozložení; vrací záložky s neuloženými změnami, které zůstaly. */
  applyLayout: (snapshot: LayoutSnapshot, options?: { keepDirty?: boolean }) => PaneTab[];
};

export type PaneTabsTexts = {
  /** @deprecated 2.86.0 – dialog čte `DsTexts.panes`; odstraní se ve 3.0.0. */
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
  /** Jedno upozornění po slučování panelů; {count} a {max} se nahradí. */
  limitClosed: string;
  narrowed: string;
  restored: string;
  untitled: string;
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
  limitClosed: "Zavřené záložky: {count} – v panelu může být nejvýše {max}. Alt+Shift+T je vrátí.",
  narrowed: "Málo místa – panely byly sloučeny. Po zvětšení okna se rozdějení obnoví.",
  restored: "Rozdějení panelů obnoveno.",
  untitled: "Bez názvu",
  recordNavDirty: "Nejprve uložte nebo zahoďte neuložené změny",
};
