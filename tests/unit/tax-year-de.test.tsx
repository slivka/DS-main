/** DE-4 až DE-6: řízená prezentace bez výpočtů a bez technických účtů. */
import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  TaxBookView,
  TaxAssetCard,
  TaxInternalMovementFields,
  TransportAllowanceGrid,
  TaxYearCloseWizard,
  TaxReturnOutput,
  TaxYearCarryForward,
  taxYearCloseBlocked,
  type TaxBookEntry,
} from "../../src/components/ds";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DsTextsProvider, DS_TEXTS_SK } from "../../src/ds-texts";
const entry: TaxBookEntry = {
  id: "e1",
  date: "2026-11-01",
  paymentDocumentId: "p1",
  paymentDocument: "BA1",
  invoiceId: "dd1",
  invoice: "DD2026001",
  item: "Tržby",
  treatment: "taxable",
  amount: 1210,
  currency: "CZK",
  movementAmount: 1210,
  vat: 210,
  base: 1000,
  kind: "advance_tax_document",
};
const wrap = (ui: React.ReactNode) => render(<TooltipProvider>{ui}</TooltipProvider>);
test("kniha ukáže typ zápisu a rozpočet Základ / DPH / Celkem z dat APP", () => {
  const open = mock();
  wrap(<TaxBookView rows={[entry]} homeCurrency="CZK" onDocumentOpen={open} storageKey="t-de4" />);
  expect(screen.getAllByText("Daňový doklad k záloze").length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Základ · CZK/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Celkem · CZK/).length).toBeGreaterThan(0);
  expect(screen.getAllByText("1 000,00").length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "DD2026001" }));
  expect(open).toHaveBeenCalledWith("dd1");
});
test("kniha bez typu a základu zachová původní sloupce", () => {
  wrap(
    <TaxBookView
      rows={[{ ...entry, kind: undefined, base: undefined }]}
      homeCurrency="CZK"
      storageKey="t-de4b"
    />,
  );
  expect(screen.queryByText(/Základ · CZK/)).toBeNull();
  expect(screen.queryByText("Typ zápisu")).toBeNull();
});
test("karta majetku ukáže daňovou řadu, drobný majetek jen poznámku", () => {
  const { unmount } = wrap(
    <TaxAssetCard
      currency="CZK"
      asset={{
        name: "Auto",
        acquisitionPrice: 600000,
        series: [{ year: 2026, depreciation: 66000, residualValue: 534000 }],
      }}
    />,
  );
  expect(screen.getAllByText("534 000,00").length).toBeGreaterThan(0);
  expect(screen.queryByText(/účet/i)).toBeNull();
  unmount();
  wrap(
    <TaxAssetCard
      currency="CZK"
      asset={{ name: "PC", acquisitionPrice: 40000, lowValue: true, series: [] }}
    />,
  );
  expect(screen.getByText(/neodepisuje/)).toBeTruthy();
  expect(screen.queryByText("Daňové odpisy")).toBeNull();
});
test("přeřazení nabídne dvě položky, nepeněžní pohyb jednu; důvod se předá", () => {
  const change = mock();
  const items = [
    { id: "a", label: "A" },
    { id: "t", label: "Tajný", technical: true },
  ];
  const { rerender } = wrap(
    <TaxInternalMovementFields
      value={{ kind: "transfer" }}
      onChange={change}
      items={items}
      currency="CZK"
    />,
  );
  expect(screen.getAllByText("Z položky").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Na položku").length).toBeGreaterThan(0);
  rerender(
    <TooltipProvider>
      <TaxInternalMovementFields
        value={{ kind: "non_cash_income" }}
        onChange={change}
        items={items}
        currency="CZK"
      />
    </TooltipProvider>,
  );
  expect(screen.queryByText("Z položky")).toBeNull();
  fireEvent.change(screen.getByLabelText("Důvod"), { target: { value: "Dar" } });
  expect(change).toHaveBeenCalledWith({ kind: "non_cash_income", reason: "Dar" });
  expect(screen.queryByText("Tajný")).toBeNull();
});
test("paušál na dopravu: zákaz zobrazí důvod a akci nespustí", () => {
  const create = mock();
  wrap(
    <TransportAllowanceGrid
      currency="CZK"
      months={[{ id: "01", label: "Leden" }]}
      vehicles={[{ id: "v", label: "Octavia" }]}
      cells={[{ monthId: "01", vehicleId: "v", count: 1, amount: 5000 }]}
      onCreateDocuments={create}
      disabledReason="Nelze při výdajích procentem"
    />,
  );
  expect(screen.getByText("5 000,00")).toBeTruthy();
  expect(screen.getByText("Nelze při výdajích procentem")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Vytvořit interní doklady" }));
  expect(create).not.toHaveBeenCalled();
});
test("uzavření roku: blokující kontrola brání, informační ne", () => {
  expect(taxYearCloseBlocked([{ id: "a", title: "x", severity: "info" }])).toBe(false);
  expect(taxYearCloseBlocked([{ id: "a", title: "x", severity: "blocking" }])).toBe(true);
  const close = mock();
  const { rerender } = wrap(
    <TaxYearCloseWizard
      year={2026}
      checks={[{ id: "u", title: "Nezařazené úhrady", severity: "blocking" }]}
      onCloseYear={close}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Uzavřít rok" }));
  expect(close).not.toHaveBeenCalled();
  rerender(
    <TooltipProvider>
      <TaxYearCloseWizard
        year={2026}
        checks={[{ id: "r", title: "Pohledávky", severity: "info" }]}
        onCloseYear={close}
      />
    </TooltipProvider>,
  );
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Uzavřít rok" }));
  expect(close).toHaveBeenCalledTimes(1);
  rerender(
    <TooltipProvider>
      <TaxYearCloseWizard
        year={2026}
        checks={[]}
        onCloseYear={close}
        result={{ status: "success" }}
      />
    </TooltipProvider>,
  );
  expect(screen.getByText("Rok byl uzavřen.")).toBeTruthy();
});
test("výstup pro přiznání ukáže řádky a proklik", () => {
  const open = mock();
  wrap(
    <TaxReturnOutput
      year={2026}
      currency="CZK"
      rows={[{ id: "l", line: "101", label: "Příjmy § 7", amount: 1250000 }]}
      onLineOpen={open}
    />,
  );
  expect(screen.getAllByText("1 250 000,00").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Příjmy § 7").length).toBeGreaterThan(0);
});
test("převod do dalšího roku: stav a akce, slovenské texty", () => {
  const run = mock();
  render(
    <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
      <TooltipProvider>
        <TaxYearCarryForward fromYear={2026} status="ready" onCarryForward={run} />
      </TooltipProvider>
    </DsTextsProvider>,
  );
  expect(screen.getByText("Pripravené")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Previesť do ďalšieho roka" }));
  expect(run).toHaveBeenCalledTimes(1);
});
