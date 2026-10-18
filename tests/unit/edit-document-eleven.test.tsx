/** Edit dokladu 11 · testy změněných kurzů, zamčení a pořadí polí. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  DocumentForm,
  type DocumentFormProps,
} from "../../src/components/ds/accounting/document-form";
import { RateField } from "../../src/components/ds/form/rate-field";
import { DS_TEXTS_SK, DsTextsProvider } from "../../src/ds-texts";
import { RecordActionBar } from "../../src/components/ds/layout/record-action-bar";
import { Settings } from "lucide-react";

afterEach(cleanup);
const base: DocumentFormProps = {
  title: "FP",
  documentType: "FP",
  status: "draft",
  value: {
    currency: "EUR",
    rate: 25,
    amountTotal: 1210,
    totalMode: "entered",
    partnerId: "p",
    partnerBankAccountId: "bank",
    constantSymbol: "0008",
    specificSymbol: "99",
  },
  onChange: () => {},
  lines: [],
  onLinesChange: () => {},
  books: [],
  accounts: [],
  homeCurrency: "CZK",
  homeCurrencySymbol: "Kč",
  currencies: [{ code: "EUR", symbol: "€" }],
  partners: [{ id: "p", name: "Dodavatel", ico: "12345678", dic: "CZ12345678" }],
  bankAccountOptions: [{ id: "bank", number: "2001234567", bankCode: "2010" }],
  paymentMethodOptions: [{ value: "bank", label: "Převodem" }],
};
describe("Edit dokladu 11", () => {
  it("zdroj kurzu má trvalý přístupný popis a tooltip při fokusu, ne řádek pod polem", async () => {
    const props = {
      value: 25,
      onChange: () => {},
      currency: "EUR",
      currencySymbol: "€",
      homeCurrency: "CZK",
      homeCurrencySymbol: "Kč",
      rateAmount: 1,
      manual: false,
      suggestedInfo: "ČNB 9. 10. 2026",
      suggestedRate: 25,
      showNote: false,
    };
    const view = render(<RateField {...props} />);
    const input = view.getByRole("textbox");
    const description = document.getElementById(input.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe("Kč za 1 € · ČNB 9. 10. 2026");
    expect(view.container.querySelector(".rate-field-hint")).toBeNull();
    expect(view.container.querySelector('[data-slot="rate-source-attention"]')).toBeNull();
    fireEvent.focus(input);
    await waitFor(() => expect(view.getByRole("tooltip").textContent).toContain("ČNB"));
    view.rerender(<RateField {...props} sourceAttention />);
    expect(view.container.querySelector('[data-slot="rate-source-attention"]')).toBeTruthy();
    view.rerender(<RateField {...props} manual />);
    expect(view.container.querySelector('[data-slot="rate-source-attention"]')).toBeTruthy();
    view.rerender(<RateField {...props} manual readOnly />);
    expect(view.queryByRole("textbox")).toBeNull();
    expect(view.container.querySelector('[data-slot="field-value"]')?.textContent).toBe("25,000");
    expect(view.container.querySelector('[data-slot="rate-source-attention"]')).toBeTruthy();
  });
  it("formulář předá upozornění oběma kurzům a zachová chybu i ruční důvody", () => {
    const view = render(
      <DocumentForm
        {...base}
        value={{ ...base.value, rateSourceAttention: true, vatRateSourceAttention: true }}
        vatRateField={{ value: null, onChange: () => {} }}
      />,
    );
    expect(view.container.querySelectorAll('[data-slot="rate-source-attention"]')).toHaveLength(2);
    expect((view.getByLabelText("Kurz DPH") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true");
    // Chybějící kurz DPH se hlásí jen jednou – v chybovém pruhu, ne současně v upozorněních.
    expect(view.container.querySelector('[data-slot="document-form-error"]')?.textContent).toContain("Kurz ČNB");
    expect(view.container.querySelector('[data-slot="document-form-notices"]')?.textContent ?? "").not.toContain("Kurz ČNB");
    expect(view.container.querySelector('[data-slot="document-rate-details"]')).toBeNull();
    view.rerender(
      <DocumentForm
        {...base}
        value={{ ...base.value, rateManual: true }}
        vatRateField={{ value: 25, manual: true, note: "Důvod", onChange: () => {} }}
      />,
    );
    expect(view.getByLabelText("Důvod ručního kurzu")).toBeTruthy();
    expect(view.getByLabelText("Důvod ručního kurzu DPH")).toBeTruthy();
  });
  for (const type of ["FP", "ZFP", "DDPOZ"])
    it(`${type}: účet → způsob platby → Popis → číslo; bez dvojí platby`, () => {
      const view = render(<DocumentForm {...base} documentType={type} />);
      const account = view.getByRole("combobox", { name: "Bankovní účet" });
      const description = view.getByLabelText("Popis");
      const number = view.getByLabelText("Číslo dokladu dodavatele");
      const method = view.queryByLabelText("Způsob platby");
      const ordered = method
        ? [account, method, description, number]
        : [account, description, number];
      for (let i = 1; i < ordered.length; i++)
        expect(
          ordered[i - 1]?.compareDocumentPosition(ordered[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      expect(view.queryAllByLabelText("Způsob platby")).toHaveLength(type === "DDPOZ" ? 0 : 1);
      expect(method?.closest('[data-slot="document-payment-section"]') ?? null).toBeNull();
      view.rerender(<DocumentForm {...base} documentType={type} vat={{ visible: true }} />);
      expect(view.getByLabelText("Číslo daňového dokladu")).toBeTruthy();
    });
  for (const type of ["FP", "ZFP"])
    for (const mode of ["partner", "manual"] as const)
      it(`${type}/${mode}: zákaz platby má přednost a nemaže hodnoty`, () => {
        const change = mock(),
          toggle = mock();
        const reason = "Způsob platby Hotově se neplatí na účet";
        const view = render(
          <DocumentForm
            {...base}
            documentType={type}
            counterpartyInput={mode}
            value={{ ...base.value, partnerId: null }}
            onChange={change}
            paymentOrderEnabled
            onPaymentOrderEnabledChange={toggle}
            receivedAccountDisabledReason={reason}
          />,
        );
        expect(
          view.getByText(reason, { selector: "[data-slot=field-value] > div" }).textContent,
        ).toBe(reason);
        const button = view.getByRole("button", { name: "Platit příkazem" });
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.hasAttribute("disabled")).toBe(false);
        expect(button.getAttribute("aria-disabled")).toBe("true");
        expect(
          document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent,
        ).toBe(reason);
        fireEvent.click(button);
        expect(toggle).not.toHaveBeenCalled();
        expect(change).not.toHaveBeenCalled();
        expect(
          view.getByLabelText("Konstantní symbol", { selector: "input" }).getAttribute("value"),
        ).toBe("");
        expect(
          view.getByLabelText("Konstantní symbol", { selector: "input" }).hasAttribute("disabled"),
        ).toBe(true);
        expect(
          view.getByLabelText("Specifický symbol", { selector: "input" }).getAttribute("value"),
        ).toBe("");
        expect(
          view.getByLabelText("Specifický symbol", { selector: "input" }).hasAttribute("disabled"),
        ).toBe(true);
        expect(view.queryByLabelText("Číslo účtu bez IBAN")).toBeNull();
        expect(view.queryByRole("combobox", { name: "Bankovní účet" })).toBeNull();
        expect(view.queryByText("Nejdřív vyberte dodavatele")).toBeNull();
        expect(
          view
            .getByText(reason, { selector: "[data-slot=field-value] > div" })
            .querySelector("svg"),
        ).toBeNull();
        view.rerender(<DocumentForm {...base} documentType={type} />);
        expect(view.getByLabelText("Konstantní symbol").getAttribute("value")).toBe("0008");
        expect(view.getByLabelText("Specifický symbol").getAttribute("value")).toBe("99");
      });
  it("vypnutý příkaz a firemní účet ukazují důvod bez zámku; slovenský překlad", () => {
    const view = render(
      <DsTextsProvider locale="sk">
        <DocumentForm {...base} paymentOrderEnabled={false} />
      </DsTextsProvider>,
    );
    const reason = DS_TEXTS_SK.documentForm.paymentOrderDisabled;
    expect(view.getByText(reason, { selector: "[data-slot=field-value] > div" }).textContent).toBe(
      reason,
    );
    expect(
      view.getByText(reason, { selector: "[data-slot=field-value] > div" }).querySelector("svg"),
    ).toBeNull();
    view.rerender(
      <DocumentForm
        {...base}
        documentType="FV"
        companyBankAccountOptions={[
          { id: "1", label: "Účet", account: "123/0100", currency: "EUR" },
        ]}
        companyBankAccountDisabledReason="Hotově"
      />,
    );
    const account = view.getByLabelText("Uhradit na bankovní účet");
    expect(account.textContent).toBe("Hotově");
    expect(account.querySelector("svg")).toBeNull();
    expect(account.hasAttribute("title")).toBe(false);
  });
  it("DDPOZ ignoruje důvod způsobu platby pro účet, přepínač i symboly", () => {
    const toggle = mock();
    const view = render(
      <DocumentForm
        {...base}
        documentType="DDPOZ"
        paymentOrderEnabled
        onPaymentOrderEnabledChange={toggle}
        receivedAccountDisabledReason="Hotově"
      />,
    );
    expect(view.getByRole("combobox", { name: "Bankovní účet" })).toBeTruthy();
    const button = view.getByRole("button", { name: "Platit příkazem" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBeNull();
    expect(view.getByLabelText("Konstantní symbol").getAttribute("value")).toBe("0008");
    expect(view.getByLabelText("Specifický symbol").getAttribute("value")).toBe("99");
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledWith(false);
  });
  it("fokus zamčeného přepínače ukáže důvod, název zůstává Platit příkazem", async () => {
    const reason = "Hotově se neplatí na účet";
    const view = render(<DocumentForm {...base} receivedAccountDisabledReason={reason} />);
    const button = view.getByRole("button", { name: "Platit příkazem" });
    fireEvent.focus(button);
    await waitFor(() => expect(view.getByRole("tooltip").textContent).toBe(reason));
  });
  it("odpojení ručního účtu při zamčení vyčistí validační hlášení bez změny hodnot", () => {
    const validation = mock();
    const change = mock();
    const props = {
      ...base,
      counterpartyInput: "manual" as const,
      value: { ...base.value, manualBankAccount: { text: "", iban: "", swift: "" } },
      onChange: change,
      onPaymentOrderEnabledChange: () => {},
      onManualBankAccountValidationChange: validation,
    };
    const view = render(<DocumentForm {...props} />);
    fireEvent.change(view.getByLabelText("IBAN"), { target: { value: "invalid" } });
    expect(validation.mock.calls.at(-1)?.[0]).not.toEqual({});
    change.mockClear();
    view.rerender(<DocumentForm {...props} receivedAccountDisabledReason="Hotově" />);
    expect(validation.mock.calls.at(-1)?.[0]).toEqual({});
    expect(change).not.toHaveBeenCalled();
  });
  it("menu zachová akci položky s ikonou", () => {
    const click = mock();
    const view = render(
      <RecordActionBar
        moreActions={[{ id: "settings", label: "Nastavení", icon: Settings, onClick: click }]}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Další akce" }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(view.getByRole("menuitem", { name: "Nastavení" }));
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe("Edit dokladu 11 · 2. kolo oprav", () => {
  it("přepínač jen ke čtení je aria-disabled, s obecným důvodem a se zakázaným vzhledem", async () => {
    const { PaymentOrderAccountField } =
      await import("../../src/components/ds/accounting/payment-order-account-field");
    const { TooltipProvider } = await import("../../src/components/ui/tooltip");
    const view = render(
      <TooltipProvider>
        <PaymentOrderAccountField
          enabled
          enabledLabel="Platit příkazem"
          disabledLabel="Nezahrnovat"
          disabledReason="Nezahrnuje se"
        >
          <input aria-label="Účet" />
        </PaymentOrderAccountField>
      </TooltipProvider>,
    );
    const button = view.getByRole("button", { name: "Platit příkazem" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(
      document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe("Pole je jen pro čtení");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.className.split(" ")).not.toContain("pointer-events-none");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("po odpojení a připojení ručního účtu znovu ohlásí chybu IBAN", async () => {
    const { ReceivedBankAccountField } =
      await import("../../src/components/ds/accounting/received-bank-account-field");
    const reports: object[] = [];
    const texts = {
      accountLabel: "Účet",
      accountWithoutIbanLabel: "Účet",
      validation: {
        account: "a",
        bankCode: "b",
        bankCodeRequired: "c",
        iban: "IBAN chyba",
        swift: "d",
        swiftRequired: "e",
        accountRequired: "f",
        accountOrIban: "g",
      },
    };
    const field = (
      <ReceivedBankAccountField
        value={{ text: "", iban: "CZ00", swift: "" }}
        onChange={() => {}}
        isHomeCurrency
        onValidationChange={(e) => reports.push(e)}
        texts={texts}
      />
    );
    const view = render(field);
    view.rerender(<div />);
    expect(reports.at(-1)).toEqual({});
    view.rerender(field);
    await waitFor(() => expect(reports.at(-1)).toEqual({ iban: "IBAN chyba" }));
  });
});
