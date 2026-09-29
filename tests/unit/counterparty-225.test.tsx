import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { counterpartyFromPartner, counterpartyFromText, filterCounterpartyPartners } from "../../src/components/ds/accounting/counterparty-field";
import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

const partners = [{ id: "p1", name: "Alfa stavby s.r.o.", ico: "12345678", dic: "CZ12345678" }];
const base: DocumentHeaderValue = { bookId: "b", accountingDate: "2026-09-25", issueDate: "2026-09-25", currency: "CZK", rate: 1, amountTotal: 0, totalMode: "entered" };
const render = (value: DocumentHeaderValue, extra: Record<string, unknown> = {}) => renderToStaticMarkup(
  <DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} partners={partners} status="draft" {...extra} />);

describe("CounterpartyField / DocumentForm 2.25.0", () => {
  it("psaní textu zruší partnerId a ponechá identifikátory", () => expect(counterpartyFromText("Alfa stavby", "12345678", "CZ12345678")).toEqual({ name: "Alfa stavby", partnerId: null, ico: "12345678", dic: "CZ12345678" }));
  it("výběr partnera vyplní všechny údaje", () => expect(counterpartyFromPartner(partners[0])).toEqual({ name: "Alfa stavby s.r.o.", partnerId: "p1", ico: "12345678", dic: "CZ12345678" }));
  it("našeptává podle názvu i IČO", () => {
    expect(filterCounterpartyPartners(partners, "")).toHaveLength(1);
    expect(filterCounterpartyPartners(partners, "alfa")).toHaveLength(1);
    expect(filterCounterpartyPartners(partners, "1234")).toHaveLength(1);
  });
  it("IČO/DIČ bez partnera mají prázdnou hodnotu", () => {
    const html = render({ ...base, counterpartyName: "Kurýr" });
    expect(html).toContain("document-partner-ico");
    expect(html).toContain("document-partner-dic");
    expect(render({ ...base, partnerId: "p1" })).toContain("CZ12345678");
  });
  it("ID nemá partnerskou sekci", () => expect(render({ ...base, counterpartyName: "FÚ" }, { documentType: "ID" })).not.toContain('id="document-partner"'));
  it("kurz u CZK není", () => {
    const html = render(base);
    expect(html).not.toContain("document-rate");
    const foreign = render({ ...base, currency: "EUR", rate: 24.38 });
    expect(foreign).toContain("24,380");
    expect(foreign).toContain("Kč za 1 EUR");
  });
  it("currencyLocked = text", () => {
    const html = render({ ...base, currency: "EUR", rate: 24.38 }, { documentType: "FP", currencies: [{ code: "CZK" }, { code: "EUR" }], currencyLocked: true });
    const cur = html.match(/id="document-currency"[\s\S]*?<\/div>/)?.[0] ?? "";
    expect(cur).not.toContain("combobox");
    expect(cur).toContain("EUR");
  });
});
