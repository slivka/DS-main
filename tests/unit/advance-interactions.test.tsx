/** Interakce záloh: potvrzení odstranění, předání důvodu a řezu k datu. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AdvanceDeductionsSection } from "../../src/components/ds/accounting/advances/advance-deductions-section";
import { AdvanceReasonDialog } from "../../src/components/ds/accounting/advances/advance-reason-dialog";
import { AdvanceRegisterGrid } from "../../src/components/ds/accounting/advances/advance-register-grid";
import { allocationInvalid } from "../../src/components/ds/accounting/advances/advance-allocation-model";
afterEach(cleanup);
describe("Advance interactions", () => {
  it("odebrání se předá teprve po potvrzení", () => {
    const calls: string[] = [];
    render(
      <AdvanceDeductionsSection
        storageKey="remove-advance"
        rows={[
          {
            id: "a",
            vs: "123",
            vatCode: "Z",
            base: 100,
            vat: 21,
            total: 121,
            payment: "Bez platby",
            status: "open",
            permissions: { remove: { can: true } },
          },
        ]}
        onAction={(action) => calls.push(action)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Odebrat", exact: true }));
    expect(calls).toEqual([]);
    const dialog = screen.getByRole("alertdialog");
    const button = Array.from(dialog.querySelectorAll("button")).find(
      (item) => item.textContent === "Odebrat",
    );
    if (!button) throw new Error("Chybí potvrzení odstranění");
    fireEvent.click(button);
    expect(calls).toEqual(["remove"]);
  });
  it("potvrzení důvodu předá výběr i text beze změny", () => {
    const calls: string[] = [];
    render(
      <AdvanceReasonDialog
        open
        onOpenChange={() => {}}
        title="DD nebude"
        reasons={[{ value: "other", label: "Jiný důvod" }]}
        value={{ reason: "other", note: "Důvod APP" }}
        onChange={() => {}}
        onConfirm={(value) => calls.push(`${value.reason}:${value.note}`)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Potvrdit", exact: true }));
    expect(calls).toEqual(["other:Důvod APP"]);
  });
  it("řez k datu předá přepnutí APP", () => {
    const changes: boolean[] = [];
    render(
      <AdvanceRegisterGrid
        storageKey="advance-cutoff"
        rows={[]}
        filters={{ overdue: false, withoutDD: false }}
        onFiltersChange={() => {}}
        asOf={{
          enabled: false,
          onEnabledChange: (value) => changes.push(value),
          value: "2026-10-20",
          onChange: () => {},
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Stav k datu/ }));
    expect(changes).toEqual([true]);
  });
  it("odmítnutí kandidáta chybějícího po aktualizaci brání uložení", () => {
    expect(allocationInvalid([{ id: "a", amount: 100 }], [], 2000)).toBe(true);
  });
});
