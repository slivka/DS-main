import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { DocumentForm, vsFromDocumentNumber } =
  await import("../../src/components/ds/accounting/document-form");
const { DocumentCounterpartyTab, DocumentPrintTab } =
  await import("../../src/components/ds/accounting/document-detail-tabs");

const base = {
  bookId: "fp",
  number: "FP1",
  accountingDate: "2026-09-29",
  issueDate: "2026-09-29",
  dueDate: "2026-10-10",
  taxDate: "2026-09-29",
  vatDate: "2026-09-01",
  externalNumber: "FA-2026/0123",
  variableSymbol: "20260123",
  bankAccount: "19-2000145399/0800",
  currency: "EUR",
  rate: 24.3,
  amountTotal: 1000,
  totalMode: "entered" as const,
  mainAccountId: "321001",
};

function Form({ initial = base, ...props }: { initial?: typeof base } & Record<string, unknown>) {
  const [value, setValue] = React.useState(initial);
  return (
    <DocumentForm
      title="Přijatá faktura"
      status="draft"
      documentType="FP"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      currencies={[{ code: "EUR", label: "Euro", symbol: "€" }]}
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      mainSide="D"
      {...props}
    />
  );
}

afterEach(() => cleanup());
afterAll(async () => {
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

describe("DocumentForm 2.73", () => {
  it("mění číselníkový KS a identifikátor firemního účtu bez volného vstupu", () => {
    const patches: Array<Record<string, unknown>> = [];
    const view = render(
      <Form
        initial={{ ...base, constantSymbol: "9999", companyBankAccountId: null }}
        documentType="FV"
        constantSymbolOptions={[{ value: "0308", label: "0308 – Platby za služby" }]}
        companyBankAccountOptions={[
          { id: "company-1", label: "Hlavní", account: "123/0100", currency: "CZK" },
        ]}
        onChange={(next: Record<string, unknown>) => patches.push(next)}
      />,
    );
    expect(view.getByRole("combobox", { name: "Konstantní symbol" }).textContent).toContain("9999");
    expect(view.queryByRole("textbox", { name: "Konstantní symbol" })).toBeNull();
    fireEvent.click(view.getByRole("combobox", { name: "Bankovní účet firmy" }));
    fireEvent.click(view.getByRole("option", { name: /Hlavní/ }));
    expect(patches.at(-1)?.companyBankAccountId).toBe("company-1");
  });

  it("readOnly odběratel nenačítá partnera a tisk mění celý value.print", () => {
    const counterparty = {
      name: "Firma",
      ico: "12345678",
      dic: "CZ12345678",
      street: "Ulice 1",
      zip: "11000",
      city: "Praha",
      country: "CZ",
      email: "a@example.cz",
    };
    const readonlyView = render(
      <DocumentCounterpartyTab
        value={counterparty}
        onChange={() => {}}
        partnerId="p1"
        onReloadFromPartner={() => {}}
        readOnly
      />,
    );
    expect(readonlyView.queryByRole("button", { name: "Načíst znovu z partnera" })).toBeNull();
    expect(readonlyView.getAllByRole("textbox").every((input) => input.hasAttribute("readonly"))).toBe(
      true,
    );
    cleanup();
    const print = {
      options: {
        showHeader: false,
        showFooter: false,
        showVatRecap: false,
        showNote: false,
        showColumnHeadings: false,
        showTotalsRow: false,
        showPaymentSchedule: false,
      },
      headerText: "",
      footerText: "",
      note: "",
      issuedByName: "",
      issuedByPhone: "",
      issuedByEmail: "",
    };
    let changed = print;
    const printView = render(
      <DocumentPrintTab value={print} onChange={(next) => (changed = next)} />,
    );
    fireEvent.click(printView.getByRole("checkbox", { name: "Tisknout záhlaví" }));
    expect(changed).toEqual({ ...print, options: { ...print.options, showHeader: true } });
  });

  it("odvodí VS jen z 1 až 10 číslic", () => {
    expect(vsFromDocumentNumber("FA-2026/0123")).toBe("20260123");
    expect(vsFromDocumentNumber("0012")).toBe("0012");
    expect(vsFromDocumentNumber(" 20 26 / 01 ")).toBe("202601");
    expect(vsFromDocumentNumber("bez číslic")).toBeNull();
    expect(vsFromDocumentNumber("12345678901")).toBeNull();
  });

  it("změna čísla obnoví automatický VS, ale nepřepíše ruční", () => {
    const auto = render(<Form />);
    fireEvent.change(auto.container.querySelector("#document-externalNumber") as HTMLInputElement, {
      target: { value: "FA-2026/0456" },
    });
    expect(
      (auto.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("20260456");
    cleanup();
    const manual = render(<Form initial={{ ...base, variableSymbol: "777" }} />);
    fireEvent.change(
      manual.container.querySelector("#document-externalNumber") as HTMLInputElement,
      { target: { value: "FA-2026/0456" } },
    );
    expect(
      (manual.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("777");
  });

  it("pamatuje automatický VS přes prázdné a příliš dlouhé číslo", () => {
    const emptyBridge = render(
      <Form initial={{ ...base, externalNumber: "FA-1", variableSymbol: "1" }} />,
    );
    const number = emptyBridge.container.querySelector(
      "#document-externalNumber",
    ) as HTMLInputElement;
    fireEvent.change(number, { target: { value: "" } });
    expect(
      (emptyBridge.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("");
    fireEvent.change(number, { target: { value: "FA-2" } });
    expect(
      (emptyBridge.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("2");
    cleanup();
    const longBridge = render(
      <Form initial={{ ...base, externalNumber: "1234567890", variableSymbol: "1234567890" }} />,
    );
    const longNumber = longBridge.container.querySelector(
      "#document-externalNumber",
    ) as HTMLInputElement;
    fireEvent.change(longNumber, { target: { value: "123456789012" } });
    expect(
      (longBridge.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("1234567890");
    fireEvent.change(longNumber, { target: { value: "9876543210" } });
    expect(
      (longBridge.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("9876543210");
  });

  it("ručně zadaný VS nepřepíše ani přes prázdné nebo dlouhé číslo", () => {
    const view = render(
      <Form initial={{ ...base, externalNumber: "FA-1", variableSymbol: "777" }} />,
    );
    const number = view.container.querySelector("#document-externalNumber") as HTMLInputElement;
    fireEvent.change(number, { target: { value: "" } });
    fireEvent.change(number, { target: { value: "123456789012" } });
    fireEvent.change(number, { target: { value: "FA-2" } });
    expect(
      (view.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("777");
  });

  it("přijatý doklad řadí Platební údaje před Částku a má číslo span 6", () => {
    const view = render(<Form />);
    const text = view.container.textContent ?? "";
    expect(text.indexOf("Platební údaje")).toBeLessThan(text.indexOf("Částka"));
    expect(
      view.container.querySelector("#document-externalNumber")?.closest(".col-span-20")?.className,
    ).toContain("col-span-6");
    expect(
      view.container.querySelector("[data-slot=document-payment-section] #document-bankAccount"),
    ).toBeTruthy();
    expect(view.getByText("Nejdřív vyberte dodavatele")).toBeTruthy();
    const exclude = view.container
      .querySelector("#document-exclude-payment-orders")
      ?.closest("[data-slot=checkbox-field]");
    expect(exclude?.className).toContain("@min-[40rem]:mt-4");
    expect(exclude?.className).toContain("[&_label]:whitespace-nowrap");
    expect(exclude?.className).not.toContain("self-center");
  });

  it("mění popisek čísla podle viditelné DPH", () => {
    const payer = render(<Form vat={{ visible: true }} />);
    expect(payer.getByText("Číslo daňového dokladu")).toBeTruthy();
    cleanup();
    const nonPayer = render(<Form vat={{ visible: false }} />);
    expect(nonPayer.getByText("Číslo dokladu dodavatele")).toBeTruthy();
  });

  it("dlouhé číslo ponechá VS a ukáže nápovědu", () => {
    const view = render(<Form />);
    fireEvent.change(view.container.querySelector("#document-externalNumber") as HTMLInputElement, {
      target: { value: "12345678901" },
    });
    expect(
      (view.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("20260123");
    expect(view.getByText("Číslo má víc než 10 číslic – VS doplňte ručně")).toBeTruthy();
  });

  it("živé datumové varování je v pruhu a po odebrání zmizí", () => {
    const view = render(
      <Form dateWarnings={{ taxDate: "DUZP je mimo období" }} vat={{ visible: true }} />,
    );
    expect(
      view.container.querySelector("[data-slot=document-form-notices]")?.textContent,
    ).toContain("DUZP je mimo období");
    expect(view.container.querySelector("#document-taxDate")?.className).toContain(
      "border-warning",
    );
    view.rerender(<Form dateWarnings={{}} vat={{ visible: true }} />);
    expect(
      view.container.querySelector("[data-slot=document-form-notices]")?.textContent ?? "",
    ).not.toContain("DUZP je mimo období");
  });

  it("zobrazí současně varování podaného období i datumové varování", () => {
    const view = render(
      <Form
        dateWarnings={{ vatDate: "Datum DPH je mimo období" }}
        vat={{ visible: true, periodFiled: true, filedWarning: "Období už bylo podáno" }}
      />,
    );
    const notices =
      view.container.querySelector("[data-slot=document-form-notices]")?.textContent ?? "";
    expect(notices).toContain("Období už bylo podáno");
    expect(notices).toContain("Datum DPH je mimo období");
    expect(
      view.container.querySelector("#document-vatDate")?.getAttribute("aria-describedby"),
    ).toBeTruthy();
    expect(
      view.container.querySelector("#document-vatDate")?.getAttribute("aria-invalid"),
    ).toBeNull();
  });
});

describe("BankAccountField 2.73", () => {
  it("nabídne založení prvního účtu a zavolá akci", () => {
    const onAddAccount = mock(() => {});
    const view = render(
      <BankAccountField
        aria-label="Bankovní účet"
        value=""
        onChange={() => {}}
        options={[]}
        selectionOnly
        onAddAccount={onAddAccount}
      />,
    );
    fireEvent.click(view.getByRole("combobox", { name: "Bankovní účet" }));
    fireEvent.click(view.getByRole("option", { name: "Přidat účet…" }));
    expect(onAddAccount).toHaveBeenCalledTimes(1);
  });

  it("neplatný a chybějící účet popíše bez surového identifikátoru", () => {
    const view = render(
      <BankAccountField value="invalid-id" onChange={() => {}} options={[]} selectionOnly />,
    );
    expect(view.getByRole("combobox").textContent).toContain("Účet není v číselníku partnera");
    expect(view.getByRole("combobox").textContent).not.toContain("invalid-id");
    view.rerender(
      <BankAccountField
        value="bank-1"
        onChange={() => {}}
        options={[{ id: "bank-1", number: "123", bankCode: "0100", invalid: true }]}
        selectionOnly
      />,
    );
    expect(view.getByRole("combobox").textContent).toContain("neplatný");
    expect(view.getByRole("combobox").querySelector(".line-through")).toBeTruthy();
  });

  it("nemění prázdnou hodnotu podle výchozí možnosti", () => {
    let value = "";
    render(
      <BankAccountField
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={[{ number: "19-2000145399", bankCode: "0800", default: true }]}
      />,
    );
    expect(value).toBe("");
  });

  it("ověří modulo 11 a předaný kód banky", () => {
    const view = render(
      <BankAccountField
        value="123456789/9999"
        onChange={() => {}}
        bankCodes={["0800"]}
        invalidAccountText="Neplatný účet"
        invalidBankCodeText="Neplatná banka"
      />,
    );
    expect(view.getByRole("alert").textContent).toBe("Neplatná banka");
    view.rerender(
      <BankAccountField
        value="123456789/0800"
        onChange={() => {}}
        bankCodes={["0800"]}
        invalidAccountText="Neplatný účet"
        invalidBankCodeText="Neplatná banka"
      />,
    );
    expect(view.getByRole("alert").textContent).toBe("Neplatný účet");
    view.rerender(
      <BankAccountField
        value="19-2000145399/0800"
        onChange={() => {}}
        bankCodes={["0800"]}
        invalidAccountText="Neplatný účet"
        invalidBankCodeText="Neplatná banka"
      />,
    );
    expect(view.queryByRole("alert")).toBeNull();
  });

  it("po opuštění hlásí neúplný účet, odstraňuje mezery a vrací se z režimu Jiný účet", () => {
    const options = [{ number: "19-2000145399", bankCode: "0800" }];
    function AccountHarness() {
      const [account, setAccount] = React.useState("");
      return (
        <BankAccountField
          aria-label="Bankovní účet"
          value={account}
          onChange={setAccount}
          options={options}
          invalidAccountText="Neplatný účet"
        />
      );
    }
    const view = render(<AccountHarness />);
    expect(view.getByRole("combobox", { name: "Bankovní účet" })).toBeTruthy();
    fireEvent.click(view.getByRole("combobox", { name: "Bankovní účet" }));
    fireEvent.click(view.getByRole("option", { name: "Jiný účet" }));
    const input = view.getByRole("textbox", { name: "Bankovní účet" });
    fireEvent.change(input, { target: { value: "123 456 789" } });
    expect((input as HTMLInputElement).value).toBe("123456789");
    fireEvent.blur(input);
    expect(view.getByRole("alert").textContent).toBe("Neplatný účet");
    view.rerender(
      <BankAccountField
        aria-label="Bankovní účet"
        value="19-2000145399/0800"
        onChange={() => {}}
        options={options}
      />,
    );
    expect(view.queryByRole("textbox", { name: "Bankovní účet" })).toBeNull();
  });

  it("v režimu Jiný účet vstup zůstane po smazání i po shodě s nabídkou", () => {
    const options = [{ number: "19-2000145399", bankCode: "0800" }];
    function Harness() {
      const [account, setAccount] = React.useState("");
      return (
        <BankAccountField
          aria-label="Účet"
          value={account}
          onChange={setAccount}
          options={options}
        />
      );
    }
    const view = render(<Harness />);
    fireEvent.click(view.getByRole("combobox", { name: "Účet" }));
    fireEvent.click(view.getByRole("option", { name: "Jiný účet" }));
    const input = view.getByRole("textbox", { name: "Účet" });
    fireEvent.change(input, { target: { value: "123" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(view.getByRole("textbox", { name: "Účet" })).toBe(input);
    fireEvent.change(input, { target: { value: "19-2000145399/0800" } });
    expect(view.getByRole("textbox", { name: "Účet" })).toBe(input);
  });
});

describe("DocumentForm 2.73 – druhá kontrola", () => {
  it("VS do patche nedá, když se nemění, a paměť obnoví při jiném dokladu", () => {
    const patches: Array<Record<string, unknown>> = [];
    const initial = { ...base, externalNumber: "FA-1", variableSymbol: "" };
    function Tracked({ doc }: { doc: typeof base & { id?: string } }) {
      const [value, setValue] = React.useState(doc);
      React.useEffect(() => setValue(doc), [doc]);
      return (
        <DocumentForm
          title="FP"
          status="draft"
          documentType="FP"
          value={value}
          onChange={(next: Record<string, unknown>) => {
            patches.push(next);
            setValue(next as typeof doc);
          }}
          lines={[]}
          onLinesChange={() => {}}
          books={[]}
          accounts={[]}
          currencies={[{ code: "EUR", label: "Euro", symbol: "€" }]}
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          mainSide="D"
        />
      );
    }
    const view = render(<Tracked doc={{ ...initial, externalNumber: "ABC" }} />);
    const number = () =>
      view.container.querySelector("#document-externalNumber") as HTMLInputElement;
    fireEvent.change(number(), { target: { value: "ABCD" } });
    expect(patches.at(-1)?.variableSymbol).toBe("");
    // druhý doklad s ručním VS: paměť z prvního se nesmí přenést
    view.rerender(
      <Tracked
        doc={{ ...base, id: "2", number: "FP2", externalNumber: "FA-5", variableSymbol: "5" }}
      />,
    );
    view.rerender(
      <Tracked
        doc={{ ...base, id: "3", number: "FP3", externalNumber: "FA-7", variableSymbol: "5" }}
      />,
    );
    fireEvent.change(number(), { target: { value: "FA-8" } });
    expect(
      (view.container.querySelector("#document-variableSymbol") as HTMLInputElement).value,
    ).toBe("5");
  });
});
