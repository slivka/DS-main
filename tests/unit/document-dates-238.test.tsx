import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
import { DateField } from "../../src/components/ds/form/date-field";

const baseValue: DocumentHeaderValue = {
  issueDate: "2026-09-26",
  accountingDate: "2026-09-26",
  taxDate: "2026-09-26",
  vatPeriod: "2026-08-01",
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

const periods = [
  { value: "2026-08-01", label: "08/2026 · KH srpen 2026 / DPH 3.Q 2026", filed: true },
  { value: "2026-09-01", label: "09/2026 · KH září 2026 / DPH 3.Q 2026" },
];

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
  it("neplátci skryje DUZP i Období DPH", () => {
    const html = form({ vat: { visible: false, periodOptions: periods } });
    expect(html).not.toContain(">DUZP<");
    expect(html).not.toContain(">Období DPH<");
  });

  it("kotví DUZP a Období DPH ve sloupcích 15–20 za levými daty", () => {
    const html = form({ vat: { visible: true, periodOptions: periods } });
    expect(html.indexOf("Datum vystavení")).toBeLessThan(html.indexOf("Datum účetního případu"));
    expect(html.indexOf("Datum účetního případu")).toBeLessThan(html.indexOf("Splatnost"));
    expect(html.indexOf("Splatnost")).toBeLessThan(html.indexOf(">DUZP<"));
    const dates = html.slice(html.indexOf('data-slot="document-dates"'), html.indexOf(">Účtování a částka</h2>"));
    expect(dates).toContain("@min-[40rem]:col-start-15");
    expect(dates).toContain("@min-[40rem]:col-start-18");
  });

  it("období jen pro čtení má vysvětlení a podané období ukáže upozornění", () => {
    const html = form({ vat: { visible: true, periodOptions: periods, periodReadOnly: true } });
    expect(html).toContain('id="document-vatPeriod" readOnly="" aria-readonly="true"');
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