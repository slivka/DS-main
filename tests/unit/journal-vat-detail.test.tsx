import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { JournalVatAccountingFields } from "../../src/components/ds/accounting/journal-vat-accounting-fields";
import { JournalEditorContext } from "../../src/components/ds/accounting/journal-editor-context";
import { DS_TEXTS_CS } from "../../src/ds-texts";
import { fromJournalRow, toJournalRow, type JournalLine, type VatCodeOption } from "../../src/components/ds/accounting/journal-lines";
import { duplicateJournalLine } from "../../src/components/ds/accounting/journal-lines-model";

afterEach(cleanup);
const CODE: VatCodeOption = { id: "in", code: "Z", name: "Tuzemsko", direction: "in", hasTax: true, rate: 21, selfAssessment: false, requiresPdpSubject: false };
const LINE: JournalLine = { id: "row", amount: 1000, vatCodeId: "in", vatDeduction: "partial", vatDeductionShare: 60, khLimitExcluded: true };
type Context = NonNullable<React.ContextType<typeof JournalEditorContext>>;
interface DemoProps {
  withoutAccounts?: boolean;
  inbound?: boolean;
  code?: VatCodeOption | null;
  canEdit?: boolean;
  onChange?: (line: JournalLine) => void;
}
function Demo({ withoutAccounts, inbound = true, code = CODE, canEdit = true, onChange }: DemoProps) {
  const [line, setLine] = React.useState(LINE);
  const context = {
    editor: {
      t: DS_TEXTS_CS.journalEditor,
      props: { withoutAccounts, vat: { rowDetails: { disabledReason: "Zaúčtovaný doklad" } } },
      validations: new Map(), vatWarnings: new Map(),
      canEditCell: () => canEdit,
      patch: (_id: string, values: Partial<JournalLine>) => {
        const next = { ...line, ...values };
        setLine(next); onChange?.(next);
      },
    },
  } as unknown as Context;
  return <TooltipProvider><JournalEditorContext.Provider value={context}><JournalVatAccountingFields line={line} inbound={inbound} code={code ?? undefined} /></JournalEditorContext.Provider></TooltipProvider>;
}

describe("účetní pole detailu DPH", () => {
  it("přepnutí na plný a zpět zachová 60 % i vyloučení KH", () => {
    const change = mock(); const view = render(<Demo onChange={change} />);
    fireEvent.click(view.getByRole("radio", { name: "Plný" }));
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({ vatDeduction: "full", vatDeductionShare: 60, khLimitExcluded: true });
    fireEvent.click(view.getByRole("radio", { name: "Poměrný" }));
    expect(view.getByRole("textbox", { name: "Poměr %" }).getAttribute("value")).toBe("60");
  });
  it("změna procenta předá hodnotu a zachová ostatní údaje", () => {
    const change = mock(); const view = render(<Demo onChange={change} />);
    fireEvent.change(view.getByRole("textbox", { name: "Poměr %" }), { target: { value: "70" } });
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({ vatDeductionShare: 70, khLimitExcluded: true });
  });
  it("změna KH předá false bez změny nároku", () => {
    const change = mock(); const view = render(<Demo onChange={change} />);
    fireEvent.click(view.getByRole("checkbox"));
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({ khLimitExcluded: false, vatDeduction: "partial", vatDeductionShare: 60 });
  });
  it("zakázaná pole nevolají změnu a poskytují důvod", () => {
    const change = mock(); const view = render(<Demo canEdit={false} onChange={change} />);
    const checkbox = view.getByRole("checkbox");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
    fireEvent.click(checkbox);
    fireEvent.click(view.getByRole("radio", { name: "Plný" }));
    expect(view.getAllByLabelText("Zaúčtovaný doklad").length).toBe(3);
    expect(change).not.toHaveBeenCalled();
  });
  it("ZL účetní pole skryje bez zápisu", () => {
    const change = mock(); const view = render(<Demo withoutAccounts onChange={change} />);
    expect(view.queryByRole("checkbox")).toBeNull();
    expect(view.queryByRole("radiogroup")).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  it("bez kódu a směru nenabízí vyloučení KH", () => {
    const view = render(<Demo code={null} inbound={false} />);
    expect(view.queryByRole("checkbox")).toBeNull();
  });
  it("vydaný doklad s kódem má KH, ale ne vstupní nárok", () => {
    const view = render(<Demo code={{ ...CODE, direction: "out" }} inbound={false} />);
    expect(view.queryByRole("radiogroup")).toBeNull();
    expect(view.getByRole("checkbox").getAttribute("aria-checked")).toBe("true");
  });
});

describe("model účetních údajů řádku", () => {
  it("převod s vypnutým DPH udrží oba údaje a procento", () => {
    const row = toJournalRow(LINE);
    expect(row).toMatchObject({ vat_deduction: "partial", vat_deduction_share: 60, kh_limit_excluded: true });
    expect(fromJournalRow(row)).toMatchObject({ vatDeduction: "partial", vatDeductionShare: 60, khLimitExcluded: true });
  });
  it("převod plného nároku nevymaže dříve zadaných 60 %", () => {
    const row = toJournalRow({ ...LINE, vatDeduction: "full" }, { vat: { calcMode: "net" } });
    expect(row.vat_deduction_share).toBe(60);
    expect(row.kh_limit_excluded).toBe(true);
  });
  it("duplikace zachová nárok a vyloučení KH", () => {
    expect(duplicateJournalLine([LINE], LINE, "copy")[1]).toMatchObject({ id: "copy", vatDeduction: "partial", vatDeductionShare: 60, khLimitExcluded: true });
  });
});