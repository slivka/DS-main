import { describe, expect, it } from "bun:test";

import { resolveJournalColumnLayout } from "../../src/components/ds/accounting/journal-lines-editor";

const poColumns = ["row", "text", "counterAccountName", "quantity", "unitId", "unitPrice", "amount", "dimensionId", "actions"] as const;
const idColumns = ["row", "text", "debitAccountName", "creditAccountName", "quantity", "unitId", "unitPrice", "amount", "debitDimensionId", "creditDimensionId", "actions"] as const;

describe("JournalLinesEditor adaptivní sloupce 2.43.0", () => {
  it("přesouvá PO skupiny podle skutečného součtu šířek", () => {
    expect(resolveJournalColumnLayout({ availableWidthRem: 90, mode: "mainAccount", visibleColumnIds: [...poColumns] }).hiddenColumnIds).toEqual([]);
    const withoutDimension = resolveJournalColumnLayout({ availableWidthRem: 70, mode: "mainAccount", visibleColumnIds: [...poColumns] });
    expect(withoutDimension.hiddenColumnIds).toEqual([]);
    expect(withoutDimension.compactAccounts).toBe(true);
    const compact = resolveJournalColumnLayout({ availableWidthRem: 35, mode: "mainAccount", visibleColumnIds: [...poColumns] });
    expect(compact.hiddenColumnIds).toEqual(["quantity", "unitId", "unitPrice", "dimensionId"]);
    expect(compact.compactAccounts).toBe(true);
  });

  it("přesouvá u ID obě zakázky a zúží oba účty", () => {
    const layout = resolveJournalColumnLayout({ availableWidthRem: 40, mode: "internal", visibleColumnIds: [...idColumns] });
    expect(layout.hiddenColumnIds).toEqual(["quantity", "unitId", "unitPrice", "debitDimensionId", "creditDimensionId"]);
    expect(layout.compactAccounts).toBe(true);
  });

  it("přesouvá v režimu shared společného partnera, VS a zakázku do detailu", () => {
    const layout = resolveJournalColumnLayout({ availableWidthRem: 40, mode: "internal", sharedSideFields: true, visibleColumnIds: ["row", "text", "debitAccount", "creditAccount", "amount", "dimensionId", "vs", "partnerId", "actions"] });
    expect(layout.hiddenColumnIds).toEqual(["partnerId", "vs", "dimensionId"]);
  });

  it("započítá vlastní uloženou šířku a vždy rezervuje Textu 12 rem", () => {
    const layout = resolveJournalColumnLayout({ availableWidthRem: 60, mode: "mainAccount", visibleColumnIds: ["row", "text", "counterAccount", "amount", "dimensionId", "actions"], widths: { amount: 20, text: 40 } });
    expect(layout.hiddenColumnIds).toEqual([]);
    expect(layout.requiredWidthRem).toBe(58.75);
  });
});