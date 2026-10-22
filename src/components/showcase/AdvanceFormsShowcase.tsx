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
import { DEDUCTION_ROWS, MANUAL_DEDUCTION, ADVANCE_CURRENCY } from "./advance-showcase-data";
import type { JournalDeductions } from "../ds/accounting/journal-deductions-types";

const round = (value: number) => Math.round(value * 100) / 100;
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
  const [lines, setLines] = useState(INVOICE_LINES);
  const [adding, setAdding] = useState(false);
  const [allocation, setAllocation] = useState<AdvanceAllocation[]>([]);
  const [rows, setRows] = useState(INITIAL[type]);
  // Součty dodává APP z DB; ukázka je skládá z řádků.
  const itemsTotal = round(lines.reduce((sum, line) => sum + (line.amount ?? 0), 0));
  const deducted = round(rows.reduce((sum, row) => sum + row.base + row.vat, 0));
  const byCode = new Map<string, { base: number; vat: number }>([
    ["Z 21 %", { base: itemsTotal, vat: round(itemsTotal * 0.21) }],
  ]);
  for (const row of rows) {
    const code = row.vatCode ?? "";
    const prev = byCode.get(code) ?? { base: 0, vat: 0 };
    byCode.set(code, { base: round(prev.base + row.base), vat: round(prev.vat + row.vat) });
  }
  const deductions: JournalDeductions = {
    rows,
    onAdd: (kind) => {
      if (kind === "manual") {
        if (!rows.some((row) => row.id === MANUAL_DEDUCTION.id))
          setRows([...rows, MANUAL_DEDUCTION]);
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
    onAmountChange: (row, base) =>
      setRows(
        rows.map((item) =>
          item.id === row.id ? { ...item, base, vat: round(base * 0.21) } : item,
        ),
      ),
    totals: { items: itemsTotal, deducted, toPay: round(itemsTotal + deducted) },
    recap: {
      deductionRows: rows.map((row) => ({
        id: row.id,
        label: row.text,
        base: row.base,
        vat: row.vat,
      })),
      totalsByCode: [...byCode].map(([vatCode, value]) => ({ vatCode, ...value })),
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
            defaultDirection: type === "FP" || type === "ZFP" ? "in" : "out",
            codes: type === "FP" || type === "ZFP" ? MOCK_VAT_CODES_IN : MOCK_VAT_CODES_OUT,
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
