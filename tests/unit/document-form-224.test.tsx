import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { mainAccountLabelForType, partnerLabelForType } from "../../src/components/ds/accounting/document-fields";
import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

const value: DocumentHeaderValue = {
  bookId: "cash", direction: "in", accountingDate: "2026-09-25", issueDate: "2026-09-25",
  description: "Vklad", currency: "CZK", rate: 1, amountTotal: 1000, totalMode: "entered", mainAccountId: "211001",
};

describe("DocumentForm 2.24.0", () => {
  it("odvozuje popisek hlavního účtu podle typu", () => {
    expect(mainAccountLabelForType("PO")).toBe("Účet pokladny");
    expect(mainAccountLabelForType("BA")).toBe("Účet banky");
    expect(mainAccountLabelForType("FV")).toBe("Účet pohledávky");
    expect(mainAccountLabelForType("FP")).toBe("Účet závazku");
    expect(mainAccountLabelForType("ZFV")).toBe("Účet přijaté zálohy");
    expect(mainAccountLabelForType("ZFP")).toBe("Účet poskytnuté zálohy");
    expect(mainAccountLabelForType("ID")).toBe("Hlavní účet");
  });

  it("odvozuje popisek partnera podle typu a směru", () => {
    expect(partnerLabelForType("PO", "in")).toBe("Přijato od");
    expect(partnerLabelForType("PO", "out")).toBe("Vyplaceno komu");
    expect(partnerLabelForType("FV", "out")).toBe("Odběratel");
    expect(partnerLabelForType("ZFV", "out")).toBe("Odběratel");
    expect(partnerLabelForType("FP", "in")).toBe("Dodavatel");
    expect(partnerLabelForType("ZFP", "in")).toBe("Dodavatel");
    expect(partnerLabelForType("BA", "in")).toBe("Partner");
  });

  it("zamčený hlavní účet vykreslí jako text bez comboboxu", () => {
    const html = renderToStaticMarkup(<DocumentForm title="Pokladní doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[{ id: "cash", code: "PD", name: "Pokladní doklady", type: "cash" }]} accounts={[{ code: "211001", name: "Pokladna CZK" }]} partners={[]} mainSide="MD" mainAccountLocked status="draft" />);
    expect(html).toContain("211.001");
    expect(html).toContain("Pokladna CZK");
    expect(html).not.toContain('id="document-main-account" type="button"');
    const accountField = html.match(/Účet pokladny[\s\S]*?Datum účetního případu/)?.[0] ?? "";
    expect(accountField).not.toContain('role="combobox"');
  });
});
