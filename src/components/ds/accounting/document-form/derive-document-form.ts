/** Odvozené hodnoty formuláře dokladu. */
import { computeJournalTotals } from "../journal-vat";
import { formatAccountCode } from "../account-code";
import { documentIdentityVariantForType } from "../document-fields";
import { formatCodeName } from "../../../../lib/code-format";
import type { DocumentFields } from "../document-fields";
import type { AccountOption } from "../account-select";
import type { BookOption } from "../book-select";
import type { CurrencyOption } from "../currency-amount";
import type { PartnerOption } from "../partner-select";
import type { JournalLine } from "../journal-lines";
import type {
  DocumentFormProps,
  DocumentHeaderField,
  DocumentIdentity,
} from "./document-form-types";
export interface DerivedArgs {
  documentType: string;
  value: DocumentFormProps["value"];
  lines: JournalLine[];
  linesEditorProps: DocumentFormProps["linesEditorProps"];
  readOnly: boolean;
  f: DocumentFields;
  mainSide?: "MD" | "D";
  homeCurrency: string;
  rateAmount: number;
  partners: PartnerOption[];
  accounts: AccountOption[];
  mainAccountOptions?: AccountOption[];
  currencies?: CurrencyOption[];
  books: BookOption[];
  identity?: DocumentIdentity;
  can: (k: DocumentHeaderField) => boolean;
  mainAccountLocked: boolean;
}
/** Spočítá součty, režim dokladu a popisky identity bez vedlejších efektů. */
export function deriveDocumentForm(a: DerivedArgs) {
  const {
    documentType,
    value,
    lines,
    linesEditorProps,
    readOnly,
    f,
    mainSide,
    homeCurrency,
    rateAmount,
    partners,
    accounts,
    mainAccountOptions,
    currencies,
    books,
    identity,
    can,
    mainAccountLocked,
  } = a;
  const normalizedType = documentType.toUpperCase();
  const receivedDocument =
    normalizedType === "FP" || normalizedType === "ZFP" || normalizedType === "DDPOZ";
  const issuedDocument =
    normalizedType === "FV" || normalizedType === "ZFV" || normalizedType === "DDPZ";
  const forcedSum =
    normalizedType === "ID" ||
    normalizedType === "UZ" ||
    normalizedType === "KR" ||
    normalizedType === "ZAP";
  const totalMode = forcedSum ? "sum" : value.totalMode;
  const linesSum =
    Math.round(
      lines
        .filter((line) => !line.isRounding && !line.isFxRounding)
        .reduce((sum, line) => sum + (line.amount || 0), 0) * 100,
    ) / 100;
  const documentLinesSum =
    Math.round(
      lines
        .filter((line) => !line.isRounding && !line.isFxRounding)
        .reduce((sum, line) => sum + (line.foreignAmount ?? line.amount ?? 0), 0) * 100,
    ) / 100;
  const lineRounding = lines.find((line) => line.isRounding)?.amount;
  const roundedLinesSum =
    Math.round((linesSum + (lineRounding ?? value.roundingAmount ?? 0)) * 100) / 100;
  const editorVat = linesEditorProps?.vat;
  const vatTotals = computeJournalTotals(lines, {
    vat: editorVat?.enabled ? editorVat : null,
    readOnly: readOnly || linesEditorProps?.editableFields?.length === 0,
    mainAccount: f.mainAccount && mainSide ? value.mainAccountId : null,
    mainSide,
    foreign: value.currency !== homeCurrency,
    rate: value.rate,
    rateAmount,
  });
  const sumTotal = editorVat?.enabled
    ? value.currency !== homeCurrency
      ? vatTotals.gross
      : Math.round(
          (vatTotals.grossHome +
            (lineRounding ?? value.roundingAmount ?? 0) +
            lines
              .filter((line) => line.isFxRounding)
              .reduce((sum, line) => sum + (line.amount || 0), 0)) *
            100,
        ) / 100
    : value.currency !== homeCurrency
      ? documentLinesSum
      : roundedLinesSum;
  const total = totalMode === "sum" ? sumTotal : value.amountTotal;
  const partner = partners.find((item) => item.id === value.partnerId);
  const sameAccount = (a?: string | null, b?: string | null) =>
    !!a && !!b && a.replace(/\D/g, "") === b.replace(/\D/g, "");
  const allowedMainAccounts = mainAccountOptions ?? [];
  const account = [...allowedMainAccounts, ...accounts].find(
    (item) => item.code.replace(/\D/g, "") === (value.mainAccountId ?? "").replace(/\D/g, ""),
  );
  const mode: "mainAccount" | "internal" =
    f.mainAccount && value.mainAccountId && mainSide ? "mainAccount" : "internal";
  const foreign = value.currency !== homeCurrency;
  const currencySymbol = currencies?.find((item) => item.code === value.currency)?.symbol;
  const currencyOptions = (currencies ?? []).map((item) => ({
    value: item.code,
    label: formatCodeName(item.code, item.label),
    selectedLabel: item.code,
  }));
  const currentBook = books.find((item) => item.id === value.bookId);
  const identityVariant = identity?.variant ?? documentIdentityVariantForType(documentType);
  const effectiveIdentity: DocumentIdentity = identity ?? {
    variant: identityVariant,
    book: currentBook ? formatCodeName(currentBook.code, currentBook.name) : "—",
    period: value.accountingDate?.slice(0, 4) || "—",
    ...(f.mainAccount && value.mainAccountId && mainSide
      ? {
          account: {
            side: mainSide === "MD" ? "MD" : "DAL",
            label: account
              ? formatCodeName(formatAccountCode(account.code), account.name)
              : formatAccountCode(value.mainAccountId),
          },
        }
      : {}),
    number: value.number,
  };
  const canEditIdentityAccount =
    effectiveIdentity.variant === "invoice" &&
    !!effectiveIdentity.account?.editable &&
    !mainAccountLocked &&
    can("mainAccountId") &&
    allowedMainAccounts.length > 0;
  return {
    normalizedType,
    receivedDocument,
    issuedDocument,
    forcedSum,
    totalMode,
    lineRounding,
    vatTotals,
    total,
    partner,
    sameAccount,
    allowedMainAccounts,
    mode,
    foreign,
    currencySymbol,
    currencyOptions,
    identityVariant,
    effectiveIdentity,
    canEditIdentityAccount,
  };
}
