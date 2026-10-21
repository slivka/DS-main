import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { JournalVatAccountingFields } from "../../src/components/ds/accounting/journal-vat-accounting-fields";
import { JournalEditorContext } from "../../src/components/ds/accounting/journal-editor-context";
import { useJournalEditorState } from "../../src/components/ds/accounting/useJournalEditorState";
import { useJournalKeyboard } from "../../src/components/ds/accounting/useJournalKeyboard";
import {
  fromJournalRow,
  toJournalRow,
  type JournalLine,
  type VatCodeOption,
} from "../../src/components/ds/accounting/journal-lines";
import { duplicateJournalLine } from "../../src/components/ds/accounting/journal-lines-model";

afterEach(cleanup);
const CODE: VatCodeOption = {
  id: "in",
  code: "Z",
  name: "Tuzemsko",
  direction: "in",
  hasTax: true,
  rate: 21,
  selfAssessment: false,
  requiresPdpSubject: false,
};
const LINE: JournalLine = {
  id: "row",
  amount: 1000,
  vatCodeId: "in",
  vatDeduction: "partial",
  vatDeductionShare: 60,
  khLimitExcluded: true,
};
interface DemoProps {
  withoutAccounts?: boolean;
  inbound?: boolean;
  code?: VatCodeOption | null;
  canEdit?: boolean;
  readOnly?: boolean;
  onEditor?: (editor: ReturnType<typeof useJournalEditorState>) => void;
  onChange?: (line: JournalLine) => void;
}
function Demo({
  withoutAccounts,
  inbound = true,
  code = CODE,
  canEdit = true,
  readOnly,
  onEditor,
  onChange,
}: DemoProps) {
  const [line, setLine] = React.useState(LINE);
  const editor = useJournalEditorState(
    {
      lines: [line],
      accounts: [],
      documentCurrency: "EUR",
      homeCurrency: "EUR",
      withoutAccounts,
      vat: {
        enabled: true,
        readOnly,
        codes: code ? [code] : [],
        rowDetails: { canEdit: () => canEdit, disabledReason: "Zaúčtovaný doklad" },
      },
      onChange: (lines) => {
        const next = lines[0];
        if (!next) return;
        setLine(next);
        onChange?.(next);
      },
    },
    null,
  );
  const context = { editor, keyboard: useJournalKeyboard(editor) };
  React.useEffect(() => onEditor?.(editor), [editor, onEditor]);
  return (
    <TooltipProvider>
      <JournalEditorContext.Provider value={context}>
        <JournalVatAccountingFields line={line} inbound={inbound} code={code ?? undefined} />
      </JournalEditorContext.Provider>
    </TooltipProvider>
  );
}

describe("účetní pole detailu DPH", () => {
  it("přepnutí na plný a zpět zachová 60 % i vyloučení KH", () => {
    const change = mock();
    const view = render(<Demo onChange={change} />);
    fireEvent.click(view.getByRole("radio", { name: "Plný" }));
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({
      vatDeduction: "full",
      vatDeductionShare: 60,
      khLimitExcluded: true,
    });
    fireEvent.click(view.getByRole("radio", { name: "Poměrný" }));
    expect(view.getByRole("textbox", { name: "Poměr %" }).getAttribute("value")).toBe("60");
  });
  it("změna procenta předá hodnotu a zachová ostatní údaje", () => {
    const change = mock();
    const view = render(<Demo onChange={change} />);
    fireEvent.change(view.getByRole("textbox", { name: "Poměr %" }), { target: { value: "70" } });
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({
      vatDeductionShare: 70,
      khLimitExcluded: true,
    });
  });
  it("změna KH předá false bez změny nároku", () => {
    const change = mock();
    const view = render(<Demo onChange={change} />);
    fireEvent.click(view.getByRole("checkbox"));
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({
      khLimitExcluded: false,
      vatDeduction: "partial",
      vatDeductionShare: 60,
    });
  });
  it("zakázaná pole nevolají změnu a poskytují důvod", () => {
    const change = mock();
    const view = render(<Demo canEdit={false} onChange={change} />);
    const checkbox = view.getByRole("checkbox");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
    fireEvent.click(checkbox);
    fireEvent.click(view.getByRole("radio", { name: "Plný" }));
    expect(view.getAllByLabelText("Zaúčtovaný doklad").length).toBe(3);
    expect(change).not.toHaveBeenCalled();
  });
  it("ZL účetní pole skryje bez zápisu", () => {
    const change = mock();
    const view = render(<Demo withoutAccounts onChange={change} />);
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
  it("zaúčtování má přednost před povolením APP a nic nezapisuje", () => {
    const change = mock();
    const view = render(<Demo readOnly canEdit onChange={change} />);
    expect(view.getByRole("checkbox").hasAttribute("disabled")).toBe(true);
    expect(view.getByRole("textbox", { name: "Poměr %" }).hasAttribute("disabled")).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });
  it("změna kódu na neznámý zachová obě hodnoty a 60 %", () => {
    const change = mock();
    let changeCode: (() => void) | undefined;
    render(
      <Demo
        onChange={change}
        onEditor={(editor) => {
          changeCode = () => editor.changeVatCode(LINE, "other");
        }}
      />,
    );
    act(() => changeCode?.());
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({
      vatCodeId: "other",
      vatDeduction: "partial",
      vatDeductionShare: 60,
      khLimitExcluded: true,
    });
  });
});

describe("model účetních údajů řádku", () => {
  it("převod s vypnutým DPH udrží oba údaje a procento", () => {
    const row = toJournalRow(LINE);
    expect(row).toMatchObject({
      vat_deduction: "partial",
      vat_deduction_share: 60,
      kh_limit_excluded: true,
    });
    expect(fromJournalRow(row)).toMatchObject({
      vatDeduction: "partial",
      vatDeductionShare: 60,
      khLimitExcluded: true,
    });
  });
  it("převod plného nároku nevymaže dříve zadaných 60 %", () => {
    const row = toJournalRow({ ...LINE, vatDeduction: "full" }, { vat: { calcMode: "net" } });
    expect(row.vat_deduction_share).toBe(60);
    expect(row.kh_limit_excluded).toBe(true);
  });
  it("duplikace zachová nárok a vyloučení KH", () => {
    expect(duplicateJournalLine([LINE], LINE, "copy")[1]).toMatchObject({
      id: "copy",
      vatDeduction: "partial",
      vatDeductionShare: 60,
      khLimitExcluded: true,
    });
  });
});
