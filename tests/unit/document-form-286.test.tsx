/** Testy chování formuláře dokladu 2.86.0 po kontrole kódu. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render, within } = await import("@testing-library/react");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { DocumentCounterpartyTab } =
  await import("../../src/components/ds/accounting/document-detail-tabs");
const { CounterpartyInputField } =
  await import("../../src/components/ds/accounting/counterparty-input-field");
const { VatStatusBadge } = await import("../../src/components/ds/data-display/vat-status-badge");
const { vsColumn } = await import("../../src/components/ds/grid/vs-column");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");

afterEach(cleanup);

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
  constantSymbol: "0308",
  specificSymbol: "77",
  bankAccount: "19-2000145399/0800",
  currency: "CZK",
  rate: 1,
  amountTotal: 1000,
  totalMode: "entered" as const,
  mainAccountId: "321001",
  partnerId: "p1",
};

function Form({ initial = base, ...props }: { initial?: typeof base } & Record<string, unknown>) {
  const [value, setValue] = React.useState(initial);
  return (
    <DocumentForm
      title="Doklad"
      status="draft"
      documentType="FP"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      currencies={[{ code: "CZK", label: "Koruna", symbol: "Kč" }]}
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      mainSide="D"
      partners={[{ id: "p1", code: "P1", name: "Dodavatel" }]}
      {...props}
    />
  );
}

const cpValue = {
  name: "Odběratel s.r.o.",
  ico: "12345678",
  dic: "CZ12345678",
  street: "Dlouhá",
  house_number: "1",
  zip: "11000",
  city: "Praha",
  country: "CZ",
};

describe("DocumentForm 2.86.0 – chování", () => {
  it("řízená záložka otevře Odběratele z aplikace a hlásí uživatelskou změnu", () => {
    const change = mock();
    const view = render(
      <Form
        documentType="FV"
        activeDetailTab="counterparty"
        onActiveDetailTabChange={change}
        counterpartyTab={{ value: cpValue, onChange: () => {} }}
      />,
    );
    expect(view.getByDisplayValue("Odběratel s.r.o.")).toBeTruthy();
    fireEvent.click(view.getByRole("tab", { name: /Řádky/ }));
    expect(change).toHaveBeenCalledWith("lines");
  });

  it("ručně → partner s vyplněnými údaji vyžádá potvrzení", () => {
    const change = mock();
    const view = render(
      <TooltipProvider>
        <CounterpartyInputField
          mode="manual"
          name="Ruční firma"
          partners={[]}
          onPartnerChange={() => {}}
          onNameChange={() => {}}
          onModeChange={change}
          hasManualData
          partnerModeLabel="Vybrat z adresáře"
          manualModeLabel="Zadat ručně"
          replaceManualWarning="Ručně zadané údaje budou nahrazeny údaji partnera"
        />
      </TooltipProvider>,
    );
    const toggle = view.getByRole("button", { name: "Vybrat z adresáře" });
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(toggle);
    expect(change).not.toHaveBeenCalled();
    const dialog = view.getByRole("alertdialog");
    fireEvent.click(within(dialog).getAllByRole("button").at(-1) as HTMLElement);
    expect(change).toHaveBeenCalledWith("partner");
  });

  it("v readOnly přepínač režimu nejde použít", () => {
    const change = mock();
    const view = render(
      <TooltipProvider>
        <CounterpartyInputField
          mode="partner"
          name=""
          partners={[]}
          onPartnerChange={() => {}}
          onNameChange={() => {}}
          onModeChange={change}
          readOnly
          partnerModeLabel="Vybrat z adresáře"
          manualModeLabel="Zadat ručně"
          replaceManualWarning="x"
        />
      </TooltipProvider>,
    );
    const toggle = view.getByRole("button", { name: "Zadat ručně" }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
  });

  it("zamčená záložka Odběratel: jen hodnoty, odznaky, aktualizace s potvrzením", () => {
    const refresh = mock();
    const view = render(
      <TooltipProvider>
        <DocumentCounterpartyTab
          value={cpValue}
          onChange={() => {}}
          partnerId="p1"
          counterpartyLocked
          counterpartyLockedReason="Zmrazeno při zařazení"
          counterpartyManualFields={["city"]}
          onRefreshCounterparty={refresh}
          countries={[{ code: "CZ", name: "Česko" }]}
        />
      </TooltipProvider>,
    );
    expect(view.queryAllByRole("textbox")).toHaveLength(0);
    expect(view.getByText("upraveno ručně")).toBeTruthy();
    expect(view.getByText("Česko")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Aktualizovat z partnera" }));
    expect(refresh).not.toHaveBeenCalled();
    const dialog = view.getByRole("alertdialog");
    fireEvent.click(within(dialog).getAllByRole("button").at(-1) as HTMLElement);
    expect(refresh).toHaveBeenCalled();
  });

  it("FV: firemní účet je nad Základními údaji a se zákazem nezobrazí hodnotu", () => {
    const view = render(
      <Form
        documentType="FV"
        initial={{ ...base, companyBankAccountId: "c1" } as typeof base}
        companyBankAccountOptions={[
          { id: "c1", label: "Hlavní", account: "123/0100", currency: "CZK" },
        ]}
        companyBankAccountDisabledReason="Doklad se hradí v hotovosti"
      />,
    );
    const label = view.getByText("Uhradit na bankovní účet");
    const basic = view.getByText("Základní údaje");
    expect(label.compareDocumentPosition(basic) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(view.queryByRole("combobox", { name: "Uhradit na bankovní účet" })).toBeNull();
    expect(view.container.textContent).not.toContain("123/0100");
  });

  it("vypnutý platební příkaz skryje KS a SS, VS zůstane", () => {
    const view = render(<Form paymentOrderEnabled={false} />);
    expect(view.queryByText("Konstantní symbol")).toBeNull();
    expect(view.queryByText("Specifický symbol")).toBeNull();
    expect(view.getAllByText("Variabilní symbol").length).toBeGreaterThan(0);
  });

  it("bankovní doklad má pole účtu v Platebních údajích", () => {
    const view = render(<Form documentType="BA" />);
    expect(view.container.querySelector("#document-bankAccount")).not.toBeNull();
  });

  it("tužka u vybraného partnera otevře jeho kartu", () => {
    const edit = mock();
    const view = render(<Form onEditCounterparty={edit} />);
    fireEvent.click(view.getAllByRole("button", { name: /Upravit/ })[0]);
    expect(edit).toHaveBeenCalledWith("p1");
  });

  it("štítek DPH ukáže datum nespolehlivosti", () => {
    const view = render(<VatStatusBadge status="payer" unreliableSince="2026-03-01" />);
    expect(view.container.textContent).toContain("01.03.2026");
  });

  it("vsColumn je vlevo a popisek předává aplikace", () => {
    const column = vsColumn<{ vs: string }>((row) => row.vs, "VS");
    expect(column.align).toBe("left");
    expect(column.label).toBe("VS");
  });
});
