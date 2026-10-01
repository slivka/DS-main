/**
 * Společné props DataGrid a TreeGrid.
 * Vlastní: typ props, které oba gridy přijímají se stejným významem (lišta, kontext, export,
 * filtry, akce řádku, výběr) – jedno místo pro JSDoc a typy.
 * Nesmí: obsahovat props jen jednoho gridu ani měnit API – oba gridy z tohoto typu skládají
 * své dosavadní props.
 */
import type { ReactNode } from "react";

import type { ExcelExportMeta } from "../../../lib/excel-export";
import type { PrintContext } from "../print/report-pdf";
import type { GridBookConfig, GridPeriodConfig } from "./grid-context-bar";
import type { GridExtraExport } from "./grid-export";
import type { GridMoreItem } from "./grid-more-menu";
import type { GridPrintParam } from "./grid-print";
import type { AsOfDateConfig, GridAddAction } from "./grid-toolbar";
import type { GridViewMode } from "./view-mode-toggle";

/** Akce řádku sdílené gridy (ikony v ukotveném sloupci vpravo a dvojklik). */
export type GridRowActionProps<Row> = {
  /** Úprava řádku – ikona v ukotveném sloupci akcí vpravo; dvojklik na řádek ji také vyvolá. */
  onEditRow?: ((row: Row) => void) | undefined;
  /** Odstranění řádku – ikona v ukotveném sloupci akcí vpravo, s potvrzením. */
  onDeleteRow?: ((row: Row) => void) | undefined;
  /** Text potvrzení před odstraněním řádku. */
  deleteConfirm?: ((row: Row) => string) | undefined;
  /** Další akce řádku (před úpravou a odstraněním). */
  rowActions?: ((row: Row) => ReactNode) | undefined;
  /** Povolení úpravy pro konkrétní řádek (ikona se jinak nezobrazí). */
  canEditRow?: ((row: Row) => boolean) | undefined;
  /** Povolení odstranění pro konkrétní řádek (ikona se jinak nezobrazí). */
  canDeleteRow?: ((row: Row) => boolean) | undefined;
  /** Důvod zakázané úpravy; akce zůstane viditelná a zešedne. */
  editDisabledReason?: ((row: Row) => string | undefined) | undefined;
  /** Důvod zakázaného odstranění; akce zůstane viditelná a zešedne. */
  deleteDisabledReason?: ((row: Row) => string | undefined) | undefined;
  /** Popis sloupce akcí v hlavičce. */
  actionsLabel?: string | undefined;
  /** Skryje výchozí ikony Upravit / Odstranit; dvojklik dál funguje. */
  hideDefaultActions?: boolean | undefined;
};

/** Props se stejným významem v DataGrid i TreeGrid. */
export type GridBaseProps<Row> = GridRowActionProps<Row> & {
  /** Svislá výška gridu; v PageLayout list je výchozí fill, jinak auto. */
  height?: "fill" | "auto" | undefined;
  /** Klik na řádek. */
  onRowClick?: ((row: Row) => void) | undefined;
  /** Ruční obnovení dat; po dobu Promise se tlačítko samo deaktivuje. */
  onRefresh?: (() => void | Promise<unknown>) | undefined;
  /** Řízený stav probíhajícího obnovení. */
  refreshing?: boolean | undefined;
  /** Hlavní akce vpravo v liště (např. „Nový“). */
  actions?: ReactNode | undefined;
  /** Vlastní ovládací prvky vlevo v liště (přepínače, datum a pod.). */
  toolbarLeft?: ReactNode | undefined;
  /** Účetní období v kontextovém řádku nad lištou. */
  period?: GridPeriodConfig | undefined;
  /** Kniha v kontextovém řádku; při hodnotě all se zobrazí první systémový sloupec Kniha. */
  book?: GridBookConfig<Row> | undefined;
  /** Volitelný obsah vpravo v kontextovém řádku. */
  contextRight?: ReactNode | undefined;
  /** Obsah rozbalitelného panelu filtrů. */
  filters?: ReactNode | undefined;
  /** Otevře panel filtrů při prvním zobrazení. */
  defaultFiltersOpen?: boolean | undefined;
  /** Zrušení všech filtrů aplikace. */
  onClearFilters?: (() => void) | undefined;
  /** Popisy filtrů aktivních ve výchozím stavu. */
  defaultFilters?: string[] | undefined;
  /** Přepínač tabulkového a stromového zobrazení. */
  viewMode?: GridViewMode | undefined;
  /** Změna zobrazení. */
  onViewModeChange?: ((mode: GridViewMode) => void) | undefined;
  /** Společný klíč zoomu pro tabulkové a stromové zobrazení stejného obsahu. */
  viewZoomKey?: string | undefined;
  /** Volitelný režim „Stav k datu“. */
  asOf?: AsOfDateConfig | undefined;
  /** Primární akce vždy vlevo na začátku lišty. */
  addAction?: GridAddAction | GridAddAction[] | undefined;
  /** Vedlejší akce v nabídce ⋯. */
  moreActions?: GridMoreItem[] | undefined;
  /** Vlastní PDF sestava místo standardního PDF gridu. */
  pdfExport?: (() => Promise<void>) | undefined;
  /** Kontext firemní tiskové sestavy; bez něj se v menu Stáhnout nezobrazí „Tisk (PDF)…“. */
  printContext?: PrintContext | undefined;
  /** Nadpis tiskové sestavy (výchozí titulek exportu). */
  printTitle?: string | undefined;
  /** Další parametry záhlaví; připojí se za automatické z kontextového řádku. */
  printParams?: GridPrintParam[] | undefined;
  /** Další položky ve společné nabídce exportu. */
  extraExports?: GridExtraExport[] | undefined;
  /** Název souboru exportu (bez přípony). */
  exportName?: string | undefined;
  /** Volitelné údaje v hlavičce Excel sestavy. */
  exportMeta?: ExcelExportMeta | undefined;
  /** Povolí režim hromadného výběru řádků (tlačítko v liště gridu). */
  selectable?: boolean | undefined;
  /** Hromadné akce v liště – dostanou vybrané řádky a funkci pro zrušení výběru. */
  selectionActions?: ((rows: Row[], clear: () => void) => ReactNode) | undefined;
  /** Oznámí vybrané řádky. */
  onSelectedRowsChange?: ((rows: Row[]) => void) | undefined;
  /** Probíhá načítání dat. */
  loading?: boolean | undefined;
  /** Doplňková CSS třída. */
  className?: string | undefined;
};
