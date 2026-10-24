/** Kontrakty gridu · ověřuje řazení, fulltext a pevné skupiny · nečte zdroj. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, renderHook, act } from "@testing-library/react";
import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import { useGridSort } from "../../src/components/ds/grid/grid-sort";
import { useDataGridFilters } from "../../src/components/ds/grid/useDataGridFilters";
import { useDataGridGroups } from "../../src/components/ds/grid/useDataGridGroups";
import { DS_TEXTS_CS } from "../../src/ds-texts";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { GridToolbarOverflowContext } from "../../src/components/ds/grid/grid-toolbar-context";
import { GridFrame } from "../../src/components/ds/grid/GridFrame";
import { updateGridLayout } from "../../src/lib/grid-prefs";
import type { DataGridColumn } from "../../src/components/ds/grid/data-grid-types";
afterEach(cleanup);
const rows = [
  { id: "a", name: "Banka", amount: 1 },
  { id: "b", name: "Pokladna", amount: 9 },
];
type Row = (typeof rows)[number];
const columns: DataGridColumn<Row>[] = [
  { id: "name", label: "Název", value: (row) => row.name },
  { id: "amount", label: "Částka", value: (row) => row.amount, defaultSortDirection: "desc" },
];
describe("DataGrid nové kontrakty", () => {
  it("úzká lišta přesune hledání do jediné nabídky a hledání dál změní data", () => {
    const searches: string[] = [];
    const ui = render(
      <TooltipProvider>
        <GridToolbarOverflowContext.Provider value={3}>
          <GridFrame
            zoom={{
              zoom: 1,
              setZoom: () => {},
              density: "normal",
              setDensity: () => {},
              isAuto: false,
            }}
            texts={DS_TEXTS_CS.grid}
            context={{}}
            toolbarClassName=""
            search={{ value: "", onChange: (value) => searches.push(value) }}
            filtersOpen={false}
            filterChips={[]}
            columnPicker={{ columns: [], visible: {}, onToggle: () => {} }}
            dataGroup={null}
            moreActions={[]}
            selection={null}
          />
        </GridToolbarOverflowContext.Provider>
      </TooltipProvider>,
    );
    fireEvent.click(ui.getByRole("button", { name: "Další akce" }));
    const search = ui.getByRole("button", { name: "Hledat" });
    fireEvent.click(search);
    const input = document.querySelector('[data-slot="grid-more-content"] input');
    if (!input) throw new Error("Hledání není v nabídce");
    fireEvent.change(input, { target: { value: "banka" } });
    expect(searches).toEqual(["banka"]);
  });
  it("sloupec s desc se výchozí řadí od největšího", () => {
    const ui = render(
      <DataGrid
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        storageKey="contracts-desc"
        defaultSort="amount"
        paginated={false}
        hideToolbar
      />,
    );
    expect([...ui.container.querySelectorAll("tbody tr")].map((r) => r.textContent)).toEqual([
      "Pokladna9",
      "Banka1",
    ]);
  });
  it("první klik nového sloupce respektuje jeho směr, další jej obrátí", () => {
    const hook = renderHook(() =>
      useGridSort("contracts-toggle", "name", "asc", (id) => (id === "amount" ? "desc" : "asc")),
    );
    act(() => hook.result.current.toggle("amount"));
    expect(hook.result.current.dir).toBe("desc");
    act(() => hook.result.current.toggle("amount"));
    expect(hook.result.current.dir).toBe("asc");
  });
  it("uložené řazení předchází výchozímu desc", () => {
    updateGridLayout("contracts-saved-sort", { sort: { key: "amount", dir: "asc" } });
    const hook = renderHook(() => useGridSort("contracts-saved-sort", "amount", "desc"));
    expect(hook.result.current.dir).toBe("asc");
  });
  it("searchText hledá i data mimo sloupce a zachová běžný fulltext", () => {
    const hook = renderHook(() =>
      useDataGridFilters({
        rows,
        columns,
        shown: columns,
        byId: new Map(columns.map((c) => [c.id, c])),
        texts: DS_TEXTS_CS.grid,
        searchText: (row) => (row.id === "a" ? "import výpisu" : ""),
      }),
    );
    act(() => hook.result.current.setSearch("IMPORT"));
    expect(hook.result.current.filtered.map((r) => r.id)).toEqual(["a"]);
    act(() => hook.result.current.setSearch("pokladna"));
    expect(hook.result.current.filtered.map((r) => r.id)).toEqual(["b"]);
  });
  it("pevná skupina přežije uložené vypnutí i žádost o odstranění", () => {
    updateGridLayout("contracts-fixed", { grouping: { enabled: false, groups: [] } });
    const hook = renderHook(() =>
      useDataGridGroups({
        storageKey: "contracts-fixed",
        groupable: true,
        fixedGroupBy: "name",
        groupTotals: "header",
        paginated: false,
        effectiveColumns: columns,
        shown: columns,
        pageRows: rows,
        sorted: rows,
        valueOf: (row, id) => (id === "name" ? row.name : row.amount),
        texts: DS_TEXTS_CS.grid,
        searching: false,
      }),
    );
    act(() => hook.result.current.grouping.clear());
    expect(hook.result.current.grouping.active).toBe(true);
    expect(hook.result.current.grouping.groups.map((g) => g.id)).toEqual(["name"]);
    expect(
      hook.result.current.displayItems
        .filter((item) => item.type === "group")
        .map((item) => item.count),
    ).toEqual([1, 1]);
  });
  it("headerTooltip se otevře fokusem řaditelného i neřaditelného záhlaví", async () => {
    for (const sortable of [true, false]) {
      const ui = render(
        <TooltipProvider delayDuration={0}>
          <DataGrid
            rows={rows}
            columns={[{ ...columns[0], sortable, headerTooltip: "Zdroj názvu" }]}
            rowKey={(r) => r.id}
            storageKey={`contracts-tooltip-${sortable}`}
            hideToolbar
            paginated={false}
          />
        </TooltipProvider>,
      );
      const trigger = sortable
        ? ui.getByRole("button", { name: "Seřadit podle Název" })
        : ui.getByText("Název");
      fireEvent.focus(trigger);
      expect((await ui.findByRole("tooltip")).textContent).toBe("Zdroj názvu");
      cleanup();
    }
  });
});
