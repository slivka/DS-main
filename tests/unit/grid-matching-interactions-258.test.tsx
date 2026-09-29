import "./dom-setup";
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DataGrid, type DataGridColumn } from "../../src/components/ds/grid/DataGrid";
import { GridAmountEditor } from "../../src/components/ds/grid/grid-amount-editor";

afterEach(() => cleanup());

function Editor({ initial = 100, max, onValue }: { initial?: number; max?: number; onValue?: (v: number | null) => void }) {
  const [value, setValue] = React.useState<number | null>(initial);
  const invalid = max != null && value != null && value > max;
  return (
    <TooltipProvider>
      <table><tbody><tr>
        <td><GridAmountEditor ariaLabel="A" value={value} invalid={invalid} invalidMessage="Převýšeno" onChange={(v) => { setValue(v); onValue?.(v); }} /></td>
        <td><GridAmountEditor ariaLabel="B" value={5} onChange={() => {}} /></td>
      </tr></tbody></table>
      <output data-testid="val">{String(value)}</output>
    </TooltipProvider>
  );
}

describe("GridAmountEditor – interakce 2.58.0", () => {
  it("Enter potvrdí a následný blur ponechá novou hodnotu", () => {
    const { getByLabelText, getByTestId } = render(<Editor />);
    const input = getByLabelText("A") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(getByTestId("val").textContent).toBe("250");
  });

  it("Esc vrátí původní hodnotu", () => {
    const { getByLabelText, getByTestId } = render(<Editor />);
    const input = getByLabelText("A") as HTMLInputElement;
    act(() => input.focus());
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
    expect(getByTestId("val").textContent).toBe("100");
  });

  it("Tab přejde na další editor", () => {
    const { getByLabelText } = render(<Editor />);
    const a = getByLabelText("A") as HTMLInputElement;
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "Tab" });
    expect(document.activeElement).toBe(getByLabelText("B"));
  });

  it("změna platnosti nepřemontuje input a fokus zůstane", () => {
    const { getByLabelText } = render(<Editor max={200} />);
    const input = getByLabelText("A") as HTMLInputElement;
    act(() => input.focus());
    fireEvent.change(input, { target: { value: "300" } });
    fireEvent.keyDown(input, { key: "Enter" });
    const after = getByLabelText("A");
    expect(after).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.closest("[data-slot=grid-amount-editor]")?.getAttribute("data-invalid")).toBe("true");
  });
});

type R = { id: string; name: string; amount: number };
const columns: DataGridColumn<R>[] = [
  { id: "name", label: "Název", value: (r) => r.name },
  { id: "amount", label: "Částka", numeric: true, decimals: 2, value: (r) => r.amount },
];

describe("DataGrid – řízený výběr, interakce 2.58.0", () => {
  it("klik na řádek v selectMode volá onSelectedKeysChange", () => {
    const calls: string[][] = [];
    const rows: R[] = [{ id: "a", name: "Alfa", amount: 1 }, { id: "b", name: "Beta", amount: 2 }];
    const { getByText } = render(
      <DataGrid storageKey="sel-click" rows={rows} columns={columns} rowKey={(r) => r.id} selectMode selectedKeys={[]} onSelectedKeysChange={(k) => calls.push(k)} paginated={false} />,
    );
    fireEvent.click(getByText("Beta"));
    expect(calls.at(-1)).toEqual(["b"]);
  });

  it("klíč zmizelého řádku se v callbacku neposílá", () => {
    const calls: string[][] = [];
    const rows: R[] = [{ id: "a", name: "Alfa", amount: 1 }, { id: "b", name: "Beta", amount: 2 }];
    const { getByText } = render(
      <DataGrid storageKey="sel-gone" rows={rows} columns={columns} rowKey={(r) => r.id} selectMode selectedKeys={["a", "zmizel"]} onSelectedKeysChange={(k) => calls.push(k)} paginated={false} />,
    );
    fireEvent.click(getByText("Beta"));
    expect(calls.at(-1)?.sort()).toEqual(["a", "b"]);
  });
});
