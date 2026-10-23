/** 2.137.0 · akce v bublině návrhu a jedna ikona návrhu v poli s ikonovým tlačítkem. */
import { afterEach, describe, expect, it, mock } from "bun:test";

const { act, cleanup, fireEvent, render, renderHook, waitFor } =
  await import("@testing-library/react");
const { Field } = await import("../../src/components/ds/layout/form-field-layout");
const { FieldSuggestionIndicator } = await import("../../src/components/ds/form/field-feedback");
const { Input } = await import("../../src/components/ui/input");
const { Button } = await import("../../src/components/ui/button");
const { LookupField } = await import("../../src/components/ds/form/lookup-field");
const { useHoverPopover } = await import("../../src/components/ds/form/use-hover-popover");

afterEach(cleanup);

describe("akce v bublině návrhu", () => {
  it("lookup s ikonovým tlačítkem zpřístupní akci návrhu a zavolá ji", async () => {
    const onClick = mock(() => undefined);
    const lookup = mock(() => undefined);
    const view = render(
      <Field
        label="Dodavatel"
        htmlFor="lookup-supplier"
        suggestion={{
          source: "faktura.pdf",
          uncertain: true,
          message: "Dodavatel není v adresáři.",
          action: { label: "Založit dodavatele z dokladu", onClick },
        }}
      >
        <LookupField id="lookup-supplier" value="" onChange={() => undefined} onAction={lookup} />
      </Field>,
    );
    expect(view.getByRole("button", { name: "Vyhledat" })).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Dodavatel není v adresáři." }));
    const action = await view.findByRole("button", { name: "Založit dodavatele z dokladu" });
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(lookup).not.toHaveBeenCalled();
  });

  it("po odjetí se zavře se zpožděním a přejezd do bubliny zavření zruší", async () => {
    const { result } = renderHook(useHoverPopover);
    act(() => result.current.onMouseEnter());
    expect(result.current.open).toBe(true);
    act(() => result.current.onMouseLeave());
    expect(result.current.open).toBe(true);
    act(() => result.current.onMouseEnter());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    expect(result.current.open).toBe(true);
    act(() => result.current.onMouseLeave());
    await waitFor(() => expect(result.current.open).toBe(false));
  });

  it("kliknutím otevřená bublina zůstane otevřená po odjetí", async () => {
    const view = render(
      <FieldSuggestionIndicator
        suggestion={{
          source: "faktura.pdf",
          uncertain: true,
          message: "Ke kontrole",
          action: { label: "Prověřit", onClick: () => undefined },
        }}
      />,
    );
    const icon = view.getByRole("button", { name: "Ke kontrole" });
    fireEvent.click(icon);
    await view.findByRole("button", { name: "Prověřit" });
    fireEvent.mouseLeave(icon);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    expect(view.getByRole("button", { name: "Prověřit" })).toBeTruthy();
    fireEvent.keyDown(view.getByRole("button", { name: "Prověřit" }), { key: "Escape" });
    await waitFor(() => expect(view.queryByRole("button", { name: "Prověřit" })).toBeNull());
  });
  it("nabídne odkazové tlačítko, zavolá akci a bublinu zavře", async () => {
    const onClick = mock(() => undefined);
    const view = render(
      <FieldSuggestionIndicator
        suggestion={{
          source: "faktura.pdf",
          uncertain: true,
          message: "Dodavatel není v adresáři.",
          action: { label: "Založit dodavatele z dokladu", onClick },
        }}
      />,
    );
    const icon = view.getByRole("button", { name: "Dodavatel není v adresáři." });
    expect(icon.tagName).toBe("BUTTON");
    fireEvent.click(icon);
    const action = await view.findByRole("button", { name: "Založit dodavatele z dokladu" });
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(view.queryByRole("button", { name: "Založit dodavatele z dokladu" })).toBeNull(),
    );
  });

  it("bez akce zůstává obyčejná ikona s bublinou", () => {
    const view = render(
      <FieldSuggestionIndicator suggestion={{ source: "faktura.pdf", uncertain: true }} />,
    );
    expect(view.container.querySelector('[data-slot="field-suggestion"]')?.tagName).toBe("SPAN");
    expect(view.container.querySelector("[data-has-action]")).toBeNull();
  });

  it("pole s ikonovým tlačítkem vykreslí jedinou ikonu návrhu", () => {
    const view = render(
      <Field label="Dodavatel" htmlFor="d" suggestion={{ source: "faktura.pdf", uncertain: true }}>
        <Input id="d" />
        <Button type="button" size="icon" aria-label="Adresář" />
      </Field>,
    );
    expect(view.container.querySelectorAll('[data-slot="field-suggestion"]').length).toBe(1);
  });
});
