/**
 * Klientské kontroly hlavičky dokladu · vlastní převod chyb a varování na položky pruhu ·
 * nesmí měnit pole ani hodnoty; serverové položky sem nepatří.
 */
import { isValidCzIco } from "../../form/ico-link";
import type { FormIssue } from "../../../../lib/form-issues";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
  DocumentVatRateField,
} from "./document-form-types";

/** Vstupy klientských kontrol. */
export interface DocumentValidationArgs {
  /** Typ dokladu (BA mění id polí protiúčtu). */
  code?: string;
  /** Hlavička. */
  value: DocumentHeaderValue;
  /** Cizí měna. */
  foreign: boolean;
  /** Kurz DPH. */
  vatRateField?: DocumentVatRateField;
  /** Texty formuláře. */
  t: DocumentFormTexts;
  /** Chyby polí. */
  fieldErrors?: Partial<Record<DocumentHeaderField, string>>;
  /** Výstrahy polí. */
  fieldWarnings?: Partial<Record<DocumentHeaderField, string>>;
  /** Duplicitní daňové číslo. */
  taxDocumentNumberWarning?: string;
  /** Neplatné IČO. */
  icoWarning?: boolean;
  /** Doklad jen pro čtení – chybějící kurz DPH se nehlásí. */
  readOnly?: boolean;
  /** Klíče polí s neplatným zápisem data. */
  invalidDates?: DocumentHeaderField[];
  /** Varování VS (víc než 10 číslic / bez číslic) – jen z pole VS. */
  variableSymbolWarning?: string;
  /** Popisek pole VS. */
  variableSymbolLabel?: string;
  /** Popisek daňového čísla. */
  taxNumberLabel?: string;
  /** Popisky polí mimo DocumentFormTexts (banka: kód banky, IBAN, SWIFT, druh účtu…). */
  fieldLabels?: Partial<Record<string, string>>;
}

/** Id ovládacího prvku pro klíč hlavičky (výjimky od výchozího `document-klíč`). */
const HEADER_FIELD_ID: Record<string, string> = {
  partnerId: "document-partner",
  counterpartyName: "document-partner",
  counterpartyIco: "document-partner-ico",
  counterpartyDic: "document-partner-dic",
  // Země protistrany nemá vlastní prvek; řídí tvar IČO.
  counterpartyCountry: "document-partner-ico",
  bankCode: "document-bank-code",
  bankSwift: "document-bank-code",
  bankIban: "document-movement-account",
  partnerBankAccountId: "document-bankAccount",
  manualBankAccount: "document-bankAccount",
  variableSymbolLinked: "document-variableSymbol",
  totalMode: "document-amountTotal",
  // Zaokrouhlení se zadává v rekapitulaci řádků; nejbližší prvek hlavičky je Celkem.
  roundingAmount: "document-amountTotal",
  rateNote: "document-rate-note",
  rateManual: "document-rate",
  taxDocumentNumberLinked: "document-taxDocumentNumber",
  // Kniha a směr nemají vlastní pole; nejbližší prvek je identifikační řádek.
  bookId: "document-identity",
  direction: "document-identity",
};

/** Kontext zpětného mapování id → klíč (typ dokladu a režim účtu protiúčtu BA). */
export interface HeaderFieldKeyContext {
  /** Typ dokladu. */
  code?: string;
  /** Druh účtu protiúčtu BA (`iban` = IBAN + SWIFT). */
  bankAccountKind?: string;
}

/** Id sdílená více klíči: klíč určuje typ dokladu a režim účtu (jediné místo pravidla). */
const SHARED_ID_KEY: Record<string, (ctx: HeaderFieldKeyContext) => string> = {
  "document-movement-account": (ctx) =>
    ctx.code === "BA" && ctx.bankAccountKind !== "iban" ? "bankAccount" : "bankIban",
  "document-bank-code": (ctx) => (ctx.bankAccountKind === "iban" ? "bankSwift" : "bankCode"),
  "document-bankAccount": () => "bankAccount",
  "document-partner": () => "partnerId",
  "document-partner-ico": () => "counterpartyIco",
  "document-amountTotal": () => "amountTotal",
  "document-variableSymbol": () => "variableSymbol",
  "document-taxDocumentNumber": () => "taxDocumentNumber",
  "document-rate": () => "rate",
  "document-identity": () => "bookId",
};

/** Jednoznačná id (jeden klíč na prvek) odvozená z tabulky klíč → id. */
const UNIQUE_ID_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(HEADER_FIELD_ID)
    .filter(([, id]) => !(id in SHARED_ID_KEY))
    .map(([key, id]) => [id, key]),
);

/** Klíče hlavičky, které nejsou pole – do pruhu se jako položky pole neposílají. */
const NON_FIELD_KEYS = new Set([
  "id",
  "rateInfo",
  "suggestedRate",
  "suggestedRateInfo",
  "print",
  "rateSourceAttention",
  "vatRateSourceAttention",
]);

/** Id pole bankovního účtu: u BA protiúčet, jinak účet partnera. */
function headerFieldId(key: string, code?: string): string {
  if (key === "bankAccount")
    return code === "BA" ? "document-movement-account" : "document-bankAccount";
  return HEADER_FIELD_ID[key] ?? `document-${key}`;
}

/** Klíč hlavičky z id ovládání – explicitní tabulka id → klíč, nikdy „první shoda“. */
export function headerFieldKeyFromId(id: string, ctx: HeaderFieldKeyContext = {}): string {
  const shared = SHARED_ID_KEY[id];
  if (shared) return shared(ctx);
  return UNIQUE_ID_KEY[id] ?? id.replace("document-", "");
}

/** Popisky klíčů, které nemají stejnojmenný text (nikdy se neukáže technický klíč). */
function headerLabelAlias(
  t: DocumentFormTexts,
  key: string,
  fieldLabels?: Partial<Record<string, string>>,
  direction?: string | null,
): string | undefined {
  // Některé popisky žijí v dsTexts.documentForm (DocumentForm předává sloučené texty).
  const all = t as Partial<Record<string, string>>;
  const alias: Record<string, string | undefined> = {
    partnerId: t.partner,
    counterpartyName: t.partner,
    counterpartyIco: t.ico,
    counterpartyDic: t.dic,
    counterpartyCountry: fieldLabels?.counterpartyCountry,
    handedOverBy: direction === "out" ? t.handedOverByOut : t.handedOverByIn,
    companyBankAccountId: t.bankAccount,
    partnerBankAccountId: t.bankAccount,
    manualBankAccount: t.bankAccount,
    paymentMethodId: all.paymentMethod,
    mainAccountId: t.mainAccountSelect,
    variableSymbolLinked: t.variableSymbol,
    totalMode: t.amountTotal,
    bookId: t.book,
    taxDocumentNumber: fieldLabels?.taxDocumentNumber,
    taxDocumentNumberLinked: fieldLabels?.taxDocumentNumber,
    rateManual: t.manualRate,
    roundingAmount: t.rounding,
    bankCode: fieldLabels?.bankCode,
    bankIban: fieldLabels?.bankIban,
    bankSwift: fieldLabels?.bankSwift,
    bankAccountKind: fieldLabels?.bankAccountKind,
  };
  return alias[key];
}

/** Popisek pole hlavičky z textů formuláře; technický klíč se nikdy nezobrazí. */
export function headerFieldLabel(
  t: DocumentFormTexts,
  key: string,
  fieldLabels?: Partial<Record<string, string>>,
  direction?: string | null,
): string {
  const found = Object.entries(t).find(([name]) => name === key)?.[1];
  if (typeof found === "string") return found;
  const alias = headerLabelAlias(t, key, fieldLabels, direction);
  if (alias) return alias;
  // Za běhu formulář nesmí spadnout – obecný popisek + varování pro vývojáře.
  console.warn(`documentForm: chybí popisek pole „${key}“`);
  return t.unknownField;
}

/** Položka pole hlavičky. */
function headerIssue(
  t: DocumentFormTexts,
  key: DocumentHeaderField,
  message: string,
  severity: FormIssue["severity"],
  label?: string,
  fieldLabels?: Partial<Record<string, string>>,
  code?: string,
  direction?: string | null,
): FormIssue {
  return {
    fieldId: headerFieldId(key, code),
    label: label ?? headerFieldLabel(t, key, fieldLabels, direction),
    message,
    severity,
    source: "client",
  };
}

/** Klientské položky hlavičky: chyby polí, neplatná data, kurz DPH a varování polí. */
export function documentClientIssues(a: DocumentValidationArgs): FormIssue[] {
  const issues: FormIssue[] = [];
  for (const [key, message] of Object.entries(a.fieldErrors ?? {})) {
    // Klíče, které nejsou pole (rateInfo, suggestedRate, print, *SourceAttention…),
    // se do pruhu jako položky pole neposílají.
    if (NON_FIELD_KEYS.has(key)) continue;
    if (message)
      issues.push(
        headerIssue(
          a.t,
          key as DocumentHeaderField,
          message,
          "error",
          undefined,
          a.fieldLabels,
          a.code,
          a.value.direction,
        ),
      );
  }
  for (const key of a.invalidDates ?? [])
    issues.push(headerIssue(a.t, key, a.t.invalidDate, "error", undefined, a.fieldLabels, a.code));
  const vat = a.vatRateField;
  if (
    !a.readOnly &&
    a.foreign &&
    vat &&
    !vat.sameAsDocument &&
    !vat.manual &&
    vat.suggestedRate == null
  )
    issues.push({
      label: a.t.vatRate,
      message: a.t.vatRateMissing,
      severity: "error",
      source: "client",
      code: "vat_rate_missing",
    });
  if (a.foreign && a.value.rateManual && !a.value.rateNote?.trim())
    issues.push(
      headerIssue(a.t, "rateNote", a.t.rateNoteRequired, "error", undefined, a.fieldLabels),
    );
  if (a.foreign && vat?.manual && !vat.note?.trim())
    issues.push({
      label: a.t.vatRate,
      message: a.t.rateNoteRequired,
      severity: "error",
      source: "client",
      code: "vat_rate_note",
    });
  for (const [key, message] of Object.entries(a.fieldWarnings ?? {})) {
    if (NON_FIELD_KEYS.has(key)) continue;
    if (message)
      issues.push(
        headerIssue(
          a.t,
          key as DocumentHeaderField,
          message,
          "warning",
          undefined,
          a.fieldLabels,
          a.code,
          a.value.direction,
        ),
      );
  }
  if (a.taxDocumentNumberWarning)
    issues.push(
      headerIssue(
        a.t,
        "taxDocumentNumber",
        a.taxDocumentNumberWarning,
        "warning",
        a.taxNumberLabel,
      ),
    );
  if (a.icoWarning)
    issues.push(headerIssue(a.t, "counterpartyIco", a.t.invalidIco, "warning", a.t.ico));
  if (a.variableSymbolWarning)
    issues.push(
      headerIssue(a.t, "variableSymbol", a.variableSymbolWarning, "warning", a.variableSymbolLabel),
    );
  return issues;
}

/** Přepne příznak neplatného data; beze změny vrátí stejný objekt. */
export function toggleInvalidDate<K extends string>(
  prev: Partial<Record<K, true>>,
  key: K,
  invalid: boolean,
): Partial<Record<K, true>> {
  if (Boolean(prev[key]) === invalid) return prev;
  const next = { ...prev };
  if (invalid) next[key] = true;
  else delete next[key];
  return next;
}

/** Vstupy odvozenin protistrany. */
export interface DocumentCounterpartyArgs {
  /** Hlavička. */
  value: DocumentHeaderValue;
  /** Vybraný partner z adresáře. */
  partner?: { ico?: string | null; dic?: string | null } | null;
  /** Interní doklad. */
  internal: boolean;
  /** Režim protistrany. */
  counterpartyInput: string;
  /** Výstrahy polí od aplikace. */
  fieldWarnings?: Partial<Record<DocumentHeaderField, string>>;
  /** Text varování ručního partnera (dsTexts.documentEdit.internalManualPartner). */
  internalManualPartner: string;
}

/** IČO/DIČ protistrany, varování neplatného IČO a varování ručního partnera u interního dokladu. */
export function useDocumentCounterpartyWarnings(a: DocumentCounterpartyArgs) {
  const counterpartyIco = a.value.counterpartyIco ?? a.partner?.ico ?? "";
  const counterpartyDic = a.value.counterpartyDic ?? a.partner?.dic ?? "";
  const icoWarning =
    !a.value.partnerId &&
    /^\d{8}$/.test(counterpartyIco.replace(/\s/g, "")) &&
    !isValidCzIco(counterpartyIco);
  const effectiveFieldWarnings =
    a.internal && a.counterpartyInput === "manual"
      ? { ...a.fieldWarnings, partnerId: a.internalManualPartner }
      : a.fieldWarnings;
  return { counterpartyIco, counterpartyDic, icoWarning, effectiveFieldWarnings };
}
