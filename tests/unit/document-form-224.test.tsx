import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
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

  it("odvozuje popisek partnera podle typu", () => {
    expect(partnerLabelForType("PO", "in")).toBe("Partner");
    expect(partnerLabelForType("PO", "out")).toBe("Partner");
    expect(partnerLabelForType("FV", "out")).toBe("Odběratel");
    expect(partnerLabelForType("ZFV", "out")).toBe("Odběratel");
    expect(partnerLabelForType("FP", "in")).toBe("Dodavatel");
    expect(partnerLabelForType("ZFP", "in")).toBe("Dodavatel");
    expect(partnerLabelForType("BA", "in")).toBe("Partner");
  });

  it("zamčený hlavní účet vykreslí jako text bez comboboxu", () => {
    const html = renderToStaticMarkup(<DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Pokladní doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[{ id: "cash", code: "PD", name: "Pokladní doklady", type: "cash" }]} accounts={[{ code: "211001", name: "Pokladna CZK" }]} partners={[]} mainSide="MD" mainAccountLocked status="draft" />);
    expect(html).toContain("211.001");
    expect(html).toContain("Pokladna CZK");
    expect(html).not.toContain('id="document-main-account" type="button"');
    const accountField = html.match(/Účet pokladny[\s\S]*?Datum účetního případu/)?.[0] ?? "";
    expect(accountField).not.toContain('role="combobox"');
  });

  it("zobrazí měnu a kurz za množství", () => {
    const html = renderToStaticMarkup(<DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Přijatá faktura" documentType="FP" rateAmount={100} value={{ ...value, currency: "JPY", rate: 15.9 }} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} currencies={[{ code: "JPY", label: "Japonský jen" }]} status="draft" />);
    expect(html).toContain(">JPY<");
    expect(html).toContain("15,900");
    expect(html).toContain("Kč za 100 JPY");
  });

  it("vykreslí trvale viditelné Uložit mimo PageHeader", () => {
    const html = renderToStaticMarkup(<DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Doklad" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} status="draft" saveAction={{ onSave: () => {}, dirty: true }} />);
    expect(html).toContain('data-slot="document-action-bar"');
    expect(html).toContain('aria-label="Uložit"');
    expect(html).toContain("Neuložené změny");
  });

  it("zobrazuje důvod zakázané další akce přímo v nabídce a stav u nadpisu", () => {
    const html = renderToStaticMarkup(<DocumentForm homeCurrency="CZK" homeCurrencySymbol="Kč" title="Doklad" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} status="filed" approved moreActions={[{ id: "cancel", label: "Stornovat", onClick: () => {}, disabled: true, disabledReason: "Doklad je uzamčen." }]} />);
    expect((html.match(/Zařazen/g) ?? []).length).toBe(1);
    const source = readFileSync("src/components/ds/accounting/document-form.tsx", "utf8");
    expect(source).toContain("action.disabled && action.disabledReason");
    expect(source).not.toContain("title={action.disabledReason}");
  });
});
