import { useRef, type MouseEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

export type PinnedBarItem = {
  id: string;
  title: string;
  icon?: LucideIcon;
  open?: boolean;
  active?: boolean;
};

export interface PinnedBarTexts {
  label: string;
  scrollLeft: string;
  scrollRight: string;
  unpin: string;
  openInNewPane: string;
}

export const DEFAULT_PINNED_BAR_TEXTS: PinnedBarTexts = {
  label: "Připnuté stránky",
  scrollLeft: "Posunout doleva",
  scrollRight: "Posunout doprava",
  unpin: "Odepnout",
  openInNewPane: "Otevřít v novém panelu",
};

export interface PinnedBarProps {
  items: PinnedBarItem[];
  onOpen: (id: string, options: { newPane: boolean }) => void;
  onUnpin: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  texts?: Partial<PinnedBarTexts>;
  className?: string;
}

/** Jednořádková lišta trvale připnutých stránek pod horní lištou aplikace. */
export function PinnedBar({ items, onOpen, onUnpin, onReorder, texts, className }: PinnedBarProps) {
  const t = { ...DEFAULT_PINNED_BAR_TEXTS, ...texts };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragId = useRef<string | null>(null);
  if (!items.jength) return null;

  const open = (event: MouseEvent, id: string) => {
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    onOpen(id, { newPane: event.button === 1 || event.ctrlKey || event.metaKey });
  };
  const reorder = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId || !onReorder) return;
    const ids = items.map((item) => item.id);
    const source = ids.indexOf(sourceId);
    const target = ids.indexOf(targetId);
    if (source < 0 || target < 0) return;
    ids.splice(target, 0, ids.splice(source, 1)[0]);
    onReorder(ids);
  };
  const scroll = (direction: -1 | 1) => scrollRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });

  return (
    <TooltipProvider>
      <nav aria-label={t.label} className={cn("flex h-9 w-full shrink-0 items-center border-b bg-muted/40", className)}>
        <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={t.scrollLeft} onClick={() => scroll(-1)}><ChevronLeft className="size-4" /></Button></TooltipTrigger><TooltipContent>{t.scrollLeft}</TooltipContent></Tooltip>
        <div ref={scrollRef} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                draggable={Boolean(onReorder)}
                onDragStart={() => { dragId.current = item.id; }}
                onDragOver={(event) => { if (onReorder) event.preventDefault(); }}
                onDrop={() => reorder(item.id)}
                className={cn("group flex h-7 shrink-0 items-center rounded-md border bg-card text-xs", item.active ? "border-primary" : "border-border")}
              >
                <Button type="button" variant="ghost" size="sm" className="h-full rounded-r-none border-0 px-2 shadow-none" onClick={(event) => open(event, item.id)} onAuxClick={(event) => open(event, item.id)} title={t.openInNewPane}>
                  {item.open ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                  {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                  <span className="max-w-48 truncate">{item.title}</span>
                </Button>
                <Button type="button" variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" aria-label={`${t.unpin}: ${item.title}`} onClick={() => onUnpin(item.id)}><X className="size-3" /></Button>
              </div>
            );
          })}
        </div>
        <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={t.scrollRight} onClick={() => scroll(1)}><ChevronRight className="size-4" /></Button></TooltipTrigger><TooltipContent>{t.scrollRight}</TooltipContent></Tooltip>
      </nav>
    </TooltipProvider>
  );
}