import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CheckboxField,
  Field,
  FieldGrid,
  FieldTable,
  FieldValue,
  GridSegmentedToggle,
  MaskInput,
  OptionSelect,
  RecordDialog,
  SectionHeading,
} from "../../src/components/ds";
import { Input } from "../../src/components/ui/input";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { RecordDialogShowcase } from "../../src/components/showcase/RecordDialogShowcase";

const noop = () => {};

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));
const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
afterEach(cleanup);

describe("formulářové prvky dialogu záznamu", () => {
  it("sdílí standardní výšku ovládání a hodnoty jen ke čtení", () => {
    const html = renderToStaticMarkup(
      <FieldGrid cols={12}>
        <Field label="Text" span={4}>
          <Input />
        </Field>
        <Field label="Výběr" span={4}>
          <OptionSelect value="a" onChange={noop} options={[{ value: "a", label: "A" }]} />
        </Field>
        <Field label="Hodnota" span={4}>
          <FieldValue>Hodnota</FieldValue>
        </Field>
      </FieldGrid>,
    );
    expect(html.match(/data-control-height="standard"/g) ?? []).toHaveLength(3);
  });

  it("FieldValue zkrátí hodnotu, podporuje prostou variantu a vysvětlí zámek", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <FieldValue lockedReason="Neměnné po založení">Dlouhá hodnota</FieldValue>
        <FieldValue variant="plain">Prostá hodnota</FieldValue>
      </TooltipProvider>,
    );
    expect(html).toContain('title="Dlouhá hodnota"');
    expect(html).toContain('aria-label="Neměnné po založení"');
    expect(html.match(/bg-muted/g) ?? []).toHaveLength(1);
  });

  it("FieldGrid zobrazí společnou nápovědu a SectionHeading obsah vpravo", () => {
    const html = renderToStaticMarkup(
      <>
        <FieldGrid hint="Vysvětlení skupiny">Pole</FieldGrid>
        <SectionHeading aside="Stav">Sekce</SectionHeading>
      </>,
    );
    expect(html).toContain("Vysvětlení skupiny");
    expect(html).toContain("Stav");
    expect(html).toContain("normal-case tracking-normal");
  });

  it("CheckboxField v režimu input drží šestnáctibodové ovládání v řádku pole", () => {
    const html = renderToStaticMarkup(
      <CheckboxField align="input" checked onCheckedChange={noop} label="Schválení" />,
    );
    expect(html).toContain('data-align="input"');
    expect(html).toContain("min-h-[var(--control-h)]");
    expect(html).toContain("size-4");
    expect(html).toContain("pt-[calc(1.25rem+0.25rem)]");
  });
});

describe("RecordDialog 2.84", () => {
  it("ukázka A používá širokou mřížku a přesné rozložení polí", () => {
    const view = render(
      <TooltipProvider>
        <RecordDialogShowcase />
      </TooltipProvider>,
    );
    fireEvent.click(view.getByRole("button", { name: "Bez záložek" }));
    const dialog = view.getByRole("dialog");
    expect(dialog.className).toContain("sm:max-w-3xl");
    expect(view.getByLabelText("Typ knihy po založení nelze změnit.")).toBeTruthy();
    expect(view.getByText("Schválení")).toBeTruthy();
    expect(view.getByText("Vyžaduje schválení").closest('[data-align="input"]')).toBeTruthy();
  });

  it("ukázka C používá lg, FieldTable a stejné dvanáctisloupcové spany", () => {
    const view = render(
      <TooltipProvider>
        <RecordDialogShowcase />
      </TooltipProvider>,
    );
    fireEvent.click(view.getByRole("button", { name: "Číselné řady" }));
    expect(view.getByRole("dialog", { name: /Číselné řady knihy/ }).className).toContain(
      "sm:max-w-4xl",
    );
    expect(view.getByRole("table", { name: "Číselné řady" })).toBeTruthy();
    expect(view.getByRole("columnheader", { name: "Řada" }).className).toContain("col-span-2");
    expect(view.getByRole("columnheader", { name: "Maska" }).className).toContain("col-span-4");
    expect(view.getByText("Účet", { selector: "label" }).parentElement?.className).toContain(
      "col-span-8",
    );
    expect(view.getByText("Na dokladu").parentElement?.className).toContain("col-span-4");
    expect(view.getByText(/Nastavení DPH se použije/)).toBeTruthy();
  });

  it("jediná záložka ukáže přímo obsah bez lišty", () => {
    const view = render(
      <RecordDialog
        open
        onOpenChange={noop}
        title="Záznam"
        tabs={[{ value: "only", label: "Jediná", content: <span>Obsah jediné záložky</span> }]}
      />,
    );
    expect(view.getByText("Obsah jediné záložky")).toBeTruthy();
    expect(view.queryByRole("tablist")).toBeNull();
  });

  it("více záložek ponechá všechny panely vykreslené a neaktivní znepřístupní", () => {
    const view = render(
      <RecordDialog
        open
        onOpenChange={noop}
        title="Záznam"
        tabs={[
          { value: "short", label: "Krátká", content: <span>Krátký obsah</span> },
          { value: "long", label: "Dlouhá", content: <span>Dlouhý obsah</span> },
        ]}
      />,
    );
    const panels = view.getAllByRole("tabpanel", { hidden: true });
    expect(panels).toHaveLength(2);
    expect(panels[1]?.hasAttribute("inert")).toBe(true);
    expect(view.getByRole("tab", { name: "Dlouhá" })).toBeTruthy();
  });

  it("velikost lg, titulkové štítky a doplňkový řádek jsou veřejnou součástí", () => {
    const view = render(
      <RecordDialog
        open
        onOpenChange={noop}
        title="Záznam"
        size="lg"
        titleBadges={<span>Aktivní</span>}
        headerExtra="Podrobnost"
      />,
    );
    expect(view.getByRole("dialog").className).toContain("sm:max-w-4xl");
    expect(view.getByText("Aktivní")).toBeTruthy();
    expect(view.getByText("Podrobnost").className).toContain("text-[0.78125rem]");
  });
});

describe("FieldTable, MaskInput a řádkový segment", () => {
  it("FieldTable používá přístupné role a popisky i v mobilním řádku", () => {
    const html = renderToStaticMarkup(
      <FieldTable
        ariaLabel="Číselné řady"
        columns={[{ key: "mask", label: "Maska", span: 12 }]}
        rows={[{ key: "one", cells: { mask: <Input defaultValue="{RRRR}-{###}" /> } }]}
      />,
    );
    expect(html).toContain('role="table"');
    expect(html).toContain('role="columnheader"');
    expect(html).toContain('role="cell"');
    expect(html).toContain('aria-label="Maska"');
  });

  it("MaskInput vloží token na pozici kurzoru a zobrazí náhled", async () => {
    const change = mock(() => {});
    const view = render(<MaskInput value="A-B" onChange={change} preview="A-2026-B" />);
    const input = view.getByRole("textbox") as HTMLInputElement;
    await act(async () => {
      input.focus();
    });
    input.setSelectionRange(2, 2);
    fireEvent.click(view.getByRole("button", { name: "{RRRR}" }));
    expect(change).toHaveBeenCalledWith("A-{RRRR}B");
    expect(view.getByText("A-2026-B")).toBeTruthy();
  });

  it("řádkový segment drží kompaktní výšku", () => {
    const html = renderToStaticMarkup(
      <GridSegmentedToggle
        options={[{ value: "read", label: "Číst" }]}
        value="read"
        defaultValue="read"
        onChange={noop}
        ariaLabel="Oprávnění"
        size="row"
      />,
    );
    expect(html).toContain("h-[1.5em]");
  });
});
