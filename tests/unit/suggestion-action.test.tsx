/** 2.137.0 · akce v bublině návrhu a jedna ikona návrhu v poli s ikonovým tlačítkem. */
import { afterEach, describe, expect, it, mock } from "bun:test";

const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { Field } = await import("../../src/components/ds/layout/form-field-layout");
const { FieldSuggestionIndicator } = await import("../../src/components/ds/form/field-feedback");
const { Input } = await import("../../src/components/ui/input");
const { Button } = await import("../../src/components/ui/button");

afterEach(cleanup);

describe("akce v bublině návrhu", () => {
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
