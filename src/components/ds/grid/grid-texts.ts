export interface GridTexts {
  locale: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearchLabel: string;
  refresh: string;
  columnsTitle: string;
  selectMore: string;
  cancelSelection: string;
  selectedRecords: (count: string) => string;
  selectAllRows: string;
  selectRow: string;
  actions: string;
  edit: string;
  remove: string;
  removeConfirm: string;
  emptyTitle: string;
  searchEmptyTitle: string;
  emptyValue: string;
  valuesCount: (count: number) => string;
  total: string;
  sidePanelLabel: string;
  filterLabel: (label: string) => string;
  filterSearchPlaceholder: string;
  selectAll: string;
  clear: string;
  noValues: string;
  dateFilterYears: string;
  dateFilterQuarters: string;
  dateFilterMonths: string;
  dateFilterDates: string;
  dateFilterQuarter: (quarter: number, year: number) => string;
  showFilters: string;
  activeFilters: string;
  defaultFilters: string;
  clearAllFilters: string;
  clearFilter: string;
  clearAll: string;
  rowsLabel: string;
  show: string;
  all: string;
  pageSize: string;
  noRecords: string;
  page: (page: number, pageCount: number) => string;
  previousPage: string;
  nextPage: string;
  download: string;
  downloadExcel: string;
  downloadPdf: string;
  downloadHtml: string;
  retry: string;
  loading: string;
  groupingEnable: string;
  groupingDisable: string;
  groupingDropHint: string;
  groupingAddColumn: string;
  groupingClear: string;
  groupingEmpty: string;
  zoomOut: string;
  zoomIn: string;
  zoomReset: string;
  normalDensity: string;
  compactDensity: string;
  resizeColumn: string;
  resizeColumnHint: string;
  moreActions: string;
  treeView: string;
  tableView: string;
}

export const DEFAULT_GRID_TEXTS: GridTexts = {
  locale: "cs-CZ",
  searchPlaceholder: "Hledat…",
  searchLabel: "Hledat",
  clearSearchLabel: "Zrušit hledání",
  refresh: "Obnovit data",
  columnsTitle: "Sloupce",
  selectMore: "Vybrat více",
  cancelSelection: "Zrušit výběr",
  selectedRecords: (count) => `Vybraných záznamů: ${count}`,
  selectAllRows: "Vybrat všechny řádky",
  selectRow: "Vybrat řádek",
  actions: "Akce",
  edit: "Upravit",
  remove: "Odstranit",
  removeConfirm: "Opravdu odstranit tento záznam?",
  emptyTitle: "Zatím zde nejsou žádné záznamy",
  searchEmptyTitle: "Hledání neodpovídá žádný záznam",
  emptyValue: "(prázdné)",
  valuesCount: (count) => `${count} hodnot`,
  total: "Celkem",
  sidePanelLabel: "Poznámky k vybranému záznamu",
  filterLabel: (label) => `Filtrovat ${label}`,
  filterSearchPlaceholder: "Hledat…",
  selectAll: "Vybrat vše",
  clear: "Vymazat",
  noValues: "Žádné hodnoty.",
  dateFilterYears: "Roky",
  dateFilterQuarters: "Čtvrtletí",
  dateFilterMonths: "Měsíce",
  dateFilterDates: "Jednotlivá data",
  dateFilterQuarter: (quarter, year) => `${quarter}. čtvrtletí ${year}`,
  showFilters: "Zobrazit filtry",
  activeFilters: "Aktivní filtry",
  defaultFilters: "Výchozí filtry",
  clearAllFilters: "Zrušit všechny filtry",
  clearFilter: "Zrušit filtr",
  clearAll: "Zrušit vše",
  rowsLabel: "řádků",
  show: "Zobrazit",
  all: "Vše",
  pageSize: "Počet záznamů na stránku",
  noRecords: "žádné záznamy",
  page: (page, pageCount) => `Strana ${page} / ${pageCount}`,
  previousPage: "Předchozí stránka",
  nextPage: "Další stránka",
  download: "Stáhnout",
  downloadExcel: "Stáhnout do Excelu",
  downloadPdf: "Stáhnout do PDF",
  downloadHtml: "Stáhnout do HTML",
  retry: "Zkusit znovu",
  loading: "Načítám data…",
  groupingEnable: "Seskupit podle sloupce",
  groupingDisable: "Vypnout seskupení",
  groupingDropHint: "Přetáhněte sem záhlaví sloupce pro seskupení",
  groupingAddColumn: "+ Přidat sloupec",
  groupingClear: "Zrušit seskupení",
  groupingEmpty: "(nevyplněno)",
  zoomOut: "Zmenšit tabulku",
  zoomIn: "Zvětšit tabulku",
  zoomReset: "Výchozí velikost",
  normalDensity: "Normální hustota řádků",
  compactDensity: "Kompaktní hustota řádků",
  resizeColumn: "Změnit šířku sloupce",
  resizeColumnHint: "Tažením změníte šířku, dvojklik vrátí automatickou šířku",
  moreActions: "Další akce",
  treeView: "Stromové zobrazení",
  tableView: "Tabulkové zobrazení",
};

export function resolveGridTexts(texts?: Partial<GridTexts>): GridTexts {
  return { ...DEFAULT_GRID_TEXTS, ...texts };
}