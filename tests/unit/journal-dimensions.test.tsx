import { describe, expect, test } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import {
  DimensionBar,
  JournalLinesEditor,
  MultiValueCell,
  DimensionFilter,
  type DimensionValue,
  type JournalLine,
} from "@/components/ds";
import {
  applyHeaderDimensions,
  effectiveDimensions,
  inheritDimensions,
  resetDimension,
  dimensionsToRow,
  dimensionsFromRow,
  dimensionOverrides,
} from "@/components/ds/accounting/journal-dimensions-model";
import { journalCategoryInputs } from "@/components/ds/accounting/journal-category-inputs";
import { fromJournalRow, toJournalRow } from "@/components/ds/accounting/journal-lines";
import { headerDimensionValues } from "@/components/ds/accounting/journal-dimension-inputs";
const header: DimensionValue[] = [
  { typeId: "vehicle", valueId: "a", label: "Auto A", kind: "vehicle" },
];
const manual: DimensionValue = {
  typeId: "vehicle",
  valueId: "b",
  label: "Auto B",
  inherited: false,
  kind: "vehicle",
};
const types = [
  { id: "vehicle", label: "Vozidlo", order: 1 },
  { id: "centre", label: "Středisko", order: 2 },
];
const editorProps = {
  accounts: [],
  documentCurrency: "EUR",
  homeCurrency: "EUR",
  onChange: () => {},
};
describe("model dimenzí", () => {
  test("hlavička se propíše na MD i DAL všech řádků bez mutace", () => {
    const lines: JournalLine[] = [{ id: "1" }, { id: "2" }];
    const next = applyHeaderDimensions(lines, header);
    for (const line of next) {
      expect(line.dimensions?.MD[0]).toEqual({ ...header[0], inherited: true });
      expect(line.dimensions?.D[0]?.valueId).toBe("a");
    }
    expect(lines[0]?.dimensions).toBeUndefined();
  });
  test("změna hlavičky přepíše jen převzaté, ruční MD zůstane", () => {
    const line: JournalLine = {
      id: "1",
      dimensions: { MD: [manual], D: [{ ...manual, inherited: true }] },
    };
    const next = effectiveDimensions(line, header);
    expect(next.MD[0]?.valueId).toBe("b");
    expect(next.MD[0]?.inherited).toBe(false);
    expect(next.D[0]?.valueId).toBe("a");
    expect(next.D[0]?.inherited).toBe(true);
  });
  test("odebrání hlavičky odstraní jen převzaté", () => {
    expect(
      inheritDimensions(
        [manual, { typeId: "centre", valueId: "c", label: "C", inherited: true }],
        [],
      ),
    ).toEqual([manual]);
  });
  test("na typ a stranu zůstane nejvýše jedna hodnota", () => {
    expect(
      inheritDimensions([manual, { ...manual, valueId: "dup" }], [...header, ...header]),
    ).toEqual([manual]);
  });
  test("vrácení obnoví aktuální hlavičku, nikoliv starou převzatou", () => {
    expect(resetDimension([manual], header, "vehicle")).toEqual([
      { ...header[0], inherited: true },
    ]);
  });
  test("vrácení bez typu v hlavičce odstraní výjimku", () => {
    expect(resetDimension([manual], [], "vehicle")).toEqual([]);
  });
  test("DB dostane jen ruční, value_id a vehicle_id podle APP", () => {
    expect(
      dimensionsToRow({
        MD: [
          manual,
          { typeId: "centre", valueId: "c", label: "C", kind: "value", inherited: false },
        ],
        D: [{ ...manual, inherited: true }],
      }),
    ).toEqual({
      MD: [
        { type_id: "vehicle", vehicle_id: "b" },
        { type_id: "centre", value_id: "c" },
      ],
      D: [],
    });
  });
  test("prázdný typ a ruční null do DB nejdou", () => {
    expect(dimensionsToRow({ MD: [{ ...manual, valueId: null }], D: [] })).toEqual({
      MD: [],
      D: [],
    });
  });
  test("toJournalRow předá dimenze, nesplete je s kategorií", () => {
    const row = toJournalRow({
      id: "1",
      categoryId: "cat",
      dimensions: { MD: [manual], D: [{ ...manual, inherited: true }] },
    });
    expect(row.debit_category_id).toBe("cat");
    expect(row.dimensions).toEqual({ MD: [{ type_id: "vehicle", vehicle_id: "b" }], D: [] });
  });
  test("fromJournalRow načte vozidlo i hodnotu s popiskem a inherited", () => {
    const row = toJournalRow({ id: "1" });
    row.dimensions = {
      MD: [{ type_id: "vehicle", vehicle_id: "a", label: "Auto A", inherited: true }],
      D: [{ type_id: "centre", value_id: "c", label: "C" }],
    };
    const line = fromJournalRow(row);
    expect(line.dimensions?.MD[0]).toEqual({ ...header[0], inherited: true });
    expect(line.dimensions?.D[0]?.kind).toBe("value");
    expect(line.dimensions?.D[0]?.inherited).toBe(false);
  });
  test("bez zapojení hlavičky zůstanou načtené převzaté", () => {
    const dimensions = dimensionsFromRow({
      MD: [{ type_id: "vehicle", vehicle_id: "a", inherited: true }],
      D: [],
    });
    expect(effectiveDimensions({ id: "1", dimensions })).toBe(dimensions);
  });
  test("počet výjimek počítá řádek jednou i při ruční MD i DAL", () => {
    expect(
      dimensionOverrides(
        [
          { id: "1", dimensions: { MD: [manual], D: [manual] } },
          { id: "2", dimensions: { MD: [{ ...manual, valueId: "a" }], D: [] } },
        ],
        header,
      ),
    ).toEqual({ vehicle: 1 });
  });
  test("B1 legacy dimensions číselník stále funguje", () => {
    const category = { id: "cat", name: "Kategorie" };
    const props = journalCategoryInputs({ ...editorProps, lines: [], dimensions: [category] });
    expect(props.categories).toEqual([category]);
    expect(headerDimensionValues([category])).toBeUndefined();
  });
  test("B2 dimensions nikdy není categories; nová prázdná categories má přednost", () => {
    expect(
      journalCategoryInputs({ ...editorProps, lines: [], dimensions: header }).categories,
    ).toEqual([]);
    expect(
      journalCategoryInputs({
        ...editorProps,
        lines: [],
        categories: [],
        dimensions: [{ id: "old", name: "Old" }],
      }).categories,
    ).toEqual([]);
    expect(headerDimensionValues(header)).toEqual(header);
  });
});
describe("lišta dimenzí", () => {
  test("Delete chip odebere a nepředá Enter rodiči gridu", () => {
    let next: DimensionValue[] = [];
    let enters = 0;
    render(
      <div
        onKeyDown={(event) => {
          if (event.key === "Enter") enters++;
        }}
      >
        <DimensionBar
          types={types}
          value={header}
          onChange={(value) => {
            next = value;
          }}
          loadOptions={async () => []}
        />
      </div>,
    );
    const chip = screen.getByRole("combobox", { name: "Vozidlo: Auto A" });
    fireEvent.keyDown(chip, { key: "Delete" });
    expect(next).toEqual([]);
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(enters).toBe(0);
  });
  test("readOnly a disabled nikdy nemění hodnoty", () => {
    let calls = 0;
    const { rerender } = render(
      <DimensionBar
        types={types}
        value={header}
        onChange={() => calls++}
        loadOptions={async () => []}
        readOnly
      />,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Delete" });
    expect(screen.queryByRole("button", { name: /Odebrat/ })).toBeNull();
    rerender(
      <DimensionBar
        types={types}
        value={header}
        onChange={() => calls++}
        loadOptions={async () => []}
        disabled
      />,
    );
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Vozidlo: Auto A" }), {
      key: "Backspace",
    });
    expect(calls).toBe(0);
  });
  test("Enter výběru typu přidá prázdný typ a rovnou otevře hodnoty", async () => {
    function Demo() {
      const [value, setValue] = useState<DimensionValue[]>([]);
      return (
        <DimensionBar
          types={types}
          value={value}
          onChange={setValue}
          loadOptions={async () => [{ id: "a", label: "Auto A" }]}
        />
      );
    }
    render(<Demo />);
    fireEvent.click(screen.getByRole("combobox", { name: "+ Dimenze" }));
    fireEvent.click(await screen.findByRole("option", { name: "Vozidlo" }));
    expect(await screen.findByRole("option", { name: "Auto A" })).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: "Auto A" }));
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Vozidlo: Auto A" })).toBeTruthy(),
    );
  });
  test("ukončená hodnota je viditelná, ale znovu se nenabízí", async () => {
    render(
      <DimensionBar
        types={types}
        value={[{ ...manual, inactive: true }]}
        onChange={() => {}}
        loadOptions={async () => [
          { id: "b", label: "Auto B", inactive: true },
          { id: "a", label: "Auto A" },
        ]}
      />,
    );
    const chip = screen.getByRole("combobox", { name: "Vozidlo: Auto B" });
    expect(chip.textContent).toContain("Auto B");
    fireEvent.click(chip);
    expect(await screen.findByRole("option", { name: "Auto A" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Auto B" })).toBeNull();
  });
  test("zamítnutí načítání nevyvolá změnu", async () => {
    let calls = 0;
    render(
      <DimensionBar
        types={types}
        value={header}
        onChange={() => calls++}
        loadOptions={async () => {
          throw new Error("network");
        }}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Vozidlo: Auto A" }));
    await screen.findByText("Hodnoty se nepodařilo načíst");
    expect(calls).toBe(0);
  });
  test("editor při renderu jen odvodí hlavičku bez zápisu, jiné změny ji předají", async () => {
    let changes: JournalLine[] = [];
    render(
      <JournalLinesEditor
        {...editorProps}
        mode="mainAccount"
        lines={[{ id: "r", text: "A", amount: 1 }]}
        dimensionTypes={types}
        dimensions={header}
        loadDimensionOptions={async () => []}
        onChange={(lines) => {
          changes = lines;
        }}
      />,
    );
    expect(changes).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: /Duplikovat řádek/ }));
    expect(changes.length).toBe(2);
    expect(changes[1]?.dimensions?.D[0]?.valueId).toBe("a");
  });
  test("MultiValueCell uchová více hotových hodnot", () => {
    render(<MultiValueCell values={[{ label: "Auto A" }, { label: "Auto B" }]} />);
    expect(screen.getByText("Auto A")).toBeTruthy();
  });
  test("filtr vynechá ukončené nabídky a změní set přes společný checklist", async () => {
    let selected = new Set<string>();
    render(
      <DimensionFilter
        options={[
          { id: "a", label: "Auto A" },
          { id: "b", label: "Auto B", inactive: true },
        ]}
        selected={selected}
        onSelectionChange={(value) => {
          selected = value;
        }}
        label="Vozidlo"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(await screen.findByRole("checkbox", { name: "Auto A" }));
    expect(selected.has("a")).toBe(true);
    expect(screen.queryByText("Auto B")).toBeNull();
  });
});
