/** Rozložení a přetažení panelů · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { APP_ZOOM_EVENT, getAppZoom } from "../../../lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT, startPointerDrag } from "../../../lib/resize-lock";
import { type PaneTabsApi } from "./pane-context";

import { evenWidths, findTab, type PaneTab } from "./pane-state";

import type { PaneLayoutProps } from "./pane-layout-types";
import { DEFAULT_PANE_TEXTS, maxPaneLayout, requiredPaneWidth } from "./pane-layout-utils";
import { PaneColumn } from "./pane-column";
function useAppZoomScale() {
  const [scale, setScale] = useState(getAppZoom);
  useEffect(() => {
    const read = () => setScale(getAppZoom());
    read();
    window.addEventListener(APP_ZOOM_EVENT, read as EventListener);
    return () => window.removeEventListener(APP_ZOOM_EVENT, read as EventListener);
  }, []);
  return scale;
}

export function PaneLayoutInner({
  api,
  renderTab,
  renderLinkedPanel,
  getTabIcon,
  renderEmpty,
  minPaneWidth,
  texts,
  className,
  rootRef,
}: PaneLayoutProps & {
  api: PaneTabsApi;
  minPaneWidth: number;
  rootRef: React.Ref<HTMLDivElement>;
}) {
  const { state } = api;
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_PANE_TEXTS, ...dsTexts.paneChrome, ...dsTexts.panes, ...texts };
  const emptyHint = t.emptyHint;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [draftWidths, setDraftWidths] = useState<number[] | null>(null);
  const fontScale = useAppZoomScale();
  const maximizedIndex =
    api.maximized !== null && state.panes[api.maximized] ? api.maximized : null;
  const maximized = maximizedIndex !== null ? state.panes[maximizedIndex].id : null;
  const collision: CollisionDetection = (args) => {
    // Rozhoduje místo, kde je ukazatel; plocha panelu má přednost před záložkami jiného panelu.
    const hits = pointerWithin(args);
    return hits.length ? hits : closestCenter(args);
  };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => {
      if (isResizeLocked()) return;
      const width = element.getBoundingClientRect().width;
      if (width > 0) setContainerWidth(width);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    window.addEventListener(RESIZE_END_EVENT, update);
    return () => {
      observer.disconnect();
      window.removeEventListener(RESIZE_END_EVENT, update);
    };
  }, []);

  const maxLayout = containerWidth ? maxPaneLayout(containerWidth, minPaneWidth, fontScale) : null;
  useEffect(() => {
    if (maxLayout) api.reportMaxLayout(maxLayout);
  }, [maxLayout, state.layout]);

  // Tisk jen aktivního panelu.
  useEffect(() => {
    const onBefore = () => {
      document.querySelectorAll<HTMLElement>("[data-pane]").forEach((element) => {
        element.setAttribute(
          "data-print-hide",
          element.dataset.pane === state.active ? "false" : "true",
        );
      });
    };
    const onAfter = () =>
      document
        .querySelectorAll<HTMLElement>("[data-pane]")
        .forEach((element) => element.removeAttribute("data-print-hide"));
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
    };
  }, [state.active]);

  const shownPanes = maximized ? state.panes.filter((pane) => pane.id === maximized) : state.panes;
  const resolvedWidths = useMemo(() => {
    if (draftWidths?.length === shownPanes.length) return draftWidths;
    if (shownPanes.length === 1) return [1];
    const base =
      state.widths && state.widths.length === shownPanes.length
        ? state.widths
        : evenWidths(shownPanes.length);
    const sum = base.reduce((total, value) => total + value, 0) || 1;
    return base.map((value) => value / sum);
  }, [draftWidths, state.widths, shownPanes.length]);

  const onDividerDown = (index: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    const start = { x: event.clientX, widths: resolvedWidths };
    let finalWidths = start.widths;
    const onMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const total = containerRef.current.getBoundingClientRect().width;
      const delta = (moveEvent.clientX - start.x) / total;
      const next = [...start.widths];
      const minShare = (minPaneWidth * fontScale) / total;
      const left = next[index] + delta;
      const right = next[index + 1] - delta;
      if (left < minShare || right < minShare) return;
      next[index] = left;
      next[index + 1] = right;
      finalWidths = next;
      setDraftWidths(next);
    };
    startPointerDrag(event, {
      onMove,
      onEnd: () => {
        setDraftWidths(null);
        onWidths(finalWidths);
      },
    });
  };
  const onWidths = (widths: number[]) => api.setWidths(widths);

  const onDragEnd = (event: DragEndEvent) => {
    // Úchyt v nadpisu stránky má id "header:<tabId>" a tabId v datech.
    const tabId = String(
      (event.active.data.current as { tabId?: string } | undefined)?.tabId ?? event.active.id,
    );
    const over = event.over;
    if (!over) return;
    const overId = String(over.id);
    if (overId === tabId) return;
    const source = findTab(api.state, tabId);
    // Přesun mezi panely jen přetažením na plochu panelu; lišta slouží jen k řazení.
    if (overId.startsWith("area:")) {
      const paneId = overId.slice(overId.indexOf(":") + 1);
      if (source?.pane.id !== paneId) api.moveTab(tabId, paneId);
      return;
    }
    if (overId.startsWith("bar:")) return;
    const target = findTab(api.state, overId);
    if (!target || !source || source.pane.id !== target.pane.id) return;
    api.moveTab(tabId, target.pane.id, target.tabIndex);
  };

  return (
    <DndContext
      id="pane-layout"
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={() => undefined}
      onDragCancel={() => undefined}
      onDragEnd={onDragEnd}
    >
      <div
        ref={rootRef}
        data-slot="pane-layout"
        data-required-width={requiredPaneWidth(state.layout, minPaneWidth, fontScale)}
        className={cn("flex min-h-0 w-full flex-1 flex-col", className)}
      >
        {maximizedIndex !== null ? (
          <div
            role="status"
            className="flex h-9 shrink-0 items-center justify-between gap-3 border-b bg-accent px-3 text-sm text-accent-foreground"
          >
            <span>{t.maximizedBanner.replace("{index}", String(maximizedIndex + 1))}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7"
              onClick={api.restoreLayout}
            >
              {t.restoreLayout}
              <kbd className="ml-1 font-mono text-xs text-muted-foreground">Esc</kbd>
            </Button>
          </div>
        ) : null}
        <div ref={containerRef} className="flex min-h-0 w-full flex-1 items-stretch">
          {shownPanes.map((pane, index) => (
            <div
              key={pane.id}
              className="flex min-w-0"
              style={{ flex: `${resolvedWidths[index] ?? 1} 1 0%` }}
            >
              <PaneColumn
                pane={pane}
                paneIndex={state.panes.indexOf(pane)}
                api={api}
                renderTab={renderTab}
                renderLinkedPanel={renderLinkedPanel}
                renderEmpty={renderEmpty}
                getTabIcon={getTabIcon}
                emptyHint={emptyHint}
                texts={{ ...dsTexts.paneChrome, ...texts }}
                maximized={maximized === pane.id}
                flashing={api.flashPaneId === pane.id}
                getIconByName={(name) =>
                  getTabIcon ? getTabIcon({ icon: name } as PaneTab) : undefined
                }
              />
              {index < shownPanes.length - 1 ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  onPointerDown={onDividerDown(index)}
                  onDoubleClick={() => onWidths(evenWidths(shownPanes.length))}
                  className="w-2 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
