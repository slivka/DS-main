/** Testy chování DS 2.86.0: protistrana, účty, hledání a zarovnání VS. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { CounterpartyInputField } =
  await import("../../src/components/ds/accounting/counterparty-input-field");
const { validateManualBankAccount } =
  await import("../../src/components/ds/accounting/received-bank-account-field");
const { PaymentOrderAccountField } =
  await import("../../src/components/ds/accounting/payment-order-account-field");
const { OptionSelect } = await import("../../src/components/ds/form/option-select");
const { journalColumnDefs } = await import("../../src/components/ds/accounting/journal-columns");
const { DS_TEXTS_CS } = await import("../../src/ds-texts");

afterEach(cleanup);

describe("DS 2.86.0", () => {
  it("přepne partnera na ruční režim bez změny hodnot", () => {
    const change = mock();
    const partnerChange = mock();
    const nameChange = mock();
    const view = render(
      <CounterpartyInputField
        mode="partner"
        partnerId="p1"
        name="Firma"
        partners={[{ id: "p1", code: "P1", name: "Firma" }]}
        onPartnerChange={partnerChange}
        onNameChange={nameChange}
        onModeChange={change}
        partnerModeLabel="Vybrat z adresáře"
        manualModeLabel="Zadat ručně"
        replaceManualWarning="Ručně zadané údaje budou nahrazeny údaji partnera"
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Zadat ručně" }));
    expect(change).toHaveBeenCalledWith("manual");
    expect(partnerChange).not.toHaveBeenCalled();
    expect(nameChange).not.toHaveBeenCalled();
  });

  it("ověří modulo 11, IBAN modulo 97, český kód banky a SWIFT", () => {
    const validCz = validateManualBankAccount(
      { text: "19-2000145399/0800", iban: "", swift: "" },
      true,
      ["0800"],
    );
    expect(validCz).toEqual({});
    expect(
      validateManualBankAccount(
        { text: "19-2000145398/0800", iban: "", swift: "" },
        true,
        ["0800"],
      ).text,
    ).toBeTruthy();
    expect(
      validateManualBankAccount(
        { text: "", iban: "CZ6508000000192000145399", swift: "GIBACZPX" },
        false,
        ["0800"],
      ),
    ).toEqual({});
    expect(
      validateManualBankAccount(
        { text: "12345", iban: "", swift: "BAD" },
        false,
      ).swift,
    ).toBeTruthy();
  });

  it("vypnutý platební příkaz schová účet, ale zachová řízenou hodnotu", () => {
    const change = mock();
    const view = render(
      <PaymentOrderAccountField
        enabled={false}
        onEnabledChange={change}
        enabledLabel="Platit příkazem"
        disabledLabel="Nezahrnovat do platebních příkazů"
        disabledReason="Doklad se nezahrnuje do platebních příkazů"
      >
        <span>19-2000145399/0800</span>
      </PaymentOrderAccountField>,
    );
    expect(view.queryByText("19-2000145399/0800")).toBeNull();
    fireEvent.click(view.getByRole("button", { name: "Nezahrnovat do platebních příkazů" }));
    expect(change).toHaveBeenCalledWith(true);
  });

  it("hledá KS podle názvu a po výběru ukáže jen kód", () => {
    const change = mock();
    const view = render(
      <OptionSelect
        value=""
        onChange={change}
        searchable
        selectedLabel={(option) => option.value}
        options={[{ value: "0308", label: "0308 – Platby za zboží", searchText: "0308 platby za zboží" }]}
      />,
    );
    fireEvent.click(view.getByRole("combobox"));
    fireEvent.change(view.getByRole("searchbox"), { target: { value: "zboží" } });
    fireEvent.click(view.getByRole("option", { name: "0308 – Platby za zboží" }));
    expect(change).toHaveBeenCalledWith("0308");
  });

  it("definuje všechny sloupce VS vlevo", () => {
    const t = DS_TEXTS_CS.journalEditor;
    const labels = Object.fromEntries(
      Object.keys(t).map((key) => [key, key]),
    ) as Parameters<typeof journalColumnDefs>[0]["labels"];
    const columns = journalColumnDefs({
      t,
      mode: "internal",
      labels,
      counterShortLabel: "Protiúčet",
      counterNameLabel: "Protiúčet – název",
      showQuantityColumns: false,
      vatOn: false,
      foreign: false,
      homeAmountLabel: "Částka",
      sideFields: "split",
      hasValue: () => true,
    });
    expect(columns.filter((column) => /Vs$|^vs$/.test(column.id)).map((column) => column.align)).toEqual([
      "left",
      "left",
    ]);
  });
});