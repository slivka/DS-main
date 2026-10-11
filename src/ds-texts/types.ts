/**
 * Typy textů design systému.
 * Vlastní: tvar všech textů knihovny (DsTexts) a dílčí rozhraní.
 * Nesmí: obsahovat hodnoty textů ani React kód.
 */
import type { Locale } from "date-fns";
import type { PaneChromeTexts } from "../components/ds/panes/pane-context";
import type { LayoutMenuTexts } from "../components/ds/panes/layout-menu";

/** Druh potvrzovaného odchodu. */
export type UnsavedChangesAction = "close" | "switch" | "logout" | "navigate";
/** Přeložené volby potvrzení odchodu. */
export type UnsavedActionTexts = Record<
  UnsavedChangesAction,
  { title: string; discard: string; back: string; save: string }
>;
export type DsLocale = "cs" | "sk";
export type TextTemplate = (...args: never[]) => string;
export type TextTree = { [key: string]: string | TextTemplate | TextTree };

import type { GridTexts, JournalEditorTexts } from "./grid-journal-types";
export type { GridTexts, JournalEditorTexts } from "./grid-journal-types";

export interface DsTexts {
  locale: DsLocale;
  intlLocale: string;
  dateLocale: Locale;
  grid: GridTexts;
  common: {
    close: string;
    cancel: string;
    confirm: string;
    understand: string;
    save: string;
    yes: string;
    no: string;
    system: string;
  };
  recordAction: { moreActions: string; unsaved: string; errorTitle: string; closeError: string };
  appShell: {
    clearSearch: string;
    mainMenu: string;
    containsActivePage: string;
    disabledHint: string;
    searchPlaceholder: string;
    searchEmpty: string;
    resizeMenu: string;
    panelView: string;
    contextDisabledHint: string;
  };
  paneChrome?: Partial<PaneChromeTexts>;
  layoutMenu?: Partial<LayoutMenuTexts>;
  panes: {
    panel: (index: number) => string;
    emptyHint: string;
    maximizedBanner: string;
    restoreLayout: string;
    limitClosed: string;
    /** Nadpis dialogu neuložených změn. */
    unsavedTitle: (tab: string) => string;
    /** Druhá věta dialogu. */
    unsavedNotSaved: string;
    unsavedActions?: UnsavedActionTexts;
    saveAndContinue: string;
    continueWithoutSaving: string;
    backToRecord: string;
    openInNewTab: string;
    intentCloseTab: string;
    intentClosePane: string;
    intentReplace: (target: string) => string;
    intentHistory: string;
    intentLogout: string;
    /** Oznámení po otevření v nové záložce místo nahrazení rozepsané. */
    openedInNewTab: (target: string, tab: string) => string;
    /** Přístupný název tečky neuložených změn. */
    unsavedChanges: string;
  };
  notification: {
    label: string;
    title: string;
    markAllRead: string;
    empty: string;
    showAll: string;
    loading: string;
  };
  appZoom: { label: string; decrease: string; increase: string; reset: string };
  /** Rám mimo AppShell (nastavení prostoru). */
  standalone: { close: string; pages: string; pagesSelect: string };
  contextSwitcher: { search: string; empty: string; current: string; selected: string };
  confirmByTyping: { instruction: string; cancel: string; running: string };
  dangerZone: { title: string };
  noticeBar: { close: string };
  maskInput: {
    /** Popisek náhledu příštího čísla. */
    preview: string;
    /** Výchozí tokeny masky čísla dokladu. */
    tokens: { token: string; label: string }[];
  };
  recordDialog: {
    detailSections: string;
    hidePanel: (panel: string) => string;
    notes: string;
    active: string;
    inactive: string;
    saveAndAction: string;
    dirtyTitle: string;
    history: string;
    noHistory: string;
    system: string;
    yes: string;
    no: string;
  };
  date: {
    chooseDate: string;
    dateSelection: string;
    openCalendar: string;
    invalidFormat: (format: string) => string;
    sameAsIssue: string;
    relinkIssue: string;
    rangePlaceholder: string;
    rangeLabel: string;
    clear: string;
    chooseRangeEnd: string;
    openTime: string;
    all: string;
    day: string;
    week: string;
    month: string;
    year: string;
    custom: string;
    from: string;
    to: string;
  };
  country: {
    choose: string;
    search: string;
    emptyTitle: string;
    emptyDescription: (query: string) => string;
    recent: string;
    eu: string;
    other: string;
  };
  multiSelect: { selectAll: string; noValues: string };
  rateField?: {
    note: string;
    manual: string;
    required: string;
    withoutDate: string;
    unit: string;
    suggested: (info: string, rate: string) => string;
  };
  optionSelect: {
    emptyValue: string;
    inactive: string;
    unknownValue: string;
    searchPlaceholder: string;
    noResults: string;
  };
  tree: { expand: string; collapse: string; breadcrumbs: string };
  contacts: {
    blacklist: string;
    companyId: string;
    personalId: string;
    openRegistry: string;
    openAres: string;
  };
  accessibility: { resizeCombobox: string };
  company: { companyId: string };
  errors: {
    load: string;
    network: string;
    networkDetail: string;
    expired: string;
    expiredDetail: string;
    forbidden: string;
    forbiddenDetail: string;
    timeout: string;
    timeoutDetail: string;
  };
  columnPicker: {
    clearCustom: string;
    clearCustomTitle: string;
    default: string;
    restoreSaved: string;
    restoreFactory: string;
    showSection: (section: string) => string;
    hideSection: (section: string) => string;
    show: string;
    hide: string;
    saveDefault: string;
    saved: string;
    saveColumns: string;
    persistenceHint: string;
    savedViews: string;
    noSavedViews: string;
    applyView: string;
    overwrite: string;
    overwriteTitle: string;
    deleteView: string;
    viewName: string;
    saveView: string;
    save: string;
    accountFormRequired: string;
    compactAccountHeading: (label: string) => string;
  };
  /** Rekapitulace účetních řádků – názvy sloupců účtů (krátká / rozšířená forma). */
  /** Texty editoru řádků dokladu (`JournalLinesEditor`). */
  journalEditor: JournalEditorTexts;
  journalRecap: {
    debitShort: string;
    creditShort: string;
    debitAccount: string;
    creditAccount: string;
  };
  documentForm: {
    /** Popisek celku v domácí měně. */
    totalHome?: string;
    changeAccount: string;
    currencyDisabled: string;
    mainAccountSelect: string;
    supplierNumber: string;
    supplierTaxDocumentNumber: string;
    documentNumberTooLongForVs: string;
    bankAccountInvalid: string;
    bankCodeInvalid: string;
    otherBankAccount: string;
    editSelected: string;
    manualAccountNumber: string;
    manualAccountWithoutIban: string;
    invalidIban: string;
    invalidSwift: string;
    swiftRequired: string;
    addBankAccount: string;
    selectSupplierFirst: string;
    invalidBankAccountWarning: string;
    invalidBankAccount: string;
    bankAccountMissing: string;
    paymentMethod: string;
    companyBankAccount: string;
    vatVerified: (date: string) => string;
    counterpartyTab: string;
    printTab: string;
    reloadFromPartner: string;
    name: string;
    ico: string;
    dic: string;
    email: string;
    phone: string;
    printGeneral: string;
    printItems: string;
    issuedBy: string;
    printHeader: string;
    printFooter: string;
    printVatRecap: string;
    printNote: string;
    printColumnHeadings: string;
    printTotalsRow: string;
    printPaymentSchedule: string;
    headerText: string;
    footerText: string;
    note: string;
    selectFromDirectory: string;
    enterManually: string;
    replaceManualCounterparty: string;
    counterpartyLocked: string;
    manuallyEdited: string;
    refreshCounterparty: string;
    frozenAt: (date: string) => string;
    payByOrder: string;
    excludeFromPaymentOrders: string;
    paymentOrderDisabled: string;
    payToBankAccount: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    country: string;
    refreshCounterpartyConfirm: string;
    bankCodeRequired: string;
    accountRequired: string;
    accountOrIban: string;
    vsColumn: string;
    clear: string;
  };
  export: {
    parametersSheet: string;
    parameter: string;
    value: string;
    reportName: string;
    company: string;
    period: string;
    exportedAt: string;
    user: string;
    activeFilters: string;
    pageFooter: string;
    fallbackColumn: (index: number) => string;
    printPdf: string;
  };
  print: {
    book: string;
    allBooks: string;
    period: string;
    search: string;
    filter: string;
    asOf: string;
    total: string;
    portrait: string;
    landscape: string;
    orientation: string;
    largeTitle: string;
    largeDescription: (rows: string, pages: string) => string;
    print: string;
    printTitle: string;
    downloadPdf: string;
    preview: string;
    preparing: string;
    printedBy: string;
    page: (page: number, pages: number) => string;
  };
}
