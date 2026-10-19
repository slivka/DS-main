import { describe, expect, it } from "bun:test";
import * as React from "react";
import { render } from "@testing-library/react";
import { DocumentForm } from "../../../src/components/ds/accounting/document-form";
describe("dbg", () => {
  it("PO manual ids", () => {
    const view = render(
      <DocumentForm
        title="D" status="draft" documentType="PO"
        value={{ bookId: "b", number: "X1", accountingDate: "2026-10-10", issueDate: "2026-10-10", currency: "CZK", amountTotal: 0 }}
        onChange={() => {}} lines={[]} onLinesChange={() => {}}
        books={[]} accounts={[]} currencies={[{ code: "CZK", symbol: "Kč" }]}
        homeCurrency="CZK" homeCurrencySymbol="Kč" mainSide="D"
        counterpartyInput="manual" onCounterpartyInputChange={() => {}}
      />,
    );
    const ids = [...view.container.querySelectorAll("[id]")].map((n) => n.id).filter((i) => i.includes("bank") || i.includes("Bank"));
    console.log("IDS:", JSON.stringify(ids));
    expect(true).toBe(true);
  });
});
