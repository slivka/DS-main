/** Vytěžování 2.135.0 · stav pole, pruhy stavu, souhrn s F8, dialog přepsání a tabulka položek. */
import { afterEach, describe, expect, it, mock } from "bun:test";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { Field, FieldGrid } = await import("../../src/components/ds/layout/form-field-layout");
const { Input } = await import("../../src/components/ui/input");
const { ExtractionStatus } =
  await import("../../src/components/ds/extraction/extraction-status");
const { SuggestionSummary, focusNextUncertainField } =
  await import("../../src/components/ds/extraction/suggestion-summary");
const { ExtractionOverwriteDialog } =
  await import("../../src/components/ds/extraction/extraction-overwrite-dialog");
const { ExtractedItemsTable } =
  await import("../../src/components/ds/extraction/extracted-items-table");
const { DS_TEXTS_CS, DS_TEXTS_SK } = await import("../../src/ds-texts");

afterEach(cleanup);

describe("stav pole z vytěžení", () => {
  it("navržené pole má jemný podklad a značku suggested", () => {
    const view = render(
      <Field label="Odběratel" htmlFor="p" suggestion={{ source: "faktura.pdf" }}>
        <Input id="p" defaultValue="Firma" />
      </Field>,
    );
    const wrapper = view.container.querySelector('[data-suggestion="suggested"]');
    expect(wrapper).not.toBeNull();
    expect(view.container.querySelector('[data-slot="field-suggestion"]')).toBeNull();
  });

  it("nejisté pole má ikonu s bublinou a značku uncertain", () => {
    const view = render(
      <Field label="Částka" htmlFor="a" suggestion={{ source: "faktura.pdf", uncertain: true }}>
        <Input id="a" defaultValue="100" />
      </Field>,
    );
    expect(view.container.querySelector('[data-suggestion="uncertain"]')).not.toBeNull();
    const indicator = view.container.querySelector('[data-slot="field-suggestion"]');
    expect(indicator).not.toBeNull();
    expect(indicator?.getAttribute("aria-label")).toContain("Ke kontrole");
    expect(indicator?.getAttribute("aria-label")).toContain("faktura.pdf");
  });

  it("vlastní zpráva návrhu má přednost před výchozí", () => {
    const view = render(
      <Field
        label="Částka"
        htmlFor="a"
        suggestion={{ source: "f.pdf", uncertain: true, message: "Nekonkrétní částka" }}
      >
        <Input id="a" defaultValue="100" />
      </Field>,
    );
    const indicator = view.container.querySelector('[data-slot="field-suggestion"]');
    expect(indicator?.getAttribute("aria-label")).toBe("Nekonkrétní částka");
  });

  it("chyba má před návrhem přednost", () => {
    const view = render(
      <Field label="Částka" htmlFor="a" error="Chybí" suggestion={{ source: "f.pdf" }}>
        <Input id="a" defaultValue="100" />
      </Field>,
    );
    expect(view.container.querySelector("[data-suggestion]")).toBeNull();
    expect(view.container.querySelector('[data-slot="field-suggestion"]')).toBeNull();
  });

  it("samostatný vstup s vlastním návrhem nese značku na ovládání", () => {
    const view = render(<Input aria-label="Částka" suggestion={{ source: "f.pdf" }} />);
    const input = view.getByLabelText("Částka");
    expect(input.getAttribute("data-suggestion")).toBe("suggested");
  });
});

describe("ExtractionStatus", () => {
  it("vykreslí všechny čtyři stavy s jejich akcemi", () => {
    const onCancel = mock(() => undefined);
    const onRetry = mock(() => undefined);
    const onOpenOriginal = mock(() => undefined);
    const view = render(
      <>
        <ExtractionStatus state="extracting" onCancel={onCancel} />
        <ExtractionStatus state="done" method="AI návrh" />
        <ExtractionStatus state="failed" onRetry={onRetry} />
        <ExtractionStatus state="duplicate" onOpenOriginal={onOpenOriginal} />
      </>,
    );
    view.getByText("Vytěžuji soubor…");
    view.getByText("Hotovo · AI návrh");
    view.getByText("Soubor se nepodařilo vytěžit.");
    view.getByText("Duplicitní soubor – tento soubor už byl vytěžen.");
    fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
    fireEvent.click(view.getByRole("button", { name: "Zkusit znovu" }));
    fireEvent.click(view.getByRole("button", { name: "Otevřít původní doklad" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onOpenOriginal).toHaveBeenCalledTimes(1);
  });
});

describe("SuggestionSummary", () => {
  it("skloňuje počet polí ke kontrole", () => {
    const cs = DS_TEXTS_CS.extraction;
    expect(cs.summaryFieldsToCheck(1)).toBe("1 pole ke kontrole");
    expect(cs.summaryFieldsToCheck(3)).toBe("3 pole ke kontrole");
    expect(cs.summaryFieldsToCheck(7)).toBe("7 polí ke kontrole");
    const sk = DS_TEXTS_SK.extraction;
    expect(sk.summaryFieldsToCheck(1)).toBe("1 pole na kontrolu");
    expect(sk.summaryFieldsToCheck(5)).toBe("5 polí na kontrolu");
  });

  it("klávesa F8 přesune fokus na další pole ke kontrole", () => {
    const view = render(
      <FieldGrid cols={12}>
        <Field label="A" htmlFor="a" suggestion={{ source: "f.pdf", uncertain: true }}>
          <Input id="a" defaultValue="1" />
        </Field>
        <Field label="B" htmlFor="b">
          <Input id="b" defaultValue="2" />
        </Field>
        <Field label="C" htmlFor="c" suggestion={{ source: "f.pdf", uncertain: true }}>
          <Input id="c" defaultValue="3" />
        </Field>
        <SuggestionSummary method="AI návrh" uncertainCount={2} onDiscard={() => undefined} />
      </FieldGrid>,
    );
    view.getByLabelText("A").focus();
    fireEvent.keyDown(window, { key: "F8" });
    expect(document.activeElement).toBe(view.getByLabelText("C"));
    fireEvent.keyDown(window, { key: "F8" });
    expect(document.activeElement).toBe(view.getByLabelText("A"));
  });

  it("tlačítko Další ke kontrole a Zahodit návrh fungují", () => {
    const onDiscard = mock(() => undefined);
    const view = render(
      <>
        <Field label="A" htmlFor="a" suggestion={{ source: "f.pdf", uncertain: true }}>
          <Input id="a" defaultValue="1" />
        </Field>
        <SuggestionSummary method="AI návrh" uncertainCount={1} onDiscard={onDiscard} />
      </>,
    );
    fireEvent.click(view.getByRole("button", { name: "Další ke kontrole" }));
    expect(document.activeElement).toBe(view.getByLabelText("A"));
    fireEvent.click(view.getByRole("button", { name: "Zahodit návrh" }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it("focusNextUncertainField bez nejistých polí nic nedělá", () => {
    render(<Input aria-label="Prázdné" />);
    expect(() => focusNextUncertainField()).not.toThrow();
  });
});

describe("ExtractionOverwriteDialog", () => {
  it("nabídne Přepsat vše, Doplnit jen prázdná pole a Zrušit", () => {
    const onOverwriteAll = mock(() => undefined);
    const onFillEmpty = mock(() => undefined);
    const onOpenChange = mock(() => undefined);
    const view = render(
      <ExtractionOverwriteDialog
        open
        onOpenChange={onOpenChange}
        onOverwriteAll={onOverwriteAll}
        onFillEmpty={onFillEmpty}
      />,
    );
    view.getByText("Doklad už má vyplněné hodnoty");
    fireEvent.click(view.getByRole("button", { name: "Doplnit jen prázdná pole" }));
    expect(onFillEmpty).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    fireEvent.click(view.getByRole("button", { name: "Přepsat vše" }));
    expect(onOverwriteAll).toHaveBeenCalledTimes(1);
  });
});

describe("ExtractedItemsTable", () => {
  const items = [
    {
      id: "i1",
      text: "Kancelářské potřeby",
      quantity: 2,
      unit: "bal",
      unitPrice: 1250,
      vatRate: "21 %",
      base: 2500,
      tax: 525,
    },
    {
      id: "i2",
      text: "Doprava",
      quantity: null,
      unit: null,
      unitPrice: null,
      vatRate: "21 %",
      base: 150,
      tax: 31.5,
    },
  ];

  it("je výchozí sbalená a po rozkliku ukáže řádky i souhrn", () => {
    const view = render(<ExtractedItemsTable items={items} totals={{ base: 2650, tax: 556.5 }} />);
    view.getByText("Vytěžené položky (2)");
    expect(view.queryByText("Kancelářské potřeby")).toBeNull();
    fireEvent.click(view.getByText("Vytěžené položky (2)"));
    view.getByText("Kancelářské potřeby");
    view.getByText("Celkem");
    // Souhrnný řádek nese hodnoty od aplikace s oddělenými tisíci.
    console.log("TDs:", Array.from(view.container.querySelectorAll("td")).map((t) => JSON.stringify(t.textContent)).join(" | "));
    view.getByText("2 650,00");
    view.getByText("556,50");
  });

  it("řádek bez množství a ceny má prázdné buňky, nikoli nuly", () => {
    const view = render(
      <ExtractedItemsTable items={items} totals={{ base: 2650, tax: 556.5 }} defaultOpen />,
    );
    const row = view.getByText("Doprava").closest("tr");
    expect(row).not.toBeNull();
    const cells = Array.from(row!.querySelectorAll("td")).map((cell) => cell.textContent);
    expect(cells[1]).toBe("");
    expect(cells[2]).toBe("");
    expect(cells[3]).toBe("");
    expect(cells[5]).toBe("150,00");
  });
});
