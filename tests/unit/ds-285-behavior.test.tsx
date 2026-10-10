/** Testy chování DS 2.85.0: výběry KS, účtu firmy a přidání účtu partnera. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { LookupField } = await import("../../src/components/ds/form/lookup-field");
const { OptionSelect } = await import("../../src/components/ds/form/option-select");

afterEach(() => cleanup());

/** Otevře výběr kliknutím na spouštěč a klikne na položku podle názvu. */
async function pick(view: ReturnType<typeof render>, trigger: Element, name: string | RegExp) {
  fireEvent.click(trigger);
  const option = await view.findByRole("option", { name });
  await act(async () => fireEvent.click(option));
}

function IssuedForm({ onValue }: { onValue: (v: Record<string, unknown>) => void }) {
  const [value, setValue] = React.useState<Record<string, unknown>>({
    currency: "CZK",
    amountTotal: 1000,
    totalMode: "entered",
  });
  return (
    <DocumentForm
      title="FV"
      status="draft"
      documentType="FV"
      value={value}
      onChange={(next) => {
        setValue(next as Record<string, unknown>);
        onValue(next as Record<string, unknown>);
      }}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      constantSymbolOptions={[{ value: "0308", label: "0308 – Platby za služby" }]}
      companyBankAccountOptions={[
        { id: "company-1", label: "Hlavní", account: "123/0100", currency: "CZK" },
      ]}
    />
  );
}

describe("DS 2.85.0 – chování výběrů", () => {
  it("výběr účtu firmy zapíše companyBankAccountId", async () => {
    const onValue = mock();
    const view = render(<IssuedForm onValue={onValue} />);
    const trigger = view.container.querySelector("#document-companyBankAccountId");
    expect(trigger).toBeTruthy();
    await pick(view, trigger as Element, /Hlavní · 123\/0100 · CZK/);
    expect(onValue.mock.calls.at(-1)?.[0]).toMatchObject({ companyBankAccountId: "company-1" });
  });

  it("KS v nabídce zobrazí název, po výběru jen kód a zapíše jej", async () => {
    const onValue = mock();
    const view = render(<IssuedForm onValue={onValue} />);
    const trigger = view.container.querySelector("#document-constantSymbol");
    expect(trigger?.getAttribute("role")).toBe("combobox");
    await pick(view, trigger as Element, "0308 – Platby za služby");
    expect(onValue.mock.calls.at(-1)?.[0]).toMatchObject({ constantSymbol: "0308" });
    expect(trigger?.textContent?.trim()).toBe("0308");
    expect(trigger?.getAttribute("title")).toBe("0308 – Platby za služby");
  });

  it("klik na „Přidat účet…“ zavolá onAddAccount i bez položek", async () => {
    const onAddAccount = mock();
    const onChange = mock();
    const view = render(
      <BankAccountField
        value=""
        onChange={onChange}
        options={[]}
        selectionOnly
        onAddAccount={onAddAccount}
      />,
    );
    await pick(view, view.getByRole("combobox"), "Přidat účet…");
    expect(onAddAccount).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("zakázaný účet zobrazí důvod uvnitř pole bez duplicitního tooltipu", () => {
    const view = render(
      <BankAccountField
        value=""
        onChange={() => {}}
        options={[]}
        selectionOnly
        disabledReason="Nejdřív vyberte dodavatele"
      />,
    );
    expect(view.getByText("Nejdřív vyberte dodavatele")).toBeTruthy();
    const trigger = view.getByRole("combobox");
    expect(trigger.textContent).toBe("Nejdřív vyberte dodavatele");
    expect(view.container.querySelector("p")).toBeNull();
    fireEvent.focus(trigger);
    expect(view.queryByRole("tooltip")).toBeNull();
  });

  it("tužka upraví jen vybranou editovatelnou hodnotu", () => {
    const onEditSelected = mock();
    const view = render(
      <LookupField value="partner-1" onChange={() => {}} onEditSelected={onEditSelected} />,
    );
    fireEvent.click(view.getByRole("button", { name: "Upravit vybraný záznam" }));
    expect(onEditSelected).toHaveBeenCalledWith("partner-1");
    view.rerender(
      <LookupField
        value="partner-1"
        onChange={() => {}}
        onEditSelected={onEditSelected}
        disabled
      />,
    );
    expect(view.queryByRole("button", { name: "Upravit vybraný záznam" })).toBeNull();
    view.rerender(
      <LookupField
        value="partner-1"
        onChange={() => {}}
        onEditSelected={onEditSelected}
        readOnly
      />,
    );
    expect(view.queryByRole("button", { name: "Upravit vybraný záznam" })).toBeNull();
    view.rerender(<LookupField value="" onChange={() => {}} onEditSelected={onEditSelected} />);
    expect(view.queryByRole("button", { name: "Upravit vybraný záznam" })).toBeNull();
  });

  it("neznámou volbu popíše čitelně a zachová doplněk vybrané položky", () => {
    const view = render(<OptionSelect value="raw-id" onChange={() => {}} options={[]} />);
    expect(view.getByRole("combobox").textContent).toContain("Hodnota není v číselníku");
    // 2.86.0: hodnota mimo číselník zůstane vidět spolu s označením.
    expect(view.getByRole("combobox").textContent).toContain("raw-id");
    view.rerender(
      <OptionSelect
        value="eur"
        onChange={() => {}}
        options={[{ value: "eur", label: "Euro", trailingLabel: "EUR" }]}
      />,
    );
    expect(view.getByRole("combobox").textContent).toContain("Euro");
    expect(view.getByRole("combobox").textContent).toContain("EUR");
  });

  it("skryje stav DPH partnera po vypnutí přepínače", () => {
    const view = render(<IssuedFormWithVatStatus />);
    expect(view.getByText("Ověřeno 24.09.2026")).toBeTruthy();
    fireEvent.click(view.getByRole("switch", { name: "Vstupuje do DPH" }));
    expect(view.queryByText("Ověřeno 24.09.2026")).toBeNull();
  });

  it("drží DUZP a Datum DPH v jedné pravé skupině", () => {
    const view = render(<IssuedFormWithVatStatus />);
    const taxDate = view.container.querySelector("#document-taxDate");
    const vatDate = view.container.querySelector("#document-vatDate");
    const group = view.container.querySelector('[data-slot="document-vat-dates"]');
    expect(group).toBeTruthy();
    expect(taxDate?.closest('[data-slot="document-vat-dates"]')).toBe(group);
    expect(vatDate?.closest('[data-slot="document-vat-dates"]')).toBe(group);
  });
});

function IssuedFormWithVatStatus() {
  const [value, setValue] = React.useState<Record<string, unknown>>({
    currency: "CZK",
    amountTotal: 1_000,
    totalMode: "entered",
    vatRelevant: true,
    taxDate: "2026-09-24",
    vatDate: "2026-09-24",
  });
  return (
    <DocumentForm
      title="FV"
      status="draft"
      documentType="FV"
      value={value}
      onChange={(next) => setValue(next as Record<string, unknown>)}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      vat={{ visible: true }}
      vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
    />
  );
}
