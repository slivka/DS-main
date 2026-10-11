/** Sestavení záložek formuláře dokladu. */
import { JournalLinesEditor } from "../journal-lines-editor";
import { DocumentCounterpartyTab, DocumentPrintTab } from "../document-detail-tabs";
import type { AccountOption } from "../account-select";
import type { DimensionOption } from "../dimension-select";
import type { PartnerOption } from "../partner-select";
import type { CurrencyOption } from "../currency-amount";
import type { DocumentFields } from "../document-fields";
import type { JournalLine } from "../journal-lines";
import type { DocumentFormProps, DocumentFormTab, DocumentFormTexts } from "./document-form-types";
export interface BuildDocumentTabsArgs {
  lines: JournalLine[];
  onLinesChange: (v: JournalLine[]) => void;
  accounts: AccountOption[];
  dimensions: DimensionOption[];
  partners: PartnerOption[];
  mode: "mainAccount" | "internal";
  mainSide?: "MD" | "D";
  value: DocumentFormProps["value"];
  totalMode: "entered" | "sum";
  total: number;
  currencies?: CurrencyOption[];
  homeCurrency: string;
  homeCurrencySymbol?: string;
  rateAmount: number;
  linesEditorProps: DocumentFormProps["linesEditorProps"];
  readOnly: boolean;
  f: DocumentFields;
  lineRounding?: number;
  can: (key: keyof DocumentFormProps["value"]) => boolean;
  changeRounding: (v: number) => void;
  roundingLabel?: string;
  t: DocumentFormTexts & { counterpartyTab: string; printTab: string };
  roundingLimit: number;
  vatTotals: { visibleLineCount: number };
  tabs: DocumentFormTab[];
  issuedDocument: boolean;
  counterpartyTab: DocumentFormProps["counterpartyTab"];
  printTab: DocumentFormProps["printTab"];
}
/** Sestaví vestavěné a aplikační záložky ve stabilním pořadí. */
export function buildDocumentTabs(a: BuildDocumentTabsArgs): DocumentFormTab[] {
  const {
    lines,
    onLinesChange,
    accounts,
    dimensions,
    partners,
    mode,
    mainSide,
    value,
    totalMode,
    currencies,
    homeCurrency,
    homeCurrencySymbol,
    rateAmount,
    linesEditorProps,
    readOnly,
    f,
    lineRounding,
    can,
    changeRounding,
    roundingLabel,
    t,
    roundingLimit,
    vatTotals,
    tabs,
    issuedDocument,
    counterpartyTab,
    printTab,
  } = a;
  return [
    {
      id: "lines",
      label: t.linesTab,
      badge: vatTotals.visibleLineCount || undefined,
      content: (
        <JournalLinesEditor
          lines={lines}
          onChange={onLinesChange}
          accounts={accounts}
          dimensions={dimensions}
          partners={partners}
          mode={mode}
          mainSide={mainSide}
          mainAccount={value.mainAccountId}
          totalAmount={totalMode === "entered" ? value.amountTotal : undefined}
          documentCurrency={value.currency}
          documentCurrencySymbol={currencies?.find((item) => item.code === value.currency)?.symbol}
          homeCurrency={homeCurrency}
          homeCurrencySymbol={homeCurrencySymbol}
          rate={value.rate}
          rateAmount={rateAmount}
          totalMode={totalMode === "entered" ? "entered" : "computed"}
          {...linesEditorProps}
          recapTotalAmount={a.total}
          editableFields={readOnly ? [] : linesEditorProps?.editableFields}
          rounding={
            f.rounding
              ? {
                  value: lineRounding ?? value.roundingAmount ?? 0,
                  onChange: can("roundingAmount") ? changeRounding : undefined,
                  readOnly: !can("roundingAmount"),
                  label: roundingLabel ?? t.rounding,
                  limit: roundingLimit,
                }
              : undefined
          }
        />
      ),
    },
    ...tabs.filter((item) => item.id !== "lines"),
    ...(issuedDocument && counterpartyTab
      ? [
          {
            id: "counterparty",
            label: t.counterpartyTab,
            content: (
              <DocumentCounterpartyTab
                {...counterpartyTab}
                partnerId={value.partnerId}
                readOnly={readOnly}
              />
            ),
          },
        ]
      : []),
    ...(issuedDocument && printTab
      ? [
          {
            id: "print",
            label: t.printTab,
            content: <DocumentPrintTab {...printTab} readOnly={readOnly} />,
          },
        ]
      : []),
  ];
}
