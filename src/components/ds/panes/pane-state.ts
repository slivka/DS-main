/** Stav jednoho panelu v režimu více oken. */
export type PaneState = {
  id: string;
  route: string;
  params?: Record<string, unknown>;
  title?: string;
  /** Záznam smí být otevřený jen v jednom panelu. */
  uniqueKey?: boolean;
};

export type PaneLayoutCount = 1 | 2 | 3;

export type PaneLayoutState = {
  panes: PaneState[];
  activePaneId: string;
  layout: PaneLayoutCount;
  /** Podíly šířek viditelných panelů (součet 1). */
  widths?: number[];
};

export type PaneTarget = "active" | "new" | (string & {});

const stableParams = (params?: Record<string, unknown>) => {
  if (!params) return "";
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
};

/** Klíč pro porovnání, zda je stejný záznam už otevřený v jiném panelu. */
export function paneKey(pane: { route: string; params?: Record<string, unknown> }): string | null {
  if (!pane.route) return null;
  const query = stableParams(pane.params);
  return query ? `${pane.route}?${query}` : pane.route;
}

/** Serializace rozložení do řetězce pro URL i pro uložení do databáze. */
export function serializePanes(state: PaneLayoutState): string {
  return JSON.stringify({
    l: state.layout,
    a: state.activePaneId,
    w: state.widths,
    p: state.panes.map((pane) => ({
      i: pane.id,
      r: pane.route,
      q: pane.params,
      t: pane.title,
      u: pane.uniqueKey,
    })),
  });
}

/** Obnovení rozložení ze serializovaného řetězce; při chybě vrací null. */
export function parsePanes(value: string | null | undefined): PaneLayoutState | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(value) as {
      l?: number;
      a?: string;
      w?: number[];
      p?: { i?: string; r?: string; q?: Record<string, unknown>; t?: string; u?: boolean }[];
    };
    const panes: PaneState[] = (raw.p ?? [])
      .filter((pane) => typeof pane.r === "string")
      .map((pane, index) => ({
        id: pane.i ?? `pane-${index + 1}`,
        route: pane.r as string,
        params: pane.q,
        title: pane.t,
        uniqueKey: pane.u,
      }));
    if (!panes.length) return null;
    const layout = (raw.l === 2 || raw.l === 3 ? raw.l : 1) as PaneLayoutCount;
    const activePaneId = panes.some((pane) => pane.id === raw.a) ? (raw.a as string) : panes[0].id;
    return { panes, activePaneId, layout, widths: Array.isArray(raw.w) ? raw.w : undefined };
  } catch {
    return null;
  }
}

/** Rovnoměrné rozdělení šířek pro daný počet panelů. */
export function evenWidths(count: number): number[] {
  return Array.from({ length: count }, () => 1 / count);
}
