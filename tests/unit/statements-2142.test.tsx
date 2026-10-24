/** Výkazy (2.142.0): FinancialStatementView, SavedStatementList, StatementSaveDialog, šablona. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";

const { cleanup, render, fireEvent } = await import("@testing-library/react");
const m = await import("../../src/components/ds/statements");
const { DS_TEXTS_SK, DsTextsProvider } = await import("../../src/ds-texts");

afterEach(cleanup);

const rows: import("../../src/components/ds/statements").StatementRow[] = [
  { id: "A", mark: "A.", label: "Aktiva", kind: "sum", values: { full: { c: 1_234_567.5 }, thousands: { c: 1_235 } }, rounded: true },
  { id: "A1", parentId: "A", mark: "A.I.", label: "Majetek", kind: "mapped", values: { full: { c: 1_234_567.5 }, thousands: { c: 1_235 } } },
];

describe("FinancialStatementView", () => {
  it("jen nesoučtové řádky jsou upravitelné a jen v režimu úprav", () => {
    expect(m.isStatementRowEditable(rows[0]!, true)).toBe(false);
    expect(m.isStatementRowEditable(rows[1]!, true)).toBe(true);
    expect(m.isStatementRowEditable(rows[1]!, false)).toBe(false);
  });
  it("jednotky nesou měnu z dat", () => {
    expect(m.statementUnitLabel("tis. {currency}", "EUR")).toBe("tis. EUR");
  });
  it("přepnutí na tisíce ukáže hodnoty APP bez desetin a s oddělením tisíců", () => {
    const view = render(
      <m.FinancialStatementView kind="balance" currency="Kč" rows={rows} columns={[{ id: "c", label: "Běžné" }]} />,
    );
    expect(view.container.textContent).toContain("1 234 567,50");
    fireEvent.click(view.getByRole("radio", { name: "tis. Kč" }));
    expect(view.container.querySelector('[data-unit="thousands"]')).not.toBeNull();
    expect(view.container.textContent).toContain("1 235");
  });
  it("dorovnaný řádek má ikonu s popisem", () => {
    const view = render(
      <m.FinancialStatementView kind="balance" currency="Kč" rows={rows} columns={[{ id: "c", label: "Běžné" }]} />,
    );
    expect(view.getAllByRole("img", { name: /dorovnán/ }).length).toBe(1);
  });
  it("kontroly zobrazí stav a rozdíl od APP", () => {
    const view = render(
      <m.StatementChecksBar checks={[{ kind: "balance", ok: true }, { kind: "profit", ok: false, difference: 1 }]} />,
    );
    expect(view.container.querySelector('[data-check="profit"]')?.getAttribute("data-ok")).toBe("false");
    expect(view.container.textContent).toContain("Aktiva = Pasiva");
  });
});

describe("Šablona výkazu", () => {
  const tpl = [
    { id: "a", mark: "A.", label: "A", kind: "sum" as const, mapping: [] },
    { id: "b", parentId: "a", mark: "A.I.", label: "B", kind: "mapped" as const, mapping: [] },
    { id: "c", parentId: "b", mark: "1.", label: "C", kind: "mapped" as const, mapping: [] },
  ];
  it("přesun zachová ostatní pořadí", () => {
    expect(m.moveTemplateRow(tpl, 2, 0).map((r) => r.id)).toEqual(["c", "a", "b"]);
    expect(m.moveTemplateRow(tpl, 0, 9)).toBe(tpl);
  });
  it("odebrání převede potomky na rodiče odebraného", () => {
    expect(m.removeTemplateRow(tpl, "b").find((r) => r.id === "c")?.parentId).toBe("a");
  });
  it("hloubka podle rodičů", () => {
    expect(m.templateRowDepth(tpl, tpl[2]!)).toBe(2);
  });
  it("přidání řádku a chyba validace z props", () => {
    let next: unknown = null;
    const view = render(
      <m.StatementTemplateEditor rows={tpl} mappingOptions={[]} createRowId={() => "n"} issues={{ b: "Chybí účet" }} onChange={(r) => (next = r)} />,
    );
    expect(view.getByRole("alert").textContent).toBe("Chybí účet");
    fireEvent.click(view.getByRole("button", { name: "Přidat řádek" }));
    expect((next as { id: string }[]).at(-1)?.id).toBe("n");
  });
});

describe("Uložené výkazy a dialog", () => {
  it("dialog bez názvu nejde uložit", () => {
    const view = render(
      <m.StatementSaveDialog open onOpenChange={() => {}} value={{ name: " ", kind: "balance", period: "2026", unit: "full" }} onChange={() => {}} onSubmit={() => {}} periods={[{ value: "2026", label: "2026" }]} currency="Kč" />,
    );
    expect(view.getByRole("button", { name: "Uložit" }).hasAttribute("disabled") || view.getByRole("button", { name: "Uložit" }).getAttribute("aria-disabled") === "true").toBe(true);
  });
  it("seznam ukáže druh a jednotky ve slovenštině", () => {
    const view = render(
      <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
        <m.SavedStatementList currency="EUR" onOpen={() => {}} items={[{ id: "1", name: "S1", kind: "income", period: "2025", unit: "thousands", savedBy: "J", savedAt: "2026-03-10T08:05:00" }]} />
      </DsTextsProvider>,
    );
    expect(view.container.textContent).toContain("Výkaz ziskov a strát");
    expect(view.container.textContent).toContain("tis. EUR");
  });
});
