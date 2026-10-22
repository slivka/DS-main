/** Formuláře záloh · vlastní ukázku sdíleného slotu · APP u ZL odečty nepředává. */
import { useState } from "react";
import { toast } from "sonner";
import { DocumentForm } from "../ds/accounting/document-form";
import { DocumentPostingGrid } from "../ds/accounting/document-posting-grid";
import { AdvanceAllocationDialog } from "../ds/accounting/advances/advance-allocation-dialog";
import type { AdvanceAllocation } from "../ds/accounting/advances/advance-types";
import { advanceListVariant } from "../ds/accounting/advance-list-variant";
import { useDsTexts } from "../../ds-texts";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_PARTNERS,
  MOCK_VAT_CODES_OUT,
  MOCK_VAT_CODES_IN,
} from "../../lib/mock/accounting";
import { INVOICE_HEADER, INVOICE_LINES, CURRENCIES } from "./document-form-showcase-data";
import { DEDUCTION_ROWS, MANUAL_DEDUCTION, ADVANCE_CURRENCY, SHOWCASE_ITEMS } from "./advance-showcase-data";
import type { JournalDeductions } from "../ds/accounting/journal-deductions-types";

/** Součet v celých haléřích (APP čte hotové částky z DB). */
const sumCents = (values: number[]) =>
  values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
import { ShowcaseSection } from "./ShowcaseLayout";
type ShowcaseType = "FV" | "FP" | "ZFV" | "ZFP" | "PO";
const INITIAL: Record<ShowcaseType, typeof DEDUCTION_ROWS> = {
  FV: DEDUCTION_ROWS,
  FP: [...DEDUCTION_ROWS.slice(1, 2), MANUAL_DEDUCTION],
  PO: [MANUAL_DEDUCTION],
  ZFV: [],
  ZFP: [],
};
function AdvanceForm({ type }: { type: ShowcaseType }) {
  const t = useDsTexts();
  const [value, setValue] = useState({ ...INVOICE_HEADER, recordKey: type });
  const purchase = type === "FP" || type === "ZFP";
  const codes = purchase ? MOCK_VAT_CODES_IN : MOCK_VAT_CODES_OUT;
  const code = codes[0];
  const [lines, setLines] = useState(() =>
    INVOICE_LINES.map((line) => (line.isFxRounding ? line : { ...line, vatCodeId: code?.id })),
  );
  const [adding, setAdding] = useState(false);
  const [allocation, setAllocation] = useState<AdvanceAllocation[]>([]);
  const [rows, setRows] = useState(() =>
    INITIAL[type].map((row) => ({ ...row, vatCode: code?.code })),
  );
  // APP načte součty z DB; ukázka je skládá v celých haléřích (bez výpočtu DPH v DS).
  const deducted = sumCents(rows.map((row) => row.total));
  const after = (key: "base" | "vat" | "total" | "homeBase" | "homeVat" | "homeTotal") =>
    sumCents([SHOWCASE_ITEMS[key], ...rows.map((row) => row[key] ?? 0)]);
  const deductions: JournalDeductions = {
    rows,
    onAdd: (kind) => {
      if (kind === "manual") {
        if (!rows.some((row) => row.id === MANUAL_DEDUCTION.id))
          setRows([...rows, { ...MANUAL_DEDUCTION, vatCode: code?.code }]);
        return;
      }
      setAllocation([]);
      setAdding(true);
    },
    onRemove: (row, reason) => {
      setRows(rows.filter((item) => item.id !== row.id));
      toast(`${t.advances.remove}: ${row.text}${reason ? ` (${reason})` : ""}`);
    },
    removeReason: type === "FP" ? { required: true } : undefined,
    // APP uloží základ a z DB vrátí přepočtený řádek; ukázka DPH a kurz nemění.
    onAmountChange: (row, base) =>
      setRows(
        rows.map((item) =>
          item.id === row.id ? { ...item, base, total: sumCents([base, item.vat]) } : item,
        ),
      ),
    totals: {
      itemsGross: SHOWCASE_ITEMS.total,
      deductionsGross: deducted,
      payable: sumCents([SHOWCASE_ITEMS.total, deducted]),
    },
    recap: {
      deductionRows: rows.map((row) => ({
        id: row.id,
        vatCode: row.vatCode ?? "",
        label: row.text,
        base: row.base,
        vat: row.vat,
        total: row.total,
        homeBase: row.homeBase,
        homeVat: row.homeVat,
        homeTotal: row.homeTotal,
      })),
      totalsByCode: [
        {
          vatCode: code?.code ?? "",
          base: after("base"),
          vat: after("vat"),
          total: after("total"),
          homeBase: after("homeBase"),
          homeVat: after("homeVat"),
          homeTotal: after("homeTotal"),
        },
      ],
    },
  };
  const zl =
    type === "ZFV" || type === "ZFP"
      ? advanceListVariant({ type, vatPayer: true, recapNote: t.vatFive.notTaxDocument })
      : undefined;
  return (
    <>
      <DocumentForm
        title={type}
        status="draft"
        documentType={type}
        value={value}
        onChange={(next) => setValue({ ...next, recordKey: type })}
        lines={lines}
        onLinesChange={setLines}
        books={MOCK_BOOKS}
        accounts={MOCK_ACCOUNTS}
        partners={MOCK_PARTNERS}
        currencies={CURRENCIES}
        homeCurrency={ADVANCE_CURRENCY.code}
        fields={zl?.fields}
        vat={zl?.vat ?? { visible: true }}
        linesEditorProps={{
          withoutAccounts: Boolean(zl),
          vat: {
            enabled: true,
            defaultDirection: purchase ? "in" : "out",
            codes,
          },
          deductions: zl ? undefined : deductions,
        }}
      />
      <AdvanceAllocationDialog
        open={adding}
        onOpenChange={setAdding}
        target="taxDocument"
        storageKey={`deduction-candidates-${type}`}
        candidates={[
          {
            id: "advance",
            document: "Záloha partnera 2026003",
            remaining: 500,
            defaultAmount: 500,
          },
          { id: "dd", document: "DDPZ 2026004", remaining: 700, defaultAmount: 700 },
        ]}
        value={allocation}
        onChange={setAllocation}
        remaining={2000}
        currency={ADVANCE_CURRENCY.symbol}
        dirty={allocation.length > 0}
        onAllocate={() => {
          setAdding(false);
          toast(t.advances.allocate);
        }}
      />
    </>
  );
}
export function AdvanceFormsShowcase() {
  const t = useDsTexts();
  return (
    <ShowcaseSection title={t.advances.deductions}>
      <div className="space-y-6">
        {(["FV", "FP", "PO", "ZFV", "ZFP"] as const).map((type) => (
          <AdvanceForm key={type} type={type} />
        ))}
      </div>
      <DocumentPostingGrid
        accounts={MOCK_ACCOUNTS}
        entries={[
          { id: "advance", text: "Odečet", amount: 1000, auto: "advance" },
          { id: "fx", text: "Vyrovnání", amount: 12.5, auto: "advance_fx" },
        ]}
      />
    </ShowcaseSection>
  );
}
