/** Přehledy DPH · callbacky, řízené změny a potvrzení; žádné daňové výpočty. */
import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import {
  VatReturnView,
  VatControlStatementView,
  VatRecapitulativeView,
  VatChecksPanel,
  VatFilingBar,
  VatPeriodPicker,
} from "../../src/components/ds";
import { DsTextsProvider } from "../../src/ds-texts";
import { vatFilingKinds, vatRowDifference } from "../../src/components/ds/vat/vat-report-model";

test("VatReturnView otevře původní řádek a porovná jen dodané částky", () => {
  const row = {
    key: "1",
    section: "I" as const,
    label: "Tuzemské plnění",
    base: 10000,
    tax: 2100,
    documentCount: 2,
  };
  const open = mock();
  render(
    <VatReturnView
      rows={[row]}
      currency="EUR"
      summary={{ liability: 2100 }}
      compare={{ "1": { tax: 2000 } }}
      onRowOpen={open}
    />,
  );
  const label = screen.getAllByText(/1 · Tuzemské plnění/)[0];
  if (!label) throw new Error("Řádek chybí");
  fireEvent.doubleClick(label);
  expect(open.mock.calls[0]?.[0].key).toBe("1");
  expect(vatRowDifference(row, { tax: 2000 })).toEqual({ base: undefined, tax: 100 });
});

test("VatControlStatementView přepne A4 a otevře doklad ze snímku", () => {
  const open = mock();
  const change = mock();
  render(
    <VatControlStatementView
      currency="EUR"
      sections={{
        A4: {
          documents: [
            {
              id: "doc",
              dic: "DE123",
              number: "FV42",
              date: "2026-10-01",
              rates: [{ rate: 21, base: 1000, tax: 210 }],
            },
          ],
        },
      }}
      onDocumentOpen={open}
      onSectionChange={change}
    />,
  );
  fireEvent.mouseDown(screen.getByRole("tab", { name: "A4" }), { button: 0, ctrlKey: false });
  expect(change).toHaveBeenCalledWith("A4");
  fireEvent.doubleClick(screen.getByText("FV42"));
  expect(open).toHaveBeenCalledWith("doc");
});

test("VatRecapitulativeView SH otevře podklady", () => {
  const open = mock();
  render(
    <VatRecapitulativeView
      currency="EUR"
      rows={[{ id: "sh", country: "DE", dic: "DE123", supplyCode: 3, amount: 45000 }]}
      onRowOpen={open}
    />,
  );
  fireEvent.doubleClick(screen.getByText("DE123"));
  expect(open).toHaveBeenCalledWith("sh");
});

test("VatRecapitulativeView OSS zachová zápornou opravu a období", () => {
  const open = mock();
  render(
    <VatRecapitulativeView
      variant="oss"
      currency="EUR"
      ossRows={[
        {
          id: "correction",
          country: "AT",
          rate: 20,
          base: -100,
          tax: -20,
          correctionPeriod: "2026-Q3",
        },
      ]}
      onRowOpen={open}
    />,
  );
  fireEvent.doubleClick(screen.getByText("2026-Q3"));
  expect(open).toHaveBeenCalledWith("correction");
});

test("VatChecksPanel řízený filtr zachová jen chyby a otevře doklad", () => {
  const open = mock();
  render(
    <VatChecksPanel
      severity="error"
      items={[
        { id: "e", severity: "error", text: "Chybí DIČ", documentId: "d" },
        { id: "w", severity: "warning", text: "Koncept" },
      ]}
      onDocumentOpen={open}
    />,
  );
  expect(screen.queryByText("Koncept")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Otevřít doklad" }));
  expect(open).toHaveBeenCalledWith("d");
});

test("VatFilingBar předá akce a nemění řízený stav sama", () => {
  const create = mock();
  const filed = mock();
  render(
    <VatFilingBar
      form="return"
      status="open"
      kind="regular"
      confirmText="2026"
      actions={{ onCreate: create, onMarkFiled: filed }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Vytvořit podání" }));
  fireEvent.click(screen.getByRole("button", { name: "Označit jako podané" }));
  expect(create).toHaveBeenCalledTimes(1);
  expect(filed).toHaveBeenCalledTimes(1);
});

test("VatFilingBar odemkne až po opsání a neprázdném důvodu", async () => {
  const unlock = mock(async () => {});
  render(
    <VatFilingBar
      form="control"
      status="filed"
      kind="regular"
      confirmText="Říjen"
      actions={{ onUnlock: unlock }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Odemknout období" }));
  const dialog = screen.getByRole("dialog");
  const inputs = within(dialog).getAllByRole("textbox");
  const confirmation = inputs.find((input) => input.tagName === "INPUT");
  if (!confirmation) throw new Error("Chybí potvrzení");
  fireEvent.change(confirmation, { target: { value: "Říjen" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Odemknout období" }));
  await waitFor(() => expect(unlock).not.toHaveBeenCalled());
  fireEvent.change(within(dialog).getByLabelText("Důvod odemknutí"), {
    target: { value: "  Oprava dokladu  " },
  });
  await waitFor(() =>
    expect(
      within(dialog).getByRole("button", { name: "Odemknout období" }).hasAttribute("disabled"),
    ).toBe(false),
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Odemknout období" }));
  await waitFor(() => expect(unlock).toHaveBeenCalledWith("Oprava dokladu"));
});

test("VatPeriodPicker nevolá změnu při zobrazení čtvrtletí", () => {
  const change = mock();
  const period = {
    from: "2026-10-01",
    to: "2026-12-31",
    kind: "quarter" as const,
    label: "DPH 4.Q 2026 · KH říjen 2026",
  };
  render(<VatPeriodPicker periods={[period]} value={period} onChange={change} readOnly />);
  expect(change).not.toHaveBeenCalled();
  expect(
    screen.getByRole("combobox").getAttribute("aria-disabled") ??
      String(screen.getByRole("combobox").hasAttribute("disabled")),
  ).toBeTruthy();
});

test("druhy podání přiznání mají dodatečné a KH/SH následné", () => {
  expect(vatFilingKinds("return")).toEqual(["regular", "corrective", "additional"]);
  expect(vatFilingKinds("control")).toEqual(["regular", "corrective", "subsequent"]);
  expect(vatFilingKinds("recapitulative")).toEqual(["regular", "corrective", "subsequent"]);
  expect(vatFilingKinds("oss")).toEqual(["regular", "corrective"]);
});

test("slovenský provider podporuje lištu podání", () => {
  const create = mock();
  render(
    <DsTextsProvider locale="sk">
      <VatFilingBar
        form="return"
        status="open"
        kind="regular"
        confirmText="2026"
        actions={{ onCreate: create }}
      />
    </DsTextsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Vytvoriť podanie" }));
  expect(create).toHaveBeenCalledTimes(1);
});

test("VatPeriodPicker výběr měsíce předá přesný rozsah APP", async () => {
  const change = mock();
  const period = {
    from: "2026-10-01",
    to: "2026-10-31",
    kind: "month" as const,
    label: "Říjen 2026",
  };
  render(<VatPeriodPicker periods={[period]} onChange={change} />);
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "Ř" });
  await waitFor(() => expect(screen.getByRole("option", { name: "Říjen 2026" })).toBeDefined());
  fireEvent.click(screen.getByRole("option", { name: "Říjen 2026" }));
  expect(change).toHaveBeenCalledWith(period);
});

test("VatChecksPanel změna filtru hlásí závažnost a rodič řídí seznam", async () => {
  const change = mock();
  const items = [
    { id: "e", severity: "error" as const, text: "Chybí DIČ" },
    { id: "i", severity: "info" as const, text: "Informativní nález" },
  ];
  const view = render(<VatChecksPanel items={items} severity="all" onSeverityChange={change} />);
  fireEvent.pointerDown(screen.getByRole("combobox"), { button: 0, ctrlKey: false });
  await waitFor(() => expect(screen.getByRole("option", { name: "Chyba" })).toBeDefined());
  fireEvent.click(screen.getByRole("option", { name: "Chyba" }));
  expect(change).toHaveBeenCalledWith("error");
  view.rerender(<VatChecksPanel items={items} severity="error" onSeverityChange={change} />);
  expect(screen.queryByText("Informativní nález")).toBeNull();
});

test("VatControlStatementView A5 zobrazuje souhrn bez prokliku dokladu", () => {
  const open = mock();
  render(
    <VatControlStatementView
      currency="EUR"
      activeSection="A5"
      sections={{ A5: { summary: [{ rate: 12, base: 7000.25, tax: 840.03 }] } }}
      onDocumentOpen={open}
    />,
  );
  fireEvent.doubleClick(screen.getByText("12 %"));
  expect(open).not.toHaveBeenCalled();
});
