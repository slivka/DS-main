/**
 * Typy TreeGrid.
 * Vlastní: veřejné typy řádku a sloupce stromu, úrovně rozbalení, texty a props TreeGrid
 * (společné props z GridBaseProps).
 * Nesmí: obsahovat chování.
 */
import type { ReactNode } from "react";

import type { ExcelColumnType } from "../../../lib/excel-export";
import type { FilterChip } from "./filter-chips";
import type { GridBaseProps } from "./grid-base-props";
import type { GridTexts } from "./grid-texts";

/** Řádek stromu: id a volitelný rodič. */
export type TreeGridRow = { id: string; parentId?: string | null };

/** Sloupec stromu. */
export type TreeGridColumn<Row extends TreeGridRow> = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Číselný sloupec – vpravo, tisíce mezerou, se součtem za uzel. */
  numeric?: boolean;
  decimals?: number;
  /** Souhrn za uzel a za celou tabulku; u číselných sloupců výchozí „sum“. */
  total?: "sum" | "none";
  /** Hodnota pro zobrazení, hledání i export. */
  value?: (row: Row) => string | number | null | undefined;
  /** Vlastní vykresjení buňky; `total` je souhrn za uzel včetně potomků. */
  render?: (row: Row, total: number | null) => ReactNode;
  exportType?: ExcelColumnType;
  width?: number;
  /** Sloupec je ve výchozím stavu skrytý (lze zapnout ve výběru sloupců). */
  hiddenByDefault?: boolean;
  locked?: boolean;
  fitContent?: boolean;
  transient?: boolean;
};

/** Úroveň rozbajení – `depth` = počet rozbajených úrovní (0 = jen kořeny). */
export type TreeGridExpandLevel = { id: string; label: string; depth: number };

/** Texty stromu (výchozí z DsTexts). */
export type TreeGridTexts = {
  searchPlaceholder: string;
  expandAll: string;
  collapseAll: string;
  expandNode: string;
  collapseNode: string;
  levelsLabel: string;
  emptyLabel: string;
  totalLabel: string;
  exportLabel: string;
  columnsTitle: string;
};

/** Výchozí české texty stromu; část z nich TreeGrid přepíše texty z DsTexts. */
export const DEFAULT_TREE_GRID_TEXTS: TreeGridTexts = {
  searchPlaceholder: "Hledat…",
  expandAll: "Rozbalit vše",
  collapseAll: "Sbalit vše",
  expandNode: "Rozbalit",
  collapseNode: "Sbalit",
  levelsLabel: "Úroveň rozbajení",
  emptyLabel: "Zatím zde nejsou žádné položky",
  totalLabel: "Celkem",
  exportLabel: "Export do Excelu",
  columnsTitle: "Sloupce",
};

/** Props TreeGrid; společné props s DataGrid jsou v {@link GridBaseProps}. */
export interface TreeGridProps<Row extends TreeGridRow> extends GridBaseProps<Row> {
  /** Řádky stromu (rodič přes `parentId`; v exportu je bez `exportName` tlačítko skryté). */
  rows: Row[];
  /** Sloupce; první nese hierarchii. */
  columns: TreeGridColumn<Row>[];
  /** Nadpis (export, nastavení, volitelně v liště). */
  title: string;
  /** Zobrazí nadpis v liště. Výchozí je false; title se dál používá pro export a nastavení. */
  showTitle?: boolean;
  /** Klíč pro uložení zoomu a viditelnosti sloupců (výchozí z `exportName` / `title`). */
  storageKey?: string;
  /** Uzly jsou na začátku sbalené. */
  defaultCollapsed?: boolean;
  /** Tlačítka úrovní rozbajení v liště, např. Třídy · Skupiny · Účty · Vše. */
  expandLevels?: TreeGridExpandLevel[];
  /** Řízená úroveň rozbajení (hloubka). */
  expandDepth?: number;
  /** Změna úrovně rozbalení. */
  onExpandDepthChange?: (depth: number) => void;
  /** Zvýrazněný uzel; bez zadání se zvýrazní naposledy rozbajený / vybraný uzel. */
  highlightedRowId?: string | null;
  /** Dvojklik na řádek (má přednost před úpravou). */
  onRowOpen?: (row: Row) => void;
  /** Štítky aktivních filtrů. */
  filterChips?: FilterChip[];
  /** Přepis společných textů gridu. */
  gridTexts?: Partial<GridTexts>;
  /** Přepis textů stromu. */
  texts?: Partial<TreeGridTexts>;
}
