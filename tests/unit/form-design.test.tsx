/** Behavior testy pořadí, výzev a oddělených akcí formulářů. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { OptionSelect } = await import("../../src/components/ds/form/option-select");
const { Input } = await import("../../src/components/ui/input");
const { DS_TEXTS_CS, DS_TEXTS_SK, DsTextsProvider } = await import("../../src/ds-texts");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
afterEach(cleanup);
const value = {
  bookId: "fp",
  number: "FP1",
  accountingDate: "2026-10-10",
  currency: "CZK",
  rate: 1,
  amountTotal: 1000,
  totalMode: "entered" as const,
  partnerId: "p1",
};
const formProps = {
  title: "Doklad",
  documentType: "FP",
  status: "draft" as const,
  value,
  onChange: () => {},
  lines: [],
  onLinesChange: () => {},
  books: [],
  accounts: [],
  currencies: [{ code: "CZK", label: "Koruna", symbol: "Kč" }],
  homeCurrency: "CZK",
  partners: [{ id: "p1", name: "Dodavatel", ico: "12345678", dic: "CZ12345678" }],
};

describe("Design formulářů", () => {
  it("výzva zákazu je uvnitř výběru jen jednou, bez odstavce a tooltipu", () => {
    const reason = DS_TEXTS_CS.documentForm.selectSupplierFirst;
    const view = render(
      <BankAccountField
        aria-label="Účet"
        value=""
        onChange={() => {}}
        selectionOnly
        disabledReason={reason}
      />,
    );
    const trigger = view.getByRole("combobox", { name: "Účet" });
    expect(trigger.textContent).toBe(reason);
    expect(trigger.hasAttribute("disabled")).toBe(true);
    expect(view.getAllByText(reason)).toHaveLength(1);
    expect(view.container.querySelector("p")).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });
  it("výzva po vybrání dodavatele zmizí a vrátí se standardní prázdná hodnota", () => {
    const view = render(
      <BankAccountField
        value=""
        onChange={() => {}}
        selectionOnly
        disabledReason={DS_TEXTS_CS.documentForm.selectSupplierFirst}
      />,
    );
    view.rerender(<BankAccountField value="" onChange={() => {}} selectionOnly />);
    expect(view.getByRole("combobox").textContent).toBe(DS_TEXTS_CS.optionSelect.emptyValue);
    expect(view.getByRole("combobox").hasAttribute("disabled")).toBe(false);
  });
  it("vlastní placeholder je výzvou výběru, ale nepřechází do ručního vstupu", () => {
    const view = render(
      <BankAccountField value="" onChange={() => {}} selectionOnly placeholder="Vybrat účet" />,
    );
    expect(view.getByRole("combobox").textContent).toBe("Vybrat účet");
    view.rerender(
      <BankAccountField
        value=""
        onChange={() => {}}
        placeholder="Vybrat účet"
        disabledReason="Důvod"
      />,
    );
    expect(view.getByRole("textbox").getAttribute("placeholder")).toBeNull();
  });
  it("FP řadí Dodavatele, IČO, DIČ, účet, číslo a popis ve stejném DOM pořadí", () => {
    const view = render(
      <TooltipProvider>
        <DocumentForm {...formProps} />
      </TooltipProvider>,
    );
    const nodes = [
      "document-partner",
      "document-partner-ico",
      "document-partner-dic",
      "document-externalNumber",
      "document-description",
    ].map((id) => view.container.querySelector(`#${id}`));
    const account = view.getByRole("combobox", { name: "Bankovní účet" });
    const ordered = [nodes[0], nodes[1], nodes[2], account, nodes[3], nodes[4]];
    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      expect(previous).toBeTruthy();
      expect(current).toBeTruthy();
      if (!previous || !current) throw new Error("Pole není vykresleno");
      expect(
        previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });
  it("pevná měna má čitelnou hodnotu bez šipky; změna režimu vrací výběr", () => {
    const view = render(
      <TooltipProvider>
        <DocumentForm {...formProps} currencyLocked />
      </TooltipProvider>,
    );
    const fixed = view.container.querySelector("[data-currency-fixed]");
    expect(fixed?.textContent).toBe("CZK");
    expect(fixed?.getAttribute("aria-readonly")).toBe("true");
    expect(fixed?.querySelector("svg")).toBeNull();
    view.rerender(
      <TooltipProvider>
        <DocumentForm {...formProps} />
      </TooltipProvider>,
    );
    expect(view.container.querySelector("[data-currency-fixed]")).toBeNull();
    expect(view.getByRole("combobox", { name: "Měna" })).toBeTruthy();
  });
  it("křížek je samostatné tlačítko, vymaže hodnotu bez otevření nabídky", () => {
    const change = mock();
    const view = render(
      <OptionSelect
        value="0008"
        onChange={change}
        searchable
        allowEmpty
        options={[{ value: "0008", label: "0008" }]}
      />,
    );
    const trigger = view.getByRole("combobox");
    const clear = view.getByRole("button", { name: DS_TEXTS_CS.documentForm.clear });
    expect(trigger.querySelector('[data-slot="select-chevron"]')).toBeTruthy();
    expect(trigger.contains(clear)).toBe(false);
    expect(trigger.parentElement).toBe(
      clear.closest('[data-slot="field-inline-actions"]')?.parentElement,
    );
    fireEvent.click(clear);
    expect(change).toHaveBeenCalledWith("");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
  it("formatPattern vykreslí vzor a nezmění hodnotu ani obsluhu vstupu", () => {
    const change = mock();
    const ref = React.createRef<HTMLInputElement>();
    const view = render(
      <Input
        ref={ref}
        formatPattern={DS_TEXTS_CS.documentForm.accountNumberPattern}
        value=""
        onChange={change}
        aria-label="Účet"
      />,
    );
    expect(ref.current?.placeholder).toBe("předčíslí-číslo");
    expect(ref.current?.value).toBe("");
    fireEvent.change(view.getByRole("textbox"), { target: { value: "19-123" } });
    expect(change).toHaveBeenCalled();
  });
  it("slovenský vzor i výzva dodavatele pocházejí z poskytovatele textů", () => {
    const view = render(
      <DsTextsProvider locale="sk" texts={DS_TEXTS_SK}>
        <BankAccountField
          selectionOnly
          value=""
          onChange={() => {}}
          disabledReason={DS_TEXTS_SK.documentForm.selectSupplierFirst}
        />
        <Input formatPattern={DS_TEXTS_SK.documentForm.accountNumberPattern} />
      </DsTextsProvider>,
    );
    expect(view.getByRole("combobox").textContent).toBe("Najskôr vyberte dodávateľa");
    expect(view.getByRole("textbox").getAttribute("placeholder")).toBe("predčíslie-číslo");
  });
});
