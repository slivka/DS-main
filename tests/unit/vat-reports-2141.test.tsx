/** DPH C (2.141.0): allowedKinds, šest oddílů, třetí sazba, nesazbový základ, stavy přehledů. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";

const { cleanup, render } = await import("@testing-library/react");
const { vatFilingKinds } = await import("../../src/components/ds/vat/vat-report-model");
const { vatExportTitle } = await import("../../src/components/ds/vat/vat-report-state");
const { VatFilingBar } = await import("../../src/components/ds/vat/vat-filing-bar");
const { VatReturnView } = await import("../../src/components/ds/vat/vat-return-view");
const { VatControlStatementView } =
  await import("../../src/components/ds/vat/vat-control-statement-view");
const { VatRecapitulativeView } =
  await import("../../src/components/ds/vat/vat-recapitulative-view");
const { VatChecksPanel } = await import("../../src/components/ds/vat/vat-checks-panel");

afterEach(cleanup);

describe("VatFilingBar.allowedKinds", () => {
  it("souhrnné hlášení nabízí jen řádné a následné", () => {
    expect(vatFilingKinds("recapitulative", ["regular", "subsequent"])).toEqual([
      "regular",
      "subsequent",
    ]);
    expect(vatFilingKinds("recapitulative")).toEqual(["regular", "corrective", "subsequent"]);
  });
  it("nabídka v liště respektuje allowedKinds", () => {
    const view = render(
      <VatFilingBar
        form="recapitulative"
        status="open"
        kind="regular"
        confirmText="ODEMKNOUT"
        allowedKinds={["regular", "subsequent"]}
        onKindChange={() => {}}
      />,
    );
    const select = view.getByLabelText(/druh podání/i);
    expect(select.textContent).not.toContain("Opravné");
  });
});

describe("VatReturnView – šest oddílů DPHDP3", () => {
  const rows = [
    { key: "1", section: "I" as const, label: "Dodání zboží", base: 1000, tax: 210 },
    {
      key: "46",
      section: "III" as const,
      label: "Odpočet",
      fullDeduction: 500,
      reducedDeduction: 120,
    },
    { key: "66", section: "VI" as const, label: "Daňová povinnost", tax: 90 },
  ];
  it("vykreslí oddíly I–VI včetně Výpočtu koeficientu a Výpočtu daně", () => {
    const view = render(<VatReturnView rows={rows} summary={{}} currency="CZK" />);
    expect(view.getByText("II. Ostatní plnění a plnění s místem mimo tuzemsko")).toBeTruthy();
    expect(view.getByText("III. Odpočet daně")).toBeTruthy();
    expect(view.getByText("V. Výpočet koeficientu")).toBeTruthy();
    expect(view.getByText("VI. Výpočet daně")).toBeTruthy();
  });
  it("odpočet má samostatné sloupce v plné výši a krácený", () => {
    const view = render(<VatReturnView rows={rows} summary={{}} currency="CZK" />);
    expect(view.getByText(/V plné výši/)).toBeTruthy();
    expect(view.getByText(/Krácený odpočet/)).toBeTruthy();
  });
});

describe("VatControlStatementView – třetí sazba a nesazbový základ", () => {
  const doc = {
    id: "d1",
    dic: "CZ12345678",
    number: "FV1",
    date: "2026-10-01",
    rates: [{ rate: 10, base: 200, tax: 20 }],
    unratedBase: 50,
  };
  it("grid dokladů má sloupce sazby 10 % a A1 nesazbový základ", () => {
    const view = render(
      <VatControlStatementView sections={{ A1: { documents: [doc] } }} currency="CZK" />,
    );
    expect(view.getByText(/Základ 10 %/)).toBeTruthy();
    expect(view.getByText(/Nesazbový základ/)).toBeTruthy();
    expect(view.container.textContent).toContain("50");
  });
  it("nesazbový základ se nezobrazuje jako 21 %", () => {
    const view = render(
      <VatControlStatementView sections={{ A1: { documents: [doc] } }} currency="CZK" />,
    );
    const base21 = view.getByText(/Základ 21 %/).closest("th") ?? view.getByText(/Základ 21 %/);
    expect(base21.textContent).not.toContain("50");
  });
  it("hideEmptyColumns skryje sazby bez hodnot", () => {
    const view = render(
      <VatControlStatementView
        sections={{ A1: { documents: [doc] } }}
        currency="CZK"
        hideEmptyColumns
      />,
    );
    expect(view.queryByText(/Základ 21 %/)).toBeNull();
    expect(view.getByText(/Základ 10 %/)).toBeTruthy();
  });
});

describe("Stavy přehledů – loading, error, exportMeta", () => {
  it("loading vykreslí kostru místo obsahu", () => {
    const view = render(<VatChecksPanel items={[]} loading />);
    expect(view.getByRole("status")).toBeTruthy();
  });
  it("error vykreslí pruh se zprávou", () => {
    const view = render(
      <VatRecapitulativeView currency="CZK" error="Nepodařilo se načíst souhrnné hlášení" />,
    );
    expect(view.getByRole("alert").textContent).toContain("Nepodařilo se načíst");
  });
  it("exportMeta se promítne do titulu exportu", () => {
    expect(
      vatExportTitle("Přiznání DPH", { period: "10/2026", company: "Alfa", filingKind: "Řádné" }),
    ).toBe("Přiznání DPH · 10/2026 · Alfa · Řádné");
    expect(vatExportTitle("Přiznání DPH")).toBe("Přiznání DPH");
  });
  it("VatReturnView při loadingu nezobrazí řádky", () => {
    const view = render(<VatReturnView rows={[]} summary={{}} currency="CZK" loading />);
    expect(view.getByRole("status")).toBeTruthy();
    expect(view.queryByText("I. Zdanitelná plnění")).toBeNull();
  });
});
