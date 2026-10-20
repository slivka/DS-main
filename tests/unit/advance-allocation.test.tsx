/** Přiřazení záloh: meze částek, výběr a potvrzení řízeného dialogu. */
import { afterEach, describe, expect, it } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AdvanceAllocationDialog } from "../../src/components/ds/accounting/advances/advance-allocation-dialog";
import {
  allocationInvalid,
  allocationTotal,
} from "../../src/components/ds/accounting/advances/advance-allocation-model";
import type { AdvanceAllocation } from "../../src/components/ds/accounting/advances/advance-types";
const candidates = [
  { id: "a", document: "ZL 1", remaining: 1000, defaultAmount: 1000 },
  { id: "b", document: "ZL 2", remaining: 815, defaultAmount: 815 },
];
afterEach(cleanup);
describe("AdvanceAllocation", () => {
  it("platba 2 000 dovolí dva ZL 1 000 a 815 bez překročení", () => {
    const value = [
      { id: "a", amount: 1000 },
      { id: "b", amount: 815 },
    ];
    expect(allocationTotal(value)).toBe(1815);
    expect(allocationInvalid(value, candidates, 2000)).toBe(false);
  });
  it("odmítne částku nad zbývající část cíle", () => {
    expect(allocationInvalid([{ id: "b", amount: 816 }], candidates, 2000)).toBe(true);
  });
  it("odmítne součet nad zbývající platbu", () => {
    expect(
      allocationInvalid(
        [
          { id: "a", amount: 1000 },
          { id: "b", amount: 815 },
        ],
        candidates,
        1814,
      ),
    ).toBe(true);
  });
  it("odmítne zápornou, nulovou, nečíselnou částku a neexistující cíl", () => {
    for (const amount of [-1, 0, NaN, Infinity, null])
      expect(allocationInvalid([{ id: "a", amount }], candidates, 2000)).toBe(true);
    expect(allocationInvalid([{ id: "unknown", amount: 1 }], candidates, 2000)).toBe(true);
  });
  it("odmítne duplicitní cíle", () => {
    expect(
      allocationInvalid(
        [
          { id: "a", amount: 1 },
          { id: "a", amount: 1 },
        ],
        candidates,
        2000,
      ),
    ).toBe(true);
  });
  it("výběr použije výchozí částku APP a potvrzení předá stejný návrh", () => {
    let saved: AdvanceAllocation[] = [];
    function Example() {
      const [value, setValue] = useState<AdvanceAllocation[]>([]);
      return (
        <AdvanceAllocationDialog
          open
          onOpenChange={() => {}}
          target="list"
          storageKey="allocation-unit"
          candidates={candidates}
          value={value}
          onChange={setValue}
          remaining={2000}
          currency="EUR"
          onAllocate={(next) => {
            saved = next;
          }}
        />
      );
    }
    render(<Example />);
    expect(screen.getByRole("button", { name: "Přiřadit", exact: true }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(screen.getByRole("textbox", { name: "Částka k přiřazení – ZL 1" })).toHaveValue(
      "1 000,00",
    );
    fireEvent.click(screen.getByRole("button", { name: "Přiřadit", exact: true }));
    expect(saved).toEqual([{ id: "a", amount: 1000 }]);
  });
  it("překročení zablokuje potvrzení", () => {
    let calls = 0;
    render(
      <AdvanceAllocationDialog
        open
        onOpenChange={() => {}}
        target="taxDocument"
        storageKey="allocation-invalid"
        candidates={candidates}
        value={[{ id: "a", amount: 1001 }]}
        onChange={() => {}}
        remaining={2000}
        currency="EUR"
        onAllocate={() => {
          calls++;
        }}
      />,
    );
    const submit = screen.getByRole("button", { name: "Přiřadit", exact: true });
    expect(submit.hasAttribute("disabled")).toBe(true);
    fireEvent.click(submit);
    expect(calls).toBe(0);
  });
  it("načítání a chyba blokují potvrzení platného návrhu", () => {
    const props = {
      open: true,
      onOpenChange: () => {},
      target: "list" as const,
      storageKey: "allocation-loading",
      candidates,
      value: [{ id: "a", amount: 1000 }],
      onChange: () => {},
      remaining: 2000,
      currency: "EUR",
      onAllocate: () => {},
    };
    const view = render(<AdvanceAllocationDialog {...props} loading />);
    expect(screen.getByRole("button", { name: "Přiřadit", exact: true }).hasAttribute("disabled")).toBe(true);
    view.rerender(<AdvanceAllocationDialog {...props} error="Chyba APP" />);
    expect(screen.getByRole("button", { name: "Přiřadit", exact: true }).hasAttribute("disabled")).toBe(true);
  });
});
