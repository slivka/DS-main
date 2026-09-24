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
};

export type TabPane = {
  id: string;
  activeTab: string | null;
  tabs: PaneTab[];
};

/** Uložené rozdělení záložek před automatickým zúžením podle šířky. */
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

/** Rovnoměrné rozdělení šířek pro daný počet panelů. */
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
};

/** Vytvoří novou záložku s jedním krokem historie. */
export function createTab(input: CreateTabInput, now = Date.now()): PaneTab {
  const entry: TabHistoryEntry = { route: input.route, params: input.params, title: input.title, shortTitle: input.shortTitle };
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
    const entry: TabHistoryEntry = { route: input.route, params: input.params, title: input.title, shortTitle: input.shortTitle };
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

  let tabs = pane.tabs;
  let evictedTabId: string | undefined;
  if (tabs.length >= MAX_TABS_PER_PANE) {
    const victim = [...tabs].filter((tab) => !isDirty(tab.id)).sort((a, b) => a.lastUsed - b.lastUsed)[0];
    if (!victim) return { state, outcome: "rejected" };
    evictedTabId = victim.id;
    tabs = tabs.filter((tab) => tab.id !== victim.id);
  }
  const tab = createTab(input, now);
  const activeIndex = tabs.findIndex((item) => item.id === pane.activeTab);
  const insertAt = activeIndex >= 0 ? activeIndex + 1 : tabs.length;
  const nextTabs = [...tabs.slice(0, insertAt), tab, ...tabs.slice(insertAt)];
  return {
    state: { ...replacePane(state, { ...pane, tabs: nextTabs, activeTab: tab.id }), active: pane.id },
    outcome: "opened",
    tabId: tab.id,
    evictedTabId,
  };
}

/** Zavře záložku; aktivní se stane soused vpravo (jinak vlevo), poslední nechá panel prázdný. */
export function closeTabInState(state: PaneTabsState, tabId: string): PaneTabsState {
  const found = findTab(state, tabId);
  if (!found) return state;
  const tabs = found.pane.tabs.filter((tab) => tab.id !== tabId);
  let activeTab = found.pane.activeTab;
  if (activeTab === tabId) activeTab = (tabs[found.tabIndex] ?? tabs[found.tabIndex - 1])?.id ?? null;
  return replacePane(state, { ...found.pane, tabs, activeTab });
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
  const tabs = [...target.tabs.slice(0, at), touch(found.tab, now), ...target.tabs.slice(at)];
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
  const tab: PaneTab = { ...found.tab, ...entry, historyIndex: index };
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

/** Sloučí záložky panelu do sousedního (vlevo, u prvního vpravo) a panel odebere. */
function mergePaneAway(state: PaneTabsState, paneIndex: number): PaneTabsState {
  if (state.panes.length < 2) return state;
  const source = state.panes[paneIndex];
  const targetIndex = paneIndex === 0 ? 1 : paneIndex - 1;
  const target = state.panes[targetIndex];
  const tabs = paneIndex === 0 ? [...source.tabs, ...target.tabs] : [...target.tabs, ...source.tabs];
  const merged: TabPane = { ...target, tabs, activeTab: target.activeTab ?? source.activeTab };
  const panes = state.panes.map((pane) => (pane.id === target.id ? merged : pane)).filter((pane) => pane.id !== source.id);
  const layout = clampLayout(panes.length);
  return {
    ...state,
    panes,
    layout,
    widths: evenWidths(layout),
    active: state.active === source.id ? merged.id : state.active,
  };
}

/** Změna počtu panelů: přidané jsou prázdné a první z nich aktivní; ubrané přesunou záložky doleva. */
export function setLayoutInState(state: PaneTabsState, layout: PaneLayoutCount): PaneTabsState {
  let next: PaneTabsState = { ...state, hiddenPanes: null };
  if (layout > next.panes.length) {
    const added = Array.from({ length: layout - next.panes.length }, emptyPane);
    return { ...next, panes: [...next.panes, ...added], layout, widths: evenWidths(layout), active: added[0].id };
  }
  while (next.panes.length > layout) next = mergePaneAway(next, next.panes.length - 1);
  return { ...next, layout, widths: evenWidths(layout) };
}

/** Zavření panelu: záložky se přesunou do sousedního. U jediného panelu se záložky zavřou. */
export function closePaneInState(state: PaneTabsState, paneId: string): PaneTabsState {
  const index = state.panes.findIndex((pane) => pane.id === paneId);
  if (index < 0) return state;
  if (state.panes.length === 1) return { ...state, panes: [{ ...state.panes[0], tabs: [], activeTab: null }], hiddenPanes: null };
  return { ...mergePaneAway(state, index), hiddenPanes: null };
}

/**
 * Automatické zúžení podle šířky: uloží rozdělení do hiddenPanes; po zvětšení ho obnoví
 * (jen záložky, které ještě existují; nové záložky zůstanou tam, kde jsou).
 */
export function applyMaxLayout(state: PaneTabsState, maxLayout: PaneLayoutCount): { state: PaneTabsState; notice: "narrowed" | "restored" | null } {
  if (state.layout > maxLayout) {
    const snapshot: HiddenPanesSnapshot = state.hiddenPanes ?? {
      layout: state.layout,
      panes: state.panes.map((pane) => ({ id: pane.id, tabIds: pane.tabs.map((tab) => tab.id), activeTab: pane.activeTab })),
    };
    let next = state;
    while (next.panes.length > maxLayout) next = mergePaneAway(next, next.panes.length - 1);
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
  return JSON.stringify(state);
}

/** Obnovení ze serializované podoby; formát v1 převede automaticky. Při chybě vrací null. */
export function parsePaneTabs(value: string | null | undefined): PaneTabsState | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(value);
    if (raw && raw.version === 2 && Array.isArray(raw.panes) && raw.panes.length) {
      const state = raw as PaneTabsState;
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
