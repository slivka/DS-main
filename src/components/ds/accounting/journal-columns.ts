/**
 * Sloupce editoru řádků a zobrazované hodnoty buněk.
 * Vlastní: popisky sloupců, definice sloupců podle režimu, text buňky mimo editaci.
 * Nesmí: držet stav ani měnit řádky; vše je čistý výpočet ze vstupu.
 */
import type { AccountOption } from "./account-select";
import type { DimensionOption } from "./dimension-select";
import type { PartnerOption } from "./partner-select";
import type { UnitOption } from "./unit-select";
import type { GridColumn } from "../grid/grid-columns";
import type { JournalLine, JournalLineColumn, VatCalcMode, VatCodeOption } from "./journal-lines";
import {
  SHARED_COLUMNS,
  SPLIT_COLUMNS,
  VAT_COLUMNS,
  accountDataColumn,
  formatJournalAccountDisplay,
  isAccountColumn,
  isAccountNameColumn,
  roundJournalAmount,
  type ColumnId,
  type JournalAccountColumnId,
} from "./journal-lines-model";
import type { JournalLinesMode } from "./journal-column-layout";
import { resolveLineVat } from "./journal-vat";
import { formatAmount } from "../../../lib/format";
import type { JournalEditorTexts } from "../../../ds-texts";

/** Popisky datových sloupců řádku. */
export function journalColumnLabels(
  t: JournalEditorTexts,
  documentCurrency: string,
  foreignAmountLabel: string,
): Record<JournalLineColumn, string> {
  return {
    counterAccount: t.counterAccount,
    debitAccount: t.debitAccount,
    creditAccount: t.creditAccount,
    amount: t.amount,
    foreignAmount: foreignAmountLabel,
    text: t.text,
    quantity: t.quantity,
    unitId: t.unit,
    unitPrice: t.unitPrice,
    dimensionId: t.dimension,
    vs: t.vs,
    partnerId: t.partner,
    debitDimensionId: t.debitDimension,
    creditDimensionId: t.creditDimension,
    debitVs: t.debitVs,
    creditVs: t.creditVs,
    debitPartnerId: t.debitPartner,
    creditPartnerId: t.creditPartner,
    nonTax: t.nonTax,
    currency: documentCurrency,
    rate: t.rate,
    vatCodeId: t.vatCode,
    vatRate: t.vatRate,
    vatAmount: t.vatAmount,
    grossAmount: t.grossAmount,
    vatDeduction: t.vatDeduction,
    vatDeductionShare: t.deductionShare,
    pdpSubjectCode: t.pdpSubject,
  };
}

/** Vstup pro definice sloupců. */
export interface JournalColumnDefsInput {
  /** Texty. */
  t: JournalEditorTexts;
  /** Režim editoru. */
  mode: JournalLinesMode;
  /** Popisky datových sloupců. */
  labels: Record<JournalLineColumn, string>;
  /** Krátký a rozšířený popisek protiúčtu. */
  counterShortLabel: string;
  /** Rozšířený popisek protiúčtu. */
  counterNameLabel: string;
  /** Množstevní sloupce viditelné ve výchozím stavu. */
  showQuantityColumns: boolean;
  /** DPH zapnuto. */
  vatOn: boolean;
  /** Doklad v cizí měně. */
  foreign: boolean;
  /** Popisek částky v domácí měně. */
  homeAmountLabel: string;
  /** Režim polí stran. */
  sideFields: "shared" | "split";
  /** Sloupec má v některém řádku hodnotu (rozhoduje o výchozí viditelnosti polí stran). */
  hasValue: (column: JournalLineColumn) => boolean;
}

/** Definice sloupců gridu podle režimu: jen protiúčet, nebo MD i DAL. */
export function journalColumnDefs(input: JournalColumnDefsInput): GridColumn<ColumnId>[] {
  const { t, showQuantityColumns: quantity } = input;
  const vatColumns: GridColumn<ColumnId>[] = input.vatOn
    ? [
        { id: "vatCodeId", label: t.vatCode },
        { id: "vatRate", label: t.vatRate, align: "right" },
        { id: "vatAmount", label: t.vatAmount, align: "right" },
        { id: "grossAmount", label: t.grossAmount, align: "right" },
      ]
    : [];
  const amountColumns: GridColumn<ColumnId>[] = [
    { id: "quantity", label: t.quantity, defaultVisible: quantity },
    { id: "unitId", label: t.unit, defaultVisible: quantity },
    { id: "unitPrice", label: t.unitPrice, defaultVisible: quantity, align: "right" },
    { id: "amount", label: t.amount, locked: true, align: "right" },
    ...vatColumns,
    ...(input.foreign
      ? [
          {
            id: "homeAmount" as const,
            label: input.homeAmountLabel,
            defaultVisible: false,
            align: "right" as const,
          },
        ]
      : []),
  ];
  const head: GridColumn<ColumnId>[] = [
    { id: "row", label: t.row, locked: true },
    { id: "text", label: t.text, locked: true },
  ];
  const actions: GridColumn<ColumnId> = {
    id: "actions",
    label: t.actions,
    locked: true,
    align: "right",
  };
  if (input.mode === "mainAccount")
    return [
      ...head,
      { id: "counterAccount", label: input.counterShortLabel },
      { id: "counterAccountName", label: input.counterNameLabel, defaultVisible: false },
      ...amountColumns,
      { id: "dimensionId", label: t.dimension },
      { id: "vs", label: t.vs, defaultVisible: false },
      { id: "partnerId", label: t.partner, defaultVisible: false },
      actions,
    ];
  return [
    ...head,
    { id: "debitAccount", label: t.sideDebit },
    { id: "debitAccountName", label: t.debitAccount, defaultVisible: false },
    { id: "creditAccount", label: t.sideCredit },
    { id: "creditAccountName", label: t.creditAccount, defaultVisible: false },
    ...amountColumns,
    ...(input.sideFields === "shared"
      ? SHARED_COLUMNS.map((id) => ({ id, label: input.labels[id] }))
      : SPLIT_COLUMNS.map((id) => ({
          id,
          label: input.labels[id],
          defaultVisible: input.hasValue(id),
        }))),
    actions,
  ];
}

/** Popisek sloupce účtu (krátká forma = strana, rozšířená = název účtu). */
export function journalAccountColumnLabel(
  column: JournalAccountColumnId,
  t: JournalEditorTexts,
  counter: { short: string; name: string },
) {
  const data = accountDataColumn(column);
  if (isAccountNameColumn(column))
    return data === "creditAccount"
      ? t.creditAccount
      : data === "debitAccount"
        ? t.debitAccount
        : counter.name;
  return data === "creditAccount"
    ? t.sideCredit
    : data === "debitAccount"
      ? t.sideDebit
      : counter.short;
}

/** Účet zobrazený ve sloupci; protiúčet má zálohu ve straně proti hlavnímu účtu. */
export function journalAccountFor(
  line: JournalLine,
  column: JournalAccountColumnId,
  counterColumn: "debitAccount" | "creditAccount" | null,
) {
  const dataColumn = accountDataColumn(column);
  return dataColumn === "counterAccount"
    ? (line.counterAccount ?? (counterColumn ? line[counterColumn] : null))
    : line[dataColumn];
}

/** Číselníky a kurz, které potřebuje zobrazení hodnoty buňky. */
export interface JournalDisplayContext {
  /** Účty podle čísla. */
  accountByCode: Map<string, AccountOption>;
  /** Zakázky. */
  dimensions: DimensionOption[];
  /** Partneři. */
  partners: PartnerOption[];
  /** Měrné jednotky. */
  units: UnitOption[];
  /** Kódy DPH podle id. */
  vatCodeMap: Map<string, VatCodeOption>;
  /** Režim zadání částky. */
  calcMode: VatCalcMode;
  /** Doklad v cizí měně. */
  foreign: boolean;
  /** Kurz dokladu. */
  rate: number | null;
  /** Počet jednotek kurzu. */
  rateAmount: number;
  /** Strana protiúčtu v režimu hlavního účtu. */
  counterColumn: "debitAccount" | "creditAccount" | null;
  /** Rozšířené formy účtu zobrazené zkráceně. */
  compactAccountIds: ReadonlySet<ColumnId>;
}

const numberText = (value: number, options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("cs-CZ", options).format(value);

function vatDisplayValue(line: JournalLine, column: ColumnId, ctx: JournalDisplayContext) {
  const resolved = resolveLineVat(line, ctx.vatCodeMap, {
    calcMode: ctx.calcMode,
    foreign: ctx.foreign,
  });
  if (column === "vatCodeId") return resolved.code?.code ?? "";
  if (column === "vatRate")
    return resolved.code
      ? resolved.rate == null
        ? "—"
        : `${numberText(resolved.rate, {})} %`
      : "";
  if (column === "vatAmount")
    return resolved.code?.hasTax ? formatAmount(resolved.vat, 2) : resolved.code ? "—" : "";
  if (column === "grossAmount")
    return resolved.code || line.grossAmount != null ? formatAmount(resolved.gross, 2) : "";
  if (column === "pdpSubjectCode") return line.pdpSubjectCode ?? "";
  return "";
}

/** Text buňky mimo editaci (částky s oddělením tisíců, účet 221.001, názvy z číselníků). */
export function journalDisplayValue(
  line: JournalLine,
  column: ColumnId,
  ctx: JournalDisplayContext,
): string {
  if (VAT_COLUMNS.has(column)) return vatDisplayValue(line, column, ctx);
  if (isAccountColumn(column)) {
    const code = journalAccountFor(line, column, ctx.counterColumn);
    const account = code ? ctx.accountByCode.get(code) : undefined;
    const extended = isAccountNameColumn(column) && !ctx.compactAccountIds.has(column);
    return code ? formatJournalAccountDisplay(code, account?.name, extended) : "";
  }
  if (column === "dimensionId" || column === "debitDimensionId" || column === "creditDimensionId")
    return ctx.dimensions.find((item) => item.id === line[column])?.name ?? "";
  if (column === "partnerId" || column === "debitPartnerId" || column === "creditPartnerId")
    return ctx.partners.find((item) => item.id === line[column])?.name ?? "";
  if (column === "unitId") return ctx.units.find((item) => item.id === line.unitId)?.code ?? "";
  if (column === "homeAmount")
    return line.amount == null && line.foreignAmount == null
      ? ""
      : formatAmount(
          Number(line.amount) ||
            roundJournalAmount(((line.foreignAmount || 0) * (ctx.rate || 0)) / ctx.rateAmount),
          2,
        );
  if (column === "amount") {
    const amount = ctx.foreign ? line.foreignAmount : line.amount;
    return amount == null ? "" : formatAmount(Number(amount), 2);
  }
  if (column === "quantity")
    return line.quantity == null ? "" : numberText(line.quantity, { maximumFractionDigits: 4 });
  if (column === "unitPrice")
    return line.unitPrice == null
      ? ""
      : numberText(line.unitPrice, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (column === "row" || column === "actions") return "";
  return String(line[column] ?? "");
}
