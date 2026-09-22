import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { gridFontSize } from "@/components/ds/grid/grid-zoom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function GridFilterToggle({
  open,
  onOpenChange,
  onClear,
  activeCount = 0,
  activeFilters = [],
  defaultFilters = [],
  zoom = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Zruší aktivní filtry ikonou uvnitř tlačítka. */
  onClear?: () => void;
  activeCount?: number;
  /** Texty zobrazené v tooltipu aktivního filtru. */
  activeFilters?: string[];
  /** Filtry, které jsou aktivní ve výchozím stavu (nezapočítávají se do activeCount).
   *  Zobrazují se modře místo červeně a v tooltipu pod hlavičkou „Výchozí filtry". */
  defaultFilters?: string[];
  zoom?: number;
}) {
  const active = activeCount > 0;
  const hasDefault = defaultFilters.length > 0;
  const showDefault = !active && hasDefault;
  const tooltipLabel = active
    ? `Aktivní filtry: ${activeFilters.join(", ")}`
    : showDefault
      ? `Výchozí filtry: ${defaultFilters.join(", ")}`
      : "Zobrazit filtry";
  return (
    <div className="grid-toolbar-group flex shrink-0 items-center">
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={open}
              aria-controls="grid-filter-panel"
              aria-label={tooltipLabel}
              onClick={() => onOpenChange(!open)}
              className={`grid-toolbar-control relative ${
                active
                  ? "grid-toolbar-active"
                  : showDefault
                    ? "border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    : ""
              }`}
              style={{ fontSize: gridFontSize(zoom) }}
            >
              <Filter className="size-[1.2em]" />
              {active ? (
                <>
                  <span className="inline-flex min-w-[1.45em] items-center justify-center rounded-full bg-destructive px-1 text-[0.72em] leading-[1.45em] font-semibold text-destructive-foreground">
                    {activeCount}
                  </span>
                  {onClear ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Zrušit všechny filtry"
                      title="Zrušit všechny filtry"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClear();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onClear();
                        }
                      }}
                      className="inline-flex items-center justify-center hover:text-destructive/70"
                    >
                      <X className="size-[1.15em]" />
                    </span>
                  ) : null}
                </>
              ) : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {active || showDefault ? (
              <div className="space-y-1">
                {hasDefault && (
                  <>
                    <p className="font-semibold">Výchozí filtry</p>
                    {defaultFilters.map((filter) => (
                      <p key={filter} className="font-normal">
                        {filter}
                      </p>
                    ))}
                  </>
                )}
                {active && (
                  <>
                    <p className="font-semibold pt-1">Aktivní filtry</p>
                    {(activeFilters.length ? activeFilters : [`${activeCount} aktivní`]).map(
                      (filter) => (
                        <p key={filter} className="font-normal">
                          {filter}
                        </p>
                      ),
                    )}
                  </>
                )}
              </div>
            ) : (
              "Zobrazit filtry"
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function GridFilterPanel({
  open,
  onClear: _onClear,
  zoom: _zoom,
  children,
}: {
  open: boolean;
  /** @deprecated Zrušení filtrů patří do GridFilterToggle. */
  onClear?: () => void;
  /** @deprecated Zachováno pro kompatibilitu volajících míst. */
  zoom?: number;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      id="grid-filter-panel"
      className="grid-toolbar-group order-last flex w-full basis-full flex-wrap items-center border-t pt-2"
    >
      {children}
    </div>
  );
}
export type GridFilterChip = { id: string; label: string; onRemove?: () => void };

/**
 * Počet zobrazených záznamů + chipy aktivních filtrů.
 * Doplňuje lištu gridu, aby bylo hned vidět, proč je grid „prázdný“.
 */
export function GridResultCount({
  shown,
  total,
  chips = [],
  onClearAll,
  zoom = 1,
  className = "",
}: {
  /** Počet riadkov po filtrech/hledání. */
  shown: number;
  /** Celkový počet načtených riadkov. */
  total: number;
  chips?: GridFilterChip[];
  onClearAll?: () => void;
  zoom?: number;
  className?: string;
}) {
  const filtered = shown !== total;
  return (
    <div
      className={`grid-toolbar-group flex min-w-0 flex-wrap items-center gap-[0.4em] ${className}`}
      style={{ fontSize: gridFontSize(zoom) }}
    >
      <span className="shrink-0 text-muted-foreground" aria-live="polite">
        {filtered ? (
          <>
            <span className="font-semibold text-foreground">{shown.toLocaleString("sk-SK")}</span>
            {" z "}
            {total.toLocaleString("sk-SK")} riadkov
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{total.toLocaleString("sk-SK")}</span>
            {" riadkov"}
          </>
        )}
      </span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex max-w-[16em] items-center gap-[0.3em] rounded-full border border-primary/40 bg-primary/10 px-[0.6em] py-[0.1em] text-primary"
        >
          <span className="truncate">{chip.label}</span>
          {chip.onRemove ? (
            <button
              type="button"
              aria-label={`Zrušit filtr ${chip.label}`}
              title={`Zrušit filtr ${chip.label}`}
              onClick={chip.onRemove}
              className="rounded-full hover:text-destructive"
            >
              <X className="size-[1em]" />
            </button>
          ) : null}
        </span>
      ))}
      {chips.length > 1 && onClearAll ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-[0.5em] py-[0.1em]"
          style={{ fontSize: "1em" }}
          onClick={onClearAll}
        >
          Zrušit vše
        </Button>
      ) : null}
    </div>
  );
}
