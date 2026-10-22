/** Formáty sloupců: persistence, pohledy a sanitace. */
import { describe, expect, it } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useGridColumns } from "../../src/components/ds/grid/grid-columns";
import { getGridLayout, updateGridLayout } from "../../src/lib/grid-prefs";
import { ColumnPicker } from "../../src/components/ds/grid/column-picker";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { sanitizeColumnStyle } from "../../src/lib/column-tones";
const columns = [
  { id: "amount", label: "Částka", defaultStyle: { bold: true } },
  { id: "partner", label: "Partner" },
  { id: "actions", label: "Akce" },
  { id: "temporary", label: "Dočasný", transient: true },
  { id: "indicators", label: "Indikátory", type: "record-indicators" },
  { id: "lockedFormat", label: "Neměnit", styleable: false },
];
describe("useGridColumns formát", () => {
  it("obnoví uložený tón, výchozí tučně a ignoruje neznámý tón", () => {
    updateGridLayout("styles", { styles: { partner: { tone: "blue-soft" } } });
    const { result } = renderHook(() => useGridColumns("styles", columns));
    expect(result.current.styles.amount).toEqual({ bold: true });
    expect(result.current.styles.partner).toEqual({ tone: "blue-soft" });
    expect(sanitizeColumnStyle({ tone: "unknown-strong", bold: true })).toEqual({ bold: true });
  });
  it("zápis sdílí dva gridy a přežije nové připojení", () => {
    const a = renderHook(() => useGridColumns("shared", columns));
    const b = renderHook(() => useGridColumns("shared", columns));
    act(() => a.result.current.setColumnStyle("partner", { tone: "purple-strong", bold: true }));
    expect(b.result.current.styles.partner).toEqual({ tone: "purple-strong", bold: true });
    a.unmount();
    const c = renderHook(() => useGridColumns("shared", columns));
    expect(c.result.current.styles.partner).toEqual(b.result.current.styles.partner);
  });
  it("pohled uloží a obnoví styly i výslovné vypnutí defaultStyle", () => {
    const { result } = renderHook(() => useGridColumns("views", columns));
    act(() => result.current.setColumnStyle("amount", null));
    act(() => result.current.setColumnStyle("partner", { tone: "teal-soft" }));
    act(() => result.current.views.save("Barevný"));
    const id = result.current.views.views[0]?.id;
    expect(id).toBeDefined();
    act(() => result.current.setColumnStyle("partner", { tone: "yellow-strong" }));
    if (!id) throw new Error("Pohled chybí");
    act(() => result.current.views.apply(id));
    expect(result.current.styles.partner).toEqual({ tone: "teal-soft" });
    expect(result.current.styles.amount).toEqual({});
  });
  it("vlastní výchozí obnoví formát, tovární vrátí defaultStyle", () => {
    const { result } = renderHook(() => useGridColumns("default", columns));
    act(() => result.current.setColumnStyle("partner", { tone: "orange-soft" }));
    act(() => result.current.saveDefault());
    act(() => result.current.clearColumnStyles());
    act(() => result.current.reset());
    expect(result.current.styles.partner).toEqual({ tone: "orange-soft" });
    act(() => result.current.clearDefault());
    act(() => result.current.reset());
    expect(result.current.styles.amount).toEqual({ bold: true });
    expect(result.current.styles.partner).toBeUndefined();
  });
  it("neukládá systémové, transient ani zakázané sloupce", () => {
    const { result } = renderHook(() => useGridColumns("system", columns));
    for (const id of ["actions", "temporary", "indicators", "lockedFormat"]) {
      act(() => result.current.setColumnStyle(id, { bold: true, tone: "pink-strong" }));
      expect(getGridLayout("system").styles?.[id]).toBeUndefined();
    }
  });
  it("Zrušit formát všech vypne i výchozí styly po opětovném připojení", () => {
    const hook = renderHook(() => useGridColumns("clear", columns));
    act(() => hook.result.current.clearColumnStyles());
    hook.unmount();
    const { result } = renderHook(() => useGridColumns("clear", columns));
    expect(Object.values(result.current.styles).some((style) => style.bold || style.tone)).toBe(
      false,
    );
  });
});
it("ColumnPicker mění formát a nabízí hromadné zrušení", () => {
  function Picker() {
    const cols = useGridColumns("picker", columns);
    return (
      <TooltipProvider>
        <ColumnPicker
          columns={cols.columns}
          visible={cols.visible}
          onToggle={cols.toggle}
          onReset={cols.reset}
          styles={cols.styles}
          onColumnStyleChange={cols.setColumnStyle}
          onClearColumnStyles={cols.clearColumnStyles}
        />
      </TooltipProvider>
    );
  }
  render(<Picker />);
  fireEvent.click(screen.getByRole("button", { name: "Sloupce" }));
  fireEvent.click(screen.getByRole("button", { name: "Formát sloupce Partner" }));
  fireEvent.click(screen.getByRole("button", { name: "Modrá světlá" }));
  expect(getGridLayout("picker").styles?.partner).toEqual({ tone: "blue-soft" });
  fireEvent.click(screen.getByRole("button", { name: "Zrušit formát všech sloupců" }));
  expect(getGridLayout("picker").styles?.partner).toEqual({});
});
