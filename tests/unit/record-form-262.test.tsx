import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CheckboxField, Field, FieldValue, NoticeBar, RecordActionBar } from "../../src/components/ds";
import { Input } from "../../src/components/ui/input";

describe("record form 2.62", () => {
  it("uses the shared field layout for controls, values, hints, and errors", () => {
    const control = renderToStaticMarkup(<Field label="Popisek" hint="Nápověda"><Input /></Field>);
    const value = renderToStaticMarkup(<Field label="Hodnota" error="Chyba"><FieldValue>123</FieldValue></Field>);
    expect(control).toContain("flex min-w-0 flex-col gap-1");
    expect(control).toContain('data-slot="field-hint"');
    expect(value).toContain('data-slot="field-error"');
    expect(value).toContain('data-slot="field-value"');
  });

  it.each(["natural", "input"] as const)("aligns a multiline checkbox in %s mode", (align) => {
    const html = renderToStaticMarkup(<CheckboxField align={align} label={<>První řádek<br />Druhý řádek</>} hint="Nápověda" checked onCheckedChange={vi.fn()} />);
    expect(html).toContain("grid-cols-[auto_minmax(0,1fr)]");
    expect(html).toContain("mt-[0.0625rem]");
    expect(html).toContain("Druhý řádek");
    expect(html).toContain("Nápověda");
  });

  it("renders actions and keeps error before notices", () => {
    const html = renderToStaticMarkup(<RecordActionBar saveAction={{ onSave: vi.fn(), dirty: false }} primaryAction={{ label: "Zařadit", onClick: vi.fn() }} error={{ message: "Chyba" }} notices={<NoticeBar tone="info">Informace</NoticeBar>} />);
    expect(html).toContain('data-slot="record-action-bar"');
    expect(html).toContain("disabled");
    expect(html.indexOf('data-slot="record-action-error"')).toBeLessThan(html.indexOf('data-slot="record-action-notices"'));
  });
});