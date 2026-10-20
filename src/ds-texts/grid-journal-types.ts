/** Typy textů gridů a editoru řádků; bez hodnot a chování. */
export interface GridTexts {
  locale: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearchLabel: string;
  /** Název sloučeného tlačítka dvou primárních akcí lišty v nejužší šířce. */
  addMenu?: string;
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
  cancel: string;
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
  activeCount: (count: number) => string;
  defaultFilters: string;
  clearAllFilters: string;
  clearFilter: string;
  removeFilter: (label: string) => string;
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
  groupingHidden: (count: number) => string;
  groupedCount: (count: number) => string;
  groupingMoveLeft: string;
  groupingMoveRight: string;
  groupingDateBy: string;
  groupingRemoveColumn: string;
  groupDay: string;
  groupMonth: string;
  groupQuarter: string;
  groupYear: string;
  quarterLabel: (quarter: number, year: string | number) => string;
  zoomOut: string;
  zoomIn: string;
  zoomReset: string;
  normalDensity: string;
  compactDensity: string;
  resizeColumn: string;
  resizeColumnHint: string;
  moreActions: string;
  moreParameters: string;
  moreTools: string;
  treeView: string;
  tableView: string;
  groupTotal: (label: string) => string;
  sortBy: (label: string) => string;
  expand: string;
  collapse: string;
  expandLevel: (level: number, label: string) => string;
  exportSearch: (query: string) => string;
  recordsCount: (count: number) => string;
}

/** Texty editoru řádků dokladu; prop `texts` editoru je částečný přepis. */
export interface JournalEditorTexts {
  row: string;
  debitAccount: string;
  creditAccount: string;
  counterAccount: string;
  /** Přepíše sdílený text `DsTexts.columnPicker.accountFormRequired`. */
  accountFormRequired?: string;
  amount: string;
  homeAmount: string;
  foreignAmount: string;
  text: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  dimension: string;
  vs: string;
  partner: string;
  debitDimension: string;
  creditDimension: string;
  debitVs: string;
  creditVs: string;
  debitPartner: string;
  creditPartner: string;
  nonTax: string;
  /** @deprecated Od 2.100.0 ignorováno; použijte fieldToggle.nonTaxPressed. Odstranění v 3.0.0. */
  nonTaxOn?: string;
  /** @deprecated Od 2.100.0 ignorováno; použijte fieldToggle.nonTaxUnpressed. Odstranění v 3.0.0. */
  nonTaxOff?: string;
  rounding: string;
  fxRounding: string;
  fxRoundingPreview: string;
  fxRoundingHint: string;
  detail: string;
  showDetail: string;
  hideDetail: string;
  sideDebit: string;
  sideCredit: string;
  actions: string;
  addLine: string;
  duplicateLine: string;
  removeLine: string;
  undo: string;
  removed: string;
  total: string;
  remaining: string;
  /** Rozpis řádků převyšuje zadanou částku. */
  exceeded: string;
  /** @deprecated 2.108.0 – stav „✓ Rozepsáno“ se nezobrazuje (rozhodnutí 18. 10.). */
  balanced: string;
  roundingExists: string;
  /** @deprecated Od 2.54; počet chyb předejte přes onValidationChange. Odstraní se ve 3.0.0. */
  errors: string;
  empty: string;
  debitRequired: string;
  creditRequired: string;
  amountRequired: string;
  missingVs: string;
  missingDimension: string;
  search: string;
  searchResult: string;
  clearSearch: string;
  quantityPriceHint: string;
  vatCode: string;
  /** Sloupec částky u dokladu s DPH (2.118.0). */
  amountNet: string;
  vatRate: string;
  vatAmount: string;
  grossAmount: string;
  /** @deprecated 2.109.0 – přepínač Bez / S DPH zrušen; odstraní se ve 3.0.0. */
  vatMode: string;
  /** @deprecated 2.109.0 – přepínač zrušen; odstraní se ve 3.0.0. */
  vatModeNet: string;
  /** @deprecated 2.109.0 – přepínač zrušen; odstraní se ve 3.0.0. */
  vatModeGross: string;
  /** @deprecated 2.109.0 – ruční daň na řádku zrušena; odstraní se ve 3.0.0. */
  vatManual: string;
  /** Skupiny DPH, pomocník „Cena s DPH“ a patička Rozdílu (2.109.0). */
  vatGroups: JournalVatGroupsTexts;
  resetVat: string;
  vatDeduction: string;
  deductionFull: string;
  deductionNone: string;
  deductionPartial: string;
  deductionShare: string;
  pdpSubject: string;
  vatBaseHome: string;
  vatHome: string;
  vatCodeRequired: string;
  vatDeviation: string;
  pdpRequired: string;
  deductionShareRange: string;
  vatMissingAccounts: string;
  /** Popisek sloupce kurzu. */
  rate: string;
  /** Přístupný název úchytu pro přesun řádku. */
  moveRow: string;
  /** Zkratka nedaňového řádku na přepínači. */
  nonTaxShort: string;
}

/** Texty skupin DPH, pomocníka ceny s DPH a patičky (2.109.0). */
export interface JournalVatGroupsTexts {
  /** Nadpis rekapitulace DPH. */
  title: string;
  /** Sloupec Kód DPH. */
  code: string;
  /** Sloupec Sazba. */
  rate: string;
  /** Sloupec Základ. */
  base: string;
  /** Sloupec DPH. */
  vat: string;
  /** Sloupec Celkem. */
  gross: string;
  /** Sloupec základu v měně firmy; `{currency}` = značka měny. */
  baseHome: string;
  /** Sloupec DPH v měně firmy; `{currency}` = značka měny. */
  vatHome: string;
  /** Rozbalit / sbalit sloupce v měně firmy. */
  toggleHome: string;
  /** Akce úprav skupiny „dle dokladu“. */
  adjust: string;
  /** DPH dle dokladu. */
  vatByDocument: string;
  /** Celkem s DPH dle dokladu. */
  grossByDocument: string;
  /** Základ dle dokladu. */
  baseByDocument: string;
  /** Vypočtená daň vedle přepisu. */
  calculated: string;
  /** Rozdíl přepisu. */
  difference: string;
  /** Vrátit vypočtenou daň. */
  resetVat: string;
  /** Použít hodnotu. */
  apply: string;
  /** Zrušit. */
  cancel: string;
  /** Rozdíl přepisu nad tolerancí; `{group}`, `{difference}`. */
  overTolerance: string;
  /** Přepis daně ≠ 0 u skupiny s nulovým základem ({group}). */
  overrideZeroBase: string;
  /** Popisek bubliny „vypočteno · rozdíl“ u přepsané daně. */
  calculatedInfo: string;
  /** Bublina pevné daně. */
  fixedTax: string;
  /** Pomocník Cena s DPH (název ikony). */
  grossHelper: string;
  /** Popisek pole v pomocníkovi; `{rate}` = sazba. */
  grossHelperField: string;
  /** Patička: Součet. */
  sum: string;
  /** Patička: Zaokrouhlení. */
  rounding: string;
  /** Patička: Rozdíl. */
  difference2: string;
  /** Nabídka u Rozdílu. */
  balance: string;
  /** Dorovnat DPH. */
  balanceVat: string;
  /** Dorovnat DPH skupiny; `{group}`. */
  balanceVatGroup: string;
  /** Dorovnat základ. */
  balanceBase: string;
  /** Zaokrouhlení v limitu. */
  balanceRounding: string;
  /** Bez možné akce (rozdíl nad limit). */
  noAction: string;
}
