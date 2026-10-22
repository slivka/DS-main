/** Vícenásobné výběry · klávesnice a zachování nabídky. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { MultiSelect } from "../../src/components/ds/form/multi-select";
import { ChipMultiSelect } from "../../src/components/ds/form/chip-multi-select";
afterEach(cleanup);
const options = [
  { value: "alfa", label: "ALFA" },
  { value: "beta", label: "BETA" },
];
function Fixture({ chips = false, search = true }) {
  const [value, change] = useState<string[]>([]);
  return (
    <>
      <button>Before</button>
      {chips ? (
        <ChipMultiSelect
          options={options}
          value={value}
          onChange={change}
          allLabel="Vybrat vše"
          clearLabel="Vymazat"
        />
      ) : (
        <MultiSelect
          options={options}
          selected={value}
          onChange={change}
          allLabel="Firmy"
          itemsLabel="firmy"
          clearLabel="Vymazat"
          showSearch={search}
        />
      )}
      <output>{value.join(",")}</output>
      <button>After</button>
    </>
  );
}
for (const chips of [false, true]) {
  test(`${chips ? "ChipMultiSelect" : "MultiSelect"}: šipky, Enter a mezerník přepínají bez zavření`, async () => {
    const view = render(<Fixture chips={chips} />);
    fireEvent.click(view.getByRole("combobox"));
    const input = view.container.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!input) throw new Error("Chybí hledání");
    await waitFor(() =>
      expect(view.getByRole("option", { name: "ALFA" }).getAttribute("aria-selected")).toBe("true"),
    );
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() =>
      expect(view.getByRole("option", { name: "BETA" }).getAttribute("aria-selected")).toBe("true"),
    );
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(view.getByRole("status").textContent).toBe("beta"));
    expect(view.getByRole("option", { name: "BETA" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(input, { key: " " });
    await waitFor(() => expect(view.getByRole("status").textContent).toBe(""));
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() =>
      expect(view.getByRole("option", { name: "ALFA" }).getAttribute("aria-selected")).toBe("true"),
    );
    fireEvent.change(input, { target: { value: "BET" } });
    await waitFor(() => expect(view.queryByRole("option", { name: "ALFA" })).toBeNull());
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(view.getByRole("status").textContent).toBe("beta"));
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(view.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(view.getByRole("combobox"));
  });
  test(`${chips ? "ChipMultiSelect" : "MultiSelect"}: Tab dosáhne všech akcí a Escape vrací fokus`, async () => {
    const view = render(<Fixture chips={chips} />);
    fireEvent.click(view.getByRole("combobox"));
    const input = view.container.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!input) throw new Error("Chybí hledání");
    fireEvent.keyDown(input, { key: "Tab" });
    const all = view.getByRole("button", { name: "Vybrat vše" });
    expect(document.activeElement).toBe(all);
    fireEvent.keyDown(all, { key: "Enter" });
    fireEvent.click(all); // Happy-dom nespouští nativní klik tlačítka z klávesy.
    expect(view.getByRole("status").textContent).toBe("alfa,beta");
    expect(view.getAllByRole("option")).toHaveLength(2);
    fireEvent.keyDown(all, { key: "Tab" });
    const clear = view.getByRole("button", { name: "Vymazat" });
    expect(document.activeElement).toBe(clear);
    fireEvent.keyDown(clear, { key: " " });
    fireEvent.click(clear);
    expect(view.getByRole("status").textContent).toBe("");
    fireEvent.keyDown(clear, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(all);
    fireEvent.keyDown(all, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Tab" });
    fireEvent.keyDown(all, { key: "Escape" });
    await waitFor(() => expect(view.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(view.getByRole("combobox"));
  });
  test(`${chips ? "ChipMultiSelect" : "MultiSelect"}: odchod fokusu mimo nabídku ji zavře`, async () => {
    const view = render(<Fixture chips={chips} />);
    fireEvent.click(view.getByRole("combobox"));
    const input = view.container.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!input) throw new Error("Chybí hledání");
    fireEvent.keyDown(input, { key: "Tab" });
    fireEvent.blur(view.getByRole("button", { name: "Vybrat vše" }), {
      relatedTarget: view.getByRole("button", { name: "After" }),
    });
    await waitFor(() => expect(view.queryByRole("listbox")).toBeNull());
    expect(view.getByRole("status").textContent).toBe("");
  });
}
