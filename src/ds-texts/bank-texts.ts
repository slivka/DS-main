/** Texty banky · vlastní jazykový kontrakt · nesmí řídit rozpoznání ani platby. */

/** Texty rozpisu výpisu s rozpoznáním (I3). */
export interface BankReconcileTexts {
  /** Nadpis gridu pohybů. */
  title: string;
  /** Sloupec pořadí. */
  order: string;
  /** Sloupec datum pohybu. */
  date: string;
  /** Sloupec směr. */
  direction: string;
  /** Příjem. */
  directionIn: string;
  /** Výdaj. */
  directionOut: string;
  /** Sloupec částka. */
  amount: string;
  /** Sloupec protiúčet a protistrana. */
  counterparty: string;
  /** Sloupec symboly. */
  symbols: string;
  /** Sloupec zpráva. */
  message: string;
  /** Sloupec účet / položka. */
  account: string;
  /** Sloupec partner. */
  partner: string;
  /** Sloupec kategorie. */
  category: string;
  /** Sloupec dimenze. */
  dimensions: string;
  /** Sloupec popis. */
  description: string;
  /** Sloupec stav rozpoznání. */
  status: string;
  /** Sloupec zdroj rozpoznání. */
  source: string;
  /** Stav jisté. */
  statusCertain: string;
  /** Stav návrh. */
  statusSuggestion: string;
  /** Stav nerozpoznáno. */
  statusUnrecognized: string;
  /** Stav zařazeno. */
  statusFiled: string;
  /** Zdroj: otevřená položka. */
  sourceOpenItem: string;
  /** Zdroj: vlastní účet. */
  sourceOwnAccount: string;
  /** Zdroj: účet partnera. */
  sourcePartnerAccount: string;
  /** Zdroj: pravidlo. */
  sourceRule: string;
  /** Filtr stavu: vše. */
  filterAll: string;
  /** Filtr stavu: jisté. */
  filterCertain: string;
  /** Filtr stavu: návrhy. */
  filterSuggestions: string;
  /** Filtr stavu: nerozpoznané. */
  filterUnrecognized: string;
  /** Filtr stavu: zařazené. */
  filterFiled: string;
  /** Akce Zařadit vše jisté, token {count}. */
  fileAllCertain: string;
  /** Akce Přijmout návrhy vybraných. */
  acceptSelected: string;
  /** Akce Zařadit vybrané. */
  fileSelected: string;
  /** Akce Znovu rozpoznat. */
  recognizeAgain: string;
  /** Akce Vytvořit pravidlo z pohybu. */
  createRule: string;
  /** Akce Otevřít doklad. */
  openDocument: string;
  /** Akce Přijmout návrh. */
  accept: string;
  /** Akce Odmítnout návrh. */
  reject: string;
  /** Popisek výběru kandidáta. */
  candidateLabel: string;
  /** Kandidát úhrady, tokeny {document} a {remaining}. */
  candidatePayment: string;
  /** Pruh importu ze souboru, tokeny {date} a {file}. */
  importFile: string;
  /** Pruh importu z API, tokeny {date} a {count}. */
  importApi: string;
  /** Akce Stáhnout originál. */
  downloadOriginal: string;
  /** Akce Zrušit import. */
  cancelImport: string;
  /** Souhrn: počáteční zůstatek. */
  summaryOpening: string;
  /** Souhrn: příjmy. */
  summaryIncome: string;
  /** Souhrn: výdaje. */
  summaryExpense: string;
  /** Souhrn: konečný zůstatek. */
  summaryClosing: string;
  /** Souhrn: zůstatek na výpise. */
  summaryBankClosing: string;
  /** Souhrn: rozdíl. */
  summaryDifference: string;
  /** Prázdný rozpis. */
  empty: string;
  /** Klávesová zkratka přijetí návrhu. */
  acceptShortcut: string;
}

/** Texty napojení knihy na banku (I4). */
export interface BankConnectionTexts {
  /** Nadpis sekce. */
  title: string;
  /** Popisek způsobu. */
  method: string;
  /** Jen ruční import. */
  methodManual: string;
  /** Fio API. */
  methodFio: string;
  /** Jiná banka (připravujeme). */
  methodOther: string;
  /** Připravujeme. */
  comingSoon: string;
  /** Popisek tokenu. */
  token: string;
  /** Token uložen, tokeny {date} a {who}. */
  tokenSaved: string;
  /** Token není uložen. */
  tokenMissing: string;
  /** Akce Změnit token. */
  changeToken: string;
  /** Titulek dialogu tokenu. */
  tokenDialogTitle: string;
  /** Popisek pole tokenu. */
  tokenField: string;
  /** Nápověda: token se nikdy nezobrazí. */
  tokenHint: string;
  /** Popisek druhu tokenu. */
  tokenKind: string;
  /** Jen sledování. */
  tokenKindRead: string;
  /** Sledování a příkazy. */
  tokenKindPayments: string;
  /** Popisek Token platí do. */
  tokenValidTo: string;
  /** Upozornění vypršení, token {days}. */
  tokenExpires: string;
  /** Popisek Stahovat. */
  fetchSchedule: string;
  /** Denně v. */
  fetchDaily: string;
  /** Častěji v pracovní dny. */
  fetchWorkdays: string;
  /** Popisek Stahovat od. */
  fetchFrom: string;
  /** Chyba: nejvýš 90 dní zpět. */
  fetchFromTooOld: string;
  /** Popisek výpisů. */
  statements: string;
  /** Text periodicity výpisů. */
  statementsNote: string;
  /** Popisek stavu spojení. */
  status: string;
  /** Stav aktivní. */
  statusActive: string;
  /** Stav chyba tokenu. */
  statusTokenError: string;
  /** Stav chyba. */
  statusError: string;
  /** Stav pozastaveno. */
  statusPaused: string;
  /** Stav odpojeno. */
  statusDisconnected: string;
  /** Popisek poslední chyby. */
  lastError: string;
  /** Popisek posledního úspěchu. */
  lastSuccess: string;
  /** Akce Otestovat spojení. */
  testConnection: string;
  /** Akce Stáhnout teď. */
  fetchNow: string;
  /** Blokace stažení, token {seconds}. */
  fetchCooldown: string;
  /** Akce Pozastavit. */
  pause: string;
  /** Akce Obnovit. */
  resume: string;
  /** Akce Odpojit. */
  disconnect: string;
  /** Potvrzení odpojení. */
  disconnectConfirm: string;
  /** Pruh: napojeno, tokeny {date} a {count}. */
  bannerConnected: string;
  /** Pruh: token vyprší, token {days}. */
  bannerTokenExpires: string;
  /** Pruh: chyba spojení. */
  bannerError: string;
  /** Štítek průběžného výpisu. */
  ongoing: string;
  /** Vysvětlení průběžného výpisu. */
  ongoingHint: string;
}

/** Texty pravidel účtování banky (I5). */
export interface BankRuleTexts {
  /** Nadpis seznamu. */
  title: string;
  /** Sloupec pořadí. */
  order: string;
  /** Sloupec název. */
  name: string;
  /** Sloupec podmínky. */
  conditions: string;
  /** Sloupec výsledek. */
  result: string;
  /** Sloupec jistota. */
  certainty: string;
  /** Jisté. */
  certain: string;
  /** Návrh. */
  suggestion: string;
  /** Sloupec knihy. */
  books: string;
  /** Všechny knihy. */
  allBooks: string;
  /** Sloupec stav. */
  status: string;
  /** Akce Nové. */
  add: string;
  /** Akce Upravit. */
  edit: string;
  /** Akce Duplikovat. */
  duplicate: string;
  /** Akce Deaktivovat. */
  deactivate: string;
  /** Akce Aktivovat. */
  activate: string;
  /** Titulek dialogu nového pravidla. */
  dialogNew: string;
  /** Titulek dialogu úpravy. */
  dialogEdit: string;
  /** Sekce podmínek. */
  conditionsSection: string;
  /** Nápověda kombinace A ZÁROVEŇ. */
  conditionsHint: string;
  /** Podmínka směr. */
  direction: string;
  /** Obě směry. */
  directionBoth: string;
  /** Podmínka protiúčet nebo IBAN. */
  counterAccount: string;
  /** Podmínka VS. */
  vs: string;
  /** Podmínka KS. */
  ks: string;
  /** Podmínka SS. */
  ss: string;
  /** Podmínka text obsahuje. */
  textContains: string;
  /** Podmínka druh pohybu. */
  movementKind: string;
  /** Druh běžný. */
  kindNormal: string;
  /** Druh poplatek. */
  kindFee: string;
  /** Druh úrok. */
  kindInterest: string;
  /** Druh karta. */
  kindCard: string;
  /** Druh storno. */
  kindReversal: string;
  /** Podmínka částka od. */
  amountFrom: string;
  /** Podmínka částka do. */
  amountTo: string;
  /** Podmínka knihy. */
  booksField: string;
  /** Sekce výsledku. */
  resultSection: string;
  /** Výsledek účet. */
  account: string;
  /** Výsledek partner. */
  partner: string;
  /** Výsledek kategorie. */
  category: string;
  /** Výsledek dimenze. */
  dimensions: string;
  /** Výsledek popis. */
  description: string;
  /** Nápověda zástupných značek. */
  placeholdersHint: string;
  /** Výsledek nedaňový. */
  nonTax: string;
  /** Výsledek jistota. */
  certaintyField: string;
  /** Náhled použití, token {count}. */
  preview: string;
  /** Prázdný seznam. */
  empty: string;
}

/** Texty platebních dávek (I7). */
export interface BankPaymentTexts {
  /** Nadpis dávky. */
  title: string;
  /** Sloupec partner. */
  partner: string;
  /** Sloupec doklad. */
  document: string;
  /** Sloupec splatnost. */
  dueDate: string;
  /** Sloupec částka. */
  amount: string;
  /** Sloupec zbývá. */
  remaining: string;
  /** Sloupec měna. */
  currency: string;
  /** Sloupec účet partnera. */
  partnerAccount: string;
  /** Sloupec symboly. */
  symbols: string;
  /** Sloupec zpráva pro příjemce. */
  message: string;
  /** Sloupec datum úhrady. */
  paymentDate: string;
  /** Sloupec kontroly. */
  checks: string;
  /** Po splatnosti. */
  overdue: string;
  /** Součet vybraných. */
  selectedTotal: string;
  /** Filtr splatnosti. */
  dueFilter: string;
  /** Filtr knihy. */
  bookFilter: string;
  /** Akce Vytvořit soubor příkazu. */
  createFile: string;
  /** Popisek formátu souboru. */
  fileFormat: string;
  /** Akce Odeslat do Fio. */
  sendFio: string;
  /** Důvod zákazu odeslání. */
  sendDisabled: string;
  /** Akce Uložit dávku. */
  saveBatch: string;
  /** Ručně psaný účet nelze. */
  accountManualForbidden: string;
  /** Titulek dialogu odeslání. */
  sendTitle: string;
  /** Souhrn dávky, tokeny {count} a {amounts}. */
  sendSummary: string;
  /** Popisek účtu plátce. */
  payerAccount: string;
  /** Upozornění přímého odeslání. */
  sendWarning: string;
  /** Popisek druhé osoby. */
  approver: string;
  /** Stav schválení druhou osobou. */
  approverStatus: string;
  /** Limit dávky, token {limit}. */
  batchLimit: string;
  /** Limit dne, token {limit}. */
  dayLimit: string;
  /** Text k opsání. */
  sendConfirmText: string;
  /** Potvrzovací tlačítko odeslání. */
  sendConfirm: string;
  /** Nadpis seznamu dávek. */
  listTitle: string;
  /** Sloupec datum. */
  listDate: string;
  /** Sloupec kdo. */
  listAuthor: string;
  /** Sloupec banka / soubor. */
  listTarget: string;
  /** Sloupec počet. */
  listCount: string;
  /** Sloupec částka. */
  listAmount: string;
  /** Sloupec stav. */
  listStatus: string;
  /** Stav vytvořeno. */
  statusCreated: string;
  /** Stav staženo. */
  statusDownloaded: string;
  /** Stav odesláno do banky. */
  statusSent: string;
  /** Stav částečně uhrazeno. */
  statusPartial: string;
  /** Stav uhrazeno. */
  statusPaid: string;
  /** Stav zrušeno. */
  statusCancelled: string;
  /** Akce Stáhnout soubor znovu. */
  downloadAgain: string;
  /** Akce Zrušit dávku. */
  cancelBatch: string;
  /** Popisek důvodu zrušení. */
  cancelReason: string;
  /** Akce Otevřít. */
  open: string;
  /** Štítek Odesláno do banky. */
  sentBadge: string;
  /** Vysvětlení štítku. */
  sentBadgeHint: string;
  /** Prázdná dávka. */
  empty: string;
}
