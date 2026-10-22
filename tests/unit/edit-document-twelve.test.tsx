/** Datumová pole a symboly · testy zachování dat při zamčení platebních údajů. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DocumentForm, type DocumentFormProps } from "../../src/components/ds/accounting/document-form";
import { DsTextsProvider, DS_TEXTS_SK } from "../../src/ds-texts";
afterEach(cleanup);
const base: DocumentFormProps = {
  title: "FP",
  documentType: "FP",
  status: "draft",
  value: {
    currency: "EUR",
    amountTotal: 0,
    totalMode: "entered",
    issueDate: "2026-10-12",
    accountingDate: "2026-10-12",
    dueDate: "2026-10-24",
    taxDate: "2026-10-12",
    vatDate: "2026-10-12",
    constantSymbol: "0008",
    specificSymbol: "99",
  },
  onChange: () => {},
  lines: [],
  onLinesChange: () => {},
  books: [],
  accounts: [],
  constantSymbolOptions: [{ value: "0008", label: "0008" }],
  vat: { visible: true },
};
describe("Edit dokladu 12", () => {
  it("psaní mimo datumy nezakládá jejich ResizeObserver znovu", () => {
    const original = globalThis.ResizeObserver;
    const dateObservers = mock();
    const constructor = mock(() => ({
      observe: (target: Element) => {
        if (target.classList.contains("document-dates-container")) dateObservers();
      },
      unobserve: mock(),
      disconnect: mock(),
    }));
    globalThis.ResizeObserver = constructor;
    try {
      const view = render(<DocumentForm {...base} />);
      const initial = dateObservers.mock.calls.length;
      expect(initial).toBeGreaterThan(0);
      view.rerender(<DocumentForm {...base} value={{ ...base.value, description: "a" }} />);
      view.rerender(<DocumentForm {...base} value={{ ...base.value, description: "ab" }} />);
      expect(dateObservers.mock.calls.length).toBe(initial);
      view.rerender(<DocumentForm {...base} texts={{ accountingDate: "Delší datum" }} />);
      expect(dateObservers.mock.calls.length).toBeGreaterThan(initial);
    } finally {
      cleanup();
      globalThis.ResizeObserver = original;
    }
  });
  for (const scenario of [
    {
      documentType: "FP",
      paymentOrderEnabled: false,
      reason: "Nezahrnuje se do platebních příkazů",
    },
    { documentType: "FP", receivedAccountDisabledReason: "Hotově", reason: "Hotově" },
    { documentType: "FV", companyBankAccountDisabledReason: "Hotově", reason: "Hotově" },
    { documentType: "ZFV", companyBankAccountDisabledReason: "Hotově", reason: "Hotově" },
  ])
    it(`${scenario.documentType} zamkne symboly bez ztráty dat`, async () => {
      const change = mock();
      const view = render(<DocumentForm {...base} {...scenario} onChange={change} />);
      for (const label of ["Konstantní symbol", "Specifický symbol"]) {
        const input = view.getByLabelText(label, { selector: "input" });
        expect(input.hasAttribute("disabled")).toBe(true);
        expect(input.getAttribute("value")).toBe("");
        const trigger = input.parentElement;
        if (!trigger) throw new Error("Chybí tooltip symbolu");
        expect(trigger.getAttribute("aria-disabled")).toBe("true");
        expect(trigger.hasAttribute("aria-label")).toBe(false);
        expect(view.getByRole("group", { name: label })).toBe(trigger);
        expect(
          document.getElementById(trigger.getAttribute("aria-describedby") ?? "")?.textContent,
        ).toBe(scenario.reason);
        fireEvent.focus(trigger);
        await waitFor(() => expect(view.getByRole("tooltip").textContent).toBe(scenario.reason));
        fireEvent.blur(trigger);
      }
      expect(change).not.toHaveBeenCalled();
      view.rerender(<DocumentForm {...base} onChange={change} paymentOrderEnabled />);
      expect(
        view.container.querySelector("#document-constantSymbol")?.hasAttribute("disabled"),
      ).toBe(false);
      expect(
        view.getByLabelText("Specifický symbol", { selector: "input" }).getAttribute("value"),
      ).toBe("99");
      fireEvent.change(view.getByLabelText("Specifický symbol", { selector: "input" }), {
        target: { value: "88" },
      });
      expect(change).toHaveBeenCalledWith({ ...base.value, specificSymbol: "88" });
    });
  it("slovenský důvod vypnutého příkazu je z katalogu", () => {
    const view = render(
      <DsTextsProvider locale="sk">
        <DocumentForm {...base} paymentOrderEnabled={false} />
      </DsTextsProvider>,
    );
    const input = view.container.querySelector("#document-specificSymbol");
    expect(
      document.getElementById(input?.parentElement?.getAttribute("aria-describedby") ?? "")
        ?.textContent,
    ).toBe(DS_TEXTS_SK.documentForm.paymentOrderDisabled);
  });
  for (const documentType of ["FV", "ZFV", "DDPOZ"])
    it(`${documentType} nechá symboly editovatelné bez použitelného důvodu`, () => {
      const change = mock();
      const view = render(
        <DocumentForm
          {...base}
          documentType={documentType}
          onChange={change}
          receivedAccountDisabledReason={documentType === "DDPOZ" ? "Hotově" : undefined}
          paymentOrderEnabled={documentType === "DDPOZ"}
        />,
      );
      for (const label of ["Konstantní symbol", "Specifický symbol"])
        expect(view.getByLabelText(label).hasAttribute("disabled")).toBe(false);
      fireEvent.change(view.getByLabelText("Specifický symbol", { selector: "input" }), {
        target: { value: "88" },
      });
      expect(change).toHaveBeenCalledWith({ ...base.value, specificSymbol: "88" });
    });
  it("všech pět dat drží pořadí a vazba i varování zůstávají dostupné", () => {
    const toggle = mock();
    const view = render(
      <DocumentForm
        {...base}
        accountingDateLink={{ locked: false, onToggle: toggle }}
        dateWarnings={{ accountingDate: "Varování" }}
      />,
    );
    const dates = view.container.querySelector('[data-slot="document-dates"]');
    expect(Array.from(dates?.querySelectorAll("input") ?? []).map((i) => i.value)).toEqual([
      "12.10.2026",
      "12.10.2026",
      "24.10.2026",
      "12.10.2026",
      "12.10.2026",
    ]);
    const accounting = view.getByLabelText("Datum účetního případu");
    expect(
      document.getElementById(accounting.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe("Varování");
    const buttons = accounting.parentElement?.querySelectorAll("button");
    expect(buttons?.length).toBe(2);
    if (!buttons?.[0]) throw new Error("Chybí vazba data");
    fireEvent.click(buttons[0]);
    expect(toggle).toHaveBeenCalledWith(true);
  });
  for (const locale of ["cs", "sk"] as const)
    it(`${locale} přijme delší popisek pouze jednoho data přes texts`, () => {
      const label =
        locale === "cs"
          ? "Datum účetního případu podle podkladů"
          : "Dátum účtovného prípadu podľa podkladov";
      const view = render(
        <DsTextsProvider locale={locale}>
          <DocumentForm {...base} texts={{ accountingDate: label }} />
        </DsTextsProvider>,
      );
      expect(view.getByLabelText(label).id).toBe("document-accountingDate");
      expect(view.container.querySelectorAll('[data-slot="document-dates"] label')).toHaveLength(5);
      expect(view.getAllByText(label)).toHaveLength(1);
    });
});
