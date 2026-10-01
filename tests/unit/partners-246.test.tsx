import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LookupField,
  nextLookupResolved,
  resolveLookupIcon,
  IcoField,
  normalizeIcoInput,
  CheckboxField,
  CheckboxGroup,
  SwitchField,
  SettingsSection,
  AddressFieldGrid,
  parseCzAccount,
  isValidCzAccount,
  czIban,
  isValidIban,
  formatIban,
  VatStatusBadge,
  RecordDialog,
  resolveLifecycleConfirm,
  activeStatusColumn,
  filterInactiveRows,
  activeToggleMenuItem,
  ShowInactiveToggle,
  OptionSelect,
  PartnerSelect,
  UnitSelect,
  selectableItems,
  Field,
  FieldGrid,
  FieldValue,
  SegmentedField,
  nextSegmentedFieldValue,
} from "../../src/components/ds";
import { Input } from "../../src/components/ui/input";

const noop = () => {};

describe("B1 LookupField / IcoField", () => {
  it("auto s hodnotou = ⟳, bez hodnoty = lupa", () => {
    expect(
      renderToStaticMarkup(<LookupField value="123" onChange={noop} onAction={noop} />),
    ).toContain('data-lookup-icon="refresh"');
    expect(
      renderToStaticMarkup(<LookupField value="" onChange={noop} onAction={noop} />),
    ).toContain('data-lookup-icon="search"');
  });
  it("po úspěšné akci ⟳, neúspěch nemění, smazání hodnoty lupa", () => {
    expect(nextLookupResolved(false, { type: "action", ok: true })).toBe(true);
    expect(nextLookupResolved(false, { type: "action", ok: undefined })).toBe(true);
    expect(nextLookupResolved(false, { type: "action", ok: false })).toBe(false);
    expect(nextLookupResolved(true, { type: "change", value: "" })).toBe(false);
    expect(nextLookupResolved(true, { type: "change", value: "1" })).toBe(true);
    expect(nextLookupResolved(false, { type: "reset", value: "1" })).toBe(true);
  });
  it("pevný režim a skrytí akce", () => {
    expect(resolveLookupIcon("search", true)).toBe("search");
    expect(resolveLookupIcon("refresh", false)).toBe("refresh");
    expect(
      renderToStaticMarkup(<LookupField value="1" onChange={noop} onAction={noop} hideAction />),
    ).not.toContain("<button");
  });
  it("IcoField: popisky a digitsOnly", () => {
    const html = renderToStaticMarkup(<IcoField value="" onChange={noop} onLookup={noop} />);
    expect(html).toContain('aria-label="Vyhledat v rejstříku"');
    expect(html).toContain('inputMode="numeric"');
    expect(renderToStaticMarkup(<IcoField value="1" onChange={noop} onLookup={noop} />)).toContain(
      'aria-label="Aktualizovat z rejstříku"',
    );
    expect(normalizeIcoInput("123 45 678 9")).toBe("12345678");
    expect(normalizeIcoInput("CZ-0012a")).toBe("0012");
  });
});

describe("B2 zaškrtávátka a přepínače", () => {
  it("CheckboxField váže popisek přes id a nápovědu", () => {
    const html = renderToStaticMarkup(
      <CheckboxField id="x" label="Plátce" hint="Nápověda" checked onCheckedChange={noop} />,
    );
    expect(html).toContain('for="x"');
    expect(html).toContain('aria-describedby="x-hint"');
    expect(
      renderToStaticMarkup(
        <CheckboxField label="A" align="input" checked={false} onCheckedChange={noop} />,
      ),
    ).toContain('data-align="input"');
  });
  it("CheckboxGroup směry", () => {
    expect(renderToStaticMarkup(<CheckboxGroup title="Volby">x</CheckboxGroup>)).toContain(
      "flex-col gap-2",
    );
    expect(renderToStaticMarkup(<CheckboxGroup direction="horizontal">x</CheckboxGroup>)).toContain(
      "gap-x-6",
    );
  });
  it("SwitchField a SettingsSection", () => {
    const html = renderToStaticMarkup(
      <SettingsSection title="Nastavení">
        <SwitchField label="Upozornění" checked busy onCheckedChange={noop} />
      </SettingsSection>,
    );
    expect(html).toContain("Změny se ukládají hned");
    expect(html).toContain('role="switch"');
    expect(html).toContain("disabled");
  });
});

describe("B4 AddressFieldGrid Mapa", () => {
  it("s mapAction tlačítko Mapa, bez něj ne", () => {
    const html = renderToStaticMarkup(
      <AddressFieldGrid value={{}} onChange={noop} mapAction={{ onClick: noop }} />,
    );
    expect(html).toContain("address-map-action");
    expect(html).toContain(">Mapa</button>");
    expect(renderToStaticMarkup(<AddressFieldGrid value={{}} onChange={noop} />)).not.toContain(
      "address-map-action",
    );
  });
});

describe("B5 bankovní účet", () => {
  it("parse, modulo 11, IBAN", () => {
    expect(parseCzAccount("19-2000145399")).toEqual({ prefix: "19", number: "2000145399" });
    expect(parseCzAccount("2000145399/0800")).toEqual({ prefix: "", number: "2000145399" });
    expect(parseCzAccount("abc")).toBeNull();
    expect(isValidCzAccount("19", "2000145399")).toBe(true);
    expect(isValidCzAccount("19", "2000145398")).toBe(false);
    const iban = czIban("19", "2000145399", "0800");
    expect(iban).toBe("CZ6508000000192000145399");
    expect(formatIban(iban)).toBe("CZ65 0800 0000 1920 0014 5399");
    expect(isValidIban("CZ65 0800 0000 1920 0014 5399")).toBe(true);
    expect(isValidIban("CZ66 0800 0000 1920 0014 5399")).toBe(false);
  });
});

describe("B6 VatStatusBadge", () => {
  it("stavy, nespolehlivost a ověření", () => {
    expect(renderToStaticMarkup(<VatStatusBadge status="payer" />)).toContain("Plátce");
    const html = renderToStaticMarkup(
      <VatStatusBadge status="payer" unreliableSince="2026-03-01" checkedAt="2026-09-26" />,
    );
    expect(html).toContain("Nespolehlivý plátce od 01.03.2026");
    expect(html).toContain("bg-destructive");
    expect(html).toContain("Ověřeno 26.09.2026");
    expect(renderToStaticMarkup(<VatStatusBadge status="unverified" />)).toContain("Neověřeno");
  });
});

describe("B8 aktivní / neaktivní", () => {
  it("RecordDialog potvrzení akce", () => {
    expect(resolveLifecycleConfirm({ label: "Deaktivovat" }, false)).toBeNull();
    expect(
      resolveLifecycleConfirm({ label: "Deaktivovat", confirm: { title: "Deaktivovat?" } }, false),
    ).toEqual({ title: "Deaktivovat?", confirmLabel: "Deaktivovat", saveFirst: false });
    expect(resolveLifecycleConfirm({ label: "Deaktivovat" }, true)?.confirmLabel).toBe(
      "Uložit změny a deaktivovat",
    );
    expect(resolveLifecycleConfirm({ label: "Deaktivovat" }, true)?.saveFirst).toBe(true);
  });
  it("RecordDialog: štítek stavu a tlačítko", () => {
    // Dialog se vykresluje do portálu; kontrolujeme, že se sestaví bez chyby.
    expect(() =>
      renderToStaticMarkup(
        <RecordDialog
          open={false}
          onOpenChange={noop}
          title="Partner"
          status={{ active: false }}
          lifecycleAction={{ label: "Aktivovat", onClick: noop }}
        />,
      ),
    ).not.toThrow();
  });
  it("grid pomocníci", () => {
    const col = activeStatusColumn<{ a: boolean }>((r) => r.a);
    expect(col.value?.({ a: false })).toBe("Neaktivní");
    expect(col.fitContent).toBe(true);
    expect(filterInactiveRows([{ a: true }, { a: false }], false, (r) => r.a)).toHaveLength(1);
    expect(filterInactiveRows([{ a: true }, { a: false }], true, (r) => r.a)).toHaveLength(2);
    expect(activeToggleMenuItem(true, noop).label).toBe("Deaktivovat");
    expect(activeToggleMenuItem(false, noop).label).toBe("Aktivovat");
    expect(renderToStaticMarkup(<ShowInactiveToggle pressed onPressedChange={noop} />)).toContain(
      "grid-toolbar-active",
    );
  });
  it("výběry: neaktivní se nenabízí, vybraná se štítkem", () => {
    expect(
      selectableItems(
        [
          { id: 1, a: false },
          { id: 2, a: true },
        ],
        (x) => x.a,
        (x) => x.id === 1,
      ),
    ).toHaveLength(2);
    expect(
      renderToStaticMarkup(
        <OptionSelect
          value="x"
          onChange={noop}
          options={[{ value: "x", label: "Stará", inactive: true }]}
        />,
      ),
    ).toContain("neaktivní");
    expect(
      renderToStaticMarkup(
        <PartnerSelect
          partners={[{ id: "p", name: "Alfa", active: false }]}
          value="p"
          onChange={noop}
        />,
      ),
    ).toContain("neaktivní");
    expect(
      renderToStaticMarkup(
        <UnitSelect
          options={[{ id: "u", code: "ks", name: "kus", isActive: false }]}
          value="u"
          onChange={noop}
        />,
      ),
    ).toContain("neaktivní");
  });
});

describe("Partneři D – formulářové rozvržení 2.52.0", () => {
  it("FieldValue má stejnou výšku jako Input a podporuje trailing", () => {
    const input = renderToStaticMarkup(<Input />);
    const value = renderToStaticMarkup(
      <FieldValue trailing={<button aria-label="Akce" />}>Hodnota</FieldValue>,
    );
    expect(input).toContain('data-control-height="standard"');
    expect(value).toContain('data-control-height="standard"');
    expect(value).toContain('data-slot="field-value-trailing"');
  });

  it("SegmentedField má radiogroup a šipky cyklicky mění hodnotu", () => {
    const options = [
      { value: "company", label: "Firma" },
      { value: "person", label: "Osoba" },
    ] as const;
    const html = renderToStaticMarkup(
      <SegmentedField
        options={[...options]}
        value="company"
        onChange={noop}
        ariaLabel="Typ partnera"
      />,
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('role="radio"');
    expect(nextSegmentedFieldValue([...options], "company", 1)).toBe("person");
    expect(nextSegmentedFieldValue([...options], "company", -1)).toBe("person");
  });

  it("FieldGrid podporuje 12 sloupců a mobilní dvojice", () => {
    const html = renderToStaticMarkup(
      <FieldGrid cols={12}>
        <Field label="Jméno" span={4}>
          A
        </Field>
        <Field label="Příjmení" span={4}>
          B
        </Field>
      </FieldGrid>,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("@min-[40rem]:grid-cols-12");
    expect(html).toContain("@min-[40rem]:col-span-4");
  });

  it("OptionSelect přijímá vlastní text prázdné hodnoty", () => {
    expect(
      renderToStaticMarkup(
        <OptionSelect value="" onChange={noop} options={[]} placeholderValueLabel="Neověřeno" />,
      ),
    ).toContain("Neověřeno");
  });
});
