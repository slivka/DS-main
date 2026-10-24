/** Banka I3 a I7 · rozpis výpisu a dávka plateb · nesmí testovat doménu aplikace. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { BankStatementReconcileView } from "../../src/components/ds/bank/bank-statement-reconcile-view";
import { PaymentOrderBatchView } from "../../src/components/ds/bank/payment-order-batch-view";
import type { BankMovementRow, PaymentOrderRow } from "../../src/components/ds/bank/bank-types";

afterEach(cleanup);

const rows: BankMovementRow[] = [
  {
    id: "a",
    order: 1,
    date: "2026-10-10",
    direction: "in",
    amount: 12100,
    currency: "CZK",
    status: "certain",
    message: "Úhrada A",
  },
  {
    id: "b",
    order: 2,
    date: "2026-10-11",
    direction: "out",
    amount: 500,
    currency: "CZK",
    status: "suggestion",
    message: "Záloha B",
    suggestion: {
      accountCode: "311001",
      candidates: [{ id: "c1", label: "FV1", amount: 500, remaining: 500 }],
      candidateId: "c1",
    },
  },
  {
    id: "c",
    order: 3,
    date: "2026-10-12",
    direction: "out",
    amount: 90,
    currency: "CZK",
    status: "unrecognized",
    message: "Poplatek C",
  },
];

function renderView(over: Partial<Parameters<typeof BankStatementReconcileView>[0]> = {}) {
  const props = {
    storageKey: "test-bank-reconcile",
    rows,
    accounts: [],
    partners: [],
    onPatch: mock(() => {}),
    onAcceptSuggestion: mock(() => {}),
    onRejectSuggestion: mock(() => {}),
    onFileCertain: mock(() => {}),
    onFileSelected: mock(() => {}),
    onRecognize: mock(() => {}),
    onCreateRule: mock(() => {}),
    onOpenDocument: mock(() => {}),
    summary: {
      opening: 1000,
      income: 12100,
      expense: 590,
      closing: 12510,
      bankClosing: 12500,
      currencySymbol: "Kč",
    },
    ...over,
  };
  return { props, ...render(<BankStatementReconcileView {...props} />) };
}

describe("BankStatementReconcileView", () => {
  it("filtr stavu zúží řádky a počty odpovídají stavům", () => {
    const { getByRole, queryByText } = renderView();
    expect(getByRole("button", { name: /Jisté \(1\)/ })).toBeTruthy();
    fireEvent.click(getByRole("button", { name: /Nerozpoznané \(1\)/ }));
    expect(queryByText("Poplatek C")).toBeTruthy();
    expect(queryByText("Úhrada A")).toBeNull();
  });

  it("Zařadit vše jisté volá onFileCertain; readOnly akci zablokuje", () => {
    const { props, getByRole } = renderView();
    fireEvent.click(getByRole("button", { name: /Zařadit vše jisté/ }));
    expect(props.onFileCertain).toHaveBeenCalledTimes(1);
    cleanup();
    const ro = renderView({ readOnly: true });
    const filed = ro.queryByRole("button", {
      name: /Zařadit vše jisté/,
    }) as HTMLButtonElement | null;
    expect(filed === null || filed.disabled).toBe(true);
  });

  it("souhrn ukazuje rozdíl proti bance s oddělenými tisíci", () => {
    const { container } = renderView();
    const text = container.textContent ?? "";
    expect(text).toContain("Rozdíl");
    expect(text.replace(/\s/g, " ")).toContain("12 510,00");
  });
});

const payments: PaymentOrderRow[] = [
  {
    id: "p1",
    partnerName: "Alza",
    documentNumber: "FP1",
    dueDate: "2026-10-20",
    amount: 1000,
    remaining: 1000,
    currency: "CZK",
    currencySymbol: "Kč",
    partnerAccountId: "acc1",
    paymentDate: "2026-10-24",
  },
  {
    id: "p2",
    partnerName: "Karet",
    documentNumber: "FP2",
    dueDate: "2026-10-21",
    amount: 200,
    remaining: 200,
    currency: "EUR",
    currencySymbol: "€",
    partnerAccountId: null,
    paymentDate: "2026-10-24",
    checks: [{ id: "x", severity: "error", title: "Chybí účet partnera" }],
  },
];

function renderBatch() {
  const onCreateFile = mock(() => {});
  const utils = render(
    <PaymentOrderBatchView
      storageKey="test-payment-batch"
      rows={payments}
      partnerAccounts={() => [{ id: "acc1", label: "123/0800" }]}
      onPatch={() => {}}
      formats={[{ id: "abo", label: "ABO" }]}
      onCreateFile={onCreateFile}
      today="2026-10-24"
    />,
  );
  return { onCreateFile, ...utils };
}

describe("PaymentOrderBatchView", () => {
  it("bez výběru je Vytvořit soubor zakázané", () => {
    const { getByRole } = renderBatch();
    expect(
      (getByRole("button", { name: "Vytvořit soubor příkazu" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("chybová kontrola blokuje soubor, bezchybný řádek ho povolí", () => {
    const { getByRole, getAllByRole } = renderBatch();
    const select = getByRole("button", { name: "Vybrat více" });
    fireEvent.click(select);
    const rowOf = (name: string) => getAllByRole("row").find((r) => r.textContent?.includes(name))!;
    fireEvent.click(within(rowOf("Karet")).getByRole("checkbox"));
    const create = getByRole("button", { name: "Vytvořit soubor příkazu" }) as HTMLButtonElement;
    expect(create.disabled).toBe(true);
    fireEvent.click(within(rowOf("Karet")).getByRole("checkbox"));
    fireEvent.click(within(rowOf("Alza")).getByRole("checkbox"));
    expect(
      (getByRole("button", { name: "Vytvořit soubor příkazu" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});
