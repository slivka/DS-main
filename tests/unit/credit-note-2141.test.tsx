/** Dobropisy 2.141.0: záporný kalendář, generátor, pozastávka a pole Opravuje doklad. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { generatePaymentSchedule, sumPaymentSchedule } = await import(
  "../../src/components/ds/accounting/payment-schedule"
);
const { PaymentScheduleEditor } = await import(
  "../../src/components/ds/accounting/payment-schedule-editor"
);
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");

afterEach(cleanup);
const noop = () => {};

describe("generátor splátek – záporný celek (dobropis)", () => {
  it("−1 210 / 3 → −403,33 −403,33 −403,34 (zbytek v poslední)", () => {
    const items = generatePaymentSchedule(-1210, {
      count: 3,
      firstDueDate: "2026-11-01",
      interval: "month",
    });
    expect(items.map((i) => i.amount)).toEqual([-403.33, -403.33, -403.34]);
    expect(sumPaymentSchedule(items)).toBe(-1210);
  });
  it("kladný celek se chová beze změny", () => {
    const items = generatePaymentSchedule(1210, {
      count: 3,
      firstDueDate: "2026-11-01",
      interval: "month",
    });
    expect(items.map((i) => i.amount)).toEqual([403.33, 403.33, 403.34]);
  });
  it("pozastávka u záporného celku je záporná a nepřepne znaménko", () => {
    const items = generatePaymentSchedule(-1000, {
      count: 2,
      firstDueDate: "2026-11-01",
      interval: "month",
      retentionAmount: -100,
    });
    const retention = items.find((i) => i.kind === "retention");
    expect(retention?.amount).toBe(-100);
    expect(sumPaymentSchedule(items)).toBe(-1000);
    expect(items.filter((i) => i.kind === "installment").every((i) => i.amount < 0)).toBe(true);
  });
  it("pozastávka v procentech u záporného celku je záporná", () => {
    const items = generatePaymentSchedule(-1000, {
      count: 1,
      firstDueDate: "2026-11-01",
      interval: "month",
      retentionPercent: 10,
    });
    expect(items.find((i) => i.kind === "retention")?.amount).toBe(-100);
    expect(sumPaymentSchedule(items)).toBe(-1000);
  });
});

describe("editor kalendáře – záporný a smíšený doklad", () => {
  it("Přidat u záporného celku předvyplní záporný zbytek, ne nulu", () => {
    let next: Array<{ amount: number }> = [];
    render(
      <TooltipProvider><PaymentScheduleEditor
        items={[]}
        onChange={(items) => {
          next = items;
        }}
        totalToPay={-500}
      /></TooltipProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Přidat" }));
    expect(next[0]?.amount).toBe(-500);
  });
  it("kontrola součtu splátek platí se znaménkem (záporný celek vyrovnan)", () => {
    render(
      <TooltipProvider><PaymentScheduleEditor
        items={[
          { kind: "installment", dueDate: "2026-11-01", amount: -300 },
          { kind: "installment", dueDate: "2026-12-01", amount: -200 },
        ]}
        onChange={noop}
        totalToPay={-500}
      /></TooltipProvider>,
    );
    expect(screen.getByTestId("payment-unallocated").textContent?.trim()).toBe("0,00");
    expect(screen.getByTestId("payment-total").textContent?.trim()).toBe("−500,00");
  });
  it("smíšený kalendář ukáže záporný zbytek se znaménkem", () => {
    render(
      <TooltipProvider><PaymentScheduleEditor
        items={[{ kind: "installment", dueDate: "2026-11-01", amount: -300 }]}
        onChange={noop}
        totalToPay={-500}
      /></TooltipProvider>,
    );
    expect(screen.getByTestId("payment-unallocated").textContent?.trim()).toBe("−200,00");
  });
});

function DocForm(props: Partial<React.ComponentProps<typeof DocumentForm>>) {
  const [value, setValue] = React.useState({
    currency: "CZK",
    amountTotal: 0,
    totalMode: "entered" as const,
  });
  return (
    <DocumentForm
      title="Doklad"
      status="draft"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={noop}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      {...props}
    />
  );
}

const CORRECTS = {
  value: "doc-1",
  options: [
    { value: "doc-1", label: "FV 2026-0001" },
    { value: "doc-2", label: "FV 2026-0002" },
  ],
};

describe("Opravuje doklad", () => {
  it("FV s correctsDocument zobrazí pole s vybraným dokladem a odkazem na otevření", () => {
    const onOpen = mock(noop);
    const view = render(
      <DocForm documentType="FV" correctsDocument={{ ...CORRECTS, onChange: noop, onOpen }} />,
    );
    expect(view.getByText("Opravuje doklad")).toBeTruthy();
    expect(view.getByText("FV 2026-0001")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Opravuje doklad" }));
    expect(onOpen).toHaveBeenCalledWith("doc-1");
  });
  it("bez props se pole nezobrazí", () => {
    const view = render(<DocForm documentType="FV" />);
    expect(view.queryByText("Opravuje doklad")).toBeNull();
  });
  it("lockedReason vykreslí hodnotu jen pro čtení se zámkem", () => {
    const view = render(
      <DocForm
        documentType="FP"
        correctsDocument={{ ...CORRECTS, onChange: noop, lockedReason: "Zaúčtováno" }}
      />,
    );
    expect(view.getByText("FV 2026-0001")).toBeTruthy();
    expect(view.queryByRole("combobox", { name: "Opravuje doklad" })).toBeNull();
  });
});
