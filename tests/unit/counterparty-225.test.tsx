import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { counterpartyFromPartner, counterpartyFromText, filterCounterpartyPartners } from "../../src/components/ds/accounting/counterparty-field";
import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

const partners = [{ id: "p1", name: "Alfa stavby s.r.o.", ico: "12345678", dic: "CZ12345678" }];
const base: DocumentHeaderValue = { bookId: "b", accountingDate: "2026-09-25", issueDate: "2026-09-25", currency: "CZK", rate: 1, amountTotal: 0, totalMode: "entered" };
const render = (value: DocumentHeaderValue, extra: Record<string, unknown> = {}) => renderToStaticMarkup(
  <DocumentForm title="Doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} partners={partners} status="draft" {...extra} />);

describe("CounterpartyField / DocumentForm 2.25.0", () => {
  it("psaní textu zruší partnerId", () => expect(counterpartyFromText("Alfa stavby")).toEqual({ name: "Alfa stavby", partnerId: null }));
  it("výběr partnera vyplní oba údaje", () => expect(counterpartyFromPartner(partners[0])).toEqual({ name: "Alfa stavby s.r.o.", partnerId: "p1" }));
  it("našeptává podle názvu i IČO", () => {
    expect(filterCounterpartyPartners(partners, "alfa")).toHaveLength(1);
    expect(filterCounterpartyPartners(partners, "1234")).toHaveLength(1);
  });
  it("IČ/DIČ bez partnera nejsou", () => {
    const html = render({ ...base, counterpartyName: "Kurýr" });
    expect(html).not.toContain("document-partner-ico");
    expect(html).not.toContain("document-partner-dic");
    expect(render({ ...base, partnerId: "p1" })).toContain("CZ12345678");
  });
  it("ID má protistranu", () => expect(render({ ...base, counterpartyName: "FÚ" }, { documentType: "ID" })).toContain('id="document-partner"'));
  it("kurz u CZK není", () => {
    const html = render(base);
    expect(html).not.toContain("document-rate");
    expect(render({ ...base, currency: "EUR", rate: 24.38 })).toContain("24,380 CZK za 1 EUR");
  });
  it("currencyLocked = text", () => {
    const html = render({ ...base, currency: "EUR", rate: 24.38 }, { currencies: [{ code: "CZK" }, { code: "EUR" }], currencyLocked: true });
    const cur = html.match(/id="document-currency"[\s\S]*?<\/div>/)?.[0] ?? "";
    expect(cur).not.toContain("combobox");
    expect(cur).toContain("EUR");
  });
});
