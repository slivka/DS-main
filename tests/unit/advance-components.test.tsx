/** Zálohy: řízené akce, oprávnění, lhůta, evidence a návrh opravného DD. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AdvancePaymentBreakdown } from "../../src/components/ds/accounting/advances/advance-payment-breakdown";
import { AdvanceDeductionsSection } from "../../src/components/ds/accounting/advances/advance-deductions-section";
import { AdvanceCorrectionDialog } from "../../src/components/ds/accounting/advances/advance-correction-dialog";
import { AdvanceRegisterGrid } from "../../src/components/ds/accounting/advances/advance-register-grid";
import { AdvanceReasonDialog } from "../../src/components/ds/accounting/advances/advance-reason-dialog";
import type {
  AdvancePaymentPlane,
  AdvancePaymentTotals,
  AdvanceRegisterRow,
} from "../../src/components/ds/accounting/advances/advance-types";
const totals: AdvancePaymentTotals = {
  amount: 2000,
  listAmount: 1815,
  cancelled: 185,
  withoutList: 185,
  taxAmount: 1500,
  noTaxDocument: 0,
  withoutTaxDocument: 500,
  deducted: 1000,
  refunded: 0,
  remaining: 1000,
};
const plane: AdvancePaymentPlane = {
  settlement: [],
  links: {
    groups: [],
    mode: "list",
    onModeChange: () => {},
    collapsedGroups: [],
    onCollapsedGroupsChange: () => {},
    onOpen: () => {},
  },
};
afterEach(cleanup);
describe("AdvancePaymentBreakdown", () => {
  it("ukazuje oba souhrny bez změnového callbacku", () => {
    let calls = 0;
    render(
      <AdvancePaymentBreakdown
        totals={totals}
        currency="EUR"
        planes={{ lists: plane, taxDocuments: plane }}
        taxStatus="partial"
        deadline={{ days: 15, label: "16.10.2026", overdue: true }}
        actions={{
          assignList: {
            can: true,
            onClick: () => {
              calls++;
            },
          },
        }}
      />,
    );
    expect(screen.getAllByText("185,00 EUR").length).toBe(2);
    expect(screen.getByRole("alert")).toHaveTextContent("Lhůta 15 dnů");
    expect(calls).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Přiřadit ZL…" }));
    expect(calls).toBe(1);
  });
  it("zakázané storno nezavolá APP", () => {
    let calls = 0;
    render(
      <AdvancePaymentBreakdown
        totals={totals}
        currency="EUR"
        planes={{ lists: plane, taxDocuments: plane }}
        taxStatus="notIssued"
        deadline={{ days: 15, label: "16.10.2026", overdue: false }}
        actions={{
          cancelRemainder: {
            can: false,
            reason: "Uzavřeno",
            onClick: () => {
              calls++;
            },
          },
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Storno zbytku…" }));
    expect(calls).toBe(0);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
describe("AdvanceDeductionsSection", () => {
  it("navázání DD předá správný otevřený odečet", () => {
    let id = "";
    render(
      <AdvanceDeductionsSection
        storageKey="deductions-unit"
        rows={[
          {
            id: "a",
            vs: "123",
            vatCode: "Z 21 %",
            base: 100,
            vat: 21,
            total: 121,
            payment: "Bez platby",
            status: "open",
            openReason: "Bez DD",
            permissions: { linkTaxDocument: { can: true } },
          },
        ]}
        onAction={(_action, row) => {
          id = row.id;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Navázat DD…" }));
    expect(id).toBe("a");
  });
  it("zakázaná akce nevyvolá změnu", () => {
    let calls = 0;
    render(
      <AdvanceDeductionsSection
        storageKey="deductions-locked"
        rows={[
          {
            id: "a",
            vs: "123",
            vatCode: "Z",
            base: 100,
            vat: 21,
            total: 121,
            payment: "Spárováno",
            status: "closed",
            permissions: { remove: { can: false, reason: "Uzavřeno" } },
          },
        ]}
        onAction={() => {
          calls++;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    expect(calls).toBe(0);
  });
  it("přidání a ruční odečet jsou dvě odlišné akce", () => {
    const calls: string[] = [];
    render(
      <AdvanceDeductionsSection
        storageKey="deductions-actions"
        rows={[]}
        addAction={{ can: true, onClick: () => calls.push("add") }}
        manualAction={{ can: true, onClick: () => calls.push("manual") }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Přidat zálohu…" }));
    fireEvent.click(screen.getByRole("button", { name: "Ruční odečet" }));
    expect(calls).toEqual(["add", "manual"]);
  });
});
describe("AdvanceCorrectionDialog", () => {
  for (const create of [true, false])
    it(`předá rozhodnutí ${create}`, () => {
      const calls: boolean[] = [];
      render(
        <AdvanceCorrectionDialog
          open
          onOpenChange={() => {}}
          storageKey="correction-unit"
          rows={[{ id: "a", document: "DD", base: -100, vat: -21 }]}
          onDecision={(value) => calls.push(value)}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: create ? "Vytvořit" : "Nevytvářet", exact: true }),
      );
      expect(calls).toEqual([create]);
    });
  it("bez náhledu nelze vytvořit, odmítnutí zůstává možné", () => {
    render(
      <AdvanceCorrectionDialog
        open
        onOpenChange={() => {}}
        storageKey="correction-empty"
        rows={[]}
        onDecision={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Vytvořit", exact: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Nevytvářet", exact: true })).not.toBeDisabled();
  });
});
describe("AdvanceRegisterGrid", () => {
  it("filtry pouze předají APP, neodvozují historické zůstatky", () => {
    const changes: string[] = [];
    render(
      <AdvanceRegisterGrid
        storageKey="register-unit"
        rows={[]}
        filters={{ overdue: false, withoutDD: false }}
        onFiltersChange={(value) => changes.push(JSON.stringify(value))}
        asOf={{
          enabled: false,
          onEnabledChange: () => {},
          value: "2026-10-20",
          onChange: () => {},
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Po lhůtě", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Bez DD", exact: true }));
    expect(changes).toEqual([
      '{"overdue":true,"withoutDD":false}',
      '{"overdue":false,"withoutDD":true}',
    ]);
  });
});
describe("AdvanceReasonDialog", () => {
  it("vyžaduje platný důvod před potvrzením", () => {
    const view = render(
      <AdvanceReasonDialog
        open
        onOpenChange={() => {}}
        title="DD nebude"
        reasons={[{ value: "other", label: "Jiný" }]}
        value={{ reason: "", note: "" }}
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Potvrdit", exact: true })).toBeDisabled();
    view.rerender(
      <AdvanceReasonDialog
        open
        onOpenChange={() => {}}
        title="DD nebude"
        reasons={[{ value: "other", label: "Jiný" }]}
        value={{ reason: "other", note: "Text" }}
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Potvrdit", exact: true })).not.toBeDisabled();
  });
});
