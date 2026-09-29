import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DataGrid, type DataGridColumn } from "../../src/components/ds/grid/DataGrid";
import { GridAmountEditor, exceedsMax } from "../../src/components/ds/grid/grid-amount-editor";
import { insertGroupTotalRows, isInteractiveTarget, nextEditorIndex, resolveSelectedRows, toggleVisibleSelection } from "../../src/components/ds/grid/grid-selection";

type R = { id: string; partner: string; amount: number };
const rows: R[] = Array.from({ length: 60 }, (_, i) => ({ id: `r${i}`, partner: i < 30 ? "ALFA" : "BETA", amount: 100 }));
const columns: DataGridColumn<R>[] = [
  { id: "partner", label: "Partner", value: (r) => r.partner },
  { id: "amount", label: "Částka", numeric: true, decimals: 2, value: (r) => r.amount },
];

describe("B1 součty skupiny pod sloupci 2.58.0", () => {
  it("groupTotals=row přidá řádek součtů s popiskem přes všechny řádky bez stránkování", () => {
    const html = renderToStaticMarkup(<DataGrid storageKey="gt-row" rows={rows} columns={columns} rowKey={(r) => r.id} defaultGroupBy="partner" groupTotals="row" paginated={false} />).replace(/[\u00a0\u202f]/g, " ");
    expect((html.match(/data-slot="grid-group-total"/g) ?? []).length).toBe(2);
    expect(html).toContain("Celkem ALFA");
    expect(html).toContain("3 000,00");
    expect((html.match(/data-slot="grid-group-total"[\s\S]*?Celkem BETA/g) ?? []).length).toBe(1);
    expect(html).toContain("6 000,00");
  });
  it("výchozí header zachová součty v záhlaví a nemá řádky součtů", () => {
    const html = renderToStaticMarkup(<DataGrid storageKey="gt-header" rows={rows} columns={columns} rowKey={(r) => r.id} defaultGroupBy="partner" paginated={false} />).replace(/[\u00a0\u202f]/g, " ");
    expect(html).not.toContain("grid-group-total");
    expect(html).toContain("Částka:");
  });
  it("insertGroupTotalRows vynechá sbalené skupiny a uzavírá vnořené", () => {
    const g = (key: string, level: number, collapsed = false) => ({ type: "group" as const, key, label: key, level, collapsed, sums: [] });
    const out = insertGroupTotalRows([g("A", 0), g("A1", 1), { type: "row" as const, row: 1 }, g("A2", 1, true), g("B", 0)]);
    expect(out.map((i) => `${i.type}:${"key" in i ? i.key : ""}`)).toEqual(["group:A", "group:A1", "row:", "groupTotal:A1", "group:A2", "groupTotal:A", "group:B", "groupTotal:B"]);
  });
});

describe("B2 řízený výběr 2.58.0", () => {
  it("výběr skrytý filtrem zůstává a vrací se z celé množiny", () => {
    const keys = new Set(["r1", "r40"]);
    expect(resolveSelectedRows(rows, keys, (r) => r.id).map((r) => r.id)).toEqual(["r1", "r40"]);
  });
  it("Vybrat vše přepíná jen viditelné řádky", () => {
    const next = toggleVisibleSelection(new Set(["r40"]), ["r1", "r2"]);
    expect([...next].sort()).toEqual(["r1", "r2", "r40"]);
    expect([...toggleVisibleSelection(next, ["r1", "r2"])]).toEqual(["r40"]);
  });
  it("řízený selectedKeys se zobrazí a sumSelected sečte jen vybrané", () => {
    const cols: DataGridColumn<R>[] = [columns[0]!, { ...columns[1]!, total: "sumSelected" }];
    const html = renderToStaticMarkup(<DataGrid storageKey="sel" rows={rows.slice(0, 5)} columns={cols} rowKey={(r) => r.id} selectMode selectedKeys={["r0", "r2"]} groupable={false} paginated={false} selectionSummary={(sel) => <span>Vybráno {sel.length}</span>} />).replace(/[\u00a0\u202f]/g, " ");
    expect((html.match(/data-state="selected"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("200,00");
    expect(html).toContain("Vybráno 2");
  });
  it("klik do inputu nebo tlačítka v buňce nepřepíná řádek", () => {
    const row = {};
    expect(isInteractiveTarget({ closest: () => ({}) }, row)).toBe(true);
    expect(isInteractiveTarget({ closest: () => null }, row)).toBe(false);
    expect(isInteractiveTarget({ closest: () => row }, row)).toBe(false);
  });
});

describe("B3 editovatelný sloupec 2.58.0", () => {
  const cols: DataGridColumn<R>[] = [columns[0]!, { id: "pay", label: "Párovat", numeric: true, value: (r) => r.amount, editor: (r) => <GridAmountEditor value={r.amount} onChange={() => {}} ariaLabel={`Editor ${r.id}`} invalid={r.id === "r1"} /> }];
  it("editor se vykreslí jen u vybraných řádků", () => {
    const html = renderToStaticMarkup(<DataGrid storageKey="ed" rows={rows.slice(0, 3)} columns={cols} rowKey={(r) => r.id} selectMode selectedKeys={["r1"]} groupable={false} paginated={false} />).replace(/[\u00a0\u202f]/g, " ");
    expect(html).toContain('aria-label="Editor r1"');
    expect(html).not.toContain('aria-label="Editor r0"');
    expect(html).toContain('data-invalid="true"');
  });
  it("Tab / Shift+Tab přechází mezi editory a převýšení maxima je chyba", () => {
    expect(nextEditorIndex(0, 3, false)).toBe(1);
    expect(nextEditorIndex(1, 3, true)).toBe(0);
    expect(nextEditorIndex(2, 3, false)).toBeNull();
    expect(exceedsMax(100.01, 100)).toBe(true);
    expect(exceedsMax(100, 100)).toBe(false);
  });
});
