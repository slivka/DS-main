import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DocumentForm,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import { DateField } from "../../src/components/ds/form/date-field";

const baseValue: DocumentHeaderValue = {
  issueDate: "2026-09-26",
  accountingDate: "2026-09-26",
  taxDate: "2026-09-26",
  vatDate: "2026-08-15",
  vatRelevant: true,
  dueDate: "2026-10-10",
  currency: "CZK",
  amountTotal: 1_000,
  totalMode: "entered",
};

function form(extra: Record<string, unknown> = {}) {
  return renderToStaticMarkup(
    <DocumentForm
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      title="Doklad"
      documentType="FP"
      value={baseValue}
      onChange={() => {}}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      status="draft"
      {...extra}
    />,
  );
}

describe("DateField link 2.38.0", () => {
  it("zamčené datum je jen pro čtení, nabízí odemčení a nezobrazuje kalendář", () => {
    const html = renderToStaticMarkup(
      <DateField
        value="2026-09-26"
        onChange={() => {}}
        link={{ locked: true, onToggle: () => {} }}
      />,
    );
    expect(html).toContain("readOnly");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Stejné jako datum vystavení – klikněte pro úpravu");
    expect(html).not.toContain("Otevřít kalendář");
  });

  it("odemčené datum zobrazuje kalendář i akci pro nové svázání", () => {
    const html = renderToStaticMarkup(
      <DateField
        value="2026-09-26"
        onChange={() => {}}
        link={{ locked: false, onToggle: () => {} }}
      />,
    );
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Znovu svázat s datem vystavení");
    expect(html).toContain("Otevřít kalendář");
  });
});

describe("DocumentForm DPH 2.43.0", () => {
  it("neplátci skryje DUZP i Datum DPH", () => {
    const html = form({ vat: { visible: false } });
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("drží hlavní data vlevo a obě data DPH ve společné pravé skupině", () => {
    const html = form({ vat: { visible: true } });
    expect(html.indexOf("Datum vystavení")).toBeLessThan(html.indexOf("Datum účetního případu"));
    expect(html.indexOf("Datum účetního případu")).toBeLessThan(html.indexOf("Splatnost"));
    expect(html.indexOf("Splatnost")).toBeLessThan(html.indexOf(">DUZP<"));
    const dates = html.slice(
      html.indexOf('data-slot="document-dates"'),
      html.indexOf(">Účtování a částka</h2>"),
    );
    expect(dates).toContain("flex flex-wrap items-start gap-3");
    const vatGroup = dates.slice(dates.indexOf('data-slot="document-vat-dates"'));
    expect(vatGroup).toContain('id="document-taxDate"');
    expect(vatGroup).toContain('id="document-vatDate"');
    expect(vatGroup.indexOf('id="document-taxDate"')).toBeLessThan(
      vatGroup.indexOf('id="document-vatDate"'),
    );
  });

  it("období jen pro čtení má vysvětlení a podané období ukáže upozornění", () => {
    const html = form({
      vat: {
        visible: true,
        dateLink: { locked: true, onToggle: () => {} },
        dateLockReadOnly: true,
        periodFiled: true,
      },
    });
    expect(html).toContain('id="document-vatDate"');
    expect(html).toContain("Daň na výstupu patří do období DUZP");
    expect(html).toContain("Období je podané – doklad půjde do dodatečného přiznání");
  });

  it("přebírá upozornění podaného období z texts", () => {
    const html = form({
      vat: { visible: true, periodFiled: true },
      texts: { filedWarning: "Vlastní upozornění" },
    });
    expect(html).toContain("Vlastní upozornění");
    expect(html).not.toContain("Období je podané – doklad půjde do dodatečného přiznání");
  });

  it("zobrazí období pod Datem DPH a podané období má před popiskem přednost", () => {
    const period = "KH srpen 2026 · DPH 3.Q 2026";
    expect(form({ vat: { visible: true, periodLabel: period } })).toContain(period);
    const filed = form({ vat: { visible: true, periodLabel: period, periodFiled: true } });
    expect(filed).toContain("Období je podané – doklad půjde do dodatečného přiznání");
    expect(filed).toContain(period);
  });

  it("řadí varování dat v pruhu a nevykreslí je pod poli", () => {
    const dateWarnings = {
      issueDate: "Vystavení",
      accountingDate: "Zaúčtování",
      dueDate: "Splatnost",
      taxDate: "DUZP a zaúčtování jsou v různých letech",
      vatDate: "Datum DPH",
    };
    const html = form({ vat: { visible: true }, dateWarnings });
    Object.values(dateWarnings).forEach((warning) => expect(html).toContain(warning));
    expect(html.indexOf("Vystavení")).toBeLessThan(html.indexOf("Zaúčtování"));
    const dates = html.slice(html.indexOf('data-slot="document-dates"'));
    expect(dates).not.toContain(">Vystavení</p>");
  });

  it("předá zámek do Data účetního případu", () => {
    const html = form({
      accountingDateLink: { locked: true, onToggle: () => {}, hint: "Vlastní nápověda" },
    });
    const accountingDate = html.slice(
      html.indexOf("Datum účetního případu"),
      html.indexOf("Splatnost"),
    );
    expect(accountingDate).toContain('aria-pressed="true"');
    expect(accountingDate).toContain("Vlastní nápověda");
    expect(accountingDate).not.toContain("Otevřít kalendář");
  });
});

describe("DocumentForm Vstupuje do DPH 2.43.0", () => {
  it("plátci se zapnutým příznakem zobrazí přepínač, DUZP i období", () => {
    const html = form({ vat: { visible: true } });
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain(">Vstupuje do DPH<");
    expect(html).toContain(">DUZP<");
    expect(html).toContain(">Datum DPH<");
  });

  it("plátci s vypnutým příznakem ponechá jen vypnutý přepínač", () => {
    const html = renderToStaticMarkup(
      <DocumentForm
        homeCurrency="CZK"
        title="Doklad"
        documentType="FP"
        value={{ ...baseValue, vatRelevant: false }}
        onChange={() => {}}
        lines={[]}
        onLinesChange={() => {}}
        books={[]}
        accounts={[]}
        status="draft"
        vat={{ visible: true }}
      />,
    );
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("stav partnera ukáže jen při zapnutém vstupu do DPH", () => {
    const shown = form({
      vat: { visible: true },
      vatPartnerStatus: { status: "payer", checkedAt: "24.09.2026" },
    });
    const hidden = renderToStaticMarkup(
      <DocumentForm
        homeCurrency="CZK"
        title="Doklad"
        documentType="FP"
        value={{ ...baseValue, vatRelevant: false }}
        onChange={() => {}}
        lines={[]}
        onLinesChange={() => {}}
        books={[]}
        accounts={[]}
        status="draft"
        vat={{ visible: true }}
        vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
      />,
    );
    expect(shown).toContain(">Plátce<");
    expect(shown).toContain("Ověřeno 24.09.2026");
    expect(hidden).not.toContain("Plátce DPH");
  });

  it("neplátci skryje celý blok DPH včetně přepínače", () => {
    const html = form({ vat: { visible: false } });
    expect(html).not.toContain("Vstupuje do DPH");
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("režim jen pro čtení přepínač zakáže", () => {
    const html = form({ vat: { visible: true, relevantReadOnly: true } });
    expect(html).toContain('role="switch"');
    expect(html).toContain("disabled");
  });

  it("přepínač je součástí pruhu akcí a stav je ve value", () => {
    const html = form({ vat: { visible: true } });
    expect(html.indexOf("Vstupuje do DPH")).toBeLessThan(
      html.indexOf('data-slot="document-dates"'),
    );
    expect(html).toContain(">DUZP<");
    expect(html).toContain(">Datum DPH<");
  });
});
