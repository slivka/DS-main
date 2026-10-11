/** Chování kurzů, přepočtu, platby a konkrétních potvrzení odchodu. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { RateField } from "../../src/components/ds/form/rate-field";
import { UnsavedChangesDialog } from "../../src/components/ds/panes/unsaved-changes-dialog";
import { DS_TEXTS_CS, DS_TEXTS_SK, DsTextsProvider } from "../../src/ds-texts";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { PaneUnsavedController } from "../../src/components/ds/panes/pane-unsaved-controller";
import { isTabDirty, setTabDirty } from "../../src/components/ds/panes/pane-tab-store";
const base = {
  title: "Faktura",
  documentType: "FV",
  status: "draft" as const,
  value: {
    bookId: "fv",
    number: "FV15",
    accountingDate: "2026-10-10",
    currency: "EUR",
    rate: 25,
    amountTotal: 1210,
    totalMode: "entered" as const,
  },
  onChange: () => {},
  lines: [],
  onLinesChange: () => {},
  books: [],
  accounts: [],
  homeCurrency: "CZK",
  homeCurrencySymbol: "Kč",
  currencies: [{ code: "EUR", symbol: "€" }],
};
afterEach(cleanup);
describe("Design formulářů 2", () => {
  it("odlišný kurz DPH následuje kurz dokladu, domácí celek je pouze v rekapitulaci", () => {
    const view = render(
      <DocumentForm {...base} vatRateField={{ value: 25.1, onChange: () => {} }} />,
    );
    const rate = view.getByLabelText("Kurz");
    const vat = view.getByLabelText("Kurz DPH");
    const total = view.getByLabelText("Celkem za doklad");
    expect(rate.compareDocumentPosition(vat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(vat.compareDocumentPosition(total) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(view.container.querySelector("#document-total-home")).toBeNull();
    const recap = view.container.querySelector('[data-slot="journal-recap-home-total"]');
    expect(recap?.getAttribute("title")).toBe("Celkem v Kč");
    expect(recap?.textContent?.replace(/\s/g, "")).toContain("30250,00");
    view.rerender(
      <DocumentForm
        {...base}
        vatRateField={{ value: 25, sameAsDocument: true, onChange: () => {} }}
      />,
    );
    expect(view.queryByLabelText("Kurz DPH")).toBeNull();
    expect(view.container.textContent).not.toContain("stejný jako kurz dokladu");
  });
  it("sčítaný celek a chybějící kurz v rekapitulaci, domácí měna údaj nemá", () => {
    const lines = [{ id: "1", amount: 5000, foreignAmount: 200 }];
    const view = render(
      <DocumentForm
        {...base}
        value={{ ...base.value, totalMode: "sum" }}
        lines={lines}
        linesEditorProps={{ recap: { open: false } }}
      />,
    );
    expect(
      view.container
        .querySelector('[data-slot="journal-recap-home-total"]')
        ?.textContent?.replace(/\s/g, ""),
    ).toContain("5000,00");
    view.rerender(<DocumentForm {...base} value={{ ...base.value, rate: null }} />);
    expect(
      view.container.querySelector('[data-slot="journal-recap-home-total"]')?.textContent,
    ).toContain("—");
    view.rerender(<DocumentForm {...base} value={{ ...base.value, currency: "CZK" }} />);
    expect(view.container.querySelector('[data-slot="journal-recap-home-total"]')).toBeNull();
    expect(view.queryByLabelText("Kurz")).toBeNull();
  });
  it("ruční důvody následují pořadí kurzů a chybějící kurz DPH upozorní", () => {
    const view = render(
      <DocumentForm
        {...base}
        value={{ ...base.value, rateManual: true }}
        vatRateField={{ value: null, manual: true, onChange: () => {} }}
      />,
    );
    const doc = view.getByLabelText("Důvod ručního kurzu");
    const vat = view.getByLabelText("Důvod ručního kurzu DPH");
    expect(doc.compareDocumentPosition(vat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    view.rerender(<DocumentForm {...base} vatRateField={{ value: null, onChange: () => {} }} />);
    expect(view.container.querySelector('[data-slot="document-vat-rate-missing"]')).toBeTruthy();
  });
  it("RateField obnoví doporučený kurz a readOnly nemá akci", () => {
    const useSuggested = mock();
    const props = {
      value: 25,
      suggestedRate: 26,
      manual: false,
      currency: "EUR",
      homeCurrency: "CZK",
      rateAmount: 1,
      onChange: () => {},
      onUseSuggested: useSuggested,
    };
    const view = render(<RateField {...props} />);
    fireEvent.click(view.getByRole("button"));
    expect(useSuggested).toHaveBeenCalledTimes(1);
    view.rerender(<RateField {...props} readOnly />);
    expect(view.queryByRole("button")).toBeNull();
    expect(view.container.querySelector('[data-slot="field-value"]')?.textContent).toBe("25,000");
  });
  for (const type of ["FV", "ZFV"])
    it(`${type} má způsob platby jen jednou nahoře před účtem`, () => {
      const props = {
        ...base,
        documentType: type,
        paymentMethodOptions: [{ value: "bank", label: "Převodem" }],
        companyBankAccountOptions: [
          { id: "1", label: "Banka", account: "123/0100", currency: "EUR" },
        ],
      };
      const view = render(<DocumentForm {...props} />);
      const method = view.getByLabelText("Způsob platby");
      const account = view.getByLabelText("Uhradit na bankovní účet");
      expect(view.getAllByLabelText("Způsob platby")).toHaveLength(1);
      expect(method.closest('[data-slot="company-bank-account-above"]')).toBeTruthy();
      expect(
        method.compareDocumentPosition(account) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      view.rerender(<DocumentForm {...props} companyBankAccountDisabledReason="Hotově" />);
      expect(view.getByLabelText("Uhradit na bankovní účet").getAttribute("data-slot")).toBe(
        "field-value",
      );
    });
  it("FP a DDPZ ponechávají způsob platby v Platebních údajích", () => {
    for (const type of ["FP", "DDPZ"]) {
      const view = render(
        <DocumentForm
          {...base}
          documentType={type}
          paymentMethodOptions={[{ value: "bank", label: "Převodem" }]}
        />,
      );
      expect(
        view.getByLabelText("Způsob platby").closest('[data-slot="document-payment-section"]'),
      ).toBeTruthy();
      view.unmount();
    }
  });
});
describe("Konkrétní volby neuložených změn", () => {
  for (const action of ["close", "switch", "logout", "navigate"] as const)
    it(`${action}: texty a návrat`, async () => {
      const back = mock();
      const save = mock();
      const discard = mock();
      const labels = DS_TEXTS_CS.panes.unsavedActions?.[action];
      if (!labels) throw new Error("Chybí překlad");
      const view = render(
        <UnsavedChangesDialog
          open
          action={action}
          tabTitle="FV15"
          intent=""
          onBack={back}
          onSave={save}
          onDiscard={discard}
        />,
      );
      expect(view.getByRole("heading").textContent).toBe(labels.title);
      const stay = view.getByRole("button", { name: labels.back });
      await waitFor(() => expect(document.activeElement).toBe(stay));
      fireEvent.click(stay);
      expect(back).toHaveBeenCalledTimes(1);
      fireEvent.click(view.getByRole("button", { name: labels.save }));
      expect(save).toHaveBeenCalledTimes(1);
      fireEvent.click(view.getByRole("button", { name: labels.discard }));
      expect(discard).toHaveBeenCalledTimes(1);
    });
  it("bez nového propu použije navigaci, slovenské texty i Esc", async () => {
    const back = mock();
    const view = render(
      <DsTextsProvider locale="sk">
        <UnsavedChangesDialog
          open
          tabTitle="FV15"
          intent="původní"
          onBack={back}
          onDiscard={() => {}}
        />
      </DsTextsProvider>,
    );
    expect(view.getByRole("heading").textContent).toBe(
      DS_TEXTS_SK.panes.unsavedActions?.navigate.title,
    );
    fireEvent.keyDown(view.getByRole("alertdialog"), { key: "Escape" });
    await waitFor(() => expect(back).toHaveBeenCalled());
  });
  for (const throws of [false, true])
    it(`neúspěšné uložení (${throws ? "výjimka" : "validace"}) neprovede odchod`, async () => {
      const proceed = mock();
      const setPending = mock();
      setTabDirty("fail-292", true);
      const view = render(
        <PaneUnsavedController
          pending={{ tabIds: ["fail-292"], intent: "", action: "close", proceed }}
          setPending={setPending}
          titleOf={() => "FV15"}
          onSaveTab={async () => {
            if (throws) throw new Error("chyba");
            return false;
          }}
        />,
      );
      fireEvent.click(view.getByRole("button", { name: "Uložit a zavřít" }));
      await waitFor(() => expect(setPending).toHaveBeenCalledWith(null));
      expect(proceed).not.toHaveBeenCalled();
      expect(isTabDirty("fail-292")).toBe(true);
    });
});
