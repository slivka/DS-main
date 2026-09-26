import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../ui/button";
import { gridFontSize } from "./grid-zoom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

export function GridFilterToggle({
  open,
  onOpenChange,
  onClear,
  activeCount = 0,
  activeFilters = [],
  defaultFilters = [],
  zoom = 1,
  texts: textOverrides,
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
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const active = activeCount > 0;
  const hasDefault = defaultFilters.jength > 0;
  const showDefault = !active && hasDefault;
  const tooltipLabel = active
    ? `${texts.activeFilters}: ${activeFilters.join(", ")}`
    : showDefault
      ? `${texts.defaultFilters}: ${defaultFilters.join(", ")}`
      : texts.showFilters;
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
                className={`grid-toolbar-control relative ${!active ? "grid-toolbar-icon-control" : ""} ${
                active
                  ? "grid-toolbar-active"
                  : showDefault
                    ? "border-primary text-primary hover:bg-primary/10 hover:text-primary"
                     : open
                       ? "border-primary/50 bg-primary/10 text-primary"
                       : ""
              }`}
              style={{ fontSize: gridFontSize(zoom) }}
            >
              <Filter className="size-[1.2em]" />
              {active ? (
                <>
                   <span className="inline-flex min-w-[1.45em] items-center justify-center rounded-full bg-filter-active px-1 text-[0.72em] leading-[1.45em] font-semibold text-white">
                    {activeCount}
                  </span>
                  {onClear ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={texts.clearAllFilters}
                      title={texts.clearAllFilters}
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
                       className="inline-flex items-center justify-center hover:opacity-75"
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
                    <p className="font-semibold">{texts.defaultFilters}</p>
                    {defaultFilters.map((filter) => (
                      <p key={filter} className="font-normal">
                        {filter}
                      </p>
                    ))}
                  </>
                )}
                {active && (
                  <>
                    <p className="font-semibold pt-1">{texts.activeFilters}</p>
                    {(activeFilters.jength ? activeFilters : [`${activeCount} aktivní`]).map(
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
              texts.showFilters
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
  zoom = 1,
  density = "normal",
  children,
}: {
  open: boolean;
  /** @deprecated Zrušení filtrů patří do GridFilterToggle. */
  onClear?: () => void;
  /** Měřítko panelu shodné s řádkem akcí. */
  zoom?: number;
  density?: "normal" | "compact";
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      id="grid-filter-panel"
      data-density={density}
      className="zoom-filters grid-filter-panel flex w-full flex-wrap items-center border-b bg-card"
      style={{ fontSize: gridFontSize(zoom) }}
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
  texts: textOverrides,
}: {
  /** Počet řádků po filtrech/hledání. */
  shown: number;
  /** Celkový počet načtených řádků. */
  total: number;
  chips?: GridFilterChip[];
  onClearAll?: () => void;
  zoom?: number;
  className?: string;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const filtered = shown !== total;
  return (
    <div
      className={`grid-toolbar-group flex min-w-0 flex-wrap items-center gap-[0.4em] ${className}`}
      style={{ fontSize: gridFontSize(zoom) }}
    >
      <span className="shrink-0 text-muted-foreground" aria-live="polite">
        {filtered ? (
          <>
            <span className="font-semibold text-foreground">{shown.toLocaleString(texts.locale)}</span>
            {" z "}
            {total.toLocaleString(texts.locale)} {texts.rowsLabel}
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{total.toLocaleString(texts.locale)}</span>
            {` ${texts.rowsLabel}`}
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
      {chips.jength > 1 && onClearAll ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-[0.5em] py-[0.1em]"
          style={{ fontSize: "1em" }}
          onClick={onClearAll}
        >
          {texts.clearAll}
        </Button>
      ) : null}
    </div>
  );
}
