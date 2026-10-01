/**
 * Typy DataGrid.
 * Vlastní: veřejné typy sloupce, štítku filtru a props DataGrid (společné props z GridBaseProps).
 * Nesmí: obsahovat chování.
 */
import type { ReactNode } from "react";

import type { ExcelColumnType } from "../../../lib/excel-export";
import type { GridBaseProps } from "./grid-base-props";
import type { GridTexts } from "./grid-texts";

/** Sloupec DataGrid. */
export type DataGridColumn<Row> = {
  /** Jednoznačný klíč sloupce. */
  id: string;
  label: string;
  /** Volitelný dynamický důvod, proč nyní nelze změnit viditelnost sloupce. */
  disableToggleReason?: string | undefined;
  align?: "left" | "right" | "center" | undefined;
  /** Hodnota použitá pro hledání, radene aj export. */
  value?: ((row: Row) => string | number | null | undefined) | undefined;
  /** Oddějená hodnota použitá pouze pro řazení, například neformátované číslo účtu. */
  sortValue?: ((row: Row) => string | number | null | undefined) | undefined;
  /** Vlastní vykreslení buňky. */
  render?: ((row: Row) => ReactNode) | undefined;
  /** Editor buňky (např. GridAmountEditor) – jen u vybraných řádků v režimu výběru; jinak render / value. */
  editor?: ((row: Row) => ReactNode) | undefined;
  /** Číselný sloupec – zarovnání vpravo a oddělování tisícov. */
  numeric?: boolean | undefined;
  decimals?: number | undefined;
  /** Explicitní datový typ pro Excel export; bez hodnoty se použije numeric/text. */
  exportType?: ExcelColumnType | undefined;
  /** Vestavěné zobrazení hodnoty; `ico` přidá ověřený odkaz do českého registru. */
  format?: "ico" | undefined;
  /**
   * Součtový riadok: „sum" (predvojené pri číselných sloupcích), „avg", „count",
   * „sumSelected" (jen vybrané řádky; v exportu bez součtu),
   * "none" pro vypnutí alebo vlastní funkcia nad filtrovanými řádky.
   */
  total?:
    | "sum"
    | "sumSelected"
    | "avg"
    | "count"
    | "none"
    | ((rows: Row[]) => ReactNode)
    | undefined;
  /** Vypnúť radene sloupce. */
  sortable?: boolean | undefined;
  /** Sloupec sa nedá skryť. */
  locked?: boolean | undefined;
  /** Ve výchozím stavu skrytý sloupec. */
  defaultVisible?: boolean | undefined;
  /** Pevná šířka sloupce v px – použije se ako minimum i maximum. */
  width?: number | undefined;
  /** Minimální šířka podle obsahu (nezalamovat, sloupec sa zúží na nejmenší možnou šířku). */
  fitContent?: boolean | undefined;
  /** Ukotvit sloupec k pravému okraju pri horizontálnom posouvání. */
  pinRight?: boolean | undefined;
  /** Sekcia sloupce (spojené záhlavie, napr. „Zmluva“). */
  section?: string | undefined;
  /** Sloupec pobočky: „auto" skryje pri jednej pobočke, „always" zobrazí vždy. */
  branchVisibility?: "auto" | "always" | undefined;
  className?: string | undefined;
  /** Vlastný filter v záhlaví sloupce (nahrádza automatický autofilter). */
  filter?: ReactNode | undefined;
  /** Příznak aktivního vlastního filtra (pro indikaci a tlačítko Vymazat filtry). */
  filterActive?: boolean | undefined;
  /** Text vlastního filtru pro přehled aktivních filtrování. */
  filterLabel?: string | undefined;
  /**
   * Více hodnot řádku pre autofilter (napr. složený riadok skupiny, ktorý
   * zastupuje i skryté pohyby). Ponuka aj porovnane použije tieto hodnoty.
   */
  filterValues?: ((row: Row) => string[]) | undefined;
  /** Interní systémový sloupec se neukládá do nastavení. */
  transient?: boolean | undefined;
};

/** Štítek aktivního filtru aplikace. */
export type DataGridFilterChip = { id: string; label: string; onRemove?: () => void };

/** Props DataGrid; společné props s TreeGrid jsou v {@link GridBaseProps}. */
export type DataGridProps<Row> = GridBaseProps<Row> & {
  /** Klíč pro uložení nastavení gridu v prohlížeči. */
  storageKey: string;
  /** Automaticky přizpůsobí zoom dostupné šířce; ve formulářovém PageLayoutu je výchozí true. */
  autoZoom?: boolean;
  /** Nadpis gridu (může být ReactNode s vlastní hlavičkou). Když chybí, hlavička se nezobrazí. */
  title?: ReactNode;
  /** Zobrazí nadpis nad lištou. Výchozí je false; title se dál používá pro export. */
  showTitle?: boolean;
  /** Skryje ozdobný pruh pred nadpisom (napr. pri vlastnej hlavičke s mesiacom). */
  hideTitleMark?: boolean;
  /** Textový nadpis použitý v exportech (PDF/Excel). Ak ne je zadaný, použije se string hodnota title. */
  exportTitle?: string;
  rows: Row[];
  columns: DataGridColumn<Row>[];
  rowKey: (row: Row) => string;
  error?: unknown;
  onRetry?: (() => void) | undefined;
  /** Popisy aktívnych filtrov pre tooltip a chipy. */
  filterChips?: DataGridFilterChip[] | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyActionLabel?: string | undefined;
  onEmptyAction?: (() => void) | undefined;
  /** Výchozí řazení; `null` = bez výchozího řazení (pořadí dat). Bez hodnoty první sloupec. */
  defaultSort?: string | null | undefined;
  /** Doplňková třída řádku (např. odlišení systémových řádků). */
  rowClassName?: ((row: Row) => string | undefined) | undefined;
  /** Skryje filtre priamo v záhlaviach sloupců. */
  columnFilters?: boolean | undefined;
  /** Povolí seskupování řádků podle sloupců. */
  groupable?: boolean | undefined;
  /** Výchozí sloupec seskupení, pokud uživatel nemá uložené vlastní nastavení. */
  defaultGroupBy?: string | undefined;
  /** Skryje spodnú lištu so stránkovaním. */
  paginated?: boolean | undefined;
  /** Zjednodušený vzhled bez modrého akcentu vlevo a so zaobleným vrchom – pro vnořené gridy bez nadpisu. */
  plain?: boolean | undefined;
  /** Skryje ovládaciu lištu pri gridoch vložených priamo do rozbajeného řádku. */
  hideToolbar?: boolean | undefined;
  /** Řízený režim výběru pro více vnořených gridů s jednou společnou lištou. */
  selectMode?: boolean | undefined;
  /** Řízený výběr – klíče vybraných řádků; grid výběr jen zobrazuje a změny hlásí přes onSelectedKeysChange. */
  selectedKeys?: string[] | undefined;
  /** Změna výběru (řízený i neřízený režim). */
  onSelectedKeysChange?: ((keys: string[]) => void) | undefined;
  /** Obsah pruhu pod tabulkou v režimu výběru – dostane vybrané řádky z celé množiny `rows`. */
  selectionSummary?: ((rows: Row[]) => ReactNode) | undefined;
  /**
   * Součty skupiny: „header“ v záhlaví skupiny (výchozí), „row“ jako řádek pod sloupci za skupinou.
   * „row“ patří k `paginated={false}` – se stránkováním by součty byly jen za stránku (ve vývoji varování).
   */
  groupTotals?: "header" | "row" | undefined;
  /** Skryje místní tlačítko, pokud výběr ovládá nadřazená lišta. */
  hideSelectionToggle?: boolean | undefined;
  /** Obsah bočného panelu patriaceho ku gridu. */
  sidePanel?: ReactNode | undefined;
  /** Klíč řádku, ke kterému je otevřený boční panel. */
  activeRowKey?: string | null | undefined;
  /** Zobrazí spodný súčtový riadok (ve výchozím stavu true). */
  showTotalRow?: boolean | undefined;
  /** Oznámi zmenu sloupcůých filtrov (id sloupce → vybrané hodnoty). */
  onColumnFiltersChange?: ((filters: Record<string, string[]>) => void) | undefined;
  /** Změna textového hledání (např. pro rozpad seskupených řádků). */
  onSearchChange?: ((search: string) => void) | undefined;
  /** Přepis výchozích českých textů, například pro slovenskou verzi aplikace. */
  texts?: Partial<GridTexts>;
  /**
   * Id sloupců připnutých vlevo (stav, aktivita…). Výchozí `DEFAULT_PINNED_COLUMNS`;
   * prázdné pole připnutí vypne.
   */
  pinnedColumnIds?: readonly string[] | undefined;
  /**
   * Id nebo popisky sloupců se šířkou podle obsahu (doklad, VS, MD/Dal…). Výchozí
   * `DEFAULT_COMPACT_COLUMNS`; sloupce s `fitContent` a datem jsou kompaktní vždy.
   */
  compactColumnIds?: readonly string[] | undefined;
};
