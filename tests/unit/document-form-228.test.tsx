import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DocumentForm,
  DocumentDirectionBadge,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import { DocumentStatusBadge } from "../../src/components/ds/accounting/document-status-badge";
import { counterpartyCreateSeed } from "../../src/components/ds/accounting/counterparty-field";
import { IcoLink, icoRegistryUrl, isValidCzIco } from "../../src/components/ds/form/ico-link";
import { RateField, rateValuesDiffer } from "../../src/components/ds/form/rate-field";
import { SectionHeading } from "../../src/components/ds/layout/section-heading";

const value: DocumentHeaderValue = {
  accountingDate: "2026-09-25",
  issueDate: "2026-09-25",
  currency: "CZK",
  amountTotal: 1000,
  totalMode: "entered",
};
const form = (extra: Record<string, unknown>) =>
  renderToStaticMarkup(
    <DocumentForm
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      title="Pokladní doklad"
      value={value}
      onChange={() => {}}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      status="draft"
      {...extra}
    />,
  );

describe("DocumentForm 2.31.0", () => {
  it("vykreslí viditelný nadpis a identitu s číslem v těle", () => {
    const html = form({
      identity: {
        variant: "cashBank",
        book: "PO - Pokladna",
        period: "2026",
        account: { side: "MD", label: "211.001 - Pokladna" },
        number: "POP20260012",
      },
      directionBadge: "in",
    });
    expect(html).toContain("document-identity");
    expect(html).toContain("POP20260012");
    expect(html).toContain(">Pokladní doklad</h1>");
    expect(html.indexOf("Pokladní doklad")).toBeLessThan(html.indexOf("document-identity"));
    expect(html.indexOf("document-direction-badge")).toBeGreaterThan(
      html.indexOf('data-slot="document-identity"'),
    );
    expect(html.indexOf("document-direction-badge")).toBeLessThan(html.indexOf("PO - Pokladna"));
  });
  it("vykreslí výchozí i vlastní text čekajícího čísla", () => {
    expect(
      form({ identity: { variant: "cashBank", book: "PO - Pokladna", period: "2026" } }),
    ).toContain("Koncept – číslo při zařazení");
    expect(
      form({
        identity: {
          variant: "cashBank",
          book: "PO - Pokladna",
          period: "2026",
          numberPending: "Čeká na číslo",
        },
      }),
    ).toContain("Čeká na číslo");
  });
  it("vykreslí směr v těle bez identity a ne v pruhu akcí", () => {
    const html = form({ directionBadge: "out" });
    const actionBar = html.slice(
      html.indexOf("document-action-bar"),
      html.indexOf("document-identity"),
    );
    expect(actionBar).not.toContain("document-direction-badge");
    expect(html).toContain("document-direction-badge");
    expect(html).toContain("Výdej");
  });
  it("vykreslí badge obou směrů", () => {
    const incoming = renderToStaticMarkup(<DocumentDirectionBadge direction="in" />);
    expect(incoming).toContain("Příjem");
    expect(incoming).toContain("h-[1.625rem]");
    expect(incoming).toContain("text-sm");
    expect(renderToStaticMarkup(<DocumentDirectionBadge direction="out" />)).toContain("Výdej");
  });
  it("má badge směru i stavu stejnou výšku", () => {
    const direction = renderToStaticMarkup(<DocumentDirectionBadge direction="in" />);
    const status = renderToStaticMarkup(<DocumentStatusBadge status="draft" size="md" />);
    expect(direction).toContain("h-[1.625rem]");
    expect(status).toContain("h-[1.625rem]");
    expect(status).toContain("text-sm");
  });
  it("pruh akcí nemá spodní linku", () => {
    const html = form({ saveAction: { onSave: () => {} } });
    const actionBar = html.match(/data-slot="document-action-bar"[^>]+/)?.[0] ?? "";
    expect(actionBar).not.toContain("border-b");
  });
  it("zamkne IČO a DIČ propojeného partnera, ruční protistranu nechá editovat", () => {
    const partners = [
      { id: "p1", name: "Beta Servis a.s.", ico: "27074358", dic: "CZ27074358", country: "CZ" },
    ];
    const linked = form({
      documentType: "PO",
      partners,
      value: { ...value, partnerId: "p1", counterpartyName: "Beta Servis a.s." },
    });
    const manual = form({
      documentType: "PO",
      partners,
      counterpartyInput: "manual",
      value: {
        ...value,
        partnerId: null,
        counterpartyName: "Kurýr",
        counterpartyIco: "12345678",
        counterpartyDic: "CZ12345678",
      },
    });
    expect(linked).toContain('id="document-partner-ico" aria-readonly="true"');
    expect(linked).toContain('id="document-partner-dic" aria-readonly="true"');
    expect(manual).toContain('id="document-partner-ico"');
    expect(manual).toContain('value="12345678"');
    expect(manual).toContain("IČO neprošlo kontrolou CZ");
    expect(manual).toContain('id="document-partner-dic"');
  });
  it("zobrazuje předávajícího jen u pokladního dokladu", () => {
    expect(
      form({ documentType: "PO", value: { ...value, direction: "in", handedOverBy: "Jan Novák" } }),
    ).toContain('id="document-handedOverBy"');
    expect(
      form({ documentType: "FP", value: { ...value, handedOverBy: "Jan Novák" } }),
    ).not.toContain('id="document-handedOverBy"');
  });
  it("řadí data vystavení před datum účetního případu", () => {
    const html = form({ documentType: "PO" });
    expect(html.indexOf("Datum vystavení")).toBeLessThan(html.indexOf("Datum účetního případu"));
  });
  it("použije nadpis Částka bez viditelného hlavního účtu", () => {
    expect(form({ documentType: "ID" })).toContain(">Částka</span></h2>");
    expect(form({ documentType: "FP" })).toContain(">Částka</span></h2>");
    expect(form({ documentType: "FP" })).not.toContain(">Hlavní účet<");
  });
  it("přesune haléřové vyrovnání do lišty řádků", () => {
    const html = form({ documentType: "PO", value: { ...value, roundingAmount: 0.4 } });
    const amountSection = html.slice(
      html.indexOf(">Částka</span></h2>"),
      html.indexOf('role="tablist"'),
    );
    expect(amountSection).not.toContain('id="document-roundingAmount"');
    expect(html).toContain('data-slot="journal-lines-rounding"');
    expect(html).toContain('data-slot="journal-lines-remaining"');
    expect(html).toContain("Zaokrouhlení");
  });
  it("zobrazuje ruční Celkem se symbolem součtu a boční štítek identity", () => {
    const html = form({
      documentType: "PO",
      identity: {
        variant: "cashBank",
        book: "PO - Pokladna",
        period: "2026",
        account: { side: "MD", label: "211.001 - Pokladna" },
      },
    });
    expect(html).toContain('id="document-amountTotal"');
    expect(html).toContain("MD");
    expect(html).toContain("211.001 - Pokladna");
    expect(html).toContain("Sčítá se z rozpisu");
  });
  it("SectionHeading používá nový styl", () =>
    expect(renderToStaticMarkup(<SectionHeading>Sekce</SectionHeading>)).toContain(
      "section-heading",
    ));
});

describe("RateField", () => {
  it("ukáže doporučení jen při rozdílu", () => {
    const same = renderToStaticMarkup(
      <RateField
        value={24.38}
        onChange={() => {}}
        currency="EUR"
        homeCurrency="CZK"
        rateAmount={1}
        suggestedRate={24.38}
        manual={false}
      />,
    );
    const different = renderToStaticMarkup(
      <RateField
        value={24.38}
        onChange={() => {}}
        currency="EUR"
        homeCurrency="CZK"
        rateAmount={1}
        suggestedRate={24.4}
        suggestedInfo="ČNB 25. 9. 2026"
        manual={false}
      />,
    );
    expect(same).not.toContain("Kurz v databázi");
    expect(different).toContain("Kurz v databázi");
  });
  it("porovnává doporučený kurz na šest míst a má akci pro jeho použití", () => {
    expect(rateValuesDiffer(24.38, 24.3800004)).toBe(false);
    expect(rateValuesDiffer(24.38, 24.39)).toBe(true);
    expect(
      renderToStaticMarkup(
        <RateField
          value={24.38}
          onChange={() => {}}
          currency="EUR"
          homeCurrency="CZK"
          rateAmount={1}
          suggestedRate={24.39}
          manual={false}
          onUseSuggested={() => {}}
        />,
      ),
    ).toContain('type="button"');
  });
  it("ruční kurz vyžaduje důvod", () =>
    expect(
      renderToStaticMarkup(
        <RateField
          value={24.38}
          onChange={() => {}}
          currency="EUR"
          homeCurrency="CZK"
          rateAmount={1}
          manual
          note=""
        />,
      ),
    ).toContain("Uveďte důvod ručního kurzu"));
});

describe("IcoLink", () => {
  it("ověří české IČO a sestaví registry", () => {
    expect(isValidCzIco("27074358")).toBe(true);
    expect(isValidCzIco("12345678")).toBe(false);
    expect(icoRegistryUrl("27074358", "or")).toContain("or.justice.cz");
    expect(icoRegistryUrl("27074358", "ares")).toContain("ares.gov.cz");
  });
  it("auto pošle osobu do ARES", () =>
    expect(renderToStaticMarkup(<IcoLink ico="27074358" kind="person" />)).toContain(
      "ares.gov.cz",
    ));
  it("neplatné nebo zahraniční IČO nevytvoří odkaz", () =>
    expect(renderToStaticMarkup(<IcoLink ico="27074358" country="SK" />)).not.toContain("href="));
  it("vytvoří seed podle osmi číslic", () => {
    expect(counterpartyCreateSeed("27074358")).toEqual({ name: "", ico: "27074358", dic: "" });
    expect(counterpartyCreateSeed("Alfa", "27074358", "CZ27074358")).toEqual({
      name: "Alfa",
      ico: "27074358",
      dic: "CZ27074358",
    });
  });
});
