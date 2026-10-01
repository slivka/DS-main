/**
 * Společný rám nad tabulkou gridu.
 * Vlastní: kontextový řádek, lištu akcí (přidání, zobrazení, rozbalení, Stav k datu, hledání,
 * filtry, seskupení, Sloupce, zoom a hustota, výběr, export, nabídka ⋯ při zúžení, Obnovit),
 * panel filtrů, štítky filtrů a pruh výběru – jednou pro DataGrid i TreeGrid.
 * Nesmí: držet stav gridu ani znát data – vše dostává hotové od gridu přes props.
 */
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../../lib/utils";
import { ColumnPicker } from "./column-picker";
import { FilterChips } from "./filter-chips";
import { GridContextBar, type GridBookConfig, type GridPeriodConfig } from "./grid-context-bar";
import { GridFilterPanel, GridFilterToggle } from "./grid-filters";
import { GridMoreMenu, type GridMoreItem } from "./grid-more-menu";
import { GridRefreshButton } from "./grid-refresh";
import { GridSearch } from "./grid-search";
import type { GridTexts } from "./grid-texts";
import {
  AsOfDateToggle,
  GridAddActions,
  GridToolbar,
  GridToolbarCollapsible,
  GridToolbarSeparator,
  type AsOfDateConfig,
  type GridAddAction,
} from "./grid-toolbar";
import { ZoomControl, type GridDensity } from "./grid-zoom";
import { ViewModeToggle, type GridViewMode } from "./view-mode-toggle";

/** Props výběru sloupců v liště (úplná podoba; nabídka ⋯ použije základní část). */
export type GridFrameColumnPicker = ComponentProps<typeof ColumnPicker<string>>;

/** Zoom a hustota gridu pro ovládání v liště. */
export type GridFrameZoom = {
  zoom: number;
  setZoom: (zoom: number) => void;
  density: GridDensity;
  setDensity: (density: GridDensity) => void;
  isAuto: boolean;
};

/** Props společného rámu gridu. */
export interface GridFrameProps {
  /** Zoom a hustota. */
  zoom: GridFrameZoom;
  /** Texty gridu. */
  texts: GridTexts;
  /** Kontextový řádek (období, kniha, obsah vpravo); bez obsahu se nevykreslí. */
  context: {
    period?: GridPeriodConfig | undefined;
    book?: GridBookConfig<never> | undefined;
    right?: ReactNode;
    className?: string;
  };
  /** Skryje lištu (vnořené gridy). */
  hideToolbar?: boolean | undefined;
  /** Třídy lišty (zaoblení a stín podle toho, co je nad ní). */
  toolbarClassName: string;
  /** Primární akce vlevo. */
  addAction?: GridAddAction | GridAddAction[] | undefined;
  /** Přepínač zobrazení tabulka / strom. */
  view?: { mode: GridViewMode; onChange: (mode: GridViewMode) => void } | undefined;
  /** Ovládání rozbalení v liště a jeho zúžená podoba v nabídce ⋯. */
  expand?: { wide: ReactNode; compact: ReactNode; separator: boolean } | undefined;
  /** Stav k datu. */
  asOf?: AsOfDateConfig | undefined;
  /** Vlastní prvky vlevo. */
  toolbarLeft?: ReactNode;
  /** Hledání v gridu. */
  search: { value: string; onChange: (value: string) => void; placeholder?: string };
  /** Panel filtrů aplikace a tlačítko filtrů. */
  filters?: {
    content: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClear?: (() => void) | undefined;
    activeCount: number;
    activeLabels: string[];
    defaultLabels: string[];
  };
  /** Panel filtrů je otevřený – štítky filtrů se pak skryjí. */
  filtersOpen: boolean;
  /** Štítky filtrů pod lištou (jen při zavřeném panelu). */
  filterChips: ComponentProps<typeof FilterChips>["chips"];
  /** Zrušení všech filtrů ze štítků. */
  onClearFilters?: (() => void) | undefined;
  /** Ovládání seskupení. */
  groupControl?: ReactNode;
  /** Výběr sloupců. */
  columnPicker: GridFrameColumnPicker;
  /** Datová skupina lišty (výběr, akce, export); null = skupina se nevykreslí. */
  dataGroup: ReactNode;
  /** Vedlejší akce v nabídce ⋯. */
  moreActions: GridMoreItem[];
  /** Obnovení dat. */
  refresh?: { onRefresh: () => void | Promise<unknown>; refreshing?: boolean | undefined };
  /** Pruh výběru nad tabulkou; null = mimo režim výběru. */
  selection: { count: string; actions: ReactNode; className: string } | null;
}

/** Kontextový řádek, lišta, filtry a pruh výběru nad tabulkou gridu. */
export function GridFrame({
  zoom: zoomState,
  texts,
  context,
  hideToolbar,
  toolbarClassName,
  addAction,
  view,
  expand,
  asOf,
  toolbarLeft,
  search,
  filters,
  filtersOpen,
  filterChips,
  onClearFilters,
  groupControl,
  columnPicker,
  dataGroup,
  moreActions,
  refresh,
  selection,
}: GridFrameProps) {
  const { zoom, setZoom, density, setDensity, isAuto } = zoomState;
  const viewToggle = view ? (
    <ViewModeToggle mode={view.mode} onChange={view.onChange} texts={texts} />
  ) : null;
  const zoomControl = (
    <ZoomControl
      zoom={zoom}
      setZoom={setZoom}
      density={density}
      setDensity={setDensity}
      auto={isAuto}
      texts={texts}
    />
  );
  const basicPicker = (
    <ColumnPicker
      columns={columnPicker.columns}
      visible={columnPicker.visible}
      onToggle={columnPicker.onToggle}
      onReorder={columnPicker.onReorder}
      onReset={columnPicker.onReset}
      zoom={zoom}
      title={columnPicker.title}
      texts={texts}
    />
  );
  const hasContext = Boolean(context.period || context.book || context.right);
  return (
    <>
      {hasContext ? (
        <GridContextBar
          period={context.period}
          book={context.book}
          contextRight={context.right}
          zoom={zoom}
          density={density}
          className={context.className}
        />
      ) : null}
      {!hideToolbar ? (
        <GridToolbar
          zoom={zoom}
          density={density}
          className={toolbarClassName}
          left={
            <>
              {addAction ? <GridAddActions actions={addAction} /> : null}
              <GridToolbarCollapsible>
                {addAction && (view || expand?.separator || asOf || toolbarLeft) ? (
                  <GridToolbarSeparator density={density} />
                ) : null}
                {viewToggle}
                {expand?.wide}
                {asOf || toolbarLeft ? (
                  <span className="grid-toolbar-optional contents">
                    <span className="hidden @min-[640px]:contents">
                      {expand ? <GridToolbarSeparator density={density} /> : null}
                    </span>
                    {asOf ? <AsOfDateToggle {...asOf} /> : null}
                    {asOf && toolbarLeft ? <GridToolbarSeparator density={density} /> : null}
                    {toolbarLeft}
                  </span>
                ) : null}
              </GridToolbarCollapsible>
            </>
          }
          right={
            <>
              <span
                data-toolbar-measure="find"
                data-toolbar-group="find"
                className="flex shrink-0 items-center gap-2"
              >
                <GridSearch
                  value={search.value}
                  onChange={search.onChange}
                  {...(search.placeholder ? { placeholder: search.placeholder } : {})}
                  zoom={zoom}
                  texts={texts}
                />
                {filters ? (
                  <GridFilterToggle
                    open={filters.open}
                    onOpenChange={filters.onOpenChange}
                    {...(filters.onClear ? { onClear: filters.onClear } : {})}
                    activeCount={filters.activeCount}
                    activeFilters={filters.activeLabels}
                    defaultFilters={filters.defaultLabels}
                    zoom={zoom}
                    texts={texts}
                  />
                ) : null}
              </span>
              <div className="grid-toolbar-wide hidden @min-[640px]:contents">
                <span
                  data-toolbar-measure="display"
                  data-toolbar-group="display"
                  className="grid-toolbar-display-group inline-flex shrink-0 items-center gap-2"
                >
                  <GridToolbarSeparator density={density} />
                  {groupControl}
                  <ColumnPicker {...columnPicker} zoom={zoom} texts={texts} />
                  {zoomControl}
                </span>
                {dataGroup ? (
                  <span
                    data-toolbar-measure="data"
                    data-toolbar-group="data"
                    className="grid-toolbar-data-group inline-flex shrink-0 items-center gap-2"
                  >
                    <GridToolbarSeparator density={density} />
                    {dataGroup}
                  </span>
                ) : null}
              </div>
              <span data-toolbar-measure="menu" data-toolbar-group="menu" className="contents">
                <GridMoreMenu
                  responsiveOverflow
                  items={moreActions}
                  zoom={zoom}
                  texts={texts}
                  compact={
                    <>
                      {viewToggle}
                      {expand?.compact}
                      {asOf ? <AsOfDateToggle {...asOf} /> : null}
                      {toolbarLeft}
                    </>
                  }
                  tools={
                    <>
                      {groupControl}
                      {basicPicker}
                      {zoomControl}
                    </>
                  }
                  secondary={dataGroup ? <>{dataGroup}</> : null}
                  className="grid-toolbar-overflow-menu"
                />
              </span>
              {refresh ? (
                <span
                  data-toolbar-measure="refresh"
                  data-toolbar-group="refresh"
                  className="grid-toolbar-refresh-group inline-flex shrink-0 items-center gap-2"
                >
                  <GridToolbarSeparator density={density} />
                  <GridRefreshButton
                    onRefresh={refresh.onRefresh}
                    refreshing={refresh.refreshing}
                    zoom={zoom}
                    texts={texts}
                  />
                </span>
              ) : null}
            </>
          }
        />
      ) : null}
      {filters ? (
        <GridFilterPanel open={filters.open} zoom={zoom} density={density}>
          {filters.content}
        </GridFilterPanel>
      ) : null}
      {!filtersOpen && filterChips.length ? (
        <div className="border border-t-0 bg-card px-2 py-1.5">
          <FilterChips
            chips={filterChips}
            onClearAll={onClearFilters}
            size="sm"
            texts={{ clearAll: texts.clearAll, removeLabel: texts.removeFilter }}
          />
        </div>
      ) : null}
      {selection ? (
        <div className={cn("items-center gap-2 px-2 py-1.5 text-sm", selection.className)}>
          <span className="text-muted-foreground">{texts.selectedRecords(selection.count)}</span>
          <div className="ml-auto flex items-center gap-2">{selection.actions}</div>
        </div>
      ) : null}
    </>
  );
}
