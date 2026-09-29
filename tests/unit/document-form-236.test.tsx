import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
import { NoticeBar } from "../../src/components/ds/feedback/notice-bar";
import { StatusBadge } from "../../src/components/ds/data-display/status-badge";

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

describe("DocumentForm a NoticeBar 2.60.0", () => {
  it("vykreslí další štítek hned za stavem v nezalamovaném obalu", () => {
    const html = form({ titleBadges: <StatusBadge status="partial" config={{ partial: { label: "Částečně uhrazeno", tone: "warning" } }} /> });
    expect(html).toContain('data-slot="document-title-badges"');
    expect(html).toContain("whitespace-nowrap");
    expect(html.indexOf("Koncept")).toBeLessThan(html.indexOf("Částečně uhrazeno"));
  });

  it("dodrží pořadí chyba, notices a jen pro čtení včetně vlastních částí banneru", () => {
    const html = form({
      error: { message: "Chyba dokladu" },
      notices: <NoticeBar tone="info">Informace dokladu</NoticeBar>,
      readOnly: true,
      readOnlyReason: "Ruší se zrušením párování",
      readOnlyTitle: "Vznikl párováním",
      readOnlyActions: <button type="button">Otevřít párování</button>,
    });
    expect(html.indexOf('data-slot="document-form-error"')).toBeLessThan(html.indexOf('data-slot="document-form-notices"'));
    expect(html.indexOf('data-slot="document-form-notices"')).toBeLessThan(html.indexOf("Vznikl párováním"));
    expect(html).toContain("Otevřít párování");
  });

  it("vykreslí všechny čtyři tóny s titulkem, obsahem a akcemi", () => {
    for (const tone of ["info", "warning", "success", "danger"] as const) {
      const html = renderToStaticMarkup(<NoticeBar tone={tone} title={`Titul ${tone}`} actions={<span>Akce</span>}>Obsah</NoticeBar>);
      expect(html).toContain(`data-tone="${tone}"`);
      expect(html).toContain(`Titul ${tone}`);
      expect(html).toContain("Obsah");
      expect(html).toContain('data-slot="notice-bar-actions"');
    }
  });
});
