import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  CODE_SEPARATOR,
  CheckboxField,
  DateField,
  DocumentForm,
  LookupField,
  OptionSelect,
  RecordActionBar,
  formatCodeName,
} from "../../src";

describe("DS 2.85.0 – obecná pravidla", () => {
  it("skládá kód a název jediným oddělovačem", () => {
    expect(CODE_SEPARATOR).toBe(" – ");
    expect(formatCodeName("321.100", "Závazky")).toBe("321.100 – Závazky");
    expect(formatCodeName("321.100", "")).toBe("321.100");
  });

  it("zobrazuje prázdnou volbu tlumeně a vstup bez placeholderu", () => {
    const select = renderToStaticMarkup(
      <OptionSelect value="" onChange={vi.fn()} options={[]} />,
    );
    const date = renderToStaticMarkup(<DateField value="" onChange={vi.fn()} />);
    expect(select).toContain("text-muted-foreground");
    expect(date).not.toContain("placeholder=");
  });

  it("počítá šířku data podle právě viditelných ikon", () => {
    const locked = renderToStaticMarkup(
      <DateField value="2026-10-01" onChange={vi.fn()} link={{ locked: true, onToggle: vi.fn() }} />,
    );
    const unlocked = renderToStaticMarkup(
      <DateField value="2026-10-01" onChange={vi.fn()} link={{ locked: false, onToggle: vi.fn() }} />,
    );
    const warned = renderToStaticMarkup(
      <DateField value="2026-10-01" onChange={vi.fn()} warning="Pozor" warningDisplay="indicator" />,
    );
    expect(locked).toContain('data-visible-icons="1"');
    expect(unlocked).toContain('data-visible-icons="2"');
    expect(warned).toContain('data-visible-icons="2"');
  });

  it("řadí hlavní krok před uložením a nabízí editaci vybraného záznamu", () => {
    const bar = renderToStaticMarkup(
      <RecordActionBar primaryAction={{ label: "Zaúčtovat", onClick: vi.fn() }} saveAction={{ onSave: vi.fn() }} />,
    );
    const lookup = renderToStaticMarkup(
      <LookupField value="42" onChange={vi.fn()} onEditSelected={vi.fn()} />,
    );
    expect(bar.indexOf("Zaúčtovat")).toBeLessThan(bar.indexOf("Uložit"));
    expect(lookup).toContain("Upravit vybraný záznam");
  });

  it("zarovnává checkbox podle prvního řádku popisku", () => {
    const html = renderToStaticMarkup(
      <CheckboxField label="Jednořádkový popisek" hint="Popis" checked onCheckedChange={vi.fn()} />,
    );
    expect(html).toContain("mt-[0.125rem]");
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
      <DocumentForm title="Doklad" documentType="FP" value={value} onChange={vi.fn()} lines={[]} onLinesChange={vi.fn()} books={[]} accounts={[]} homeCurrency="CZK" status="draft" paymentMethodOptions={[{ value: "transfer", label: "Převod" }]} />,
    );
    expect(html.indexOf("Platební údaje")).toBeLessThan(html.indexOf(">Částka<"));
  });

  it("zobrazuje nový účet partnera jen jako výběr a varuje u neplatného", () => {
    const html = renderToStaticMarkup(
      <DocumentForm title="Doklad" documentType="FP" value={value} onChange={vi.fn()} lines={[]} onLinesChange={vi.fn()} books={[]} accounts={[]} homeCurrency="CZK" status="draft" bankAccountOptions={[{ id: "bank-1", number: "123", bankCode: "0100", invalid: true }]} onAddBankAccount={vi.fn()} />,
    );
    expect(html).toContain("Bankovní účet je označen jako neplatný");
    expect(html).toContain("Přidat účet…");
    expect(html).not.toContain('id="document-bankAccount" inputmode="numeric"');
  });
});