/** BA DPH a primární akce lišty · vlastní testy chování · nesmí testovat zdrojový text. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DS_TEXTS_CS, DsTextsProvider } from "../../src/ds-texts";
import {
  DocumentForm,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import { documentFieldsForType } from "../../src/components/ds/accounting/document-fields";
import { GridAddActions } from "../../src/components/ds/grid/grid-add-actions";
import {
  GridAddLabelContext,
  GridToolbarOverflowContext,
} from "../../src/components/ds/grid/grid-toolbar-context";

afterEach(cleanup);
const value: DocumentHeaderValue = {
  issueDate: "2026-10-12",
  accountingDate: "2026-10-12",
  taxDate: "2026-10-05",
  vatDate: "2026-10-12",
  vatRelevant: true,
  direction: "out",
  currency: "EUR",
  rate: 24.38,
  amountTotal: 121,
  totalMode: "entered",
};
function ba(extra: Record<string, unknown> = {}) {
  return render(
    <DocumentForm
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      title="Bankovní doklad"
      documentType="BA"
      value={value}
      onChange={() => {}}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      status="draft"
      {...extra}
    />,
  );
}
test("BA preset obsahuje DUZP", () => {
  expect(documentFieldsForType("BA").taxDate).toBe(true);
});
test("BA bez DPH nemá DUZP ani Datum DPH", () => {
  const view = ba();
  expect(view.queryByText("DUZP")).toBeNull();
  expect(view.queryByText("Datum DPH")).toBeNull();
});
test("BA s DPH má DUZP, Datum DPH a při jiném DUZP Kurz DPH", () => {
  const view = ba({
    vat: { visible: true, dateLink: { locked: false, onToggle: () => {} } },
    vatRateField: { value: 24.41, onChange: () => {}, sameAsDocument: false },
  });
  expect(view.getAllByText("DUZP").length).toBeGreaterThan(0);
  expect(view.getAllByText("Datum DPH").length).toBeGreaterThan(0);
  expect(view.getAllByText("Kurz DPH").length).toBeGreaterThan(0);
});
const actions = (log: string[]) => [
  { label: "Nový příjem", shortLabel: "Příjem", onClick: () => log.push("in") },
  { label: "Nový výdej", shortLabel: "Výdej", onClick: () => log.push("out") },
];
test("GridAddActions dvě akce mají plný i zkrácený text", () => {
  const view = render(<GridAddActions actions={actions([])} />);
  expect(view.getByText("Nový příjem")).toBeTruthy();
  expect(view.getByText("Výdej")).toBeTruthy();
  expect(view.queryByRole("button", { name: "Nový – vyberte druh" })).toBeNull();
});
test("GridAddActions v úrovni 3 slučuje akce do menu tlačítka", () => {
  const view = render(
    <GridToolbarOverflowContext.Provider value={3}>
      <GridAddActions actions={actions([])} />
    </GridToolbarOverflowContext.Provider>,
  );
  const menu = view.container.querySelector('[data-slot="grid-add-menu"]');
  expect(menu?.getAttribute("aria-haspopup")).toBe("menu");
  expect(menu?.getAttribute("aria-label")).toBe("Nový – vyberte druh");
});
test("GridAddActions jedna akce se do menu neslučuje", () => {
  const log: string[] = [];
  const view = render(
    <GridToolbarOverflowContext.Provider value={3}>
      <GridAddActions actions={actions(log)[0]} />
    </GridToolbarOverflowContext.Provider>,
  );
  expect(view.container.querySelector('[data-slot="grid-add-menu"]')).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "Nový příjem (N)" }));
  expect(log).toEqual(["in"]);
});

test("GridAddActions měřený kompaktní stav zachová zkrácené názvy", () => {
  const view = render(
    <GridAddLabelContext.Provider value="short">
      <GridAddActions actions={actions([])} />
    </GridAddLabelContext.Provider>,
  );
  expect(view.getByText("Příjem")).toBeTruthy();
  expect(view.getByRole("button", { name: "Nový příjem (N)" })).toBeTruthy();
});

test("GridAddActions vlastní grid texty nepotřebují addMenu", () => {
  const { addMenu, ...grid } = DS_TEXTS_CS.grid;
  expect(addMenu).toBe("Nový – vyberte druh");
  const view = render(
    <DsTextsProvider texts={{ grid }}>
      <GridToolbarOverflowContext.Provider value={3}>
        <GridAddActions actions={actions([])} />
      </GridToolbarOverflowContext.Provider>
    </DsTextsProvider>,
  );
  expect(view.getByRole("button", { name: "Nový – vyberte druh" })).toBeTruthy();
});

test("GridAddActions zakázaná položka nabídky má důvod, fokus a neprovede akci", async () => {
  const log: string[] = [];
  const list = actions(log).map((action) => ({
    ...action,
    disabled: true,
    disabledReason: "Období je uzavřené",
  }));
  const view = render(
    <GridToolbarOverflowContext.Provider value={3}>
      <GridAddActions actions={list} />
    </GridToolbarOverflowContext.Provider>,
  );
  fireEvent.keyDown(view.getByRole("button", { name: "Nový – vyberte druh" }), { key: "Enter" });
  const item = await view.findByRole("menuitem", { name: /^Příjem/ });
  expect(item.getAttribute("aria-disabled")).toBe("true");
  item.focus();
  expect(document.activeElement).toBe(item);
  fireEvent.click(item);
  fireEvent.keyDown(item, { key: "Enter" });
  expect(log).toEqual([]);
  fireEvent.pointerMove(item, { pointerType: "mouse" });
  await waitFor(() => expect(view.getAllByText("Období je uzavřené").length).toBeGreaterThan(0));
});
