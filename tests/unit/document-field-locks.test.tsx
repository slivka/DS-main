/** Obecné zamčení polí dokladu a nabídka výpisu (2.128.0). */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { BankStatementForm } =
  await import("../../src/components/ds/accounting/bank-statement-form");
const { DsTextsProvider } = await import("../../src/ds-texts");

afterEach(cleanup);

const REASON = "Převzato z banky";

const baValue = {
  bookId: "bv",
  number: "BA1",
  direction: "in" as const,
  issueDate: "2026-10-20",
  accountingDate: "2026-10-20",
  bankAccount: "19-2000145399",
  bankCode: "0800",
  variableSymbol: "123",
  constantSymbol: "0308",
  specificSymbol: "77",
  currency: "CZK",
  amountTotal: 1500,
  totalMode: "entered" as const,
  mainAccountId: "221001",
  description: "Příjem z banky",
};

function BaForm(props: Record<string, unknown>) {
  const [value, setValue] = React.useState(baValue);
  return (
    <DocumentForm
      title="Bankovní pohyb"
      status="draft"
      documentType="BA"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      mainSide="D"
      editableFields={[]}
      {...props}
    />
  );
}

const lockedReasons = {
  issueDate: REASON,
  bankAccount: REASON,
  bankCode: REASON,
  variableSymbol: REASON,
  constantSymbol: REASON,
  specificSymbol: REASON,
  amountTotal: REASON,
  currency: REASON,
};

describe("DocumentForm fieldLockedReasons (2.128.0)", () => {
  it("pole s důvodem vykreslí jen pro čtení se zámkem a hodnotou", () => {
    const view = render(<BaForm fieldLockedReasons={lockedReasons} />);
    const expected: Array<[string, string]> = [
      ["Datum pohybu", "20.10.2026"],
      ["Účet protistrany", "19-2000145399"],
      ["Kód banky", "0800"],
      ["Variabilní symbol", "123"],
      ["Konstantní symbol", "0308"],
      ["Specifický symbol", "77"],
      ["Celkem za doklad", "1 500,00"],
      ["Měna", "CZK"],
    ];
    for (const [label, text] of expected) {
      const node = view.getByRole("group", { name: label });
      expect(node.getAttribute("data-slot")).toBe("field-value");
      expect(node.textContent).toContain(text);
      // Zamčené pole není editovatelné pole.
      expect(view.queryByRole("textbox", { name: label })).toBeNull();
    }
    // Každé zamčené pole má zámek s důvodem jako přístupným názvem.
    expect(view.getAllByRole("button", { name: REASON })).toHaveLength(expected.length);
  });

  it("zámek vysvětlí důvod v bublině", async () => {
    const view = render(<BaForm fieldLockedReasons={lockedReasons} />);
    fireEvent.click(view.getAllByRole("button", { name: REASON })[0]);
    expect((await view.findAllByRole("tooltip")).some((node) => node.textContent === REASON)).toBe(
      true,
    );
  });

  it("pole bez důvodu zůstane obyčejné zakázané ovládání", () => {
    const view = render(<BaForm fieldLockedReasons={lockedReasons} />);
    const description = view.getByLabelText("Popis");
    expect(description.tagName).toBe("TEXTAREA");
    expect(description).toHaveProperty("disabled", true);
    expect(
      description.closest('[data-slot="field"]')?.querySelector('[data-slot="field-value"]'),
    ).toBeNull();
  });

  it("upravitelné pole s důvodem zůstane editovatelné", () => {
    const view = render(
      <BaForm editableFields={["variableSymbol"]} fieldLockedReasons={lockedReasons} />,
    );
    const vs = view.getByLabelText("Variabilní symbol");
    expect(vs).toHaveProperty("disabled", false);
    expect(view.queryByRole("group", { name: "Variabilní symbol" })).toBeNull();
  });
});

describe("BankStatementForm menuActions (2.128.0)", () => {
  const statement = {
    value: { date: "2026-10-12", number: "2026/10", bankClosing: null },
    onChange: () => {},
    status: "open" as const,
    book: "Banka",
    currency: "CZK",
    currencySymbol: "Kč",
    period: "2026",
    bankAccount: "123/0800",
    balances: { opening: 10000, income: 5000, expense: 2500 },
  };

  it("položky se připojí za stávající a klik zavolá akci", async () => {
    const onImport = mock();
    const view = render(
      <DsTextsProvider locale="cs">
        <BankStatementForm
          {...statement}
          onDelete={() => {}}
          menuActions={[{ id: "import", label: "Import výpisu…", onClick: onImport }]}
        />
      </DsTextsProvider>,
    );
    fireEvent.keyDown(view.getByRole("button", { name: "Další akce" }), { key: "Enter" });
    const items = await view.findAllByRole("menuitem");
    // Stávající Odstranit je první, položky aplikace následují.
    expect(items[0].textContent).toContain("Odstranit");
    expect(items[1].textContent).toContain("Import výpisu…");
    fireEvent.click(items[1]);
    expect(onImport).toHaveBeenCalledTimes(1);
  });

  it("zakázaná položka ukáže důvod", async () => {
    const onImport = mock();
    const view = render(
      <DsTextsProvider locale="cs">
        <BankStatementForm
          {...statement}
          menuActions={[
            {
              id: "import",
              label: "Import výpisu…",
              onClick: onImport,
              disabled: true,
              disabledReason: "Výpis je zaúčtován",
            },
          ]}
        />
      </DsTextsProvider>,
    );
    fireEvent.keyDown(view.getByRole("button", { name: "Další akce" }), { key: "Enter" });
    const item = await view.findByRole("menuitem", { name: /Import výpisu…/ });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(item);
    expect(onImport).not.toHaveBeenCalled();
  });
});
