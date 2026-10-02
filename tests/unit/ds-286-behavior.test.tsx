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
const { TooltipProvider } = await import("../../src/components/ui/tooltip");

afterEach(cleanup);

describe("DS 2.86.0", () => {
  it("přepne partnera na ruční režim bez změny hodnot", () => {
    const change = mock();
    const partnerChange = mock();
    const nameChange = mock();
    const view = render(
      <TooltipProvider>
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
        />
      </TooltipProvider>,
    );
    fireEvent.click(view.getByRole("button", { name: "Zadat ručně" }));
    expect(change).toHaveBeenCalledWith("manual");
    expect(partnerChange).not.toHaveBeenCalled();
    expect(nameChange).not.toHaveBeenCalled();
  });

  describe("validace ručního účtu", () => {
    const d = DS_TEXTS_CS.documentForm;
    const texts = {
      account: d.bankAccountInvalid,
      bankCode: d.bankCodeInvalid,
      bankCodeRequired: d.bankCodeRequired,
      iban: d.invalidIban,
      swift: d.invalidSwift,
      swiftRequired: d.swiftRequired,
      accountRequired: d.accountRequired,
      accountOrIban: d.accountOrIban,
    };
    const v = (text: string, iban: string, swift: string, home: boolean, codes?: string[]) =>
      validateManualBankAccount({ text, iban, swift }, home, codes ?? [], texts);

    it("domácí měna: platný účet s modulo 11 a povoleným kódem banky", () => {
      expect(v("19-2000145399/0800", "", "", true, ["0800"])).toEqual({});
    });
    it("domácí měna: chybný modulo 11", () => {
      expect(v("19-2000145398/0800", "", "", true, ["0800"]).text).toBe(texts.account);
    });
    it("domácí měna: kód banky je povinný vždy, i bez číselníku", () => {
      expect(v("19-2000145399", "", "", true).text).toBe(texts.bankCodeRequired);
    });
    it("domácí měna: kód banky mimo předaný číselník", () => {
      expect(v("19-2000145399/0800", "", "", true, ["0100"]).text).toBe(texts.bankCode);
    });
    it("cizí měna: platný IBAN mod 97 se SWIFT", () => {
      expect(v("", "CZ6508000000192000145399", "GIBACZPX", false, ["0800"])).toEqual({});
    });
    it("cizí měna: neplatný IBAN", () => {
      expect(v("", "CZ6508000000192000145398", "GIBACZPX", false).iban).toBe(texts.iban);
    });
    it("cizí měna: IBAN vyžaduje SWIFT", () => {
      expect(v("", "CZ6508000000192000145399", "", false).swift).toBe(texts.swiftRequired);
    });
    it("cizí měna: SWIFT 8 nebo 11 znaků podle vzoru", () => {
      expect(v("12345", "", "BAD", false).swift).toBe(texts.swift);
      expect(v("12345", "", "GIBACZPX123", false).swift).toBeUndefined();
      expect(v("12345", "", "GIBACZ1X", false).swift).toBeUndefined();
      expect(v("12345", "", "GIBA1ZPX", false).swift).toBe(texts.swift);
    });
    it("cizí měna: účet nesmí být prázdný a číslo účtu jen bez IBANu", () => {
      expect(v("", "", "GIBACZPX", false).text).toBe(texts.accountRequired);
      expect(v("12345", "CZ6508000000192000145399", "GIBACZPX", false).text).toBe(
        texts.accountOrIban,
      );
    });
  });

  it("vypnutý platební příkaz schová účet, ale zachová řízenou hodnotu", () => {
    const change = mock();
    const view = render(
      <TooltipProvider>
        <PaymentOrderAccountField
          enabled={false}
          onEnabledChange={change}
          enabledLabel="Platit příkazem"
          disabledLabel="Nezahrnovat do platebních příkazů"
          disabledReason="Doklad se nezahrnuje do platebních příkazů"
        >
          <span>19-2000145399/0800</span>
        </PaymentOrderAccountField>
      </TooltipProvider>,
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
        options={[
          { value: "0308", label: "0308 – Platby za zboží", searchText: "0308 platby za zboží" },
        ]}
      />,
    );
    fireEvent.click(view.getByRole("combobox"));
    fireEvent.change(view.getAllByRole("combobox")[1], { target: { value: "zboží" } });
    fireEvent.click(view.getByRole("option", { name: "0308 – Platby za zboží" }));
    expect(change).toHaveBeenCalledWith("0308");
  });

  it("definuje všechny sloupce VS vlevo", () => {
    const t = DS_TEXTS_CS.journalEditor;
    const labels = Object.fromEntries(Object.keys(t).map((key) => [key, key])) as Parameters<
      typeof journalColumnDefs
    >[0]["labels"];
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
    expect(
      columns.filter((column) => /Vs$|^vs$/.test(column.id)).map((column) => column.align),
    ).toEqual(["left", "left"]);
  });
});
