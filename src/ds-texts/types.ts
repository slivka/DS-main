/**
 * Typy textů design systému.
 * Vlastní: tvar všech textů knihovny (DsTexts) a dílčí rozhraní.
 * Nesmí: obsahovat hodnoty textů ani React kód.
 */
import type { LinkedRecordTexts } from "./linked-record-texts";
import type { TemplateTexts } from "./template-texts";
import type { AdvanceTexts } from "./advance-texts";
import type { FileImportTexts } from "./file-import-texts";
export type { FileImportTexts } from "./file-import-texts";
export type { AdvanceTexts } from "./advance-texts";
export type { TemplateTexts } from "./template-texts";
export type { LinkedRecordTexts } from "./linked-record-texts";
import type { BankStatementTexts } from "./bank-statement-texts";
export type { BankStatementTexts } from "./bank-statement-texts";
import type { Locale } from "date-fns";
import type { PaneChromeTexts } from "../components/ds/panes/pane-context";
import type { LayoutMenuTexts } from "../components/ds/panes/layout-menu";
import type {
  AttachmentTexts,
  RecordHistoryTexts,
  RecordNotesTexts,
  RecordPanelTexts,
  SourcePreviewTexts,
} from "./record-panel-texts";
export type {
  AttachmentTexts,
  RecordHistoryTexts,
  RecordPanelTexts,
  SourcePreviewTexts,
} from "./record-panel-texts";

/** Druh potvrzovaného odchodu. */
export type UnsavedChangesAction = "close" | "switch" | "logout" | "navigate" | "record";
/** Přeložené volby potvrzení odchodu. */
export type UnsavedActionTexts = Record<
  UnsavedChangesAction,
  { title: string; discard: string; back: string; save: string }
>;
export type DsLocale = "cs" | "sk";
export type TextTemplate = (...args: never[]) => string;
export type TextTree = { [key: string]: string | TextTemplate | TextTree };

import type { GridTexts, JournalEditorTexts } from "./grid-journal-types";
import type { VatFiveTexts } from "./vat-five-texts";
export type { VatFiveTexts } from "./vat-five-texts";
export type { GridTexts, JournalEditorTexts, JournalVatGroupsTexts } from "./grid-journal-types";

export interface DsTexts {
  /** Obecné importní prvky. */
  fileImport: FileImportTexts;
  /** Texty záloh a odečtů. */
  advances: AdvanceTexts;
  /** Duplikace a vzory. */
  templates: TemplateTexts;
  /** DPH 5 B a zálohové listy (2.118.0). */
  vatFive: VatFiveTexts;
  /** Propojené doklady. */
  linkedRecords: LinkedRecordTexts;
  /** Panel záznamu. */
  recordPanel: RecordPanelTexts;
  /** Poznámky záznamu. */
  recordNotes: RecordNotesTexts;
  /** Přílohy záznamu. */
  attachments: AttachmentTexts;
  /** Náhled zdroje záznamu. */
  sourcePreview: SourcePreviewTexts;
  /** Historie záznamu. */
  recordHistory: RecordHistoryTexts;
  /** Přístupné názvy číselného krokovače. */
  stepper: { decrease: string; increase: string };
  /** Názvy vytváření z hledatelných výběrů. */
  selectCreate: {
    item: string;
    partner: string;
    dimension: string;
    unit: string;
    /** Štítek (TagPicker). */
    tag: string;
    /** Důvod zašedlého ＋ při prázdném hledání. */
    emptyQuery: string;
    /** Důvod zašedlého ＋ při shodném názvu nebo kódu. */
    duplicate: string;
  };
  /** Rychlé termíny splatnosti. */
  dateQuick: { sevenDays: string; fourteenDays: string; oneMonth: string };
  /** Specifické texty rozšířeného formuláře dokladu. */
  documentEdit: {
    taxNumber: string;
    numberPending: string;
    numberLink: string;
    numberLinked: string;
    numberUnlinked: string;
    movementDate: string;
    movementTitle: string;
    /** Zámek data účetního případu u bankovního pohybu (odemčeno). */
    movementDateLink: string;
    /** Zámek data účetního případu u bankovního pohybu (zamčeno). */
    movementDateLinked: string;
    counteraccountSection: string;
    accountKind: string;
    domesticAccount: string;
    /** Krátký název tuzemského režimu přepínače protiúčtu. */
    domesticAccountShort: string;
    /** Společný popisek čísla nebo IBAN protiúčtu. */
    counterpartyAccount: string;
    /** Daňové číslo dodavatele v pokladním výdaji. */
    cashSupplierTaxNumber: string;
    iban: string;
    swift: string;
    accountNumber: string;
    accountPattern: string;
    bankCode: string;
    income: string;
    expense: string;
    /** @deprecated 2.108.0 – pohyby se zobrazují i u neuloženého výpisu; nepoužívat. */
    unsavedMovements: string;
    /** Přístupný název zámku VS. */
    vsLink: string;
    /** Tooltip zamčeného VS (odvozený). */
    vsLinked: string;
    /** Tooltip odemčeného VS (vlastní). */
    vsUnlinked: string;
    /** Varování: číslo daňového dokladu má víc než 10 číslic. */
    vsTooLong: string;
    /** Varování: číslo daňového dokladu neobsahuje číslice. */
    vsNoDigits: string;
    /** Varování ručního partnera u interního dokladu. */
    internalManualPartner: string;
    /** Kód banky v nabídce, tokeny {code} a {name}. */
    bankCodeOption: string;
  };
  /** Formulář bankovního výpisu. */
  bankStatement: BankStatementTexts;
  /** Přepínače uvnitř polí. */
  fieldToggle: {
    /** Obecný důvod zamčení bez konkrétního vysvětlení. */
    locked: string;
    /** Zapnutý nedaňový stav. */
    nonTaxPressed: string;
    /** Vypnutý nedaňový stav. */
    nonTaxUnpressed: string;
    directory: string;
    directoryPressed: string;
    directoryUnpressed: string;
    suggest: string;
    suggestPressed: string;
    suggestUnpressed: string;
    sum: string;
    sumPressed: string;
    sumUnpressed: string;
    sumLocked: string;
    dateLink: string;
    dateLocked: string;
    nonTax: string;
    nonTaxLocked: string;
  };
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
  recordAction: {
    moreActions: string;
    unsaved: string;
    errorTitle: string;
    closeError: string;
    /** Zbývající chyby souhrnu; `{count}` = počet. */
    moreErrors: string;
    /** Titulek pruhu po neúspěšném uložení, token {count}. */
    saveFailedTitle: string;
    /** Titulek pruhu s chybami k doplnění, token {count}. */
    fixBeforeTitle: string;
    /** Titulek pruhu jen s varováními, token {count}. */
    warningsTitle: string;
  };
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
    /** Potvrzení náhrady obsazeného okna navázanou záložkou. */
    linkedReplaceTitle: string;
    linkedReplaceDescription: string;
    linkedReplaceConfirm: string;
    /** Navázané okno jde otevřít jen ze záložky záznamu. */
    linkedOnlyRecord: string;
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
    /** Text tlačítka Uložit během ukládání. */
    saving: string;
    /** Výchozí popisek akce Odstranit. */
    deleteLabel: string;
    /** Zaškrtnutá hodnota jen pro čtení. */
    valueYes: string;
    /** Nezaškrtnutá hodnota jen pro čtení. */
    valueNo: string;
    /** Prázdná hodnota jen pro čtení. */
    emptyValue: string;
  };
  date: {
    today: string;
    previous: string;
    next: string;
    approved: string;
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
  multiSelect: { selectAll: string; noValues: string; add?: string; clear?: string };
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
    /** Štítek ručně zadaného dodavatele vedle „Vstupuje do DPH“. */
    unverifiedSupplier: string;
    /** Bublina štítku ručně zadaného dodavatele. */
    unverifiedSupplierHint: string;
    /** Reference platby (E2E) u zahraničního protiúčtu. */
    paymentReference: string;
    /** Stálý název vazby data DPH na DUZP. */
    vatDateLinkLabel: string;
    /** Popisek celku v domácí měně. */
    totalHome?: string;
    changeAccount: string;
    currencyDisabled: string;
    mainAccountSelect: string;
    supplierNumber: string;
    supplierTaxDocumentNumber: string;
    documentNumberTooLongForVs: string;
    invalidDate: string;
    /** Obecný popisek pole bez vlastního textu (technický klíč se nikdy neukáže). */
    unknownField: string;
    bankAccountInvalid: string;
    bankCodeInvalid: string;
    otherBankAccount: string;
    /** Přístupný název přepínače ručního zadání účtu. */
    bankAccountManualToggle: string;
    /** Bublina zapnutého ručního zadání účtu. */
    bankAccountManualOn: string;
    /** Bublina výběru z účtů. */
    bankAccountManualOff: string;
    /** Vzor formátu ručně zadaného účtu uvnitř pole. */
    bankAccountFormatPattern: string;
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
    /** @deprecated Od 2.100.0 ignorováno; použijte DsTexts.fieldToggle.directory. Odstranění v 3.0.0. */
    selectFromDirectory?: string;
    /** @deprecated Od 2.100.0 ignorováno; použijte DsTexts.fieldToggle.directoryUnpressed. Odstranění v 3.0.0. */
    enterManually?: string;
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
