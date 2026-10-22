/** Popisky faktury · vlastní překladový kontrakt · bez vykreslení. */
export type InvoicePrintTextKey =
  | "draft"
  | "supplier"
  | "customer"
  | "delivery"
  | "issuedDate"
  | "taxDate"
  | "order"
  | "due"
  | "toPay"
  | "total"
  | "method"
  | "vs"
  | "account"
  | "iban"
  | "bic"
  | "ks"
  | "qr"
  | "schedule"
  | "installment"
  | "items"
  | "description"
  | "quantity"
  | "unit"
  | "unitPrice"
  | "rate"
  | "vat"
  | "base"
  | "baseTotal"
  | "vatTotal"
  | "rounding"
  | "advances"
  | "afterAdvances"
  | "advanceList"
  | "taxDocument"
  | "noTaxDocument"
  | "paidOn"
  | "amount"
  | "vatRecap"
  | "informative"
  | "note"
  | "receivedSignature"
  | "issuerSignature"
  | "issuedBy"
  | "invoiceNumber"
  | "page"
  | "of"
  | "continuation"
  | "originalNumber"
  | "correctionReason"
  | "paymentReceived"
  | "rateSentence"
  | "totalHome"
  | "showPaymentSchedule"
  | "showAdvanceDetail"
  | "showQr"
  | "showSignature"
  | "showIssuedBy"
  | "headerText"
  | "footerText"
  | "textHint"
  | "name"
  | "phone"
  | "email"
  | "reload"
  | "reloadConfirm"
  | "otherDelivery"
  | "contact"
  | "deliverySection"
  | "preview"
  | "print"
  | "download"
  | "preparing"
  | "error"
  | "logoSquare"
  | "logoWide"
  | "logoNone"
  | "examplePdp"
  | "exampleStandard"
  | "exampleEur"
  | "exampleCard"
  | "map";
/** Úplné texty tisku i souvisejících polí. */
export type InvoicePrintTexts = Record<InvoicePrintTextKey, string>;
/** České popisky návrhu C. */
export const INVOICE_PRINT_CS: InvoicePrintTexts = {
  draft: "KONCEPT",
  supplier: "Dodavatel",
  customer: "Odběratel",
  delivery: "Dodací adresa",
  issuedDate: "Datum vystavení",
  taxDate: "Datum zdan. plnění",
  order: "Objednávka odběratele",
  due: "Splatnost",
  toPay: "K úhradě",
  total: "Celkem",
  method: "Způsob platby",
  vs: "Variabilní symbol",
  account: "Účet",
  iban: "IBAN",
  bic: "BIC",
  ks: "KS",
  qr: "QR Platba",
  schedule: "Platební kalendář",
  installment: "splátka do",
  items: "Položky",
  description: "Popis",
  quantity: "Množství",
  unit: "MJ",
  unitPrice: "Cena za MJ",
  rate: "Sazba",
  vat: "DPH",
  base: "Základ",
  baseTotal: "Základ celkem",
  vatTotal: "DPH celkem",
  rounding: "Zaokrouhlení",
  advances: "Odečtené zálohy",
  afterAdvances: "Celkem po odečtení záloh",
  advanceList: "Zálohový list",
  taxDocument: "Daňový doklad",
  noTaxDocument: "bez DD",
  paidOn: "Uhrazeno",
  amount: "Částka",
  vatRecap: "Rekapitulace DPH",
  informative: "informativně",
  note: "Poznámka",
  receivedSignature: "Převzal (datum, jméno, podpis)",
  issuerSignature: "Razítko a podpis dodavatele",
  issuedBy: "Vystavil",
  invoiceNumber: "Faktura",
  page: "Strana",
  of: "z",
  continuation: "pokračování",
  originalNumber: "Původní doklad",
  correctionReason: "Důvod opravy",
  paymentReceived: "Datum přijetí platby",
  rateSentence:
    "Přepočet kurzem {source} {rate} {home}/{currency} platným ke dni uskutečnění zdanitelného plnění {date}. Daň v české měně: {vat} {home}.",
  totalHome: "Celkem v {home} (kurz {rate})",
  showPaymentSchedule: "Tisknout platební kalendář",
  showAdvanceDetail: "Tisknout podrobné zálohy",
  showQr: "QR Platba",
  showSignature: "Pole pro převzetí a razítko",
  showIssuedBy: "Tisknout, kdo doklad vystavil",
  headerText: "Záhlaví (nad položkami)",
  footerText: "Zápatí (pod položkami)",
  textHint: "Tiskne se, jen když je vyplněno",
  name: "Jméno",
  phone: "Telefon",
  email: "E-mail",
  reload: "Načíst z knihy",
  reloadConfirm: "Přepsat tiskové údaje předlohou knihy?",
  otherDelivery: "Jiná dodací adresa",
  contact: "Kontakt pro převzetí",
  deliverySection: "Dodací adresa",
  preview: "Náhled",
  print: "Tisk",
  download: "Stáhnout PDF",
  preparing: "Připravuji náhled…",
  error: "Náhled se nepodařilo připravit.",
  logoSquare: "Čtvercové logo",
  logoWide: "Obdélníkové logo",
  logoNone: "Bez loga",
  examplePdp: "Přenesená daň · 10 záloh",
  exampleStandard: "DPH 21 % + 12 %",
  exampleEur: "Faktura v EUR",
  exampleCard: "Platba kartou",
  map: "Mapa",
};
/** Slovenské popisky stejného kontraktu. */
export const INVOICE_PRINT_SK: InvoicePrintTexts = {
  ...INVOICE_PRINT_CS,
  draft: "KONCEPT",
  supplier: "Dodávateľ",
  customer: "Odberateľ",
  delivery: "Dodacia adresa",
  issuedDate: "Dátum vystavenia",
  taxDate: "Dátum zdan. plnenia",
  order: "Objednávka odberateľa",
  due: "Splatnosť",
  toPay: "Na úhradu",
  total: "Celkom",
  method: "Spôsob platby",
  vs: "Variabilný symbol",
  account: "Účet",
  schedule: "Platobný kalendár",
  installment: "splátka do",
  items: "Položky",
  description: "Popis",
  quantity: "Množstvo",
  rate: "Sadzba",
  base: "Základ",
  baseTotal: "Základ celkom",
  vatTotal: "DPH celkom",
  rounding: "Zaokrúhlenie",
  advances: "Odpočítané zálohy",
  afterAdvances: "Celkom po odpočítaní záloh",
  advanceList: "Zálohový list",
  taxDocument: "Daňový doklad",
  paidOn: "Uhradené",
  amount: "Suma",
  vatRecap: "Rekapitulácia DPH",
  informative: "informatívne",
  note: "Poznámka",
  receivedSignature: "Prevzal (dátum, meno, podpis)",
  issuerSignature: "Pečiatka a podpis dodávateľa",
  issuedBy: "Vystavil",
  invoiceNumber: "Faktúra",
  page: "Strana",
  of: "z",
  continuation: "pokračovanie",
  originalNumber: "Pôvodný doklad",
  correctionReason: "Dôvod opravy",
  paymentReceived: "Dátum prijatia platby",
  rateSentence:
    "Prepočet kurzom {source} {rate} {home}/{currency} platným ku dňu uskutočnenia zdaniteľného plnenia {date}. Daň v domácej mene: {vat} {home}.",
  totalHome: "Celkom v {home} (kurz {rate})",
  showPaymentSchedule: "Tlačiť platobný kalendár",
  showAdvanceDetail: "Tlačiť podrobné zálohy",
  showSignature: "Pole pre prevzatie a pečiatku",
  showIssuedBy: "Tlačiť, kto doklad vystavil",
  headerText: "Záhlavie (nad položkami)",
  footerText: "Zápätie (pod položkami)",
  textHint: "Tlačí sa, len keď je vyplnené",
  name: "Meno",
  phone: "Telefón",
  reload: "Načítať z knihy",
  reloadConfirm: "Prepísať tlačové údaje predlohou knihy?",
  otherDelivery: "Iná dodacia adresa",
  contact: "Kontakt pre prevzatie",
  deliverySection: "Dodacia adresa",
  preview: "Náhľad",
  print: "Tlač",
  download: "Stiahnuť PDF",
  preparing: "Pripravujem náhľad…",
  error: "Náhľad sa nepodarilo pripraviť.",
  examplePdp: "Prenesená daň · 10 záloh",
  exampleStandard: "DPH 21 % + 12 %",
  exampleEur: "Faktúra v EUR",
  exampleCard: "Platba kartou",
};
