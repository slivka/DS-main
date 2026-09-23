import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { PaneApiContext, PaneManagerContext, type PaneApi, type PaneManagerApi } from "./pane-context";
import {
  evenWidths,
  paneKey,
  type PaneLayoutCount,
  type PaneLayoutState,
  type PaneState,
  type PaneTarget,
} from "./pane-state";

export type PaneLayoutTexts = {
  back: string;
  forward: string;
  close: string;
  maximize: string;
  restore: string;
  /** {index} se nahradí pořadím panelu. */
  hidden: string;
  unsavedTitle: string;
  unsavedDescription: string;
  unsavedConfirm: string;
  unsavedCancel: string;
  untitled: string;
};

export const DEFAULT_PANE_TEXTS: PaneLayoutTexts = {
  back: "Zpět",
  forward: "Vpřed",
  close: "Zavřít panel",
  maximize: "Maximalizovat",
  restore: "Obnovit",
  hidden: "Panel {index} skryt – málo místa",
  unsavedTitle: "Neuložené změny",
  unsavedDescription: "V panelu jsou neuložené změny. Opravdu chcete pokračovat?",
  unsavedConfirm: "Zahodit změny",
  unsavedCancel: "Zpět k editaci",
  untitled: "Bez názvu",
};

type HistoryEntry = { route: string; params?: Record<string, unknown>; title?: string };
type History = { entries: HistoryEntry[]; index: number };

export const PANE_DIVIDER_WIDTH = 8;

/** Nejvyšší dostupné rozložení pro danou šířku a měřítko písma. */
export function maxPaneLayout(width: number, minPaneWidth: number, fontScale = 1): PaneLayoutCount {
  if (width < 768) return 1;
  const effective = width / (fontScale || 1);
  const fits = (count: number) => effective >= count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH;
  if (fits(3)) return 3;
  if (fits(2)) return 2;
  return 1;
}

/** Potřebná šířka okna (v px) pro dané rozložení. */
export function requiredPaneWidth(count: number, minPaneWidth: number, fontScale = 1) {
  return (count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH) * (fontScale || 1);
}

function useFontScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const read = () => {
      const size = parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
      setScale(size / 16 || 1);
    };
    read();
    window.addEventListener("app:font-scale", read as EventListener);
    return () => window.removeEventListener("app:font-scale", read as EventListener);
  }, []);
  return scale;
}

export interface PaneLayoutProps {
  panes: PaneState[];
  activePaneId: string;
  layout: PaneLayoutCount;
  widths?: number[];
  onChange: (state: PaneLayoutState) => void;
  minPaneWidth?: number;
  renderPane: (pane: PaneState) => ReactNode;
  /** Výchozí stránka po zavření posledního panelu. */
  defaultRoute: string;
  defaultTitle?: string;
  texts?: Partial<PaneLayoutTexts>;
  className?: string;
}

/** Režim více oken – 1 až 3 panely s vlastní historií, lištou a dělicími čarami. */
export function PaneLayout({
  panes,
  activePaneId,
  layout,
  widths,
  onChange,
  minPaneWidth = 560,
  renderPane,
  defaultRoute,
  defaultTitle,
  texts,
  className,
}: PaneLayoutProps) {
  const t = { ...DEFAULT_PANE_TEXTS, ...texts };
  const { confirm, confirmDialog } = useConfirmDialog();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const fontScale = useFontScale();
  const [maximized, setMaximized] = useState<string | null>(null);
  const historiesRef = useRef(new Map<string, History>());
  const dirtyRef = useRef(new Map<string, Set<string>>());
  const [, force] = useState(0);
  const rerender = () => force((value) => value + 1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(element);
    setContainerWidth(element.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const maxLayout = containerWidth ? maxPaneLayout(containerWidth, minPaneWidth, fontScale) : layout;
  const visibleCount = Math.min(layout, maxLayout, panes.length) as PaneLayoutCount;
  const requestedRef = useRef(layout);
  if (layout > requestedRef.current) requestedRef.current = layout;

  // Panel bez historie dostane záznam podle svého stavu.
  panes.forEach((pane) => {
    if (!historiesRef.current.has(pane.id)) {
      historiesRef.current.set(pane.id, {
        entries: [{ route: pane.route, params: pane.params, title: pane.title }],
        index: 0,
      });
    }
  });

  const emit = useCallback(
    (next: Partial<PaneLayoutState>) =>
      onChange({
        panes,
        activePaneId,
        layout,
        widths,
        ...next,
      }),
    [onChange, panes, activePaneId, layout, widths],
  );

  // Automatické snížení počtu viditelných panelů při zmenšení okna.
  const reportedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!containerWidth) return;
    if (layout > maxLayout) {
      if (reportedRef.current !== maxLayout) {
        reportedRef.current = maxLayout;
        for (let index = maxLayout + 1; index <= layout; index += 1) {
          toast.info(t.hidden.replace("{index}", String(index)));
        }
      }
      emit({ layout: maxLayout as PaneLayoutCount, widths: evenWidths(maxLayout) });
    } else if (layout < requestedRef.current && maxLayout >= requestedRef.current) {
      reportedRef.current = null;
      emit({ layout: requestedRef.current as PaneLayoutCount, widths: evenWidths(requestedRef.current) });
    }
  }, [containerWidth, maxLayout, layout]);

  const isDirty = (paneId: string) => (dirtyRef.current.get(paneId)?.size ?? 0) > 0;
  const guard = (paneId: string, action: () => void) => {
    if (!isDirty(paneId)) {
      action();
      return;
    }
    confirm({
      title: t.unsavedTitle,
      description: t.unsavedDescription,
      confirmLabel: t.unsavedConfirm,
      cancelLabel: t.unsavedCancel,
      destructive: true,
      onConfirm: () => {
        dirtyRef.current.delete(paneId);
        action();
      },
    });
  };

  const syncPane = (paneId: string, entry: HistoryEntry) =>
    emit({
      activePaneId: paneId,
      panes: panes.map((pane) =>
        pane.id === paneId ? { ...pane, route: entry.route, params: entry.params, title: entry.title } : pane,
      ),
    });

  const navigateInPane = (paneId: string, route: string, params?: Record<string, unknown>, title?: string) =>
    guard(paneId, () => {
      const history = historiesRef.current.get(paneId) ?? { entries: [], index: -1 };
      const entries = [...history.entries.slice(0, history.index + 1), { route, params, title }];
      historiesRef.current.set(paneId, { entries, index: entries.length - 1 });
      syncPane(paneId, entries[entries.length - 1]);
      rerender();
    });

  const step = (paneId: string, delta: number) =>
    guard(paneId, () => {
      const history = historiesRef.current.get(paneId);
      if (!history) return;
      const index = history.index + delta;
      if (index < 0 || index >= history.entries.length) return;
      historiesRef.current.set(paneId, { ...history, index });
      syncPane(paneId, history.entries[index]);
      rerender();
    });

  const closePane = (paneId: string) =>
    guard(paneId, () => {
      historiesRef.current.delete(paneId);
      dirtyRef.current.delete(paneId);
      const rest = panes.filter((pane) => pane.id !== paneId);
      if (!rest.length) {
        const fallback: PaneState = { id: `pane-${Date.now()}`, route: defaultRoute, title: defaultTitle };
        requestedRef.current = 1;
        emit({ panes: [fallback], activePaneId: fallback.id, layout: 1, widths: evenWidths(1) });
        return;
      }
      const nextLayout = Math.min(layout, rest.length) as PaneLayoutCount;
      requestedRef.current = nextLayout;
      emit({
        panes: rest,
        activePaneId: activePaneId === paneId ? rest[0].id : activePaneId,
        layout: nextLayout,
        widths: evenWidths(Math.min(nextLayout, rest.length)),
      });
      setMaximized(null);
    });

  const setLayout = (next: PaneLayoutCount) => {
    requestedRef.current = next;
    emit({ layout: next, widths: evenWidths(Math.min(next, Math.max(panes.length, 1))) });
  };

  const openInPane = (
    route: string,
    params?: Record<string, unknown>,
    options?: { target?: PaneTarget; title?: string; uniqueKey?: boolean },
  ) => {
    const target: PaneTarget = options?.target ?? "active";
    const key = paneKey({ route, params });
    const existing = panes.find((pane) => pane.uniqueKey && paneKey(pane) === key);
    if (existing) {
      emit({ activePaneId: existing.id });
      return;
    }
    if (target === "new") {
      const nextLayout = Math.min(Math.max(layout, panes.length + 1), maxLayout) as PaneLayoutCount;
      if (panes.length >= 3 || nextLayout <= panes.length) {
        // Není místo – nahradí nejstarší neaktivní panel.
        const victim = panes.find((pane) => pane.id !== activePaneId) ?? panes[0];
        navigateInPane(victim.id, route, params, options?.title);
        emit({ activePaneId: victim.id });
        return;
      }
      const pane: PaneState = {
        id: `pane-${Date.now()}`,
        route,
        params,
        title: options?.title,
        uniqueKey: options?.uniqueKey,
      };
      historiesRef.current.set(pane.id, { entries: [{ route, params, title: options?.title }], index: 0 });
      requestedRef.current = nextLayout;
      emit({
        panes: [...panes, pane],
        activePaneId: pane.id,
        layout: nextLayout,
        widths: evenWidths(nextLayout),
      });
      return;
    }
    const paneId = target === "active" ? activePaneId : target;
    if (options?.uniqueKey) {
      const pane = panes.find((item) => item.id === paneId);
      if (pane) emit({ panes: panes.map((item) => (item.id === paneId ? { ...item, uniqueKey: true } : item)) });
    }
    navigateInPane(paneId, route, params, options?.title);
  };

  const manager: PaneManagerApi = {
    activePaneId,
    layout,
    setLayout,
    setActivePane: (paneId) => emit({ activePaneId: paneId }),
    openInPane,
    closePane,
    confirmAllPanesClean: (onConfirmed) => {
      const dirtyPane = panes.find((pane) => isDirty(pane.id));
      if (!dirtyPane) {
        onConfirmed();
        return;
      }
      confirm({
        title: t.unsavedTitle,
        description: t.unsavedDescription,
        confirmLabel: t.unsavedConfirm,
        cancelLabel: t.unsavedCancel,
        destructive: true,
        onConfirm: () => {
          dirtyRef.current.clear();
          onConfirmed();
        },
      });
    },
    registerDirty: (paneId, key, dirty) => {
      const set = dirtyRef.current.get(paneId) ?? new Set<string>();
      if (dirty) set.add(key);
      else set.delete(key);
      dirtyRef.current.set(paneId, set);
    },
  };

  // Globální zkratky Ctrl+1/2/3 a Ctrl+Shift+W.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (event.shiftKey && event.key.toLowerCase() === "w") {
        event.preventDefault();
        closePane(activePaneId);
        return;
      }
      if (event.shiftKey) return;
      const index = Number(event.key);
      if (!Number.isInteger(index) || index < 1 || index > 3) return;
      const pane = panes[index - 1];
      if (!pane) return;
      event.preventDefault();
      emit({ activePaneId: pane.id });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Tisk jen aktivního panelu.
  useEffect(() => {
    const onBefore = () => {
      document.querySelectorAll<HTMLElement>("[data-pane]").forEach((element) => {
        element.setAttribute("data-print-hide", element.dataset.pane === activePaneId ? "false" : "true");
      });
    };
    const onAfter = () => {
      document.querySelectorAll<HTMLElement>("[data-pane]").forEach((element) => element.removeAttribute("data-print-hide"));
    };
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
    };
  }, [activePaneId]);

  const visiblePanes = panes.slice(0, visibleCount);
  const shownPanes = maximized ? visiblePanes.filter((pane) => pane.id === maximized) : visiblePanes;
  const resolvedWidths = useMemo(() => {
    if (shownPanes.length === 1) return [1];
    const base = widths && widths.length === shownPanes.length ? widths : evenWidths(shownPanes.length);
    const sum = base.reduce((total, value) => total + value, 0) || 1;
    return base.map((value) => value / sum);
  }, [widths, shownPanes.length]);

  const dragRef = useRef<{ index: number; startX: number; widths: number[] } | null>(null);
  const onDividerDown = (index: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    dragRef.current = { index, startX: event.clientX, widths: resolvedWidths };
    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !containerRef.current) return;
      const total = containerRef.current.getBoundingClientRect().width;
      const delta = (moveEvent.clientX - drag.startX) / total;
      const next = [...drag.widths];
      const minShare = (minPaneWidth * fontScale) / total;
      const left = next[drag.index] + delta;
      const right = next[drag.index + 1] - delta;
      if (left < minShare || right < minShare) return;
      next[drag.index] = left;
      next[drag.index + 1] = right;
      emit({ widths: next });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <PaneManagerContext.Provider value={manager}>
      <div ref={containerRef} className={cn("flex min-h-0 w-full flex-1 items-stretch", className)}>
        {shownPanes.map((pane, index) => {
          const history = historiesRef.current.get(pane.id);
          const api: PaneApi = {
            paneId: pane.id,
            isActive: pane.id === activePaneId,
            navigate: (route, params, title) => navigateInPane(pane.id, route, params, title),
            back: () => step(pane.id, -1),
            forward: () => step(pane.id, 1),
            canBack: (history?.index ?? 0) > 0,
            canForward: history ? history.index < history.entries.length - 1 : false,
            setTitle: (title) => emit({ panes: panes.map((item) => (item.id === pane.id ? { ...item, title } : item)) }),
            close: () => closePane(pane.id),
          };
          return (
            <div key={pane.id} className="flex min-w-0" style={{ flex: `${resolvedWidths[index] ?? 1} 1 0%` }}>
              <section
                data-pane={pane.id}
                data-active={api.isActive ? "true" : undefined}
                onPointerDownCapture={() => {
                  if (!api.isActive) emit({ activePaneId: pane.id });
                }}
                className={cn(
                  "@container relative flex min-w-0 flex-1 flex-col overflow-hidden border-r bg-background last:border-r-0",
                  api.isActive ? "border-t-2 border-t-primary" : "border-t-2 border-t-transparent",
                )}
              >
                <PaneHeader api={api} title={pane.title ?? t.untitled} texts={t} maximized={maximized === pane.id} onToggleMaximize={() => setMaximized(maximized === pane.id ? null : pane.id)} />
                <div className="min-h-0 flex-1 overflow-auto p-4">
                  <PaneApiContext.Provider value={api}>{renderPane(pane)}</PaneApiContext.Provider>
                </div>
              </section>
              {index < shownPanes.length - 1 ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  onPointerDown={onDividerDown(index)}
                  onDoubleClick={() => emit({ widths: evenWidths(shownPanes.length) })}
                  className="w-2 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40"
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {confirmDialog}
    </PaneManagerContext.Provider>
  );
}

function PaneHeader({
  api,
  title,
  texts,
  maximized,
  onToggleMaximize,
}: {
  api: PaneApi;
  title: string;
  texts: PaneLayoutTexts;
  maximized: boolean;
  onToggleMaximize: () => void;
}) {
  const iconButton = (label: string, icon: ReactNode, onClick: () => void, disabled?: boolean) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={label} disabled={disabled} onClick={onClick}>
            {icon}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div className="flex h-10 shrink-0 items-center gap-1 border-b bg-muted/60 px-2">
        {iconButton(texts.back, <ArrowLeft className="size-4" />, api.back, !api.canBack)}
        {iconButton(texts.forward, <ArrowRight className="size-4" />, api.forward, !api.canForward)}
        <span className="min-w-0 flex-1 truncate px-1 text-sm font-semibold">{title}</span>
        {iconButton(maximized ? texts.restore : texts.maximize, maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />, onToggleMaximize)}
        {iconButton(texts.close, <X className="size-4" />, api.close)}
      </div>
    </TooltipProvider>
  );
}
