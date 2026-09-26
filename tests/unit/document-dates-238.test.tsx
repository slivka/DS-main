import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
import { DateField } from "../../src/components/ds/form/date-field";

const baseValue: DocumentHeaderValue = {
  issueDate: "2026-09-26",
  accountingDate: "2026-09-26",
  taxDate: "2026-09-26",
  vatDate: "2026-08-15", vatRelevant: true,
  dueDate: "2026-10-10",
  currency: "CZK",
  amountTotal: 1_000,
  totalMode: "entered",
};

function form(extra: Record<string, unknown> = {}) {
  return renderToStaticMarkup(<DocumentForm
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
  />);
}



describe("DateField link 2.38.0", () => {
  it("zamčené datum je jen pro čtení, nabízí odemčení a nezobrazuje kalendář", () => {
    const html = renderToStaticMarkup(<DateField value="2026-09-26" onChange={() => {}} link={{ locked: true, onToggle: () => {} }} />);
    expect(html).toContain("readOnly");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Stejné jako datum vystavení – klikněte pro úpravu");
    expect(html).not.toContain("Otevřít kalendář");
  });

  it("odemčené datum zobrazuje kalendář i akci pro nové svázání", () => {
    const html = renderToStaticMarkup(<DateField value="2026-09-26" onChange={() => {}} link={{ locked: false, onToggle: () => {} }} />);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Znovu svázat s datem vystavení");
    expect(html).toContain("Otevřít kalendář");
  });
});

describe("DocumentForm DPH 2.38.0", () => {
  it("neplátci skryje DUZP i Datum DPH", () => {
    const html = form({ vat: { visible: false } });
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("kotví DUZP a Datum DPH ve sloupcích 15–20 za levými daty", () => {
    const html = form({ vat: { visible: true, periodLabel: "KH srpen 2026 · DPH 3.Q 2026" } });
    expect(html.indexOf("Datum vystavení")).toBeLessThan(html.indexOf("Datum účetního případu"));
    expect(html.indexOf("Datum účetního případu")).toBeLessThan(html.indexOf("Splatnost"));
    expect(html.indexOf("Splatnost")).toBeLessThan(html.indexOf(">DUZP<"));
    const dates = html.slice(html.indexOf('data-slot="document-dates"'), html.indexOf(">Účtování a částka</h2>"));
    expect(dates).toContain("@min-[40rem]:col-start-15");
    expect(dates).toContain("@min-[40rem]:col-start-18");
  });

  it("období jen pro čtení má vysvětlení a podané období ukáže upozornění", () => {
    const html = form({ vat: { visible: true, dateLink: { locked: true, onToggle: () => {} }, dateLockReadOnly: true } });
    expect(html).toContain('id="document-vatDate" readOnly="" aria-readonly="true"');
    expect(html).toContain("Období se řídí DUZP");
    expect(html).toContain("Období je podané – doklad půjde do dodatečného přiznání");
  });

  it("předá zámek do Data účetního případu", () => {
    const html = form({ accountingDateLink: { locked: true, onToggle: () => {}, hint: "Vlastní nápověda" } });
    const accountingDate = html.slice(html.indexOf("Datum účetního případu"), html.indexOf("Splatnost"));
    expect(accountingDate).toContain('aria-pressed="true"');
    expect(accountingDate).toContain("Vlastní nápověda");
    expect(accountingDate).not.toContain("Otevřít kalendář");
  });
});

describe("DocumentForm Vstupuje do DPH 2.41.0", () => {
  it("plátci se zapnutým příznakem zobrazí přepínač, DUZP i období", () => {
    const html = form({ vat: { visible: true } });
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain(">Vstupuje do DPH<");
    expect(html).toContain(">DUZP<");
    expect(html).toContain(">Datum DPH<");
  });

  it("plátci s vypnutým příznakem ponechá jen vypnutý přepínač", () => {
    const html = form({ vat: { visible: true } });
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("neplátci skryje celý blok DPH včetně přepínače", () => {
    const html = form({ vat: { visible: false } });
    expect(html).not.toContain("Vstupuje do DPH");
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Datum DPH<");
  });

  it("režim jen pro čtení přepínač zakáže", () => {
    const html = form({ vat: { visible: true, relevantReadOnly: true } });
    const vatSwitch = html.slice(html.indexOf('id="document-vatRelevant"'), html.indexOf('id="document-taxDate"'));
    expect(vatSwitch).toContain("disabled");
  });

  it("bez handleru přepínač nevykreslí a zachová dosavadní pole DPH i při relevant false", () => {
    const html = form({ vat: { visible: true } });
    expect(html).not.toContain("Vstupuje do DPH");
    expect(html).toContain(">DUZP<");
    expect(html).toContain(">Datum DPH<");
  });
});