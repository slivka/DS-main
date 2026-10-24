import { expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DocumentForm, type DocumentHeaderValue } from "@/components/ds/accounting/document-form";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DsTextsProvider } from "@/ds-texts";
const value: DocumentHeaderValue = {
  accountingDate: "2026-10-24",
  issueDate: "2026-10-24",
  currency: "EUR",
  totalMode: "entered",
  amountTotal: 1200,
};
for (const documentType of ["FP", "ZFP", "ID"]) {
  test(`DocumentForm ${documentType}: dimenze jsou oddělené od categories a detail má správné strany`, async () => {
    let headerChanges = 0;
    render(
      <TooltipProvider>
        <DocumentForm
          title="Doklad"
          documentType={documentType}
          status="draft"
          value={value}
          onChange={() => {}}
          lines={[{ id: "r", text: "A", amount: 1200 }]}
          onLinesChange={() => {}}
          books={[]}
          accounts={[]}
          homeCurrency="EUR"
          categories={[{ id: "cat", name: "Provoz" }]}
          dimensionTypes={[{ id: "vehicle", label: "Vozidlo", order: 1 }]}
          dimensions={[{ typeId: "vehicle", valueId: "a", label: "Auto A", kind: "vehicle" }]}
          onDimensionsChange={() => {
            headerChanges++;
          }}
          loadDimensionOptions={async () => [{ id: "b", label: "Auto B", kind: "vehicle" }]}
        />
      </TooltipProvider>,
    );
    const bar = screen.getByRole("group", { name: "Dimenze" });
    expect(bar).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox", { name: "Vozidlo: Auto A" }));
    fireEvent.click(await screen.findByRole("option", { name: "Auto B" }));
    expect(headerChanges).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Zobrazit detail řádku (Alt+↓)" }));
    await waitFor(() =>
      expect(screen.getAllByRole("combobox", { name: "Vozidlo: Auto A" }).length).toBe(
        documentType === "ID" ? 3 : 2,
      ),
    );
    if (documentType === "ID") {
      expect(screen.getByRole("group", { name: "Dimenze MD" })).toBeTruthy();
      expect(screen.getByRole("group", { name: "Dimenze DAL" })).toBeTruthy();
    }
  });
}
test("DocumentForm readOnly nepřepíše hlavičku ani řádky a umožní přečíst hodnotu", () => {
  let changes = 0;
  render(
    <TooltipProvider>
      <DsTextsProvider locale="sk">
        <DocumentForm
          title="Doklad"
          documentType="ID"
          status="posted"
          readOnly
          value={value}
          onChange={() => changes++}
          lines={[{ id: "r", text: "A", amount: 1200 }]}
          onLinesChange={() => changes++}
          books={[]}
          accounts={[]}
          homeCurrency="EUR"
          dimensionTypes={[{ id: "vehicle", label: "Vozidlo", order: 1 }]}
          dimensions={[{ typeId: "vehicle", valueId: "a", label: "Auto A" }]}
          onDimensionsChange={() => changes++}
          loadDimensionOptions={async () => []}
        />
      </DsTextsProvider>
    </TooltipProvider>,
  );
  const chip = screen.getByRole("combobox", { name: "Vozidlo: Auto A" });
  fireEvent.keyDown(chip, { key: "Delete" });
  fireEvent.click(chip);
  expect(changes).toBe(0);
  expect(screen.queryByRole("option")).toBeNull();
});
