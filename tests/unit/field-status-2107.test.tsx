/** Stav polí 2.107.0 · chyby, varování a nápovědy bez textu pod polem, souhrn chyb, A9. */
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, waitFor, act } = await import("@testing-library/react");
const { Field } = await import("../../src/components/ds/layout/form-field-layout");
const { CheckboxField, SwitchField } = await import("../../src/components/ds/form/checkbox-field");
const { DateField } = await import("../../src/components/ds/form/date-field");
const { Input } = await import("../../src/components/ui/input");
const { Button } = await import("../../src/components/ui/button");
const { FieldFeedbackIndicator, FieldStatusIndicator } =
  await import("../../src/components/ds/form/field-feedback");
const { FieldToggleButton } = await import("../../src/components/ds/form/field-toggle-button");
const { FieldErrorSummary } = await import("../../src/components/ds/feedback/field-error-summary");
const { RecordActionBar } = await import("../../src/components/ds/layout/record-action-bar");
const { useCellStatusTooltip } = await import("../../src/components/ds/grid/cell-status-tooltip");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { Contact } = await import("lucide-react");

afterEach(cleanup);

const originalRect = HTMLElement.prototype.getBoundingClientRect;
beforeEach(() => {
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      width: 1600,
      height: 400,
      top: 0,
      left: 0,
      right: 1600,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
});
afterEach(() => {
  HTMLElement.prototype.getBoundingClientRect = originalRect;
});

/** Nic se nevykresluje za ovládáním pole (pod prvkem). */
function assertNothingBelow(root: HTMLElement) {
  for (const field of root.querySelectorAll<HTMLElement>('[data-slot="field"]')) {
    const control = field.querySelector(".ds-field-control");
    expect(control).toBeTruthy();
    let next = control?.nextElementSibling;
    while (next) {
      expect(next.classList.contains("sr-only")).toBe(true);
      next = next.nextElementSibling;
    }
  }
  expect(root.querySelector("p.text-xs")).toBeNull();
}

describe("Pole bez textu pod prvkem", () => {
  for (const state of ["error", "warning", "hint"] as const) {
    it(`všechny typy polí ve stavu ${state}`, () => {
      const props =
        state === "error"
          ? { error: "Chyba pole" }
          : state === "warning"
            ? { warning: "Varování pole" }
            : { hint: "Nápověda pole" };
      const view = render(
        <TooltipProvider>
          <Field label="Text" htmlFor="a" {...props}>
            <Input id="a" />
          </Field>
          <Field label="Datum" htmlFor="b" {...props}>
            <DateField id="b" value="" onChange={() => {}} />
          </Field>
          <Field label="Zaškrtnutí" htmlFor="c" {...props}>
            <CheckboxField id="c" checked onCheckedChange={() => {}} label="Volba" {...props} />
          </Field>
          <SwitchField checked onCheckedChange={() => {}} label="Přepínač" {...props} />
        </TooltipProvider>,
      );
      assertNothingBelow(view.container);
      if (state === "hint")
        expect(view.container.querySelectorAll('[data-slot="field-hint"]').length).toBeGreaterThan(
          0,
        );
    });
  }

  it("CheckboxField s chybou: aria-invalid, describedby na skrytý text a ikona u popisku", () => {
    const view = render(
      <TooltipProvider>
        <CheckboxField checked onCheckedChange={() => {}} label="Souhlas" error="Povinné" />
      </TooltipProvider>,
    );
    const box = view.getByRole("checkbox");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    const described = document.getElementById(box.getAttribute("aria-describedby") ?? "");
    expect(described?.textContent).toBe("Povinné");
    expect(
      view.container.querySelector('[data-slot="field-feedback"][data-placement="label"]'),
    ).toBeTruthy();
  });

  it("číselné pole má ikonu vlevo, ostatní vpravo", () => {
    const view = render(
      <>
        <FieldFeedbackIndicator error="A" side="start" />
        <FieldStatusIndicator warning="B" />
      </>,
    );
    const icons = view.container.querySelectorAll('[data-slot="field-feedback"]');
    expect(icons[0]?.getAttribute("data-side")).toBe("start");
    expect(icons[1]?.getAttribute("data-side")).toBe("end");
  });

  it("bublina se otevře na focus ikony", async () => {
    const view = render(<FieldFeedbackIndicator error="Text chyby" />);
    fireEvent.focus(view.getByRole("img", { name: "Text chyby" }));
    await waitFor(() => expect(view.getAllByText("Text chyby").length).toBeGreaterThan(1));
  });

  it("bublina se otevře klepnutím na ikonu", async () => {
    const view = render(<FieldFeedbackIndicator warning="Text varování" />);
    fireEvent.click(view.getByRole("img", { name: "Text varování" }));
    await waitFor(() => expect(view.getAllByText("Text varování").length).toBeGreaterThan(1));
  });

  it("přepínač v poli s chybou má jednu bublinu: zpráva nahoře, původní informace pod ní", async () => {
    const view = render(
      <Field label="Partner" htmlFor="p" error="Chybí partner">
        <div className="relative">
          <Input id="p" />
          <FieldToggleButton
            icon={Contact}
            pressed
            onPressedChange={() => {}}
            label="Vybrat z adresáře"
            pressedTooltip="Partner z adresáře"
            unpressedTooltip="Ruční zadání"
          />
        </div>
      </Field>,
    );
    fireEvent.focus(view.getByRole("button", { name: "Vybrat z adresáře" }));
    await waitFor(() => {
      const extra = document.querySelector('[data-slot="field-feedback-extra"]');
      expect(extra?.textContent).toBe("Partner z adresáře");
      expect(extra?.previousElementSibling?.textContent).toBe("Chybí partner");
    });
  });
});

describe("Výška z --control-h", () => {
  it("Button size=control a CheckboxField align=input berou --control-h", () => {
    const view = render(
      <>
        <Button size="control">Mapa</Button>
        <CheckboxField align="input" checked onCheckedChange={() => {}} label="A" />
      </>,
    );
    expect(view.getByRole("button", { name: "Mapa" }).className).toContain("h-[var(--control-h)]");
    expect(view.container.querySelector('[data-slot="checkbox-field"] > div')?.className).toContain(
      "h-[var(--control-h)]",
    );
  });
});

describe("Líná bublina buňky", () => {
  function Cell({ error }: { error?: string }) {
    const status = useCellStatusTooltip({ error, extraInfo: "Název účtu" });
    return (
      <>
        <div tabIndex={0} data-testid="cell" {...status.triggerProps}>
          x
        </div>
        {status.tooltip}
      </>
    );
  }
  it("bez chyby nevytvoří bublinu ani handlery", () => {
    const view = render(<Cell />);
    fireEvent.focus(view.getByTestId("cell"));
    expect(document.querySelector('[data-slot="cell-status-tooltip"]')).toBeNull();
    expect(view.getByTestId("cell").hasAttribute("title")).toBe(false);
  });
  it("s chybou vytvoří bublinu až při focusu a se zprávou nahoře", () => {
    const view = render(<Cell error="Vyberte účet" />);
    expect(document.querySelector('[data-slot="cell-status-tooltip"]')).toBeNull();
    fireEvent.focus(view.getByTestId("cell"));
    const tip = document.querySelector('[data-slot="cell-status-tooltip"]');
    expect(tip?.textContent).toBe("Vyberte účetNázev účtu");
    expect(view.getByTestId("cell").getAttribute("aria-describedby")).toBe(tip?.id ?? "");
    fireEvent.blur(view.getByTestId("cell"));
    expect(document.querySelector('[data-slot="cell-status-tooltip"]')).toBeNull();
  });
});

describe("Souhrn chyb", () => {
  const links = Array.from({ length: 7 }, (_, index) => ({
    fieldId: `f${index}`,
    label: `Pole ${index}`,
    message: `Zpráva ${index}`,
  }));
  it("ukáže nejvýš 5 odkazů a „a další N“", () => {
    const view = render(<FieldErrorSummary errors={links} />);
    expect(view.getAllByRole("button")).toHaveLength(5);
    expect(view.getByText("a další 2")).toBeTruthy();
  });
  it("klik v pruhu lišty fokusuje pole", () => {
    const view = render(
      <>
        <input id="f0" aria-label="cíl" />
        <RecordActionBar error={{ message: "Chyby", fieldErrors: links.slice(0, 1) }} />
      </>,
    );
    fireEvent.click(view.getByRole("button", { name: /Pole 0/ }));
    expect(document.activeElement).toBe(view.getByLabelText("cíl"));
  });
  it("klik na pole skryté v mřížce rozbalí detail řádku a fokusuje pole", async () => {
    const lines = [
      { id: "l1", debitAccount: "518001", creditAccount: "321100", amount: 10, text: "A" },
    ];
    const view = render(
      <TooltipProvider>
        <JournalLinesEditor
          accounts={[
            { code: "321100", name: "Závazky" },
            { code: "518001", name: "Služby" },
          ]}
          documentCurrency="CZK"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          storageKey="field-status-2107"
          lines={lines}
          onChange={() => {}}
        />
        <FieldErrorSummary
          errors={[
            {
              fieldId: "journal-l1-quantity",
              label: "Množství",
              message: "Chyba",
              rowId: "l1",
              columnId: "quantity",
            },
          ]}
        />
      </TooltipProvider>,
    );
    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: /Množství/ }));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    const detail = view.container.querySelector('[data-journal-field="l1:quantity"]');
    expect(detail).toBeTruthy();
    expect(detail?.contains(document.activeElement)).toBe(true);
  });
});

describe("BankAccountField – ruční zadání v poli", () => {
  const options = [{ id: "a", label: "Hlavní", number: "19-2000145399", bankCode: "0800" }];
  it("v režimu manual nekreslí výběr, jen pole se vzorem a přepínačem", () => {
    const modes: string[] = [];
    const view = render(
      <TooltipProvider>
        <BankAccountField
          value=""
          onChange={() => {}}
          options={options}
          entryMode="manual"
          onEntryModeChange={(mode) => modes.push(mode)}
        />
      </TooltipProvider>,
    );
    expect(view.queryByRole("combobox")).toBeNull();
    expect(view.getByRole("textbox").getAttribute("placeholder")).toBe("předčíslí-číslo/kód");
    fireEvent.click(view.getByRole("button", { name: "Zadat účet ručně" }));
    expect(modes).toEqual(["selected"]);
  });
  it("v režimu selected je jen výběr", () => {
    const view = render(
      <BankAccountField value="" onChange={() => {}} options={options} entryMode="selected" />,
    );
    expect(view.getByRole("combobox")).toBeTruthy();
    expect(view.queryByRole("textbox")).toBeNull();
  });
});

describe("A9 – přidání zakázky a partnera", () => {
  it("＋ v hledání zakázky v detailu řádku předá hledaný text", async () => {
    const created: string[] = [];
    const view = render(
      <TooltipProvider>
        <JournalLinesEditor
          accounts={[
            { code: "321100", name: "Závazky" },
            { code: "518001", name: "Služby" },
          ]}
          documentCurrency="CZK"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          storageKey="a9-detail"
          dimensions={[{ id: "d1", code: "Z1", name: "Zakázka", isActive: true }]}
          onCreateDimension={(text) => created.push(text)}
          lines={[
            { id: "l1", debitAccount: "518001", creditAccount: "321100", amount: 1, text: "A" },
          ]}
          onChange={() => {}}
        />
      </TooltipProvider>,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Zobrazit detail řádku (Alt+↓)" })[0]!);
    const field = view.container.querySelector<HTMLElement>(
      '[data-journal-field^="l1:"][data-journal-field$="imensionId"] [role="combobox"]',
    );
    expect(field).toBeTruthy();
    fireEvent.click(field!);
    const search = await waitFor(() => {
      const input = document.querySelector<HTMLInputElement>("[cmdk-input]");
      if (!input) throw new Error("hledání není otevřené");
      return input;
    });
    fireEvent.change(search, { target: { value: "Nová Z9" } });
    fireEvent.click(await view.findByRole("button", { name: "Nová zakázka" }));
    expect(created).toEqual(["Nová Z9"]);
  });

  it("interní doklad nabídne ＋ Nový partner a tužku vybraného partnera", async () => {
    const seeds: unknown[] = [];
    const edits: string[] = [];
    const view = render(
      <TooltipProvider>
        <DocumentForm
          title="ID"
          documentType="ID"
          status="draft"
          value={{
            currency: "CZK",
            amountTotal: 0,
            totalMode: "entered",
            issueDate: "2026-10-12",
            accountingDate: "2026-10-12",
            partnerId: "p1",
          }}
          onChange={() => {}}
          lines={[]}
          onLinesChange={() => {}}
          books={[]}
          accounts={[]}
          partners={[{ id: "p1", name: "Alfa", ico: "12345678", isActive: true }]}
          onCreatePartner={(seed) => seeds.push(seed)}
          onEditCounterparty={(id) => edits.push(id)}
        />
      </TooltipProvider>,
    );
    const pencil = view.getAllByRole("button", { name: "Upravit vybraný záznam" })[0]!;
    fireEvent.click(pencil);
    expect(edits).toEqual(["p1"]);
    fireEvent.click(view.getByRole("combobox", { name: /Alfa|Partner/ }));
    const search = await waitFor(() => {
      const input = document.querySelector<HTMLInputElement>("[cmdk-input]");
      if (!input) throw new Error("hledání není otevřené");
      return input;
    });
    fireEvent.change(search, { target: { value: "Beta" } });
    fireEvent.click(await view.findByRole("button", { name: "Nový partner" }));
    expect(seeds.length).toBe(1);
  });
});
