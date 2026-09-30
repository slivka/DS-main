/**
 * Stav režimu více oken se záložkami (formát v2) a čisté funkce pro jeho změny.
 * Všechny funkce vrací nový stav – nic nemění na místě, takže jdou snadno testovat.
 */

export type PaneLayoutCount = 1 | 2 | 3;

/** 'record' = konkrétní záznam (smí být otevřený jen jednou), 'list' = seznam (vícekrát). */
export type TabKind = "list" | "record";

/** Kam otevřít stránku: nahradit aktivní záložku, nová záložka, nebo nová záložka v sousedním panelu. */
export type OpenTabTarget = "replace" | "newTab" | "adjacentPane";

export type TabHistoryEntry = {
  route: string;
  params?: Record<string, unknown>;
  title?: string;
  shortTitle?: string;
  icon?: string;
};

export type PaneTab = {
  id: string;
  route: string;
  params?: Record<string, unknown>;
  kind: TabKind;
  /** Klíč záznamu pro kontrolu duplicity; výchozí je route + params. */
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  /** Název ikony – převádí se na komponentu přes getTabIcon v PaneLayout. */
  icon?: string;
  history: TabHistoryEntry[];
  historyIndex: number;
  /** Čas posledního použití (pro limit záložek). */
  lastUsed: number;
  /** Záložka, ze které byla tato otevřena (typicky seznam → detail). */
  openerTabId: string | null;
  /** Nový, dosud neuložený záznam – nepatří do uloženého rozložení. */
  isNew?: boolean;
};

export type TabPane = {
  id: string;
  activeTab: string | null;
  tabs: PaneTab[];
};

/** Uložené rozdějení záložek před automatickým zúžením podle šířky. */
export type HiddenPanesSnapshot = {
  layout: PaneLayoutCount;
  panes: { id: string; tabIds: string[]; activeTab: string | null }[];
};

export type PaneTabsState = {
  version: 2;
  layout: PaneLayoutCount;
  /** Podíly šířek viditelných panelů (součet 1). */
  widths?: number[];
  /** Id aktivního panelu. */
  active: string;
  /** Vždy přesně `layout` panelů. */
  panes: TabPane[];
  hiddenPanes?: HiddenPanesSnapshot | null;
};

/** Stav jednoho panelu ve starém formátu v1 (jedna stránka na panel). */
export type PaneStateV1 = {
  id: string;
  route: string;
  params?: Record<string, unknown>;
  title?: string;
  uniqueKey?: boolean;
};

export type PaneLayoutStateV1 = {
  panes: PaneStateV1[];
  activePaneId: string;
  layout: PaneLayoutCount;
  widths?: number[];
};

export const MAX_TABS_PER_PANE = 10;

let sequence = 0;
/** Jedinečné id pro panel nebo záložku. */
export function createPaneId(prefix: "pane" | "tab" = "tab"): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

const stableParams = (params?: Record<string, unknown>) => {
  if (!params) return "";
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
};

/** Klíč stránky (route + params); pro prázdnou route vrací null. */
export function paneKey(pane: { route: string; params?: Record<string, unknown> }): string | null {
  if (!pane.route) return null;
  const query = stableParams(pane.params);
  return query ? `${pane.route}?${query}` : pane.route;
}

/** Rovnoměrné rozdějení šířek pro daný počet panelů. */
export function evenWidths(count: number): number[] {
  return Array.from({ length: count }, () => 1 / count);
}

const clampLayout = (value: number): PaneLayoutCount => (value >= 3 ? 3 : value <= 1 ? 1 : 2);

const emptyPane = (): TabPane => ({ id: createPaneId("pane"), activeTab: null, tabs: [] });

/** Nový prázdný stav s jedním panelem. */
export function createPaneTabsState(layout: PaneLayoutCount = 1): PaneTabsState {
  const panes = Array.from({ length: layout }, emptyPane);
  return { version: 2, layout, widths: evenWidths(layout), active: panes[0].id, panes, hiddenPanes: null };
}

export type CreateTabInput = {
  route: string;
  params?: Record<string, unknown>;
  kind?: TabKind;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
  openerTabId?: string | null;
  isNew?: boolean;
};

/** Vytvoří novou záložku s jedním krokem historie. */
export function createTab(input: CreateTabInput, now = Date.now()): PaneTab {
  const entry: TabHistoryEntry = { route: input.route, params: input.params, title: input.title, shortTitle: input.shortTitle, icon: input.icon };
  return {
    id: createPaneId("tab"),
    route: input.route,
    params: input.params,
    kind: input.kind ?? "list",
    recordKey: input.recordKey,
    title: input.title,
    shortTitle: input.shortTitle,
    icon: input.icon,
    history: [entry],
    historyIndex: 0,
    lastUsed: now,
    openerTabId: input.openerTabId ?? null,
    isNew: input.isNew || undefined,
  };
}

/** Najde záložku a její panel. */
export function findTab(state: PaneTabsState, tabId: string) {
  for (let paneIndex = 0; paneIndex < state.panes.length; paneIndex += 1) {
    const pane = state.panes[paneIndex];
    const tabIndex = pane.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex >= 0) return { pane, paneIndex, tab: pane.tabs[tabIndex], tabIndex };
  }
  return null;
}

/** Aktivní záložka aktivního panelu. */
export function activeTabOf(state: PaneTabsState): PaneTab | null {
  const pane = state.panes.find((item) => item.id === state.active);
  return pane?.tabs.find((tab) => tab.id === pane.activeTab) ?? null;
}

const recordKeyOf = (tab: Pick<PaneTab, "route" | "params" | "recordKey">) => tab.recordKey ?? paneKey(tab);

const replacePane = (state: PaneTabsState, pane: TabPane): PaneTabsState => ({
  ...state,
  panes: state.panes.map((item) => (item.id === pane.id ? pane : item)),
});

const touch = (tab: PaneTab, now: number): PaneTab => ({ ...tab, lastUsed: now });

/** Aktivuje záložku (i její panel). */
export function activateTabInState(state: PaneTabsState, tabId: string, now = Date.now()): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const pane: TabPane = {
    ...found.pane,
    activeTab: tabId,
    tabs: found.pane.tabs.map((tab) => (tab.id === tabId ? touch(tab, now) : tab)),
  };
  return { ...replacePane(state, pane), active: pane.id };
}

/** Index panelu, do kterého míří otevření. */
export function resolveTargetPaneIndex(state: PaneTabsState, target: OpenTabTarget): number {
  const activeIndex = Math.max(0, state.panes.findIndex((pane) => pane.id === state.active));
  if (target !== "adjacentPane" || state.panes.length < 2) return activeIndex;
  return activeIndex === state.panes.length - 1 ? activeIndex - 1 : activeIndex + 1;
}

/** Efektivní způsob otevření – u prázdného panelu se nahrazení mění na novou záložku. */
export function resolveOpenMode(state: PaneTabsState, target: OpenTabTarget): "replace" | "newTab" {
  if (target !== "replace") return "newTab";
  const pane = state.panes[resolveTargetPaneIndex(state, target)];
  return pane?.activeTab ? "replace" : "newTab";
}

/** Existující záložka stejného záznamu (jen kind 'record'). */
export function findRecordTab(state: PaneTabsState, input: CreateTabInput): PaneTab | null {
  if ((input.kind ?? "list") !== "record") return null;
  const key = input.recordKey ?? paneKey(input);
  if (!key) return null;
  for (const pane of state.panes) {
    const tab = pane.tabs.find((item) => item.kind === "record" && recordKeyOf(item) === key);
    if (tab) return tab;
  }
  return null;
}

export type OpenTabResult = {
  state: PaneTabsState;
  outcome: "activated" | "opened" | "replaced" | "rejected";
  tabId?: string;
  /** Záložka zavřená kvůli limitu. */
  evictedTabId?: string;
  closedTabIds?: string[];
  /** Cílový panel. */
  paneId?: string;
};

/**
 * Otevře stránku podle pravidel: stejný záznam jen jednou, nahrazení aktivní záložky,
 * nová záložka s limitem 10 na panel (zavře nejdéle nepoužitou čistou záložku).
 * Kontrolu neuložených změn při nahrazení dělá volající před voláním.
 */
export function openTabInState(
  state: PaneTabsState,
  input: CreateTabInput & { target?: OpenTabTarget },
  isDirty: (tabId: string) => boolean = () => false,
  now = Date.now(),
): OpenTabResult {
  const existing = findRecordTab(state, input);
  if (existing) return { state: activateTabInState(state, existing.id, now), outcome: "activated", tabId: existing.id };

  const target = input.target ?? "replace";
  const paneIndex = resolveTargetPaneIndex(state, target);
  const pane = state.panes[paneIndex];
  const mode = resolveOpenMode(state, target);

  if (mode === "replace" && pane.activeTab) {
    const entry: TabHistoryEntry = { route: input.route, params: input.params, title: input.title, shortTitle: input.shortTitle, icon: input.icon };
    const tabs = pane.tabs.map((tab) => {
      if (tab.id !== pane.activeTab) return tab;
      const history = [...tab.history.slice(0, tab.historyIndex + 1), entry];
      return {
        ...tab,
        ...entry,
        kind: input.kind ?? "list",
        recordKey: input.recordKey,
        icon: input.icon ?? tab.icon,
        history,
        historyIndex: history.length - 1,
        lastUsed: now,
      };
    });
    return { state: { ...replacePane(state, { ...pane, tabs }), active: pane.id }, outcome: "replaced", tabId: pane.activeTab };
  }

  const tab = createTab(input, now);
  return insertTabInState(state, paneIndex, tab, pane.activeTab, isDirty);
}

/** Nejdéle nepoužitá čistá záložka k zavření kvůli limitu. */
export function pickEvictionVictim(tabs: PaneTab[], isDirty: (tabId: string) => boolean, exclude: string[] = []): PaneTab | undefined {
  const clean = tabs.filter((tab) => !isDirty(tab.id) && !exclude.includes(tab.id)).sort((a, b) => a.lastUsed - b.lastUsed);
  return clean[0];
}

/**
 * Vloží záložku do panelu za `afterTabId` (jinak na konec), aktivuje ji i panel.
 * Hlídá limit 10 záložek.
 */
export function insertTabInState(
  state: PaneTabsState,
  paneIndex: number,
  tab: PaneTab,
  afterTabId: string | null | undefined,
  isDirty: (tabId: string) => boolean = () => false,
): OpenTabResult {
  const pane = state.panes[paneIndex];
  if (!pane) return { state, outcome: "rejected" };
  let tabs = pane.tabs;
  let evictedTabId: string | undefined;
  if (tabs.length >= MAX_TABS_PER_PANE) {
    const victim = pickEvictionVictim(tabs, isDirty, afterTabId ? [afterTabId] : []);
    if (!victim) return { state, outcome: "rejected" };
    evictedTabId = victim.id;
    tabs = tabs.filter((item) => item.id !== victim.id);
  }
  const afterIndex = afterTabId ? tabs.findIndex((item) => item.id === afterTabId) : -1;
  const insertAt = afterIndex >= 0 ? afterIndex + 1 : tabs.length;
  const nextTabs = [...tabs.slice(0, insertAt), tab, ...tabs.slice(insertAt)];
  return {
    state: { ...replacePane(state, { ...pane, tabs: nextTabs, activeTab: tab.id }), active: pane.id },
    outcome: "opened",
    tabId: tab.id,
    evictedTabId,
    closedTabIds: [],
    paneId: pane.id,
  };
}

/** Nahradí obsah záložky novou stránkou (nový krok historie) a aktivuje ji. */
export function replaceTabContentInState(state: PaneTabsState, tabId: string, input: CreateTabInput, now = Date.now()): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const entry: TabHistoryEntry = { route: input.route, params: input.params, title: input.title, shortTitle: input.shortTitle, icon: input.icon ?? found.tab.icon };
  const history = [...found.tab.history.slice(0, found.tab.historyIndex + 1), entry];
  const tab: PaneTab = {
    ...found.tab,
    ...entry,
    kind: input.kind ?? found.tab.kind,
    recordKey: input.recordKey,
    icon: input.icon ?? found.tab.icon,
    isNew: input.isNew || undefined,
    openerTabId: input.openerTabId !== undefined ? input.openerTabId : found.tab.openerTabId,
    history,
    historyIndex: history.length - 1,
    lastUsed: now,
  };
  const pane = { ...found.pane, activeTab: tabId, tabs: found.pane.tabs.map((item) => (item.id === tabId ? tab : item)) };
  return { ...replacePane(state, pane), active: pane.id };
}

export type OpenRecordModifiers = { mod?: boolean; shift?: boolean };

export type OpenRecordStateOptions = {
  fromTabId?: string | null;
  isNew?: boolean;
  modifiers?: OpenRecordModifiers;
  /** Index maximalizovaného panelu – pravidlo e) se pak neuplatní. */
  maximized?: number | null;
};

const adjacentIndex = (count: number, index: number) => (count < 2 ? -1 : index === count - 1 ? index - 1 : index + 1);

/**
 * Otevření záznamu ze seznamu podle pravidel a–f (viz dokumentace usePaneTabs.openRecord).
 * Vrací i `paneId` cílového panelu – když se liší od panelu fromTab, panel má bliknout.
 */
export function openRecordInState(
  state: PaneTabsState,
  input: CreateTabInput,
  options: OpenRecordStateOptions = {},
  isDirty: (tabId: string) => boolean = () => false,
  now = Date.now(),
): OpenTabResult & { cancelMaximize?: boolean } {
  const record: CreateTabInput = { ...input, kind: input.kind ?? "record", isNew: options.isNew };
  // a) otevřený záznam
  const existing = record.isNew ? null : findRecordTab(state, record);
  if (existing) {
    const next = activateTabInState(state, existing.id, now);
    return { state: next, outcome: "activated", tabId: existing.id, paneId: findTab(next, existing.id)?.pane.id };
  }
  const from = options.fromTabId ? findTab(state, options.fromTabId) : null;
  const fromPaneIndex = from ? from.paneIndex : Math.max(0, state.panes.findIndex((pane) => pane.id === state.active));
  const fromId = from?.tab.id ?? null;
  const mods = options.modifiers ?? {};
  const make = () => createTab({ ...record, openerTabId: fromId }, now);

  // b) modifikátory
  if (mods.mod && mods.shift) {
    const target = adjacentIndex(state.panes.length, fromPaneIndex);
    const paneIndex = target < 0 ? fromPaneIndex : target;
    const pane = state.panes[paneIndex];
    return { ...insertTabInState(state, paneIndex, make(), pane.activeTab, isDirty), cancelMaximize: true };
  }
  if (mods.mod) return insertTabInState(state, fromPaneIndex, make(), fromId, isDirty);

  // c) čistý existující detail otevřený z téhož seznamu → nahradit obsah
  if (!options.isNew && fromId) {
    for (const pane of state.panes) {
      const detail = pane.tabs.find((tab) => !tab.isNew && tab.openerTabId === fromId && tab.kind === "record" && !isDirty(tab.id));
      if (detail) {
        return { state: replaceTabContentInState(state, detail.id, { ...record, openerTabId: fromId }, now), outcome: "replaced", tabId: detail.id, paneId: pane.id };
      }
    }
  }

  // d) jiný panel, kde už jsou záložky otevřené z fromTab
  if (fromId) {
    const index = state.panes.findIndex((pane, i) => i !== fromPaneIndex && pane.tabs.some((tab) => tab.openerTabId === fromId));
    if (index >= 0) {
      const pane = state.panes[index];
      const last = [...pane.tabs].reverse().find((tab) => tab.openerTabId === fromId);
      return insertTabInState(state, index, make(), last?.id ?? pane.activeTab, isDirty);
    }
  }

  // e) prázdný sousední panel (vpravo, pak vlevo; ne při maximalizaci)
  if (options.maximized == null) {
    for (const index of [fromPaneIndex + 1, fromPaneIndex - 1]) {
      const pane = state.panes[index];
      if (pane && pane.tabs.length === 0) return insertTabInState(state, index, make(), null, isDirty);
    }
  }

  // f) nová záložka za fromTab ve stejném panelu
  return insertTabInState(state, fromPaneIndex, make(), fromId ?? state.panes[fromPaneIndex].activeTab, isDirty);
}

/** Otevře krok historie záložky jako novou záložku hned za ní. */
export function openFromHistoryInState(state: PaneTabsState, tabId: string, index: number, isDirty: (tabId: string) => boolean = () => false, now = Date.now()): OpenTabResult {
  const found = findTab(state, tabId);
  const entry = found?.tab.history[index];
  if (!found || !entry) return { state, outcome: "rejected" };
  const tab: PaneTab = {
    ...createTab({ ...entry, kind: found.tab.kind, icon: found.tab.icon, openerTabId: found.tab.openerTabId }, now),
    history: found.tab.history.slice(0, index + 1),
    historyIndex: index,
  };
  return insertTabInState(state, found.paneIndex, tab, tabId, isDirty);
}

/** Zavřená záložka v zásobníku pro „Znovu otevřít zavřenou záložku“. */
export type ClosedTabRecord = { tab: PaneTab; paneId: string; index: number };

export const MAX_CLOSED_TABS = 10;

/** Přidá záznam do zásobníku zavřených záložek (nejvýš 10). */
export function pushClosedTab(stack: ClosedTabRecord[], record: ClosedTabRecord): ClosedTabRecord[] {
  return [...stack, record].slice(-MAX_CLOSED_TABS);
}

/** Obnoví zavřenou záložku do jejího panelu (jinak do aktivního). */
export function reopenClosedTabInState(state: PaneTabsState, record: ClosedTabRecord, isDirty: (tabId: string) => boolean = () => false, now = Date.now()): OpenTabResult {
  const existing = record.tab.kind === "record" ? findRecordTab(state, record.tab) : null;
  if (existing) return { state: activateTabInState(state, existing.id, now), outcome: "activated", tabId: existing.id };
  let paneIndex = state.panes.findIndex((pane) => pane.id === record.paneId);
  if (paneIndex < 0) paneIndex = Math.max(0, state.panes.findIndex((pane) => pane.id === state.active));
  const pane = state.panes[paneIndex];
  const { pinned: _legacyPinned, ...storedTab } = record.tab as PaneTab & { pinned?: boolean };
  const tab: PaneTab = { ...storedTab, id: createPaneId("tab"), lastUsed: now };
  const after = pane.tabs[Math.min(record.index, pane.tabs.length) - 1]?.id ?? null;
  if (!after && pane.tabs.length) {
    // Vložit na začátek.
    const result = insertTabInState(state, paneIndex, tab, null, isDirty);
    if (result.outcome !== "opened") return result;
    const target = result.state.panes[paneIndex];
    const tabs = [tab, ...target.tabs.filter((item) => item.id !== tab.id)];
    return { ...result, state: replacePane(result.state, { ...target, tabs }) };
  }
  return insertTabInState(state, paneIndex, tab, after, isDirty);
}

/** Zavře záložku; aktivní se stane soused vpravo (jinak vlevo), poslední nechá panel prázdný. */
export function closeTabInState(state: PaneTabsState, tabId: string): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const tabs = found.pane.tabs.filter((tab) => tab.id !== tabId);
  let activeTab = found.pane.activeTab;
  const wasActive = activeTab === tabId;
  if (wasActive) activeTab = (tabs[found.tabIndex] ?? tabs[found.tabIndex - 1])?.id ?? null;
  const next = replacePane(state, { ...found.pane, tabs, activeTab });
  // Po zavření aktivní záložky se vrátí na záložku, ze které byla otevřena.
  const opener = found.tab.openerTabId;
  if (wasActive && opener && findTab(next, opener)) {
    const openerFound = findTab(next, opener)!;
    if (openerFound.pane.id === found.pane.id || state.active === found.pane.id) return activateTabInState(next, opener);
  }
  return next;
}

/** Id záložek, které by „Zavřít ostatní“ zavřelo. */
export function otherTabIds(state: PaneTabsState, tabId: string): string[] {
  const found = findTab(state, tabId);
  return found ? found.pane.tabs.filter((tab) => tab.id !== tabId).map((tab) => tab.id) : [];
}

/** Přesune záložku na pozici `index` v cílovém panelu (bez indexu na konec); záložka i panel se aktivují. */
export function moveTabInState(state: PaneTabsState, tabId: string, toPaneId: string, index?: number, now = Date.now()): PaneTabsState {
  const found = findTab(state, tabId);
  const targetPane = state.panes.find((pane) => pane.id === toPaneId);
  if (!found || !targetPane) return state;
  let next = closeTabInState(state, tabId);
  const target = next.panes.find((pane) => pane.id === toPaneId)!;
  if (target.tabs.length >= MAX_TABS_PER_PANE && target.id !== found.pane.id) return state;
  const at = index === undefined ? target.tabs.length : Math.max(0, Math.min(index, target.tabs.length));
  const moved: PaneTab = touch(found.tab, now);
  const tabs = [...target.tabs.slice(0, at), moved, ...target.tabs.slice(at)];
  next = replacePane(next, { ...target, tabs, activeTab: tabId });
  return { ...next, active: toPaneId };
}

/** Kopie záložky se seznamem (u záznamu vrací stav beze změny). */
export function duplicateTabInState(state: PaneTabsState, tabId: string, now = Date.now()): { state: PaneTabsState; tabId?: string } {
  const found = findTab(state, tabId);
  if (!found || found.tab.kind !== "list" || found.pane.tabs.length >= MAX_TABS_PER_PANE) return { state };
  const copy: PaneTab = { ...found.tab, id: createPaneId("tab"), history: [...found.tab.history], lastUsed: now };
  const tabs = [...found.pane.tabs.slice(0, found.tabIndex + 1), copy, ...found.pane.tabs.slice(found.tabIndex + 1)];
  return { state: { ...replacePane(state, { ...found.pane, tabs, activeTab: copy.id }), active: found.pane.id }, tabId: copy.id };
}

/** Krok v historii záložky (-1 zpět, +1 vpřed). */
export function stepTabHistory(state: PaneTabsState, tabId: string, delta: number): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const index = found.tab.historyIndex + delta;
  const entry = found.tab.history[index];
  if (!entry) return state;
  const tab: PaneTab = { ...found.tab, ...entry, icon: entry.icon ?? found.tab.icon, historyIndex: index };
  return replacePane(state, { ...found.pane, tabs: found.pane.tabs.map((item) => (item.id === tabId ? tab : item)) });
}

/** Změna titulku záložky (i v aktuálním kroku historie). */
export function setTabTitleInState(state: PaneTabsState, tabId: string, title: string, shortTitle?: string): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const history = found.tab.history.map((entry, index) => (index === found.tab.historyIndex ? { ...entry, title, shortTitle } : entry));
  const tab: PaneTab = { ...found.tab, title, shortTitle, history };
  return replacePane(state, { ...found.pane, tabs: found.pane.tabs.map((item) => (item.id === tabId ? tab : item)) });
}

/**
 * Sloučí záložky panelu do sousedního (vlevo, u prvního vpravo) a panel odebere.
 * S `limit` zavře nejstarší nerozepsané neaktivní záložky nad MAX_TABS_PER_PANE;
 * když to nestačí, panel limit dočasně překročí. Bez `limit` nic nezavírá.
 */
function mergePaneAway(
  state: PaneTabsState,
  paneIndex: number,
  limit?: { isDirty: (tabId: string) => boolean },
): { state: PaneTabsState; closedTabIds: string[] } {
  if (state.panes.length < 2) return { state, closedTabIds: [] };
  const source = state.panes[paneIndex];
  const targetIndex = paneIndex === 0 ? 1 : paneIndex - 1;
  const target = state.panes[targetIndex];
  let tabs = paneIndex === 0 ? [...source.tabs, ...target.tabs] : [...target.tabs, ...source.tabs];
  const closedTabIds: string[] = [];
  if (limit) {
    const protectedIds = [source.activeTab, target.activeTab].filter((id): id is string => !!id);
    while (tabs.length > MAX_TABS_PER_PANE) {
      const victim = pickEvictionVictim(tabs, limit.isDirty, protectedIds);
      if (!victim) break;
      closedTabIds.push(victim.id);
      tabs = tabs.filter((tab) => tab.id !== victim.id);
    }
  }
  const merged: TabPane = { ...target, tabs, activeTab: target.activeTab ?? source.activeTab };
  const panes = state.panes.map((pane) => (pane.id === target.id ? merged : pane)).filter((pane) => pane.id !== source.id);
  const layout = clampLayout(panes.length);
  return {
    state: { ...state, panes, layout, widths: evenWidths(layout), active: state.active === source.id ? merged.id : state.active },
    closedTabIds,
  };
}

export type SetLayoutResult = { state: PaneTabsState; closedTabIds: string[] };

/** Změní počet panelů a při slučování dodrží limit záložek. */
export function setLayoutWithLimitInState(state: PaneTabsState, layout: PaneLayoutCount, isDirty: (tabId: string) => boolean = () => false): SetLayoutResult {
  let next: PaneTabsState = { ...state, hiddenPanes: null };
  const closedTabIds: string[] = [];
  if (layout > next.panes.length) {
    const added = Array.from({ length: layout - next.panes.length }, emptyPane);
    return { state: { ...next, panes: [...next.panes, ...added], layout, widths: evenWidths(layout), active: added[0].id }, closedTabIds };
  }
  while (next.panes.length > layout) {
    const merged = mergePaneAway(next, next.panes.length - 1, { isDirty });
    next = merged.state;
    closedTabIds.push(...merged.closedTabIds);
  }
  return { state: { ...next, layout, widths: evenWidths(layout) }, closedTabIds };
}

/** Změna počtu panelů: přidané jsou prázdné a první z nich aktivní; ubrané přesunou záložky doleva. */
export function setLayoutInState(state: PaneTabsState, layout: PaneLayoutCount): PaneTabsState {
  return setLayoutWithLimitInState(state, layout).state;
}

/** Zavření panelu: jeho záložky se zavřou; jediný panel zůstane prázdný. */
export function closePaneInState(state: PaneTabsState, paneId: string): PaneTabsState {
  const index = state.panes.findIndex((pane) => pane.id === paneId);
  if (index < 0) return state;
  if (state.panes.length === 1) return { ...state, panes: [{ ...state.panes[0], tabs: [], activeTab: null }], hiddenPanes: null };
  const panes = state.panes.filter((pane) => pane.id !== paneId);
  const adjacentIndex = Math.min(index, panes.length - 1);
  const active = state.active === paneId ? (panes[adjacentIndex]?.id ?? panes[0].id) : state.active;
  const layout = clampLayout(panes.length);
  return { ...state, panes, active, layout, widths: evenWidths(layout), hiddenPanes: null };
}

/**
 * Automatické zúžení podle šířky: uloží rozdějení do hiddenPanes; po zvětšení ho obnoví
 * (jen záložky, které ještě existují; nové záložky zůstanou tam, kde jsou).
 */
export function applyMaxLayout(state: PaneTabsState, maxLayout: PaneLayoutCount): { state: PaneTabsState; notice: "narrowed" | "restored" | null } {
  if (state.layout > maxLayout) {
    const snapshot: HiddenPanesSnapshot = state.hiddenPanes ?? {
      layout: state.layout,
      panes: state.panes.map((pane) => ({ id: pane.id, tabIds: pane.tabs.map((tab) => tab.id), activeTab: pane.activeTab })),
    };
    let next = state;
    // Automatické zúžení nikdy nic nezavírá – panel smí dočasně překročit limit.
    while (next.panes.length > maxLayout) next = mergePaneAway(next, next.panes.length - 1).state;
    return { state: { ...next, hiddenPanes: snapshot }, notice: "narrowed" };
  }
  const snapshot = state.hiddenPanes;
  if (!snapshot || maxLayout < snapshot.layout) return { state, notice: null };
  const allTabs = new Map(state.panes.flatMap((pane) => pane.tabs.map((tab) => [tab.id, tab] as const)));
  const placed = new Set<string>();
  const panes: TabPane[] = snapshot.panes.map((saved) => {
    const tabs = saved.tabIds.map((id) => allTabs.get(id)).filter((tab): tab is PaneTab => !!tab);
    tabs.forEach((tab) => placed.add(tab.id));
    const activeTab = tabs.some((tab) => tab.id === saved.activeTab) ? saved.activeTab : tabs[0]?.id ?? null;
    return { id: saved.id, tabs, activeTab };
  });
  // Záložky otevřené během zúžení zůstanou v panelu, kde jsou (podle pořadí panelu).
  state.panes.forEach((pane, index) => {
    const extra = pane.tabs.filter((tab) => !placed.has(tab.id));
    if (!extra.length) return;
    const target = panes[index] ?? panes[panes.length - 1];
    target.tabs = [...target.tabs, ...extra];
    target.activeTab = target.activeTab ?? extra[0].id;
  });
  const activeTab = activeTabOf(state);
  const activePane = panes.find((pane) => activeTab && pane.tabs.some((tab) => tab.id === activeTab.id)) ?? panes[0];
  return {
    state: { ...state, panes, layout: snapshot.layout, widths: evenWidths(snapshot.layout), active: activePane.id, hiddenPanes: null },
    notice: "restored",
  };
}

/** Převod ze starého formátu v1: každý panel = jedna záložka, prázdný panel zůstane prázdný. */
export function migratePaneStateV1(v1: PaneLayoutStateV1, now = Date.now()): PaneTabsState {
  const source = v1.panes.length ? v1.panes : [{ id: createPaneId("pane"), route: "" }];
  const panes: TabPane[] = source.map((pane) => {
    if (!pane.route) return { id: pane.id, activeTab: null, tabs: [] };
    const tab = createTab({ route: pane.route, params: pane.params, title: pane.title, kind: pane.uniqueKey ? "record" : "list" }, now);
    return { id: pane.id, activeTab: tab.id, tabs: [tab] };
  });
  const layout = clampLayout(Math.min(v1.layout, panes.length));
  const visible = panes.slice(0, layout);
  // Panely za hranicí rozložení se sloučí do posledního viditelného.
  panes.slice(layout).forEach((pane) => {
    const last = visible[visible.length - 1];
    last.tabs = [...last.tabs, ...pane.tabs];
    last.activeTab = last.activeTab ?? pane.activeTab;
  });
  const active = visible.some((pane) => pane.id === v1.activePaneId) ? v1.activePaneId : visible[0].id;
  return { version: 2, layout, widths: v1.widths?.length === layout ? v1.widths : evenWidths(layout), active, panes: visible, hiddenPanes: null };
}

/** Plná serializace pro uložení do databáze. */
export function serializePaneTabs(state: PaneTabsState): string {
  return JSON.stringify(normalizePaneTabsState(state));
}

/** Obnovení ze serializované podoby; formát v1 převede automaticky. Při chybě vrací null. */
export function parsePaneTabs(value: string | null | undefined): PaneTabsState | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(value);
    if (raw && raw.version === 2 && Array.isArray(raw.panes) && raw.panes.length) {
      const state = normalizePaneTabsState(raw as PaneTabsState);
      const layout = clampLayout(state.panes.length);
      const active = state.panes.some((pane) => pane.id === state.active) ? state.active : state.panes[0].id;
      return { ...state, layout, active, widths: state.widths?.length === layout ? state.widths : evenWidths(layout) };
    }
    // Starý formát v1 (serializePanes do 2.11).
    if (raw && Array.isArray(raw.p)) {
      const panes: PaneStateV1[] = raw.p
        .filter((pane: { r?: unknown }) => typeof pane.r === "string")
        .map((pane: { i?: string; r: string; q?: Record<string, unknown>; t?: string; u?: boolean }, index: number) => ({
          id: pane.i ?? `pane-${index + 1}`,
          route: pane.r,
          params: pane.q,
          title: pane.t,
          uniqueKey: pane.u,
        }));
      if (!panes.length) return null;
      return migratePaneStateV1({ panes, activePaneId: raw.a, layout: clampLayout(raw.l ?? 1), widths: raw.w });
    }
    return null;
  } catch {
    return null;
  }
}

/** Krátká serializace do URL – jen aktivní záložka aktivního panelu. */
export function serializeActiveTabUrl(state: PaneTabsState): string {
  const tab = activeTabOf(state);
  if (!tab) return "";
  return JSON.stringify({ v: 2, r: tab.route, q: tab.params, k: tab.kind, rk: tab.recordKey, t: tab.title });
}

/** Obnovení z URL: jeden panel s jednou záložkou. */
export function parseActiveTabUrl(value: string | null | undefined): PaneTabsState | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(value) as { r?: string; q?: Record<string, unknown>; k?: TabKind; rk?: string; t?: string };
    if (!raw.r) return null;
    const state = createPaneTabsState(1);
    return openTabInState(state, { route: raw.r, params: raw.q, kind: raw.k, recordKey: raw.rk, title: raw.t, target: "newTab" }).state;
  } catch {
    return null;
  }
}

/**
 * Ignoruje staré pole `pinned` z 2.16.0 a doplní `openerTabId`.
 */
export function normalizePaneTabsState(state: PaneTabsState): PaneTabsState {
  return {
    ...state,
    panes: state.panes.map((pane) => ({
      ...pane,
      tabs: pane.tabs.map((tab) => {
        const { pinned: _legacyPinned, ...current } = tab as PaneTab & { pinned?: boolean };
        return { ...current, openerTabId: current.openerTabId ?? null };
      }),
    })),
  };
}

// ---------------------------------------------------------------------------
// Uložená rozložení

/** Záložka v uloženém rozložení (bez konceptů). */
export type LayoutSnapshotTab = {
  route: string;
  params?: Record<string, unknown>;
  kind: TabKind;
  recordKey?: string;
  title?: string;
  shortTitle?: string;
  icon?: string;
  /** Stav gridu bez dočasného zoomu formulářových gridů. */
  grid?: unknown;
};

export type LayoutSnapshot = {
  version: 1;
  layout: PaneLayoutCount;
  widths?: number[];
  activePane: number;
  panes: { activeIndex: number; tabs: LayoutSnapshotTab[] }[];
};

/**
 * Snímek rozložení pro uložení: záložky (route, params, stav gridu), aktivní záložka, šířky a počet panelů.
 * Bez konceptů a bez nových, dosud neuložených záznamů.
 */
export function serializeLayout(state: PaneTabsState, getGridState: (tabId: string) => unknown = () => undefined): LayoutSnapshot {
  const activePane = Math.max(0, state.panes.findIndex((pane) => pane.id === state.active));
  return {
    version: 1,
    layout: state.layout,
    widths: state.widths,
    activePane,
    panes: state.panes.map((pane) => {
      const tabs = pane.tabs.filter((tab) => !tab.isNew);
      return {
        activeIndex: Math.max(0, tabs.findIndex((tab) => tab.id === pane.activeTab)),
        tabs: tabs.map((tab) => {
          const grid = getGridState(tab.id);
          return {
            route: tab.route,
            params: tab.params,
            kind: tab.kind,
            recordKey: tab.recordKey,
            title: tab.title,
            shortTitle: tab.shortTitle,
            icon: tab.icon,
            ...(grid !== undefined ? { grid } : {}),
          };
        }),
      };
    }),
  };
}

export type ApplyLayoutResult = {
  state: PaneTabsState;
  /** Záložky s neuloženými změnami, které se nezavřely (přesunuté na konec panelu 1). */
  skipped: PaneTab[];
  /** Zavřené čisté záložky. */
  closedTabIds: string[];
  /** Stav gridu pro nově vytvořené záložky. */
  gridStates: { tabId: string; grid: unknown }[];
};

/** Použije uložené rozložení: čisté záložky zavře, rozepsané přesune na konec panelu 1. */
export function applyLayoutInState(
  state: PaneTabsState,
  snapshot: LayoutSnapshot,
  options: { keepDirty?: boolean } = {},
  isDirty: (tabId: string) => boolean = () => false,
  now = Date.now(),
): ApplyLayoutResult {
  const keepDirty = options.keepDirty !== false;
  const all = state.panes.flatMap((pane) => pane.tabs);
  const skipped = keepDirty ? all.filter((tab) => isDirty(tab.id)) : [];
  const closedTabIds = all.filter((tab) => !skipped.some((item) => item.id === tab.id)).map((tab) => tab.id);
  const gridStates: ApplyLayoutResult["gridStates"] = [];
  const layout = clampLayout(snapshot.panes.length || snapshot.layout);
  const panes: TabPane[] = Array.from({ length: layout }, (_, index) => {
    const saved = snapshot.panes[index];
    const tabs = (saved?.tabs ?? []).slice(0, MAX_TABS_PER_PANE).map((item) => {
      const tab = createTab(item, now);
      if (item.grid !== undefined) gridStates.push({ tabId: tab.id, grid: item.grid });
      return tab;
    });
    return { id: createPaneId("pane"), tabs, activeTab: tabs[saved?.activeIndex ?? 0]?.id ?? tabs[0]?.id ?? null };
  });
  if (skipped.length) {
    const recordKeys = new Set(skipped.filter((tab) => tab.kind === "record").map((tab) => recordKeyOf(tab)));
    panes.forEach((pane) => {
      pane.tabs = pane.tabs.filter((tab) => !(tab.kind === "record" && recordKeys.has(recordKeyOf(tab))));
      if (!pane.tabs.some((tab) => tab.id === pane.activeTab)) pane.activeTab = pane.tabs[0]?.id ?? null;
    });
    panes[0].tabs = [...panes[0].tabs, ...skipped];
    panes[0].activeTab = panes[0].activeTab ?? skipped[0].id;
  }
  const activeIndex = Math.min(Math.max(0, snapshot.activePane ?? 0), panes.length - 1);
  const widths = snapshot.widths?.length === layout ? snapshot.widths : evenWidths(layout);
  return {
    state: { version: 2, layout, widths, active: panes[activeIndex].id, panes, hiddenPanes: null },
    skipped,
    closedTabIds,
    gridStates,
  };
}
