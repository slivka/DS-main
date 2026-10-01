import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  BankAccountField,
  CODE_SEPARATOR,
  CheckboxField,
  DateField,
  DocumentForm,
  LookupField,
  OptionSelect,
  RecordActionBar,
  formatCodeName,
  DocumentCounterpartyTab,
  DocumentPrintTab,
} from "../../src";
import { journalRowColumnWidthRem } from "../../src/components/ds/accounting/journal-column-layout";

describe("DS 2.85.0 – obecná pravidla", () => {
  it("skládá kód a název jediným oddělovačem", () => {
    expect(CODE_SEPARATOR).toBe(" – ");
    expect(formatCodeName("321.100", "Závazky")).toBe("321.100 – Závazky");
    expect(formatCodeName("321.100", "")).toBe("321.100");
  });

  it("zobrazuje prázdnou volbu tlumeně a vstup bez placeholderu", () => {
    const select = renderToStaticMarkup(<OptionSelect value="" onChange={vi.fn()} options={[]} />);
    const date = renderToStaticMarkup(<DateField value="" onChange={vi.fn()} />);
    expect(select).toContain("text-muted-foreground");
    expect(date).not.toContain("placeholder=");
  });

  it("počítá šířku data podle právě viditelných ikon", () => {
    const locked = renderToStaticMarkup(
      <DateField
        value="2026-10-01"
        onChange={vi.fn()}
        link={{ locked: true, onToggle: vi.fn() }}
      />,
    );
    const unlocked = renderToStaticMarkup(
      <DateField
        value="2026-10-01"
        onChange={vi.fn()}
        link={{ locked: false, onToggle: vi.fn() }}
      />,
    );
    const warned = renderToStaticMarkup(
      <DateField
        value="2026-10-01"
        onChange={vi.fn()}
        warning="Pozor"
        warningDisplay="indicator"
      />,
    );
    expect(locked).toContain('data-visible-icons="1"');
    expect(unlocked).toContain('data-visible-icons="2"');
    expect(warned).toContain('data-visible-icons="2"');
    const lockedWidth = /--date-field-icons:(\d+)/.exec(locked)?.[1];
    const unlockedWidth = /--date-field-icons:(\d+)/.exec(unlocked)?.[1];
    expect(Number(unlockedWidth)).toBeGreaterThan(Number(lockedWidth));
  });

  it("řadí hlavní krok před uložením a nabízí editaci vybraného záznamu", () => {
    const bar = renderToStaticMarkup(
      <RecordActionBar
        primaryAction={{ label: "Zaúčtovat", onClick: vi.fn() }}
        saveAction={{ onSave: vi.fn() }}
      />,
    );
    const lookup = renderToStaticMarkup(
      <LookupField value="42" onChange={vi.fn()} onEditSelected={vi.fn()} />,
    );
    expect(bar.indexOf("Zaúčtovat")).toBeLessThan(bar.indexOf("Uložit"));
    expect(lookup).toContain("Upravit vybraný záznam");
  });

  it("obalí checkbox výškou prvního řádku popisku", () => {
    const html = renderToStaticMarkup(
      <CheckboxField label="Jednořádkový popisek" hint="Popis" checked onCheckedChange={vi.fn()} />,
    );
    const controlLine = /<span class="([^"]*)"><button[^>]*role="checkbox"/.exec(html)?.[1] ?? "";
    expect(controlLine.split(" ")).toEqual(expect.arrayContaining(["flex", "h-5", "items-center"]));
    expect(controlLine.split(" ").some((token) => token.startsWith("mt-"))).toBe(false);
  });

  it("zpřístupní přidání účtu i bez položek a vysvětlí zakázaný výběr", () => {
    const available = renderToStaticMarkup(
      <BankAccountField
        value=""
        onChange={vi.fn()}
        options={[]}
        selectionOnly
        onAddAccount={vi.fn()}
      />,
    );
    const disabled = renderToStaticMarkup(
      <BankAccountField
        value=""
        onChange={vi.fn()}
        options={[]}
        selectionOnly
        disabledReason="Nejdřív vyberte dodavatele"
      />,
    );
    expect(available).toContain('role="combobox"');
    expect(available).not.toContain('disabled=""');
    expect(disabled).toContain("Nejdřív vyberte dodavatele");
  });

  it("rozšiřuje sloupec pořadí až od třetí číslice", () => {
    expect(journalRowColumnWidthRem(9)).toBe(journalRowColumnWidthRem(99));
    expect(journalRowColumnWidthRem(100)).toBeGreaterThan(journalRowColumnWidthRem(99));
  });
});

describe("DS 2.85.0 – formulář dokladu", () => {
  const value = {
    currency: "CZK",
    amountTotal: 1000,
    totalMode: "entered" as const,
    partnerId: "partner-1",
    partnerBankAccountId: "bank-1",
  };

  it("řadí platební údaje před poslední sekci Částka", () => {
    const html = renderToStaticMarkup(
      <DocumentForm
        title="Doklad"
        documentType="FP"
        value={value}
        onChange={vi.fn()}
        lines={[]}
        onLinesChange={vi.fn()}
        books={[]}
        accounts={[]}
        homeCurrency="CZK"
        status="draft"
        paymentMethodOptions={[{ value: "transfer", label: "Převod" }]}
      />,
    );
    expect(html.indexOf("Platební údaje")).toBeLessThan(html.indexOf(">Částka<"));
  });

  it("zobrazuje nový účet partnera jen jako výběr a varuje u neplatného", () => {
    const html = renderToStaticMarkup(
      <DocumentForm
        title="Doklad"
        documentType="FP"
        value={value}
        onChange={vi.fn()}
        lines={[]}
        onLinesChange={vi.fn()}
        books={[]}
        accounts={[]}
        homeCurrency="CZK"
        status="draft"
        bankAccountOptions={[{ id: "bank-1", number: "123", bankCode: "0100", invalid: true }]}
        onAddBankAccount={vi.fn()}
      />,
    );
    expect(html).toContain("Bankovní účet je označen jako neplatný");
    expect(html).not.toContain('id="document-bankAccount" inputmode="numeric"');
  });

  it("odesílá identifikátor firemního účtu a neznámý KS nenabízí k volnému zápisu", () => {
    let changed = value;
    const view = renderToStaticMarkup(
      <DocumentForm
        title="FV"
        documentType="FV"
        value={value}
        onChange={(next) => (changed = next)}
        lines={[]}
        onLinesChange={vi.fn()}
        books={[]}
        accounts={[]}
        homeCurrency="CZK"
        status="draft"
        constantSymbolOptions={[{ value: "0308", label: "0308 – Platby za služby" }]}
        companyBankAccountOptions={[
          { id: "company-1", label: "Hlavní", account: "123/0100", currency: "CZK" },
        ]}
      />,
    );
    expect(view).toContain("Bankovní účet firmy");
    expect(view).toContain("0308 – Platby za služby");
    expect(changed.companyBankAccountId).toBeUndefined();
  });

  it("záložka odběratele respektuje readOnly a tisk vrací celý tvar value.print", () => {
    const counterparty = {
      name: "Firma",
      ico: "12345678",
      dic: "CZ12345678",
      street: "Ulice 1",
      zip: "11000",
      city: "Praha",
      country: "CZ",
      email: "a@example.cz",
    };
    const readOnly = renderToStaticMarkup(
      <DocumentCounterpartyTab
        value={counterparty}
        onChange={vi.fn()}
        partnerId="p1"
        onReloadFromPartner={vi.fn()}
        readOnly
      />,
    );
    expect(readOnly).not.toContain("Načíst znovu z partnera");
    expect((readOnly.match(/readonly/g) ?? []).length).toBeGreaterThan(3);

    const print = {
      options: {
        showHeader: false,
        showFooter: false,
        showVatRecap: false,
        showNote: false,
        showColumnHeadings: false,
        showTotalsRow: false,
        showPaymentSchedule: false,
      },
      headerText: "",
      footerText: "",
      note: "",
      issuedByName: "",
      issuedByPhone: "",
      issuedByEmail: "",
    };
    let nextPrint = print;
    renderToStaticMarkup(
      <DocumentPrintTab value={print} onChange={(next) => (nextPrint = next)} readOnly />,
    );
    expect(nextPrint).toEqual(print);
  });
});
