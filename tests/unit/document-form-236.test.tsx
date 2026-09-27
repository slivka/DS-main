import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

const value: DocumentHeaderValue = { accountingDate: "2026-09-26", issueDate: "2026-09-26", currency: "CZK", amountTotal: 1000, totalMode: "entered" };
const form = (extra: Record<string, unknown>) => renderToStaticMarkup(<DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Pokladní doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} status="draft" {...extra} />);

describe("DocumentForm 2.36.0 – limit a popisek haléřového vyrovnání", () => {
  it("výchozí limit je 1 Kč a popisek je výchozí", () => {
    const html = form({});
    expect(html).toContain('data-limit="1"');
    expect(html).toContain("± Zaokrouhlení");
  });
  it("předá aplikací zadaný limit i vlastní popisek", () => {
    const html = form({ roundingLimit: 0.5, roundingLabel: "Zaokrouhlení firmy" });
    expect(html).toContain('data-limit="0.5"');
    expect(html).toContain("± Zaokrouhlení firmy");
    expect(html).not.toContain(">± Zaokrouhlení<");
  });
});

describe("DocumentForm 2.48", () => {
  it("zobrazí symbol měny v identifikačním řádku a Nastavení v menu", () => {
    const html = form({ currencies: [{ code: "CZK", symbol: "Kč" }], identity: { items: ["PO", "CZK"], number: "PO1" }, settings: { onOpen: () => {} } });
    expect(html).toContain(">Kč<");
    expect(html).toContain('aria-label="Další akce"');
  });
});

describe("DocumentForm 2.49", () => {
  it("zobrazí chybový pruh pod akcemi s výchozím nadpisem a zavřením", () => {
    const html = form({ error: { message: "Doplňte účet", onClose: () => {} } });
    expect(html).toContain('data-slot="document-form-error"');
    expect(html).toContain("Doklad nelze uložit");
    expect(html).toContain("Doplňte účet");
    expect(html.indexOf('data-slot="document-action-bar"')).toBeLessThan(html.indexOf('data-slot="document-form-error"'));
    expect(html).toContain('aria-label="Zavřít chybovou hlášku"');
  });

  it("převezme texty chybového pruhu z aplikace", () => {
    const html = form({ error: { message: "Doplňte účet", onClose: () => {} }, texts: { errorTitle: "Uložení se nezdařilo", closeError: "Skrýt chybu" } });
    expect(html).toContain("Uložení se nezdařilo");
    expect(html).toContain('aria-label="Skrýt chybu"');
  });
});

describe("DocumentSettingsDialog 2.49", () => {
  it("veřejná hodnota obsahuje volbu zobrazení účtu", () => {
    const source = readFileSync("src/components/ds/accounting/document-settings-dialog.tsx", "utf8");
    expect(source).toContain('accountDisplay: DocumentAccountDisplay');
    expect(source).toContain('Zkráceně – 501.100');
    expect(source).toContain('Celý – 501.100 - Spotřeba materiálu');
  });
});
